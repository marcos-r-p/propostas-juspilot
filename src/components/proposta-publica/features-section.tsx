'use client';

import type { Proposta } from '@/types';
import { useReveal } from '@/hooks/use-reveal';
import { FEATURES_INCLUIDAS } from '@/lib/constants/precos';
import { deriveProfile } from '@/lib/utils/proposta-profile';

interface FeaturesSectionProps {
  proposta: Proposta;
}

function FeatureCell({
  feature,
  index,
  highlighted,
}: {
  feature: (typeof FEATURES_INCLUIDAS)[number];
  index: number;
  highlighted: boolean;
}) {
  const { ref, isVisible } = useReveal();

  return (
    <div
      ref={ref}
      className={`vt-reveal ${isVisible ? 'visible' : ''} group relative flex items-start gap-4 bg-[var(--vt-ink)] p-8 transition-[background] duration-300 hover:bg-[var(--vt-ink-soft)]`}
      style={{ transitionDelay: `${index * 0.06}s` }}
    >
      {highlighted && (
        <span className="absolute right-4 top-4 h-1.5 w-1.5 rounded-full bg-[var(--vt-brand)]" aria-hidden />
      )}

      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[var(--vt-brand)]/40 text-[var(--vt-brand)] transition-colors duration-300 group-hover:border-[var(--vt-brand)] group-hover:bg-[var(--vt-brand)]/10">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>

      <div>
        <div className="text-sm font-semibold text-[var(--vt-paper)]">{feature.name}</div>
        <div className="mt-1.5 text-[13px] leading-[1.5] text-[var(--vt-mute)] transition-colors duration-300 group-hover:text-[var(--vt-whisper)]">
          {feature.description}
        </div>
      </div>
    </div>
  );
}

export function FeaturesSection({ proposta }: FeaturesSectionProps) {
  const profile = deriveProfile(proposta);
  const label = useReveal();
  const title = useReveal();

  return (
    <section id="plataforma" className="mx-auto max-w-[1100px] px-6 py-24 sm:px-12">
      <div
        ref={label.ref}
        className={`vt-reveal ${label.isVisible ? 'visible' : ''} mb-3.5 flex items-center gap-4 text-[11px] uppercase tracking-[0.14em] text-[var(--vt-mute)]`}
      >
        <span className="h-px w-6 bg-[var(--vt-brand)]" />
        Plataforma
      </div>

      <h2
        ref={title.ref}
        className={`vt-reveal ${title.isVisible ? 'visible' : ''} mb-14 text-4xl font-extrabold leading-[1.12] text-[var(--vt-paper)]`}
        style={{ transitionDelay: '0.1s' }}
      >
        {profile.featuresTitle}
      </h2>

      <div className="mosaic-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES_INCLUIDAS.map((f, i) => (
          <FeatureCell
            key={f.name}
            feature={f}
            index={i}
            highlighted={!!f.highlight?.includes(profile.id)}
          />
        ))}
      </div>
    </section>
  );
}
