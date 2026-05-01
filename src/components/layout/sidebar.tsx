'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { JuspilotSymbol } from '@/components/brand/juspilot-symbol';
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
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile header */}
      <div className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b border-[#e4e4e7] bg-white px-4 py-3 md:hidden">
        <div className="flex items-center gap-2.5">
          <JuspilotSymbol size={32} />
          <div>
            <div className="text-sm font-bold text-[#09090b]">Juspilot</div>
            <div className="text-[10px] text-[#a1a1aa]">Propostas</div>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-[#e4e4e7] text-[#71717a]"
        >
          {mobileOpen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'flex h-screen w-60 flex-col border-r border-[#e4e4e7] bg-white',
        'fixed left-0 top-0 z-50 transition-transform duration-200 md:relative md:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="border-b border-[#e4e4e7] px-5 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <JuspilotSymbol size={36} />
              <div>
                <div className="text-sm font-bold text-[#09090b]">Juspilot</div>
                <div className="mt-0.5 text-[10px] text-[#a1a1aa]">Propostas</div>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-[#a1a1aa] md:hidden"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <nav className="flex-1 px-3 py-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn('mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors', isActive ? 'bg-[#D97757]/10 font-medium text-[#D97757]' : 'text-[#71717a] hover:bg-[#f4f4f5] hover:text-[#09090b]')}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <UserMenu profile={profile} />
      </aside>
    </>
  );
}
