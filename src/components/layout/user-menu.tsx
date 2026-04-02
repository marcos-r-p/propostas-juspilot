'use client';

import { useAuth } from '@/hooks/use-auth';
import type { Profile } from '@/types';

interface UserMenuProps {
  profile: Profile | null;
}

export function UserMenu({ profile }: UserMenuProps) {
  const { signOut } = useAuth();

  const initials = profile?.nome
    ? profile.nome.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  return (
    <div className="border-t border-[#e4e4e7] px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e4e4e7] text-xs font-semibold text-[#71717a]">{initials}</div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-[#09090b]">{profile?.nome || 'Carregando...'}</div>
          <div className="truncate text-xs text-[#a1a1aa]">{profile?.cargo || ''}</div>
        </div>
        <button onClick={signOut} title="Sair" className="text-[#a1a1aa] transition-colors hover:text-[#09090b]">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  );
}
