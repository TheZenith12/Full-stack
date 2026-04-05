'use client';

import { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import BookingPanel from './BookingPanel';
import type { Place, Profile } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

interface MobileBookingDrawerProps {
  place: Place;
  profile: Profile | null;
}

export default function MobileBookingDrawer({ place, profile }: MobileBookingDrawerProps) {
  const [open, setOpen] = useState(false);
  const isResort = place.type === 'resort';

  return (
    <>
      {/* Sticky bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-forest-100 px-4 py-3 flex items-center justify-between gap-3">
        <div>
          {isResort && place.price_per_night ? (
            <>
              <div className="font-display text-xl font-semibold text-forest-900">
                {formatPrice(place.price_per_night)}
              </div>
              <div className="text-xs text-forest-500">шөнөд</div>
            </>
          ) : (
            <div className="text-sm font-medium text-forest-700">🌿 Үнэгүй нэвтрэх</div>
          )}
        </div>
        <button
          onClick={() => setOpen(true)}
          className="btn-amber flex items-center gap-2 px-6 py-2.5"
        >
          {isResort ? 'Захиалах' : 'Заалт авах'}
          <ArrowRight size={15} />
        </button>
      </div>

      {/* Bottom sheet drawer */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-40 bg-forest-950/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[90dvh] overflow-y-auto">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-forest-200" />
            </div>
            {/* Close */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-forest-100">
              <span className="font-display text-lg font-semibold text-forest-900">
                {isResort ? 'Захиалах' : 'Байршил'}
              </span>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-forest-50 flex items-center justify-center text-forest-500 hover:bg-forest-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 pb-8">
              <BookingPanel place={place} profile={profile} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
