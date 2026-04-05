import { createServerSupabaseClient } from '@/lib/supabase-server';
import MapPageClient from '@/components/map/MapPageClient';

export const metadata = { title: 'Газрын зураг' };

export default async function MapPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('places')
    .select('*')
    .eq('is_published', true)
    .limit(200);
  return <MapPageClient places={(data ?? []) as any[]} />;
}
