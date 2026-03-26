import { notFound, redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getCurrentProfile } from '@/lib/actions/auth';
import PaymentClient from '@/components/booking/PaymentClient';

async function getBooking(id: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('bookings')
    .select('*, place:places(id, name, cover_image, price_per_night, type)')
    .eq('id', id)
    .single();
  return data;
}

export default async function PaymentPage({ params }: { params: { id: string } }) {
  const [booking, profile] = await Promise.all([
    getBooking(params.id),
    getCurrentProfile(),
  ]);

  if (!booking) notFound();
  if (booking.payment_status === 'paid') redirect(`/booking/${params.id}/confirmation`);

  return <PaymentClient booking={booking as any} profile={profile} />;
}
