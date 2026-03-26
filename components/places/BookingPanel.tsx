'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, CreditCard, Smartphone, ArrowRight, Lock } from 'lucide-react';
import { formatPrice, calculateNights } from '@/lib/utils';
import { createBooking } from '@/lib/actions/auth';
import { toast } from 'react-hot-toast';
import type { Place, Profile } from '@/lib/types';

interface BookingPanelProps {
  place: Place;
  profile: Profile | null;
}

export default function BookingPanel({ place, profile }: BookingPanelProps) {
  const router = useRouter();
  const isResort = place.type === 'resort';
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [payMethod, setPayMethod] = useState<'stripe' | 'qpay'>('qpay');
  const [loading, setLoading] = useState(false);

  const nights = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 0;
  const total = nights * (place.price_per_night ?? 0) * guests;
  const today = new Date().toISOString().split('T')[0];

  async function handleBook() {
    if (!profile) {
      toast.error('Захиалахын тулд нэвтрэх шаардлагатай');
      router.push(`/auth/login?redirect=/places/${place.id}`);
      return;
    }
    if (!checkIn || !checkOut) {
      toast.error('Огноо сонгоно уу');
      return;
    }
    if (nights < 1) {
      toast.error('Буцах огноо буруу байна');
      return;
    }

    setLoading(true);
    try {
      const booking = await createBooking({
        place_id:       place.id,
        guest_name:     profile.full_name ?? 'Хэрэглэгч',
        guest_phone:    profile.phone ?? '',
        guest_count:    guests,
        check_in:       checkIn,
        check_out:      checkOut,
        payment_method: payMethod,
      });
      toast.success('Захиалга амжилттай үүслээ!');
      router.push(`/booking/${booking.id}/payment`);
    } catch (err: any) {
      toast.error(err.message ?? 'Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  }

  if (!isResort) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-forest-50 rounded-xl flex items-center justify-center">
            🌿
          </div>
          <div>
            <div className="font-semibold text-forest-900 text-sm">Байгалийн газар</div>
            <div className="text-xs text-forest-500">Үнэгүй нэвтрэх боломжтой</div>
          </div>
        </div>
        <p className="text-forest-600 text-sm leading-relaxed mb-4">
          Энэ байгалийн үзэсгэлэнт газар нь нийтийн хэрэглээнд нээлттэй. Байршил мэдээллийг ашиглан очиж болно.
        </p>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary w-full"
        >
          Замын заалт авах <ArrowRight size={15} />
        </a>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <span className="font-display text-3xl font-semibold text-forest-900">
            {formatPrice(place.price_per_night ?? 0)}
          </span>
          <span className="text-forest-500 text-sm"> / шөнө</span>
        </div>
        {place.rating_avg > 0 && (
          <div className="flex items-center gap-1 text-sm">
            ⭐ <span className="font-semibold">{place.rating_avg.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="space-y-3 mb-4">
        {/* Check-in / Check-out */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-forest-500 mb-1 block">Ирэх өдөр</label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400 pointer-events-none" />
              <input
                type="date"
                min={today}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="input-field pl-9 py-2.5 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-forest-500 mb-1 block">Явах өдөр</label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400 pointer-events-none" />
              <input
                type="date"
                min={checkIn || today}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="input-field pl-9 py-2.5 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Guests */}
        <div>
          <label className="text-xs font-medium text-forest-500 mb-1 block">Зочдын тоо</label>
          <div className="relative">
            <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400 pointer-events-none" />
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="input-field pl-9 py-2.5 text-sm appearance-none"
            >
              {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                <option key={n} value={n}>{n} хүн</option>
              ))}
            </select>
          </div>
        </div>

        {/* Payment method */}
        <div>
          <label className="text-xs font-medium text-forest-500 mb-2 block">Төлбөрийн хэлбэр</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'qpay',   label: 'QPay',   icon: <Smartphone size={16} /> },
              { value: 'stripe', label: 'Карт',   icon: <CreditCard size={16} /> },
            ].map((pm) => (
              <button
                key={pm.value}
                onClick={() => setPayMethod(pm.value as any)}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  payMethod === pm.value
                    ? 'bg-forest-700 text-white border-forest-700'
                    : 'bg-white text-forest-600 border-forest-200 hover:border-forest-400'
                }`}
              >
                {pm.icon} {pm.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Price breakdown */}
      {nights > 0 && (
        <div className="bg-forest-50 rounded-xl p-4 mb-4 space-y-2">
          <div className="flex justify-between text-sm text-forest-600">
            <span>{formatPrice(place.price_per_night ?? 0)} × {nights} шөнө × {guests} хүн</span>
          </div>
          <div className="flex justify-between font-semibold text-forest-900 pt-2 border-t border-forest-200 text-sm">
            <span>Нийт дүн</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      )}

      <button
        onClick={handleBook}
        disabled={loading}
        className="btn-amber w-full py-4 text-base"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" className="opacity-75" />
            </svg>
            Боловсруулж байна...
          </span>
        ) : (
          <>Захиалах <ArrowRight size={18} /></>
        )}
      </button>

      <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-forest-400">
        <Lock size={11} /> Таны мэдээлэл хамгаалагдсан
      </div>
    </div>
  );
}
