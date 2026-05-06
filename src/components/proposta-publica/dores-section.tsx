'use client';

import { useState } from 'react';
import type { Proposta } from '@/types';
import { getDoresByIds, getSuggestedDores } from '@/lib/constants/dores';
import type { DorId } from '@/lib/constants/dores';
import { useReveal } from '@/hooks/use-reveal';
import { deriveProfile } from '@/lib/utils/proposta-profile';

interface DoresSectionProps {
  proposta: Proposta;
}

function DorCard({ dor, index, suggested }: { dor: { id: string; label: string; description: string; solution: string; iconPath: string }; index: number; suggested: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const { ref, isVisible } = useReveal();

  return (
    <div
      ref={ref}
      className={`vt-reveal ${isVisible ? 'visible' : ''} group relative cursor-pointer bg-[var(--vt-ink)] p-10 transition-[background] duration-350 hover:bg-[var(--vt-ink-soft)] ${suggested ? 'border-l-2 border-[var(--vt-brand)]/40' : ''}`}
      style={{ transitionDelay: `${index * 0.08}s` }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Left border accent */}
      <div className={`absolute left-0 top-10 w-[3px] bg-[var(--vt-brand)] transition-[height] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${expanded ? 'h-[calc(100%-80px)]' : 'h-0 group-hover:h-[calc(100%-80px)]'}`} />

      {/* Chevron arrow */}
      <div className={`absolute right-9 top-10 text-[var(--vt-graphite)] transition-[color,transform] duration-300 group-hover:text-[var(--vt-whisper)] ${expanded ? 'rotate-180 !text-[var(--vt-paper)]' : ''}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {/* Icon */}
      <div className="mb-5 text-[var(--vt-mute)] transition-colors duration-300 group-hover:text-[var(--vt-paper)]">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <path d={dor.iconPath} />
        </svg>
      </div>

      <div className="pr-8 text-[17px] font-semibold tracking-[0.01em] text-[var(--vt-paper)]">
        {dor.label}
      </div>
      <div className="mt-2.5 text-sm leading-[1.6] text-[var(--vt-whisper)]">
        {dor.description}
      </div>

      {/* Expandable solution */}
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${expanded ? 'max-h-[120px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="mt-3.5 border-t border-[var(--vt-paper)]/6 pt-3.5 text-[13px] leading-[1.6] text-[var(--vt-mute)]">
          {dor.solution}
        </div>
      </div>
    </div>
  );
}

export function DoresSection({ proposta }: DoresSectionProps) {
  const profile = deriveProfile(proposta);
  const dores = getDoresByIds((proposta.escritorio_dores || []) as DorId[]);
  const suggestedIds = new Set(
    getSuggestedDores(proposta.escritorio_areas ?? [], proposta.escritorio_perfil).map((d) => d.id)
  );
  const sortedDores = [...dores].sort((a, b) => {
    const aSuggested = suggestedIds.has(a.id as DorId);
    const bSuggested = suggestedIds.has(b.id as DorId);
    if (aSuggested && !bSuggested) return -1;
    if (!aSuggested && bSuggested) return 1;
    return 0;
  });

  const label = useReveal();
  const title = useReveal();

  if (dores.length === 0) return null;

  return (
    <section id="diagnostico" className="relative mx-auto max-w-[1100px] px-6 py-24 sm:px-12">
      {/* Decorative clipboard — desktop only */}
      <img
        src="/brand/illustrations/elemento-1-clipboard.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute right-10 top-20 hidden h-[200px] w-auto opacity-10 lg:block"
      />

      <div
        ref={label.ref}
        className={`vt-reveal ${label.isVisible ? 'visible' : ''} mb-3.5 flex items-center gap-4 text-[11px] uppercase tracking-[0.14em] text-[var(--vt-mute)]`}
      >
        <span className="h-px w-6 bg-[var(--vt-brand)]" />
        Diagnóstico
      </div>
      <div
        ref={title.ref}
        className={`vt-reveal ${title.isVisible ? 'visible' : ''} mb-14 text-4xl font-extrabold leading-[1.12] text-[var(--vt-paper)]`}
        style={{ transitionDelay: '0.1s' }}
      >
        {profile.diagnosticoTitle}
      </div>

      <div className="mosaic-grid grid-cols-1 md:grid-cols-2">
        {sortedDores.map((dor, i) => {
          const isLastOdd = sortedDores.length % 2 !== 0 && i === sortedDores.length - 1;
          const isSuggested = suggestedIds.has(dor.id as DorId);
          return (
            <div key={dor.id} className={isLastOdd ? 'md:col-span-2' : ''}>
              <DorCard dor={dor} index={i} suggested={isSuggested} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
