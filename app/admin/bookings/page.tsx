import { createServerSupabaseClient } from '@/lib/supabase-server';
import { formatPrice, formatDate, getBookingStatusLabel, getPaymentStatusLabel } from '@/lib/utils';

export default async function AdminBookingsPage() {
  const supabase = await createServerSupabaseClient();
  const { data, count } = await supabase
    .from('bookings')
    .select('*, place:places(id, name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(50);

  const bookings = (data ?? []) as any[];

  const statusColors: Record<string, string> = {
    pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    cancelled: 'bg-red-50 text-red-600 border-red-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
  };
  const payColors: Record<string, string> = {
    pending:  'bg-gray-50 text-gray-500 border-gray-200',
    paid:     'bg-green-50 text-green-700 border-green-200',
    failed:   'bg-red-50 text-red-600 border-red-200',
    refunded: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-forest-900">Захиалгууд</h1>
        <p className="text-forest-500 text-sm mt-1">{count ?? 0} нийт захиалга</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Дугаар', 'Газар', 'Зочин', 'Огноо', 'Дүн', 'Статус', 'Төлбөр'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-forest-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50/40 transition-colors">
                  <td className="px-5 py-4 text-xs font-mono text-forest-500">{String(booking.id).slice(0, 8)}...</td>
                  <td className="px-5 py-4"><div className="text-sm font-medium text-forest-800">{booking.place?.name}</div></td>
                  <td className="px-5 py-4">
                    <div className="text-sm text-forest-800">{booking.guest_name}</div>
                    <div className="text-xs text-forest-400">{booking.guest_phone}</div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="text-xs text-forest-700">{formatDate(booking.check_in)}</div>
                    <div className="text-xs text-forest-400">→ {formatDate(booking.check_out)}</div>
                  </td>
                  <td className="px-5 py-4"><span className="font-semibold text-forest-900 text-sm">{formatPrice(booking.total_amount)}</span></td>
                  <td className="px-5 py-4"><span className={`badge text-xs ${statusColors[booking.status] ?? ''}`}>{getBookingStatusLabel(booking.status)}</span></td>
                  <td className="px-5 py-4"><span className={`badge text-xs ${payColors[booking.payment_status] ?? ''}`}>{getPaymentStatusLabel(booking.payment_status)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && (
            <div className="text-center py-16 text-forest-400 text-sm">Захиалга байхгүй байна</div>
          )}
        </div>
      </div>
    </div>
  );
}
