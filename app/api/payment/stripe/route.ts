import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type BookingRow = Database['public']['Tables']['bookings']['Row'] & {
  place?: { name: string; cover_image: string | null } | null;
};

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe тохируулагдаагүй байна' }, { status: 503 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { // ✅ function level
    apiVersion: '2026-03-25.dahlia',
  });

  try {
    const { booking_id } = await req.json();
    const supabase = createAdminClient();

    const { data: booking } = await supabase
      .from('bookings')
      .select('*, place:places(name, cover_image)')
      .eq('id', booking_id)
      .single() as unknown as { data: BookingRow | null; error: any };

    if (!booking) return NextResponse.json({ error: 'Захиалга олдсонгүй' }, { status: 404 });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency:     'mnt',
          unit_amount:  booking.total_amount * 100,
          product_data: {
            name:        booking.place?.name ?? 'Захиалга',
            description: `${booking.nights} шөнө · ${booking.guest_count} хүн`,
            images:      booking.place?.cover_image ? [booking.place.cover_image] : [],
          },
        },
        quantity: 1,
      }],
      metadata: { booking_id },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/${booking_id}/confirmation?stripe=success`,
      cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/booking/${booking_id}/payment?stripe=cancel`,
    });

    await supabase.from('bookings').update({
      payment_intent: session.id,
    } as never).eq('id', booking_id);

    return NextResponse.json({ checkout_url: session.url });
  } catch (err: any) {
    console.error('Stripe error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}