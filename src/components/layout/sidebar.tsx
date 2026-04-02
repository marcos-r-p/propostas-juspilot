'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { UserMenu } from './user-menu';
import type { Profile } from '@/types';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/nova', label: 'Nova Proposta', icon: '➕' },
  { href: '/configuracoes', label: 'Configurações', icon: '⚙️' },
];

interface SidebarProps {
  profile: Profile | null;
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-[#e4e4e7] bg-white">
      <div className="border-b border-[#e4e4e7] px-5 py-5">
        <div className="text-base font-bold text-[#09090b]">⚖️ JusPilot</div>
        <div className="mt-0.5 text-xs text-[#a1a1aa]">Propostas Comerciais</div>
      </div>
      <nav className="flex-1 px-3 py-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href} className={cn('mb-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors', isActive ? 'bg-[#f4f4f5] font-medium text-[#09090b]' : 'text-[#71717a] hover:bg-[#f4f4f5] hover:text-[#09090b]')}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <UserMenu profile={profile} />
    </aside>
  );
}
