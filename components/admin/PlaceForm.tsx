'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CldUploadWidget } from 'next-cloudinary';
import { MapPin, Upload, X, Save, Eye, Building2, Leaf } from 'lucide-react';
import { createPlace, updatePlace } from '@/lib/actions/places';
import { toast } from 'react-hot-toast';
import { MONGOLIAN_PROVINCES } from '@/lib/types';
import type { Place, PlaceFormData, PlaceType } from '@/lib/types';

interface PlaceFormProps {
  place?: Place;
  mode: 'create' | 'edit';
}

export default function PlaceForm({ place, mode }: PlaceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<PlaceType>(place?.type ?? 'resort');
  const [form, setForm] = useState({
    name:            place?.name ?? '',
    description:     place?.description ?? '',
    short_desc:      place?.short_desc ?? '',
    price_per_night: place?.price_per_night?.toString() ?? '',
    phone:           place?.phone ?? '',
    email:           place?.email ?? '',
    website:         place?.website ?? '',
    latitude:        place?.latitude?.toString() ?? '',
    longitude:       place?.longitude?.toString() ?? '',
    address:         place?.address ?? '',
    province:        place?.province ?? '',
    district:        place?.district ?? '',
    video_url:       place?.video_url ?? '',
  });
  const [coverImage, setCoverImage] = useState(place?.cover_image ?? '');
  const [images, setImages] = useState<string[]>(place?.images ?? []);
  const [isPublished, setIsPublished] = useState(place?.is_published ?? false);
  const [isFeatured, setIsFeatured] = useState(place?.is_featured ?? false);

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Нэр оруулна уу'); return; }

    setLoading(true);
    try {
      const data: PlaceFormData = {
        type,
        name:            form.name,
        description:     form.description || undefined,
        short_desc:      form.short_desc || undefined,
        price_per_night: form.price_per_night ? parseFloat(form.price_per_night) : undefined,
        phone:           form.phone || undefined,
        email:           form.email || undefined,
        website:         form.website || undefined,
        latitude:        form.latitude ? parseFloat(form.latitude) : undefined,
        longitude:       form.longitude ? parseFloat(form.longitude) : undefined,
        address:         form.address || undefined,
        province:        form.province || undefined,
        district:        form.district || undefined,
        video_url:       form.video_url || undefined,
        cover_image:     coverImage || undefined,
        images,
        is_published:    isPublished,
        is_featured:     isFeatured,
      } as PlaceFormData;

      if (mode === 'create') {
        const created = await createPlace(data);
        toast.success('Газар амжилттай нэмэгдлээ!');
        router.push(`/admin/places`);
      } else {
        await updatePlace(place!.id, data);
        toast.success('Мэдээлэл шинэчлэгдлээ!');
        router.push('/admin/places');
      }
    } catch (err: any) {
      toast.error(err.message ?? 'Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-semibold text-forest-900">
          {mode === 'create' ? 'Шинэ газар нэмэх' : 'Газар засах'}
        </h1>
        {place && (
          <a href={`/places/${place.id}`} target="_blank" className="btn-secondary text-sm">
            <Eye size={15} /> Харах
          </a>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type selector */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-forest-900 mb-4">Газрын төрөл</h2>
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: 'resort', label: 'Амралтын газар', icon: Building2, desc: 'Зочид буудал, амрах бааз, кемп' },
              { value: 'nature', label: 'Байгалийн газар', icon: Leaf,      desc: 'Уул, нуур, хавцал, ой' },
            ] as const).map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    type === t.value
                      ? 'border-forest-600 bg-forest-50'
                      : 'border-gray-100 hover:border-forest-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    type === t.value ? 'bg-forest-600 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <Icon size={19} />
                  </div>
                  <div>
                    <div className="font-medium text-forest-900 text-sm">{t.label}</div>
                    <div className="text-xs text-forest-500 mt-0.5">{t.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Basic info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-forest-900 mb-4">Үндсэн мэдээлэл</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5">Нэр *</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5">Товч тайлбар</label>
              <input value={form.short_desc} onChange={(e) => set('short_desc', e.target.value)} className="input-field" placeholder="Картад харагдах товч тайлбар" />
            </div>
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5">Дэлгэрэнгүй тайлбар</label>
              <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={5} className="input-field resize-none" />
            </div>
            {type === 'resort' && (
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1.5">Үнэ (₮ / шөнө)</label>
                <input type="number" value={form.price_per_night} onChange={(e) => set('price_per_night', e.target.value)} className="input-field" placeholder="150000" />
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-forest-900 mb-4">Байршил</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-forest-700 mb-1.5">Хаяг</label>
              <input value={form.address} onChange={(e) => set('address', e.target.value)} className="input-field" placeholder="Дэлгэрэнгүй хаяг" />
            </div>
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5">Аймаг</label>
              <select value={form.province} onChange={(e) => set('province', e.target.value)} className="input-field">
                <option value="">Сонгох</option>
                {MONGOLIAN_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5">Сум/Дүүрэг</label>
              <input value={form.district} onChange={(e) => set('district', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5">Өргөрөг (Latitude)</label>
              <input type="number" step="any" value={form.latitude} onChange={(e) => set('latitude', e.target.value)} className="input-field" placeholder="47.9077" />
            </div>
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5">Уртраг (Longitude)</label>
              <input type="number" step="any" value={form.longitude} onChange={(e) => set('longitude', e.target.value)} className="input-field" placeholder="106.8832" />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-forest-900 mb-4">Холбоо барих</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5">Утас</label>
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className="input-field" placeholder="+976 9900-0000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-forest-700 mb-1.5">И-мэйл</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="input-field" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-forest-700 mb-1.5">Вэбсайт</label>
              <input value={form.website} onChange={(e) => set('website', e.target.value)} className="input-field" placeholder="https://" />
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-forest-900 mb-4">Зураг & Медиа</h2>

          {/* Cover image */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-forest-700 mb-2">Нүүр зураг</label>
            {coverImage ? (
              <div className="relative w-full h-48 rounded-xl overflow-hidden group">
                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setCoverImage('')}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <CldUploadWidget
                uploadPreset="mongolian_resorts"
                onSuccess={(result: any) => {
                  setCoverImage(result.info.secure_url);
                }}
              >
                {({ open }) => (
                  <button type="button" onClick={() => open()}
                    className="w-full h-36 border-2 border-dashed border-forest-200 rounded-xl flex flex-col items-center justify-center gap-2 text-forest-400 hover:border-forest-400 hover:text-forest-600 transition-colors">
                    <Upload size={24} />
                    <span className="text-sm">Нүүр зураг оруулах</span>
                  </button>
                )}
              </CldUploadWidget>
            )}
          </div>

          {/* Gallery */}
          <div>
            <label className="block text-sm font-medium text-forest-700 mb-2">Зургийн цомог</label>
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))}
                    className="absolute inset-0 bg-red-500/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={16} />
                  </button>
                </div>
              ))}
              <CldUploadWidget
                uploadPreset="mongolian_resorts"
                options={{ multiple: true, maxFiles: 20 }}
                onSuccess={(result: any) => {
                  setImages((prev) => [...prev, result.info.secure_url]);
                }}
              >
                {({ open }) => (
                  <button type="button" onClick={() => open()}
                    className="aspect-square border-2 border-dashed border-forest-200 rounded-xl flex flex-col items-center justify-center gap-1 text-forest-400 hover:border-forest-400 transition-colors">
                    <Upload size={18} />
                    <span className="text-xs">Нэмэх</span>
                  </button>
                )}
              </CldUploadWidget>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-forest-700 mb-1.5">Видео URL</label>
            <input value={form.video_url} onChange={(e) => set('video_url', e.target.value)} className="input-field" placeholder="YouTube эсвэл Cloudinary URL" />
          </div>
        </div>

        {/* Publish settings */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-forest-900 mb-4">Нийтлэлийн тохиргоо</h2>
          <div className="space-y-4">
            {[
              { key: 'published', label: 'Нийтлэх', desc: 'Хэрэглэгчдэд харагдана', value: isPublished, set: setIsPublished },
              { key: 'featured',  label: 'Онцлох',   desc: 'Нүүр хуудсанд онцлох',   value: isFeatured,  set: setIsFeatured  },
            ].map((opt) => (
              <label key={opt.key} className="flex items-center gap-4 cursor-pointer">
                <div
                  onClick={() => opt.set(!opt.value)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${opt.value ? 'bg-forest-600' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${opt.value ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </div>
                <div>
                  <div className="text-sm font-medium text-forest-800">{opt.label}</div>
                  <div className="text-xs text-forest-500">{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            Болих
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Хадгалж байна...' : (
              <><Save size={16} /> {mode === 'create' ? 'Газар нэмэх' : 'Хадгалах'}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
