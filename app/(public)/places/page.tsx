import { Suspense } from 'react';
import { getPlaces } from '@/lib/actions/places';
import { getUserLikes } from '@/lib/actions/auth';
import PlacesGrid from '@/components/places/PlacesGrid';
import PlacesFilterSidebar from '@/components/places/PlacesFilterSidebar';
import type { Metadata } from 'next';
import SortSelect from '@/components/places/SortSelect';

interface PlacesPageProps {
  searchParams: Promise<{
    type?: string; search?: string; province?: string;
    minPrice?: string; maxPrice?: string; page?: string; sort?: string;
  }>;
}

export async function generateMetadata({ searchParams }: PlacesPageProps): Promise<Metadata> {
  const sp = await searchParams;
  const typeLabel = sp.type === 'resort' ? 'Амралтын газрууд' :
                    sp.type === 'nature' ? 'Байгалийн газрууд' : 'Бүх газрууд';
  return { title: typeLabel };
}

export default async function PlacesPage({ searchParams }: PlacesPageProps) {
  const sp = await searchParams;
  const page = parseInt(sp.page ?? '1', 10);

  const [result, likedIds] = await Promise.all([
    getPlaces({
      type:      sp.type as any,
      search:    sp.search,
      province:  sp.province,
      minPrice:  sp.minPrice ? parseFloat(sp.minPrice) : undefined,
      maxPrice:  sp.maxPrice ? parseFloat(sp.maxPrice) : undefined,
      page,
      pageSize:  12,
      sortBy:    (sp.sort as any) ?? 'created_at',
      sortOrder: 'desc',
    }),
    getUserLikes(),
  ]);

  return (
    <div className="page-container py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar filter */}
        <aside className="lg:col-span-1">
          <PlacesFilterSidebar current={sp} />
        </aside>

        {/* Main content */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-3xl font-semibold text-forest-900">
                {sp.type === 'resort' ? '🏕 Амралтын газрууд' :
                 sp.type === 'nature' ? '🌿 Байгалийн газрууд' : 'Бүх газрууд'}
              </h1>
              <p className="text-forest-500 text-sm mt-1">{result.count} газар олдлоо</p>
            </div>
            <SortSelect defaultSort={sp.sort ?? 'created_at'} />
          </div>

          <PlacesGrid
            places={result.data}
            likedIds={likedIds}
            pagination={{ page: result.page, totalPages: result.totalPages, count: result.count }}
            searchParams={sp as Record<string, string>}
          />
        </div>
      </div>
    </div>
  );
}
