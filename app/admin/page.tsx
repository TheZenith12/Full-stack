import { createServerSupabaseClient } from '@/lib/supabase';
import { getCurrentProfile } from '@/lib/actions/auth';
import {
  MapPin, CalendarCheck, Star, Eye, TrendingUp, Users,
  Building2, Leaf, DollarSign,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

async function getDashboardStats(profile: any) {
  const supabase = await createServerSupabaseClient();
  const isAdmin = profile.role === 'super_admin';

  const placesQuery = supabase.from('places').select('id, type, view_count, is_published', { count: 'exact' });
  if (!isAdmin) placesQuery.eq('manager_id', profile.id);

  const bookingsQuery = supabase.from('bookings')
    .select('total_amount, status, payment_status', { count: 'exact' });

  const [placesRes, bookingsRes, reviewsRes, statsRes] = await Promise.all([
    placesQuery,
    bookingsQuery,
    supabase.from('reviews').select('id', { count: 'exact' }),
    supabase.from('site_stats').select('key, value'),
  ]);

  const places   = placesRes.data ?? [];
  const bookings = bookingsRes.data ?? [];

  const paidBookings   = bookings.filter((b) => b.payment_status === 'paid');
  const totalRevenue   = paidBookings.reduce((a, b) => a + b.total_amount, 0);
  const totalViews     = places.reduce((a, p) => a + p.view_count, 0);
  const statsMap: Record<string, number> = {};
  statsRes.data?.forEach(({ key, value }) => { statsMap[key] = value; });

  return {
    places:           placesRes.count ?? 0,
    publishedPlaces:  places.filter((p) => p.is_published).length,
    resorts:          places.filter((p) => p.type === 'resort').length,
    nature:           places.filter((p) => p.type === 'nature').length,
    bookings:         bookingsRes.count ?? 0,
    paidBookings:     paidBookings.length,
    totalRevenue,
    reviews:          reviewsRes.count ?? 0,
    totalViews,
    siteViews:        statsMap['total_views'] ?? 0,
  };
}

export default async function AdminDashboard() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const stats = await getDashboardStats(profile);

  const statCards = [
    { label: 'Нийт газрууд',      value: stats.places,         icon: MapPin,        color: 'bg-forest-50 text-forest-600',  subLabel: `${stats.publishedPlaces} нийтлэгдсэн` },
    { label: 'Нийт захиалгууд',   value: stats.bookings,       icon: CalendarCheck, color: 'bg-amber-50 text-amber-600',    subLabel: `${stats.paidBookings} төлөгдсөн` },
    { label: 'Нийт үзэлт',        value: stats.totalViews.toLocaleString(), icon: Eye, color: 'bg-blue-50 text-blue-600', subLabel: 'Нийт хандалт' },
    { label: 'Орлого (MNT)',       value: formatPrice(stats.totalRevenue),  icon: DollarSign, color: 'bg-green-50 text-green-600', subLabel: `${stats.paidBookings} захиалгаас` },
    { label: 'Амралтын газар',     value: stats.resorts,        icon: Building2,     color: 'bg-orange-50 text-orange-600', subLabel: 'Нийт' },
    { label: 'Байгалийн газар',    value: stats.nature,         icon: Leaf,          color: 'bg-teal-50 text-teal-600',     subLabel: 'Нийт' },
    { label: 'Сэтгэгдлүүд',        value: stats.reviews,        icon: Star,          color: 'bg-yellow-50 text-yellow-600', subLabel: 'Нийт үнэлгээ' },
    { label: 'Сайтын хандалт',     value: stats.siteViews.toLocaleString(), icon: TrendingUp, color: 'bg-purple-50 text-purple-600', subLabel: 'Нийт хандалт' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-forest-900">
          Сайн байна уу, {profile.full_name?.split(' ')[0] ?? 'Админ'} 👋
        </h1>
        <p className="text-forest-500 mt-1">Удирдлагын самбарт тавтай морилно уу</p>
      </div>

      {/* Stats grid */}
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
              <div className="text-forest-400 text-xs mt-1">{card.subLabel}</div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-forest-900 mb-4">Хурдан үйлдэл</h2>
        <div className="flex flex-wrap gap-3">
          <a href="/admin/places/new" className="btn-primary text-sm">
            + Шинэ газар нэмэх
          </a>
          <a href="/admin/bookings" className="btn-secondary text-sm">
            Захиалгууд харах
          </a>
          <a href="/" target="_blank" className="btn-secondary text-sm">
            Сайт харах →
          </a>
        </div>
      </div>
    </div>
  );
}
