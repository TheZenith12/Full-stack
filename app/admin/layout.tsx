import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/actions/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  if (!profile || !['super_admin', 'manager'].includes(profile.role)) {
    redirect('/auth/login?redirect=/admin');
  }

  return (
    <div className="flex min-h-screen bg-forest-950">
      <AdminSidebar profile={profile} />
      <main className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
        {children}
      </main>
    </div>
  );
}
