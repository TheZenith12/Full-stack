import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/actions/auth';
import AdminSettingsClient from '@/components/admin/AdminSettingsClient';
import type { Profile } from '@/lib/types';

export default async function AdminSettingsPage() {
  // Profile-ийг тодорхой type-тэйгээр аваарай
  const profile: Profile | null = await getCurrentProfile();

  // Null болон role шалгалт
  if (!profile || profile.role !== 'super_admin') {
    redirect('/admin');
  }

  return <AdminSettingsClient profile={profile} />;
}