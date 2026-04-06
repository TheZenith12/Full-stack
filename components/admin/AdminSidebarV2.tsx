'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Hotel, CalendarCheck, Star,
  Settings, LogOut, Users, MapPin, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from '@/lib/actions/auth';
import type { Profile } from '@/lib/types';

interface AdminSidebarProps {
  profile: Profile;
  assignedResort?: { id: string; name: string } | null;
}

export default function AdminSidebarV2({ profile, assignedResort }: AdminSidebarProps) {
  const pathname = usePathname();
  const isSuperAdmin = profile.role === 'super_admin';
  const isManager    = profile.role === 'manager';

  const superAdminLinks = [
    { group: 'ҮНДСЭН', items: [
      { href: '/admin',          label: 'Самбар',      icon: LayoutDashboard },
      { href: '/admin/resorts',  label: 'Газрууд',     icon: MapPin },
      { href: '/admin/bookings', label: 'Захиалгууд',  icon: CalendarCheck },
      { href: '/admin/reviews',  label: 'Сэтгэгдлүүд', icon: Star },
    ]},
    { group: 'УДИРДЛАГА', items: [
      { href: '/admin/users',    label: 'Хэрэглэгчид', icon: Users },
      { href: '/admin/settings', label: 'Тохиргоо',    icon: Settings },
    ]},
  ];

  const managerLinks = assignedResort ? [
    { group: 'МИНИЙ ГАЗАР', items: [
      { href: '/admin/my-resort',          label: assignedResort.name, icon: Hotel },
      { href: '/admin/my-resort/rooms',    label: 'Өрөөнүүд',         icon: LayoutDashboard },
      { href: '/admin/my-resort/bookings', label: 'Захиалгууд',       icon: CalendarCheck },
      { href: '/admin/my-resort/reviews',  label: 'Сэтгэгдлүүд',     icon: Star },
    ]},
  ] : [];

  const navLinks = isSuperAdmin ? superAdminLinks : managerLinks;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-forest-950 flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-forest-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-forest-700 rounded-lg flex items-center justify-center">
            <span className="text-amber-300 text-sm">🌿</span>
          </div>
          <div>
            <div className="text-white font-semibold text-sm">Монгол Нутаг</div>
            <div className="text-forest-400 text-[10px] uppercase tracking-wide">
              {isSuperAdmin ? 'Super Admin' : 'Manager Panel'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navLinks.map((group) => (
          <div key={group.group}>
            <div className="text-forest-500 text-[10px] font-semibold uppercase tracking-widest px-2 mb-1.5">
              {group.group}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((link) => {
                const Icon = link.icon;
                const active = pathname === link.href ||
                  (link.href !== '/admin' && pathname.startsWith(link.href));
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
                        active
                          ? 'bg-forest-700 text-white font-medium'
                          : 'text-forest-300 hover:bg-forest-800 hover:text-white'
                      )}
                    >
                      <Icon size={16} className="flex-shrink-0" />
                      <span className="flex-1 truncate">{link.label}</span>
                      {active && <ChevronRight size={14} className="opacity-50" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {isManager && assignedResort && (
          <div className="mx-2 mt-4 p-3 bg-forest-900 rounded-xl border border-forest-700">
            <div className="text-forest-400 text-[10px] uppercase tracking-wide mb-1">
              Оноогдсон газар
            </div>
            <div className="text-white text-xs font-medium truncate">
              🏕 {assignedResort.name}
            </div>
            <Link
              href={`/places/${assignedResort.id}`}
              target="_blank"
              className="text-amber-400 text-[10px] hover:text-amber-300 mt-1 block"
            >
              Нийтийн хуудас харах →
            </Link>
          </div>
        )}
      </nav>

      {/* Profile + Logout */}
      <div className="px-3 py-4 border-t border-forest-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-forest-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {profile.full_name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <div className="text-white text-xs font-medium truncate">
              {profile.full_name ?? 'Хэрэглэгч'}
            </div>
            <div className="text-forest-400 text-[10px] capitalize">
              {profile.role.replace('_', ' ')}
            </div>
          </div>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-forest-400 hover:bg-forest-800 hover:text-white text-sm transition-colors"
          >
            <LogOut size={15} /> Гарах
          </button>
        </form>
      </div>
    </aside>
  );
}