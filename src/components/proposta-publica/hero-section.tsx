'use client';

import type { Proposta } from '@/types';
import { useReveal } from '@/hooks/use-reveal';
import { useTyping } from '@/hooks/use-typing';
import { deriveProfile } from '@/lib/utils/proposta-profile';

interface HeroSectionProps {
  proposta: Proposta;
}

function getInitials(nome: string): string {
  return nome
    .split(' ')
    .filter((p) => p.length > 0)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function HeroSection({ proposta }: HeroSectionProps) {
  const profile = deriveProfile(proposta);
  const label = useReveal();
  const heading = useReveal();
  const subtitle = useReveal();
  const badge = useReveal();
  const arrow = useReveal();

  const subtitleText = `Proposta exclusiva para ${proposta.escritorio_nome} — ${proposta.escritorio_cidade}, ${proposta.escritorio_uf}.`;
  const { displayText } = useTyping(subtitleText, { enabled: subtitle.isVisible });

  return (
    <section id="hero" className="mx-auto max-w-[1100px] px-6 pb-24 pt-20 sm:px-12 sm:pt-24">
      <div
        ref={label.ref}
        className={`vt-reveal ${label.isVisible ? 'visible' : ''} mb-10 flex items-center gap-4 text-[11px] uppercase tracking-[0.14em] text-[var(--vt-mute)]`}
      >
        <span className="h-px w-8 bg-[var(--vt-brand)]" />
        Proposta comercial
      </div>

      <h1
        ref={heading.ref}
        className={`vt-reveal ${heading.isVisible ? 'visible' : ''} max-w-[820px] text-5xl font-extrabold leading-[1.06] tracking-tight text-[var(--vt-paper)] sm:text-[56px]`}
        style={{ transitionDelay: '0.1s' }}
      >
        {profile.heroHeadline}
      </h1>

      <p
        ref={subtitle.ref}
        className={`vt-reveal ${subtitle.isVisible ? 'visible' : ''} mt-7 max-w-[560px] text-base leading-[1.65] text-[var(--vt-whisper)]`}
        style={{ transitionDelay: '0.2s' }}
      >
        {displayText || ' '}
      </p>

      <div
        ref={badge.ref}
        className={`vt-reveal ${badge.isVisible ? 'visible' : ''} mt-14 flex flex-wrap gap-4`}
        style={{ transitionDelay: '0.3s' }}
      >
        {proposta.lead_nome && (
          <div className="flex items-center gap-3.5 rounded-xl border border-[var(--vt-graphite)] px-5 py-4 transition-[border-color,background] duration-300 hover:border-[var(--vt-brand)]/40 hover:bg-[var(--vt-ink-soft)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--vt-brand)] text-sm font-bold tracking-[0.04em] text-white">
              {getInitials(proposta.lead_nome)}
            </div>
            <div>
              <div className="text-sm font-medium text-[var(--vt-paper)]">{proposta.lead_nome}</div>
              {proposta.lead_cargo && (
                <div className="mt-0.5 text-[13px] text-[var(--vt-mute)]">{proposta.lead_cargo}</div>
              )}
            </div>
          </div>
        )}

        {proposta.consultor_nome && (
          <div className="flex items-center gap-3.5 rounded-xl border border-[var(--vt-graphite)] px-5 py-4 transition-[border-color,background] duration-300 hover:border-[var(--vt-brand)]/40 hover:bg-[var(--vt-ink-soft)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--vt-ink-soft)] text-sm font-bold tracking-[0.04em] text-[var(--vt-brand)]">
              {getInitials(proposta.consultor_nome)}
            </div>
            <div>
              <div className="text-sm font-medium text-[var(--vt-paper)]">{proposta.consultor_nome}</div>
              <div className="mt-0.5 text-[13px] text-[var(--vt-mute)]">
                {proposta.consultor_cargo || 'Consultor Comercial'} — JusPilot
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      <div
        ref={arrow.ref}
        className={`vt-reveal ${arrow.isVisible ? 'visible' : ''} mt-20 flex justify-center`}
        style={{ transitionDelay: '0.5s' }}
      >
        <div className="hero-scroll-indicator text-[var(--vt-mute)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
          </svg>
        </div>
      </div>
    </section>
  );
}
