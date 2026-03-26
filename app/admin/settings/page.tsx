import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/actions/auth';
import AdminSettingsClient from '@/components/admin/AdminSettingsClient';

export default async function AdminSettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'super_admin') redirect('/admin');
  return <AdminSettingsClient profile={profile} />;
}
