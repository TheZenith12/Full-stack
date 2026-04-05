import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/actions/auth';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import PlaceCard from '@/components/places/PlaceCard';
import Link from 'next/link';
import type { Place } from '@/lib/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Миний дуртай газрууд | Монгол Нутаг',
};

export default async function FavoritesPage() {
  const profile = await getCurrentProfile() as any;
  if (!profile) redirect('/auth/login?redirect=/profile/favorites');

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('likes')
    .select('place_id, created_at, place:places(*)')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false });

  const favorites = (data ?? []) as any[];
  const places = favorites.map((f) => f.place).filter(Boolean) as Place[];

  return (
    <div className="page-container py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-semibold text-forest-900 mb-1">
              Миний дуртай газрууд
            </h1>
            <p className="text-forest-500 text-sm">
              {places.length > 0
                ? `${places.length} газар хадгалсан байна`
                : 'Та одоогоор дуртай газар хадгалаагүй байна'}
            </p>
          </div>
          <Link href="/" className="btn-secondary text-sm hidden sm:flex">
            Газар хайх
          </Link>
        </div>

        {places.length === 0 ? (
          <div className="card p-14 text-center">
            <div className="text-6xl mb-5">🤍</div>
            <h2 className="font-display text-2xl font-semibold text-forest-700 mb-3">
              Дуртай газар байхгүй байна
            </h2>
            <p className="text-forest-500 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
              Газрын дэлгэрэнгүй хуудсан дээрх ❤️ товчийг дарж дуртай газраа хадгалаарай.
            </p>
            <Link href="/" className="btn-primary">
              Газар үзэх
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} liked={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
