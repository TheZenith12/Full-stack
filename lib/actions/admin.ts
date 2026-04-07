'use server';

import { createServerSupabaseClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function requireSuperAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Нэвтрэх шаардлагатай');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile as any).role !== 'super_admin') throw new Error('Эрх байхгүй');
  return { supabase, user };
}

async function requireManager() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile as any).role !== 'manager') redirect('/');
  const { data: assignment } = await supabase
    .from('manager_resorts').select('place_id').eq('manager_id', user.id).single();
  if (!assignment) redirect('/auth/login?error=no_resort');
  return { supabase, user, resortId: (assignment as any).place_id as string };
}

// ── Super Admin: Manager-т resort оноох ──────────────────────────────────────
export async function assignManagerAction(
  userId: string, resortId: string
): Promise<{ error: string | null }> {
  if (!userId || !resortId) return { error: 'userId болон resortId шаардлагатай' };
  try {
    const { supabase, user } = await requireSuperAdmin();

    // Хуучин assignment устгана
    await (supabase as any).from('manager_resorts').delete().eq('manager_id', userId);

    // Шинэ assignment нэмнэ
    const { error: assignErr } = await (supabase as any)
      .from('manager_resorts')
      .insert({ manager_id: userId, place_id: resortId, assigned_by: user.id });
    if (assignErr) return { error: assignErr.message };

    // Role-ийг manager болгоно
    const { error: roleErr } = await (supabase as any)
      .from('profiles')
      .update({ role: 'manager', updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (roleErr) return { error: roleErr.message };

    revalidatePath('/admin/users');
    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ── Super Admin: Manager role буцаах ─────────────────────────────────────────
export async function revokeManagerAction(userId: string): Promise<{ error: string | null }> {
  if (!userId) return { error: 'userId шаардлагатай' };
  try {
    const { supabase, user } = await requireSuperAdmin();
    if (userId === user.id) return { error: 'Өөрийнхөө эрхийг буцааж авах боломжгүй' };

    await (supabase as any).from('manager_resorts').delete().eq('manager_id', userId);
    await (supabase as any).from('profiles')
      .update({ role: 'user', updated_at: new Date().toISOString() })
      .eq('id', userId);

    revalidatePath('/admin/users');
    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ── Super Admin: Бүх хэрэглэгчид ─────────────────────────────────────────────
export async function getAllUsersAction() {
  try {
    const { supabase } = await requireSuperAdmin();
    const { data, error } = await (supabase as any)
      .from('profiles')
      .select('*, manager_resorts(place_id, places(id, name))')
      .order('created_at', { ascending: false });
    return { data: data ?? [], error: error?.message ?? null };
  } catch (err: any) {
    return { data: [], error: err.message };
  }
}

// ── Super Admin: Бүх газрууд ──────────────────────────────────────────────────
export async function getAllResortsForAssign() {
  try {
    const { supabase } = await requireSuperAdmin();
    const { data, error } = await (supabase as any)
      .from('places')
      .select('id, name, province, cover_image')
      .eq('type', 'resort')
      .order('name');
    return { data: data ?? [], error: error?.message ?? null };
  } catch (err: any) {
    return { data: [], error: err.message };
  }
}

// ── Manager: Өөрийн resort авах ───────────────────────────────────────────────
export async function getMyResortAction() {
  try {
    const { supabase, resortId } = await requireManager();
    const { data, error } = await (supabase as any)
      .from('places').select('*').eq('id', resortId).single();
    return { data: data ?? null, error: error?.message ?? null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

// ── Manager: Өөрийн resort засах ─────────────────────────────────────────────
export async function updateMyResortAction(
  _ignored: string,  // Frontend-ийн resort_id-г IGNORE хийнэ
  formData: Record<string, unknown>
): Promise<{ error: string | null }> {
  try {
    const { supabase, resortId } = await requireManager();

    const SAFE_FIELDS = [
      'name', 'description', 'short_desc', 'phone', 'email',
      'website', 'address', 'province', 'district',
      'latitude', 'longitude', 'price_per_night',
      'cover_image', 'images', 'video_url',
    ];

    const safe: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const key of SAFE_FIELDS) {
      if (key in formData) safe[key] = formData[key];
    }

    const { error } = await (supabase as any)
      .from('places').update(safe).eq('id', resortId);  // DB-аас авсан ID

    if (error) return { error: error.message };
    revalidatePath('/admin/my-resort');
    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ── Manager: Өөрийн resort-ын захиалгууд ─────────────────────────────────────
export async function getMyBookingsAction(page = 1, pageSize = 20) {
  try {
    const { supabase, resortId } = await requireManager();
    const from = (page - 1) * pageSize;
    const { data, count, error } = await (supabase as any)
      .from('bookings')
      .select('*', { count: 'exact' })
      .eq('place_id', resortId)  // DB-аас авсан resort ID
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1);
    return { data: data ?? [], count: count ?? 0, error: error?.message ?? null };
  } catch (err: any) {
    return { data: [], count: 0, error: err.message };
  }
}

// ── Manager: Захиалгын статус өөрчлөх ────────────────────────────────────────
export async function updateBookingStatusAction(
  bookingId: string,
  status: 'confirmed' | 'cancelled' | 'completed'
): Promise<{ error: string | null }> {
  try {
    const { supabase, resortId } = await requireManager();

    // Захиалга манай resort-ынх эсэхийг ЗААВАЛ шалгана
    const { data: booking } = await (supabase as any)
      .from('bookings').select('place_id').eq('id', bookingId).single();

    if (!booking || booking.place_id !== resortId) {
      return { error: 'Эрхгүй эсвэл захиалга олдсонгүй' };
    }

    const { error } = await (supabase as any)
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId);

    return { error: error?.message ?? null };
  } catch (err: any) {
    return { error: err.message };
  }
}
