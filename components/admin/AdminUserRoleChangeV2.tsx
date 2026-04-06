'use client';

import { useState, useTransition } from 'react';
import { assignManagerAction, revokeManagerAction } from '@/lib/actions/admin';
import { formatDate } from '@/lib/utils';
import { ChevronDown, Key, UserX, AlertCircle, Check } from 'lucide-react';

interface Resort { id: string; name: string; is_published: boolean }
interface User {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  created_at: string;
  managed_resort?: { resort_id: string; resort: Resort }[] | null;
}

interface Props {
  users: User[];
  availableResorts: Resort[]; // manager оноогдоогүй resort-ууд
}

export default function AdminUserRoleChangeV2({ users, availableResorts }: Props) {
  const [selectedResort, setSelectedResort] = useState<Record<string, string>>({});
  const [result, setResult]   = useState<Record<string, { ok: boolean; msg: string }>>({});
  const [pending, startTransition] = useTransition();
  const [loadingId, setLoadingId]  = useState<string | null>(null);

  async function handleAssign(userId: string) {
    const resortId = selectedResort[userId];
    if (!resortId) return;
    setLoadingId(userId);
    startTransition(async () => {
      const { error } = await assignManagerAction(userId, resortId);
      setResult(r => ({
        ...r,
        [userId]: error
          ? { ok: false, msg: error }
          : { ok: true,  msg: 'Manager болголоо' },
      }));
      setLoadingId(null);
    });
  }

  async function handleRevoke(userId: string) {
    if (!confirm('Manager эрхийг буцааж авах уу?')) return;
    setLoadingId(userId);
    startTransition(async () => {
      const { error } = await revokeManagerAction(userId);
      setResult(r => ({
        ...r,
        [userId]: error
          ? { ok: false, msg: error }
          : { ok: true,  msg: 'Эрх буцаан авлаа' },
      }));
      setLoadingId(null);
    });
  }

  return (
    <div className="space-y-3">
      {users.map((user) => {
        const isManager    = user.role === 'manager';
        const isSuperAdmin = user.role === 'super_admin';
        const assignedResort = user.managed_resort?.[0]?.resort;
        const res = result[user.id];

        return (
          <div key={user.id}
            className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            {/* Avatar + info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-semibold text-sm flex-shrink-0">
                {user.full_name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-forest-900 text-sm truncate">
                  {user.full_name ?? '—'}
                </div>
                <div className="text-forest-400 text-xs">{formatDate(user.created_at)}</div>
              </div>
            </div>

            {/* Role badge */}
            <div className="flex-shrink-0">
              {isSuperAdmin && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-medium">
                  👑 Super Admin
                </span>
              )}
              {isManager && (
                <div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-forest-50 text-forest-700 border border-forest-200 rounded-full text-xs font-medium">
                    🔑 Manager
                  </span>
                  {assignedResort && (
                    <div className="text-xs text-forest-500 mt-1 text-center">
                      🏕 {assignedResort.name}
                    </div>
                  )}
                </div>
              )}
              {!isManager && !isSuperAdmin && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-full text-xs">
                  👤 Хэрэглэгч
                </span>
              )}
            </div>

            {/* Actions */}
            {!isSuperAdmin && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {isManager ? (
                  <button
                    onClick={() => handleRevoke(user.id)}
                    disabled={loadingId === user.id}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    <UserX size={13} /> Эрх буцааж авах
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <select
                        value={selectedResort[user.id] ?? ''}
                        onChange={(e) =>
                          setSelectedResort(s => ({ ...s, [user.id]: e.target.value }))
                        }
                        className="appearance-none pl-3 pr-8 py-2 text-xs border border-gray-200 rounded-xl bg-white text-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-400/30 min-w-[180px]"
                      >
                        <option value="">— Амралтын газар сонгох —</option>
                        {availableResorts.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} {!r.is_published ? '(нийтлэгдээгүй)' : ''}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    <button
                      onClick={() => handleAssign(user.id)}
                      disabled={!selectedResort[user.id] || loadingId === user.id}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-forest-700 text-white text-xs font-medium hover:bg-forest-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Key size={13} /> Manager болгох
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Result */}
            {res && (
              <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg ${
                res.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
              }`}>
                {res.ok ? <Check size={12} /> : <AlertCircle size={12} />}
                {res.msg}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}