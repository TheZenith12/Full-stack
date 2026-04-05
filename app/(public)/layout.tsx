import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getSiteStats } from '@/lib/actions/places';
import { getCurrentProfile } from '@/lib/actions/auth';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [stats, profile] = await Promise.all([getSiteStats(), getCurrentProfile()]);

  return (
    <div className="flex flex-col min-h-dvh">
      <Header stats={stats} profile={profile} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
