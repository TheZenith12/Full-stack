'use server';

import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import type { Profile } from '@/lib/types';

// ── HELPERS ──────────────────────────────────────────────────

export async function requireAuth() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  return { supabase, user };
}

export async function requireProfile() {
  const { supabase, user } = await requireAuth();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  if (!profile) redirect('/auth/login');
  return { supabase, user, profile: profile as Profile };
}

export async function requireSuperAdmin() {
  const ctx = await requireProfile();
  if (ctx.profile.role !== 'super_admin') redirect('/');
  return ctx;
}

// ── MANAGER HELPER ───────────────────────────────────────────
type ManagerResortAssignment = {
  resort_id: string;
};

export async function requireManager() {
  const ctx = await requireProfile();
  if (ctx.profile.role !== 'manager') redirect('/');

  const { data: assignment } = await ctx.supabase
    .from('manager_resorts')
    .select('resort_id')
    .eq('manager_id', ctx.user.id)
    .single<ManagerResortAssignment>();

  if (!assignment) redirect('/auth/login?error=no_resort_assigned');

  return { ...ctx, resortId: assignment.resort_id };
}

// ── SUPER ADMIN ACTIONS ───────────────────────────────────────

export async function assignManagerAction(
  userId: string,
  resortId: string
): Promise<{ error: string | null }> {
  const { supabase } = await requireSuperAdmin();
  const { error } = await (supabase.rpc as any)('assign_manager', {
    p_user_id: userId,
    p_resort_id: resortId,
  });
  if (error) return { error: error.message };
  return { error: null };
}

export async function revokeManagerAction(
  userId: string
): Promise<{ error: string | null }> {
  const { supabase } = await requireSuperAdmin();
  const { error } = await (supabase.rpc as any)('revoke_manager', {
    p_user_id: userId,
  });
  if (error) return { error: error.message };
  return { error: null };
}

export async function getAllUsersAction() {
  const { supabase } = await requireSuperAdmin();
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      managed_resort:manager_resorts(
        resort_id,
        resort:resorts(id, name, is_published)
      )
    `)
    .order('created_at', { ascending: false });
  return { data, error: error?.message ?? null };
}

export async function getAllResortsAction() {
  const { supabase } = await requireSuperAdmin();
  const { data, error } = await supabase
    .from('resorts')
    .select(`
      *,
      manager:manager_resorts(
        manager_id,
        profile:profiles(id, full_name, phone)
      )
    `)
    .order('created_at', { ascending: false });
  return { data, error: error?.message ?? null };
}

// ── MANAGER ACTIONS ───────────────────────────────────────────

export async function getMyResortAction() {
  const { supabase, resortId } = await requireManager();
  const { data, error } = await supabase
    .from('resorts')
    .select('*')
    .eq('id', resortId)
    .single();
  if (!data || error) return { data: null, error: 'Амралтын газар олдсонгүй' };
  return { data, error: null };
}

export async function updateMyResortAction(
  resortId: string,
  formData: Record<string, unknown>
): Promise<{ data: unknown; error: string | null }> {
  const { supabase, resortId: myResortId } = await requireManager();
  if (resortId !== myResortId) {
    return { data: null, error: 'Та энэ амралтын газрыг засах эрхгүй' };
  }
  const { data, error } = await (supabase.rpc as any)('update_my_resort', {
    p_resort_id: resortId,
    p_data: formData,
  });
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function getMyRoomsAction() {
  const { supabase, resortId } = await requireManager();
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('resort_id', resortId)
    .order('price_per_night', { ascending: true });
  return { data: data ?? [], error: error?.message ?? null };
}

export async function getMyBookingsAction(params?: {
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const { supabase, resortId } = await requireManager();
  let query = supabase
    .from('bookings')
    .select('*, room:rooms(name)', { count: 'exact' })
    .eq('resort_id', resortId)
    .order('created_at', { ascending: false });

  if (params?.status) query = (query as any).eq('status', params.status);

  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;
  query = (query as any).range((page - 1) * pageSize, page * pageSize - 1);

  const { data, count, error } = await query;
  return { data: data ?? [], count: count ?? 0, error: error?.message ?? null };
}

export async function updateBookingStatusAction(
  bookingId: string,
  status: 'confirmed' | 'cancelled' | 'completed'
): Promise<{ error: string | null }> {
  const { supabase, resortId } = await requireManager();

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, resort_id')
    .eq('id', bookingId)
    .single<{ id: string; resort_id: string }>();

  if (!booking || booking.resort_id !== resortId) {
    return { error: 'Захиалга олдсонгүй эсвэл эрхгүй' };
  }

  const { error } = await (supabase.from('bookings') as any)
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', bookingId);

  return { error: error?.message ?? null };
}