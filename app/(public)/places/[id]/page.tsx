import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import PlaceDetailClient from '@/components/places/PlaceDetailClient';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('places')
    .select('name, short_desc, cover_image, province, type')
    .eq('id', params.id)
    .single();
  const place = data as any;
  if (!place) return { title: 'Газар олдсонгүй | Монгол Нутаг' };

  const typeLabel = place.type === 'resort' ? 'Амралтын газар' : 'Байгалийн газар';
  const description = place.short_desc
    ?? `${place.province ? place.province + ' дахь ' : ''}${typeLabel} — Монгол Нутаг платформд захиалаарай.`;

  return {
    title: `${place.name} | Монгол Нутаг`,
    description,
    keywords: [place.name, typeLabel, place.province, 'Монгол', 'амралт', 'байгаль'].filter(Boolean),
    openGraph: {
      title: place.name,
      description,
      images: place.cover_image ? [{ url: place.cover_image, alt: place.name }] : [],
      locale: 'mn_MN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: place.name,
      description,
      images: place.cover_image ? [place.cover_image] : [],
    },
  };
}

export default async function PlacePage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('places')
    .select('*, reviews(*, user:profiles(id, full_name))')
    .eq('id', params.id)
    .single();

  const place = data as any;
  if (!place) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  let likedIds: string[] = [];
  let profile = null;
  if (user) {
    const [likesRes, profileRes] = await Promise.all([
      supabase.from('likes').select('place_id').eq('user_id', user.id),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
    ]);
    likedIds = (likesRes.data ?? []).map((l: any) => l.place_id);
    profile = profileRes.data as any;
  }

//   await supabase.rpc(
//   'increment_view_count',
//   { place_id: params.id } as unknown as never
// );

await (supabase.rpc as any)(
  'increment_view_count',
  { place_id: params.id }
);

  return (
    <PlaceDetailClient
      place={place}
      initialLiked={likedIds.includes(place.id)}
      profile={profile}
    />
  );
}
