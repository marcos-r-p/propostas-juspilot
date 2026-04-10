'use client';

import { useState } from 'react';
import type { Proposta } from '@/types';
import { getDoresByIds } from '@/lib/constants/dores';
import type { DorId } from '@/lib/constants/dores';
import { useReveal } from '@/hooks/use-reveal';

interface DoresSectionProps {
  proposta: Proposta;
}

function DorCard({ dor, index }: { dor: { id: string; label: string; description: string; solution: string; iconPath: string }; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const { ref, isVisible } = useReveal();

  return (
    <div
      ref={ref}
      className={`vt-reveal ${isVisible ? 'visible' : ''} group relative cursor-pointer bg-[var(--vt-ink)] p-10 transition-[background] duration-350 hover:bg-[var(--vt-ink-soft)]`}
      style={{ transitionDelay: `${index * 0.08}s` }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Left border accent */}
      <div className={`absolute left-0 top-10 w-[3px] bg-[var(--vt-paper)] transition-[height] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${expanded ? 'h-[calc(100%-80px)]' : 'h-0 group-hover:h-[calc(100%-80px)]'}`} />

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
  const dores = getDoresByIds((proposta.escritorio_dores || []) as DorId[]);
  const label = useReveal();
  const title = useReveal();

  if (dores.length === 0) return null;

  return (
    <section id="diagnostico" className="mx-auto max-w-[1100px] px-6 py-24 sm:px-12">
      <div
        ref={label.ref}
        className={`vt-reveal ${label.isVisible ? 'visible' : ''} mb-3.5 flex items-center gap-4 text-[11px] uppercase tracking-[0.14em] text-[var(--vt-mute)]`}
      >
        <span className="h-px w-6 bg-[var(--vt-graphite)]" />
        Diagnóstico
      </div>
      <div
        ref={title.ref}
        className={`vt-reveal ${title.isVisible ? 'visible' : ''} mb-14 font-display text-4xl font-semibold leading-[1.12] text-[var(--vt-paper)]`}
        style={{ transitionDelay: '0.1s' }}
      >
        O que identificamos no seu escritório
      </div>

      <div className="mosaic-grid grid-cols-1 md:grid-cols-2">
        {dores.map((dor, i) => (
          <DorCard key={dor.id} dor={dor} index={i} />
        ))}
      </div>
    </section>
  );
}
