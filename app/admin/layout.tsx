// app/admin/layout.tsx
import { createServerSupabaseClient } from '@/lib/supabase-server';
import AdminSidebar from '@/components/admin/AdminSidebar';
import type { Profile } from '@/lib/types';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div style={{ padding: 40, fontFamily: 'monospace', background: '#0a1a10', color: '#fff', minHeight: '100vh' }}>
        <h2>❌ User байхгүй байна</h2>
        <p style={{ color: '#f87171' }}>{userError?.message ?? 'Session олдсонгүй'}</p>
        <br />
        <a href="/auth/login" style={{ color: '#4ade80' }}>→ Login хуудас руу очих</a>
      </div>
    );
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profileData) {
    return (
      <div style={{ padding: 40, fontFamily: 'monospace', background: '#0a1a10', color: '#fff', minHeight: '100vh' }}>
        <h2>❌ Profile байхгүй байна</h2>
        <p>User ID: {user.id}</p>
        <p>Email: {user.email}</p>
        <p style={{ color: '#f87171' }}>Profile алдаа: {profileError?.message}</p>
      </div>
    );
  }

  const profile = profileData as Profile;

  if (!['super_admin', 'manager'].includes(profile.role)) {
    return (
      <div style={{ padding: 40, fontFamily: 'monospace', background: '#0a1a10', color: '#fff', minHeight: '100vh' }}>
        <h2>❌ Эрх байхгүй</h2>
        <p>Email: {user.email}</p>
        <p>Одоогийн role: <strong style={{ color: '#fbbf24' }}>{profile.role}</strong></p>
        <p style={{ color: '#f87171' }}>super_admin эрх шаардлагатай</p>
      </div>
    );
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