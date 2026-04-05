import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getCurrentProfile } from '@/lib/actions/auth';
import {
  MapPin, CalendarCheck, Star, Eye, TrendingUp,
  Building2, Leaf, DollarSign,
} from 'lucide-react';
import AdminDashboardCharts from '@/components/admin/AdminDashboardCharts';
import { formatPrice } from '@/lib/utils';

async function getDashboardStats() {
  try {
    const supabase = await createServerSupabaseClient();

    const [placesRes, bookingsRes, reviewsRes, statsRes] = await Promise.all([
      supabase.from('places').select('id, type, view_count, is_published', { count: 'exact' }),
      supabase.from('bookings').select('total_amount, status, payment_status', { count: 'exact' }),
      supabase.from('reviews').select('id', { count: 'exact' }),
      supabase.from('site_stats').select('key, value'),
    ]);

    const places = placesRes.data ?? [];
    const bookings = bookingsRes.data ?? [];
    const paidBookings = bookings.filter((b: any) => b.payment_status === 'paid');
    const totalRevenue = paidBookings.reduce((a: number, b: any) => a + b.total_amount, 0);

    const statsMap: Record<string, number> = {};
    (statsRes.data ?? []).forEach((s: any) => { statsMap[s.key] = s.value; });

    // Monthly revenue (last 6 months)
    const now = new Date();
    const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = d.toLocaleString('mn-MN', { month: 'short' });
      const monthStr = d.toISOString().slice(0, 7);
      const amount = paidBookings
        .filter((b: any) => b.created_at?.startsWith(monthStr))
        .reduce((s: number, b: any) => s + b.total_amount, 0);
      return { month: label, amount };
    });

    const bookingsByStatus = [
      { label: 'Хүлээгдэж буй', value: bookings.filter((b: any) => b.status === 'pending').length, color: '#f59e0b' },
      { label: 'Батлагдсан',    value: bookings.filter((b: any) => b.status === 'confirmed').length, color: '#3b82f6' },
      { label: 'Дууссан',       value: bookings.filter((b: any) => b.status === 'completed').length, color: '#10b981' },
      { label: 'Цуцлагдсан',   value: bookings.filter((b: any) => b.status === 'cancelled').length, color: '#ef4444' },
    ];

    const placeTypes = [
      { label: '🏕 Амралтын газар',        value: places.filter((p: any) => p.type === 'resort').length, color: '#e8a825' },
      { label: '🌿 Байгалийн газар',        value: places.filter((p: any) => p.type === 'nature').length, color: '#195538' },
      { label: '✅ Нийтлэгдсэн',           value: places.filter((p: any) => p.is_published).length, color: '#059669' },
      { label: '📝 Нийтлэгдээгүй',         value: places.filter((p: any) => !p.is_published).length, color: '#9ca3af' },
    ];

    return {
      places: placesRes.count ?? 0,
      publishedPlaces: places.filter((p: any) => p.is_published).length,
      resorts: places.filter((p: any) => p.type === 'resort').length,
      nature: places.filter((p: any) => p.type === 'nature').length,
      bookings: bookingsRes.count ?? 0,
      paidBookings: paidBookings.length,
      totalRevenue,
      reviews: reviewsRes.count ?? 0,
      totalViews: places.reduce((a: number, p: any) => a + (p.view_count ?? 0), 0),
      siteViews: statsMap['total_views'] ?? 0,
      revenueByMonth,
      bookingsByStatus,
      placeTypes,
    };
  } catch {
    return {
      places: 0, publishedPlaces: 0, resorts: 0, nature: 0,
      bookings: 0, paidBookings: 0, totalRevenue: 0,
      reviews: 0, totalViews: 0, siteViews: 0,
      revenueByMonth: [], bookingsByStatus: [], placeTypes: [],
    };
  }
}

export default async function AdminDashboard() {
  const [profile, stats] = await Promise.all([
    getCurrentProfile(),
    getDashboardStats(),
  ]);

  // Null-safe profile: хэрвээ null бол default админ үүсгэнэ
  const safeProfile = profile ?? {
    full_name: 'Админ',
    role: 'super_admin',
  };

  const statCards = [
    { label: 'Нийт газрууд',    value: stats.places,         icon: MapPin,        color: 'bg-forest-50 text-forest-600',  sub: `${stats.publishedPlaces} нийтлэгдсэн` },
    { label: 'Нийт захиалгууд', value: stats.bookings,       icon: CalendarCheck, color: 'bg-amber-50 text-amber-600',    sub: `${stats.paidBookings} төлөгдсөн` },
    { label: 'Нийт үзэлт',      value: stats.totalViews.toLocaleString(), icon: Eye, color: 'bg-blue-50 text-blue-600', sub: 'Нийт хандалт' },
    { label: 'Орлого',          value: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'bg-green-50 text-green-600', sub: `${stats.paidBookings} захиалгаас` },
    { label: 'Амралтын газар',  value: stats.resorts,        icon: Building2,     color: 'bg-orange-50 text-orange-600',  sub: 'Нийт' },
    { label: 'Байгалийн газар', value: stats.nature,         icon: Leaf,          color: 'bg-teal-50 text-teal-600',      sub: 'Нийт' },
    { label: 'Сэтгэгдлүүд',     value: stats.reviews,        icon: Star,          color: 'bg-yellow-50 text-yellow-600',  sub: 'Нийт үнэлгээ' },
    { label: 'Сайтын хандалт',  value: stats.siteViews.toLocaleString(), icon: TrendingUp, color: 'bg-purple-50 text-purple-600', sub: 'Нийт' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-forest-900">
  Сайн байна уу, {safeProfile.full_name?.split(' ')[0] ?? 'Хэрэглэгч'} 👋
</h1>
        <p className="text-forest-500 mt-1">Удирдлагын самбарт тавтай морилно уу</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                <Icon size={19} />
              </div>
              <div className="font-display text-2xl font-semibold text-forest-900">{card.value}</div>
              <div className="text-forest-700 text-sm font-medium mt-0.5">{card.label}</div>
              <div className="text-forest-400 text-xs mt-1">{card.sub}</div>
            </div>
          );
        })}
      </div>

      <AdminDashboardCharts data={{
        bookingsByStatus: stats.bookingsByStatus,
        revenueByMonth: stats.revenueByMonth,
        placeTypes: stats.placeTypes,
      }} />

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-forest-900 mb-4">Хурдан үйлдэл</h2>
        <div className="flex flex-wrap gap-3">
          <a href="/admin/places/new" className="btn-primary text-sm">+ Шинэ газар нэмэх</a>
          <a href="/admin/bookings"   className="btn-secondary text-sm">Захиалгууд харах</a>
          <a href="/" target="_blank" className="btn-secondary text-sm">Сайт харах →</a>
        </div>
      </div>
    </div>
  );
};