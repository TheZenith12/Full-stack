import { notFound, redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getCurrentProfile } from '@/lib/actions/auth';
import PaymentClient from '@/components/booking/PaymentClient';

export default async function PaymentPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('bookings')
    .select('*, place:places(id, name, cover_image, price_per_night, type)')
    .eq('id', params.id)
    .single();

  const booking = data as any;

  if (!booking) notFound();
  if (booking.payment_status === 'paid') redirect(`/booking/${params.id}/confirmation`);

  const profile = await getCurrentProfile();

  return <PaymentClient booking={booking} profile={profile} />;
}