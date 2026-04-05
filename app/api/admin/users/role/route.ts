import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Database } from '@/lib/database.types';

type UserRole = Database['public']['Enums']['user_role'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single() as unknown as {
        data: Pick<ProfileRow, 'role'> | null;
        error: Error | null;
      };

    if (profileError) throw profileError;

    if (!profile || profile.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { user_id, role }: { user_id: string; role: UserRole } = await req.json();

    if (!user_id || !role) {
      return NextResponse.json({ error: 'user_id болон role шаардлагатай' }, { status: 400 });
    }

    const validRoles: UserRole[] = ['user', 'manager', 'super_admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Буруу role утга' }, { status: 400 });
    }

    const updateData: ProfileUpdate = {
      role,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData as never)
      .eq('id', user_id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Role update error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}