import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();

  // Auth шалгах
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Super admin эсэхийг DATABASE-ААС шалгана
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>();

  if (!profile || profile.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { user_id, resort_id, action } = await req.json();

  if (!user_id || !action) {
    return NextResponse.json({ error: 'user_id, action шаардлагатай' }, { status: 400 });
  }

  try {
    if (action === 'assign') {
      if (!resort_id) {
        return NextResponse.json({ error: 'resort_id шаардлагатай' }, { status: 400 });
      }
      // Stored procedure дуудна — SECURITY DEFINER тул RLS bypass
      const { error } = await supabase.rpc('assign_manager' as never, {
        p_user_id:   user_id,
        p_resort_id: resort_id,
      } as never);
      if (error) throw error;

    } else if (action === 'revoke') {
      if (user_id === user.id) {
        return NextResponse.json({ error: 'Өөрийнхөө эрхийг буцааж авах боломжгүй' }, { status: 400 });
      }
      const { error } = await supabase.rpc('revoke_manager' as never, {
        p_user_id: user_id,
      } as never);
      if (error) throw error;

    } else {
      return NextResponse.json({ error: 'Буруу action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}