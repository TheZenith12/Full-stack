import Link from 'next/link';
import Image from 'next/image';
import { getAdminPlaces } from '@/lib/actions/places';
import { getCurrentProfile } from '@/lib/actions/auth';
import { formatPrice, getPlaceTypeLabel, getPlaceTypeColor } from '@/lib/utils';
import { Plus, Edit, Trash2, Eye, EyeOff, MapPin } from 'lucide-react';
import AdminPlaceActions from '@/components/admin/AdminPlaceActions';

export default async function AdminPlacesPage({
  searchParams,
}: {
  searchParams: { page?: string; type?: string; search?: string };
}) {
  const [profile, result] = await Promise.all([
    getCurrentProfile(),
    getAdminPlaces({
      page:     parseInt(searchParams.page ?? '1'),
      type:     searchParams.type as any,
      search:   searchParams.search,
      pageSize: 15,
    }),
  ]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold text-forest-900">Газрууд</h1>
          <p className="text-forest-500 text-sm mt-1">{result.count} нийт газар</p>
        </div>
        <Link href="/admin/places/new" className="btn-primary">
          <Plus size={17} /> Шинэ газар нэмэх
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex gap-3">
        <form className="flex gap-3 flex-1">
          <input
            name="search"
            defaultValue={searchParams.search}
            placeholder="Нэрээр хайх..."
            className="input-field flex-1 text-sm py-2"
          />
          <select name="type" defaultValue={searchParams.type ?? ''} className="input-field w-44 text-sm py-2">
            <option value="">Бүгд</option>
            <option value="resort">Амралтын газар</option>
            <option value="nature">Байгалийн газар</option>
          </select>
          <button type="submit" className="btn-primary text-sm py-2">Хайх</button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-forest-500 uppercase tracking-wide">Газар</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-forest-500 uppercase tracking-wide hidden sm:table-cell">Төрөл</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-forest-500 uppercase tracking-wide hidden md:table-cell">Байршил</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-forest-500 uppercase tracking-wide hidden lg:table-cell">Үнэ</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-forest-500 uppercase tracking-wide">Статус</th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-forest-500 uppercase tracking-wide">Үйлдэл</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {result.data.map((place) => (
              <tr key={place.id} className="hover:bg-gray-50/60 transition-colors">
                {/* Place info */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-forest-100 flex-shrink-0">
                      {place.cover_image ? (
                        <Image src={place.cover_image} alt={place.name} width={48} height={48} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">
                          {place.type === 'resort' ? '🏕' : '🌿'}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-forest-900 text-sm">{place.name}</div>
                      <div className="text-xs text-forest-400 mt-0.5">
                        👁 {place.view_count} · ❤️ {place.like_count}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 hidden sm:table-cell">
                  <span className={`badge text-xs ${getPlaceTypeColor(place.type)}`}>
                    {getPlaceTypeLabel(place.type)}
                  </span>
                </td>

                <td className="px-4 py-4 hidden md:table-cell">
                  {place.province ? (
                    <div className="flex items-center gap-1 text-forest-500 text-xs">
                      <MapPin size={12} /> {place.province}
                    </div>
                  ) : <span className="text-forest-300 text-xs">—</span>}
                </td>

                <td className="px-4 py-4 hidden lg:table-cell">
                  <span className="text-forest-700 text-sm font-medium">
                    {place.price_per_night ? formatPrice(place.price_per_night) : '—'}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <span className={`badge text-xs ${place.is_published
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                    {place.is_published ? '✓ Нийтлэгдсэн' : '○ Ноорог'}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <AdminPlaceActions place={place} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {result.data.length === 0 && (
          <div className="text-center py-16 text-forest-400">
            <p className="text-sm">Газар олдсонгүй</p>
          </div>
        )}
      </div>
    </div>
  );
}
