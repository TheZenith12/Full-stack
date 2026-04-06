import { getMyResortAction } from '@/lib/actions/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { formatPrice } from '@/lib/utils';
import { Hotel, Bed, CalendarCheck, Star, Eye, Edit } from 'lucide-react';

export default async function MyResortPage() {
  const { data: resort, error } = await getMyResortAction();
  if (!resort || error) redirect('/admin?error=resort_not_found');

  const supabase = await createServerSupabaseClient();
  const [roomsRes, bookingsRes, reviewsRes] = await Promise.all([
    supabase.from('rooms').select('id', { count: 'exact' }).eq('resort_id', resort.id),
    supabase.from('bookings').select('id, status, total_amount', { count: 'exact' })
      .eq('resort_id', resort.id),
    supabase.from('reviews').select('id, rating', { count: 'exact' }).eq('resort_id', resort.id),
  ]);

  const stats = [
    { label: 'Өрөөнүүд',    value: roomsRes.count ?? 0,    icon: Bed,           color: 'bg-blue-50 text-blue-600' },
    { label: 'Захиалгууд',  value: bookingsRes.count ?? 0, icon: CalendarCheck, color: 'bg-amber-50 text-amber-600' },
    { label: 'Сэтгэгдлүүд', value: reviewsRes.count ?? 0,  icon: Star,          color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Нийт үзэлт',  value: resort.view_count,      icon: Eye,           color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Hotel size={20} className="text-forest-600" />
            <h1 className="font-display text-3xl font-semibold text-forest-900">
              {resort.name}
            </h1>
            <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${
              resort.is_published
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {resort.is_published ? '● Нийтлэгдсэн' : '○ Нуугдсан'}
            </span>
          </div>
          <p className="text-forest-500 text-sm">
            {resort.province ? `${resort.province} · ` : ''}
            {resort.address ?? 'Хаяг тодорхойгүй'}
          </p>
        </div>
        <Link href="/admin/my-resort/edit" className="btn-primary flex items-center gap-2 text-sm">
          <Edit size={15} /> Мэдээлэл засах
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                <Icon size={18} />
              </div>
              <div className="font-display text-2xl font-semibold text-forest-900">
                {s.value.toLocaleString()}
              </div>
              <div className="text-forest-500 text-xs mt-0.5">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: '/admin/my-resort/rooms',    label: 'Өрөөнүүд удирдах', icon: Bed,           desc: 'Өрөө нэмэх, засах, үнэ тохируулах' },
          { href: '/admin/my-resort/bookings', label: 'Захиалгууд',        icon: CalendarCheck, desc: 'Орж ирсэн захиалгуудыг харах' },
          { href: '/admin/my-resort/reviews',  label: 'Сэтгэгдлүүд',      icon: Star,          desc: 'Хэрэглэгчийн үнэлгээ баталгаажуулах' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-forest-300 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 bg-forest-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-forest-100 transition-colors">
                <Icon size={18} className="text-forest-600" />
              </div>
              <div className="font-semibold text-forest-900 text-sm">{item.label}</div>
              <div className="text-forest-400 text-xs mt-0.5">{item.desc}</div>
            </Link>
          );
        })}
      </div>

      {resort.price_per_night && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="text-amber-800 text-sm font-medium mb-1">Үндсэн үнэ</div>
          <div className="font-display text-2xl font-semibold text-amber-900">
            {formatPrice(resort.price_per_night)}
            <span className="text-base font-normal text-amber-700"> / шөнө</span>
          </div>
          <Link href="/admin/my-resort/edit" className="text-amber-600 text-xs hover:text-amber-700 mt-1 block">
            Үнэ өөрчлөх →
          </Link>
        </div>
      )}
    </div>
  );
}