import { notFound } from 'next/navigation';
import { getPlace } from '@/lib/actions/places';
import PlaceForm from '@/components/admin/PlaceForm';

export default async function EditPlacePage({ params }: { params: { id: string } }) {
  const place = await getPlace(params.id);
  if (!place) notFound();
  return <PlaceForm place={place} mode="edit" />;
}
