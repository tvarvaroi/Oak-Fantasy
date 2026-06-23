'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Users, UserCog, ShoppingBag } from 'lucide-react';

// Left navigation for the admin shell. Client component because the active
// state depends on the current pathname. Items whose tools don't exist yet
// (Subscribers/Task 2.5, Profile/2.6, Comenzi/2.8) render muted + disabled
// (D1) — visible so the founder sees the roadmap, but not clickable.

type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  enabled: boolean;
};

const NAV: NavItem[] = [
  { label: 'Panou', href: '/admin', icon: LayoutDashboard, enabled: true },
  { label: 'Produse', href: '/admin/produse', icon: Package, enabled: true },
  { label: 'Abonați', href: '/admin/subscribers', icon: Users, enabled: true },
  { label: 'Profil', href: '/admin/profile', icon: UserCog, enabled: true },
  { label: 'Comenzi', href: '/admin/comenzi', icon: ShoppingBag, enabled: true },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1" aria-label="Navigare administrare">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = item.enabled && isActive(pathname, item.href);

        const inner = (
          <>
            <Icon size={18} strokeWidth={1.75} aria-hidden />
            <span className="font-caudex" style={{ letterSpacing: '0.03em' }}>
              {item.label}
            </span>
          </>
        );

        const base =
          'flex items-center gap-3 rounded-md px-3 py-2.5 text-[0.92rem] transition-colors duration-150';

        if (!item.enabled) {
          return (
            <span
              key={item.href}
              aria-disabled
              title="În curând"
              className={`${base} cursor-not-allowed select-none`}
              style={{ color: 'var(--ink-soft)', opacity: 0.4 }}
            >
              {inner}
            </span>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={base}
            style={{
              color: active ? 'var(--cream-warm)' : 'var(--ink-soft)',
              backgroundColor: active ? 'var(--oak-warm)' : 'transparent',
              boxShadow: active
                ? 'inset 0 1px 0 rgba(255,255,255,0.12), 0 1px 3px rgba(31,24,16,0.18)'
                : 'none',
            }}
          >
            {inner}
          </Link>
        );
      })}
    </nav>
  );
}
