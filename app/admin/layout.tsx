import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import AdminSidebarV2 from '@/components/admin/AdminSidebarV2';
import type { Profile } from '@/lib/types';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();

  // 1. Auth шалгах
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?redirect=/admin');

  // 2. Profile + role татах
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/auth/login');

  const p = profile as Profile;

  // 3. User эрхгүй — хаах
  if (p.role === 'user') redirect('/');

  // 4. Manager-ийн оноогдсон resort татах
  // 4. Manager-ийн оноогдсон resort татах
let assignedResort: { id: string; name: string } | null = null;

if (p.role === 'manager') {
  type ManagerResortAssignment = {
    resort_id: string;
    resort: {
      id: string;
      name: string;
    } | null;
  };

  const { data: assignment } = await supabase
    .from('manager_resorts')
    .select('resort_id, resort:resorts(id, name)')
    .eq('manager_id', user.id)
    .single<ManagerResortAssignment>();

  if (!assignment?.resort) {
    redirect('/auth/login?error=no_resort_assigned');
  }

  assignedResort = assignment.resort;
}

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebarV2 profile={p} assignedResort={assignedResort} />
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}