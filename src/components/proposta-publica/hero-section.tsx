'use client';

import type { Proposta } from '@/types';
import { useReveal } from '@/hooks/use-reveal';
import { useTyping } from '@/hooks/use-typing';

interface HeroSectionProps {
  proposta: Proposta;
}

export function HeroSection({ proposta }: HeroSectionProps) {
  const label = useReveal();
  const heading = useReveal();
  const subtitle = useReveal();
  const badge = useReveal();

  const subtitleText = `Proposta personalizada para ${proposta.escritorio_nome}, com diagnóstico, plataforma e investimento sob medida.`;
  const { displayText } = useTyping(subtitleText, { enabled: subtitle.isVisible });

  return (
    <section id="hero" className="mx-auto max-w-[1100px] px-6 pb-24 pt-24 sm:px-12 sm:pt-28">
      <div
        ref={label.ref}
        className={`vt-reveal ${label.isVisible ? 'visible' : ''} mb-10 flex items-center gap-4 text-[11px] uppercase tracking-[0.14em] text-[var(--vt-mute)]`}
      >
        <span className="h-px w-8 bg-[var(--vt-brand)]" />
        Proposta comercial
      </div>

      <h1
        ref={heading.ref}
        className={`vt-reveal ${heading.isVisible ? 'visible' : ''} max-w-[820px] text-5xl font-extrabold leading-[1.06] text-[var(--vt-paper)] sm:text-[64px]`}
        style={{ transitionDelay: '0.1s' }}
      >
        Toda a{' '}
        <span className="text-[var(--vt-brand)]">operação jurídica</span>
        <br />
        em um só lugar.
      </h1>

      <p
        ref={subtitle.ref}
        className={`vt-reveal ${subtitle.isVisible ? 'visible' : ''} mt-7 max-w-[520px] text-[17px] leading-[1.65] text-[var(--vt-whisper)]`}
        style={{ transitionDelay: '0.2s' }}
      >
        {displayText || '\u00A0'}
      </p>

      <div
        ref={badge.ref}
        className={`vt-reveal ${badge.isVisible ? 'visible' : ''} mt-14 flex flex-wrap gap-4`}
        style={{ transitionDelay: '0.3s' }}
      >
        {/* Lead badge */}
        {proposta.lead_nome && (
          <div className="flex items-center gap-3.5 rounded-xl border border-[var(--vt-graphite)] px-5 py-4 transition-[border-color,background] duration-300 hover:border-[var(--vt-brand)]/40 hover:bg-[var(--vt-ink-soft)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--vt-brand)] text-sm font-bold tracking-[0.04em] text-white">
              {proposta.lead_nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-medium text-[var(--vt-paper)]">{proposta.lead_nome}</div>
              {proposta.lead_cargo && (
                <div className="mt-0.5 text-[13px] text-[var(--vt-mute)]">{proposta.lead_cargo}</div>
              )}
            </div>
          </div>
        )}

        {/* Consultor badge */}
        {proposta.consultor_nome && (
          <div className="flex items-center gap-3.5 rounded-xl border border-[var(--vt-graphite)] px-5 py-4 transition-[border-color,background] duration-300 hover:border-[var(--vt-brand)]/40 hover:bg-[var(--vt-ink-soft)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--vt-ink-soft)] text-sm font-bold tracking-[0.04em] text-[var(--vt-brand)]">
              {proposta.consultor_nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
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
    </section>
  );
}
