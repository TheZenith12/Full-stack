import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import type { SiteStats } from '@/lib/types';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();

  // Stats татах
  const [statsRes, resortsRes, natureRes] = await Promise.all([
    supabase.from('site_stats').select('key, value'),
    supabase.from('places').select('id', { count: 'exact' }).eq('type', 'resort').eq('is_published', true),
    supabase.from('places').select('id', { count: 'exact' }).eq('type', 'nature').eq('is_published', true),
  ]);

  const statsMap = Object.fromEntries(
    ((statsRes.data ?? []) as Array<{ key: string; value: string }>).map((s) => [s.key, s.value])
  );

  const stats: SiteStats = {
    total_views: Number(statsMap['total_views'] ?? 0),
    total_resorts: resortsRes.count ?? 0,
    total_nature: natureRes.count ?? 0,
    total_places: (resortsRes.count ?? 0) + (natureRes.count ?? 0),
    total_users: 0,
    total_bookings: 0
  };

  // Profile татах (нэвтрэсэн бол)
  const { data: { user } } = await supabase.auth.getUser();
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  return (
    <>
      <Header stats={stats} profile={profile} />
      <main>{children}</main>
      <Footer />
    </>
  );
}