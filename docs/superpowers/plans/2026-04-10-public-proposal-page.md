# Public Proposal Page Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the public proposal page `/p/[slug]` against the monochrome MIV identity — replacing gold/navy palette, Playfair Display font, inline styles, and `dangerouslySetInnerHTML` with Libre Bodoni, design system tokens, and proper React hooks.

**Architecture:** Server component page shell with client-side interactive sections. Three new hooks (`useReveal`, `useCounter`, `useTyping`) replace the inline JS. Ten existing components refactored to eight (compliance merged into footer, CTA merged into pricing). All colors from CSS custom properties, all typography via `next/font/google`.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4, `next/font/google` (Libre Bodoni), TypeScript

**Spec:** `docs/superpowers/specs/2026-04-10-public-proposal-page-design.md`

---

## File Structure

### New files
| File | Responsibility |
|------|---------------|
| `src/hooks/use-reveal.ts` | IntersectionObserver hook — observes a ref, returns `isVisible` boolean |
| `src/hooks/use-counter.ts` | Animated number counter — takes target value, returns animated current value |
| `src/hooks/use-typing.ts` | Typing effect — takes text string, returns progressively revealed text |

### Modified files
| File | Change |
|------|--------|
| `src/app/layout.tsx` | Replace Fraunces import with Libre Bodoni |
| `src/app/globals.css` | Update `--font-display` to `--font-libre-bodoni`, add vitrine utilities |
| `src/app/p/[slug]/page.tsx` | Remove inline `<style>` + `dangerouslySetInnerHTML`, compose new sections |
| `src/components/proposta-publica/header.tsx` | Monogram seal + Libre Bodoni wordmark |
| `src/components/proposta-publica/hero-section.tsx` | Left-aligned hero with typing subtitle |
| `src/components/proposta-publica/dores-section.tsx` | Accordion cards with SVG icons |
| `src/components/proposta-publica/roi-section.tsx` | Mosaic grid with `useCounter` hook |
| `src/components/proposta-publica/features-section.tsx` | Mosaic grid with SVG icons + tooltips |
| `src/components/proposta-publica/pricing-section.tsx` | Monochrome card with CTA row + validity |
| `src/components/proposta-publica/timeline-section.tsx` | Horizontal 3-step mosaic |
| `src/components/proposta-publica/footer.tsx` | Monogram seal + compliance badges |
| `src/lib/constants/dores.ts` | Replace emoji icons with SVG path data |

### Deleted files
| File | Reason |
|------|--------|
| `src/components/proposta-publica/compliance-section.tsx` | Merged into footer |
| `src/components/proposta-publica/cta-section.tsx` | Merged into pricing section |

---

## Task 1: Font swap — Libre Bodoni replaces Fraunces

**Files:**
- Modify: `src/app/layout.tsx:1-30`
- Modify: `src/app/globals.css:21`

- [ ] **Step 1: Update font import in layout.tsx**

Replace the Fraunces import with Libre Bodoni in `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Libre_Bodoni } from 'next/font/google';
import { Toaster } from '@/components/ui/toast';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const libreBodoni = Libre_Bodoni({
  variable: '--font-libre-bodoni',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'JusPilot Propostas',
  description: 'Gerador de Propostas Comerciais',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} ${libreBodoni.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Update CSS token**

In `src/app/globals.css`, change line 21:

```css
  --font-display: var(--font-libre-bodoni);
```

- [ ] **Step 3: Verify build**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds. No errors about missing font or undefined variable.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat: swap Fraunces for Libre Bodoni as display font"
```

---

## Task 2: Add vitrine utilities to globals.css

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add vitrine-specific CSS utilities**

Append the following after the existing `.animate-in` block (after line 172) in `src/app/globals.css`:

```css
/* ========== Vitrine surface (dark pages) ========== */
.vitrine {
  --vt-ink: #0a0a0a;
  --vt-ink-soft: #141416;
  --vt-graphite: #3f3f46;
  --vt-mute: #71717a;
  --vt-whisper: #a1a1aa;
  --vt-paper: #fafafa;
  background: var(--vt-ink);
  color: var(--vt-paper);
}

/* Grain texture overlay */
.vitrine-grain {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 50;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* Fio duplo editorial divider */
.vitrine-divider {
  border: none;
  border-top: 3px double rgba(250, 250, 250, 0.12);
}

/* Scroll progress bar */
.vitrine-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 2px;
  background: var(--vt-paper);
  z-index: 100;
  transition: width 0.1s linear;
}

/* Reveal animation base */
.vt-reveal {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.vt-reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Mosaic grid pattern */
.mosaic-grid {
  display: grid;
  gap: 1px;
  background: var(--vt-graphite);
}
.mosaic-grid > * {
  background: var(--vt-ink);
}
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -10`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add vitrine surface utilities to globals.css"
```

---

## Task 3: Create useReveal hook

**Files:**
- Create: `src/hooks/use-reveal.ts`

- [ ] **Step 1: Create the hook**

Create `src/hooks/use-reveal.ts`:

```ts
'use client';

import { useEffect, useRef, useState } from 'react';

interface UseRevealOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseRevealOptions = {}
) {
  const { threshold = 0.15, rootMargin = '0px 0px -40px 0px', once = true } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, isVisible };
}
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -10`
Expected: Build succeeds (hook is not imported anywhere yet, but file must compile).

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-reveal.ts
git commit -m "feat: create useReveal intersection observer hook"
```

---

## Task 4: Create useCounter hook

**Files:**
- Create: `src/hooks/use-counter.ts`

- [ ] **Step 1: Create the hook**

Create `src/hooks/use-counter.ts`:

```ts
'use client';

import { useEffect, useState } from 'react';

interface UseCounterOptions {
  duration?: number;
  decimals?: number;
  enabled?: boolean;
}

export function useCounter(target: number, options: UseCounterOptions = {}) {
  const { duration = 1800, decimals = 0, enabled = false } = options;
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled || target === 0) return;

    const startTime = performance.now();

    function update(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = target * ease;
      setValue(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.round(current));
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }, [target, duration, decimals, enabled]);

  return value;
}
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -10`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-counter.ts
git commit -m "feat: create useCounter animated number hook"
```

---

## Task 5: Create useTyping hook

**Files:**
- Create: `src/hooks/use-typing.ts`

- [ ] **Step 1: Create the hook**

Create `src/hooks/use-typing.ts`:

```ts
'use client';

import { useEffect, useState } from 'react';

interface UseTypingOptions {
  charDelay?: number;
  commaDelay?: number;
  periodDelay?: number;
  enabled?: boolean;
}

export function useTyping(text: string, options: UseTypingOptions = {}) {
  const { charDelay = 25, commaDelay = 80, periodDelay = 100, enabled = false } = options;
  const [displayText, setDisplayText] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!enabled || !text) return;

    let index = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    function typeNext() {
      if (index >= text.length) {
        setIsDone(true);
        return;
      }

      index++;
      setDisplayText(text.slice(0, index));

      const char = text[index - 1];
      const delay = char === ',' ? commaDelay : char === '.' ? periodDelay : charDelay;
      timeoutId = setTimeout(typeNext, delay);
    }

    typeNext();

    return () => clearTimeout(timeoutId);
  }, [text, charDelay, commaDelay, periodDelay, enabled]);

  return { displayText, isDone };
}
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -10`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-typing.ts
git commit -m "feat: create useTyping progressive text reveal hook"
```

---

## Task 6: Update dores.ts — replace emoji icons with SVG paths

**Files:**
- Modify: `src/lib/constants/dores.ts`

- [ ] **Step 1: Replace emoji icons with SVG path data**

Rewrite `src/lib/constants/dores.ts`:

```ts
export const DORES = [
  {
    id: 'tempo_pecas',
    label: 'Muito tempo elaborando peças',
    highlight: 'IA Jurídica',
    description:
      'Redução significativa de horas na produção de petições, contestações e recursos.',
    solution: 'A IA Jurídica gera minutas, petições e contratos em minutos, com base no contexto do caso e modelos do escritório.',
    iconPath: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M16 13H8 M16 17H8',
  },
  {
    id: 'pesquisa_jurisprudencia',
    label: 'Dificuldade em pesquisa de jurisprudência',
    highlight: 'Base Curada',
    description:
      'Acesso rápido a 30.969+ jurisprudências do STF, STJ e tribunais regionais.',
    solution: 'Base curada do STF, STJ, TJs e TST com alertas automáticos quando o entendimento muda.',
    iconPath: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20 M8 7h6 M8 11h4',
  },
  {
    id: 'gestao_prazos',
    label: 'Gestão de prazos caótica',
    highlight: 'Casos Kanban',
    description:
      'Controle inteligente com alertas de SLA, visão Kanban e atribuição de responsáveis.',
    solution: 'Prazos monitorados automaticamente com alertas inteligentes e integração direta ao tribunal.',
    iconPath: 'M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0-20 0 M12 6v6l4 2',
  },
  {
    id: 'padronizacao',
    label: 'Falta de padronização nas peças',
    highlight: 'Base de Conhecimento',
    description:
      'A IA aprende o estilo e formatação do escritório. Suas peças viram referência.',
    solution: 'Documentos indexados e pesquisáveis com IA. O escritório constrói sua própria base de referência.',
    iconPath: 'M12 2L2 7l10 5 10-5-10-5Z M2 17l10 5 10-5 M2 12l10 5 10-5',
  },
  {
    id: 'comunicacao_cliente',
    label: 'Comunicação com cliente desorganizada',
    highlight: 'CRM Jurídico',
    description:
      'Gestão completa de clientes com timeline de interações e insights por IA.',
    solution: 'Portal do cliente com acompanhamento em tempo real. Zero ligações desnecessárias.',
    iconPath: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  },
  {
    id: 'contratos',
    label: 'Processo manual de contratos',
    highlight: 'Assinatura Digital',
    description:
      'Geração automática de contratos com assinatura digital e hash criptográfico.',
    solution: 'Contratos gerados automaticamente com assinatura digital e rastreabilidade criptográfica.',
    iconPath: 'M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z',
  },
  {
    id: 'automacao',
    label: 'Tarefas repetitivas manuais',
    highlight: 'Workflows',
    description:
      'Automações no-code para alertas, follow-ups e comunicações automáticas.',
    solution: 'Automações no-code com agentes inteligentes configurados para o seu fluxo.',
    iconPath: 'M16 3l5 0 0 5 M4 20l17-17 M21 16l0 5-5 0 M15 15l6 6 M4 4l5 5',
  },
] as const;

export type DorId = (typeof DORES)[number]['id'];

export function getDorById(id: DorId) {
  return DORES.find((dor) => dor.id === id);
}

export function getDoresByIds(ids: DorId[]) {
  return DORES.filter((dor) => ids.includes(dor.id));
}
```

Key changes:
- Replaced `icon` (emoji string) with `iconPath` (SVG path `d` attribute)
- Added `solution` field (text shown when accordion card is expanded)
- All paths use stroke-only style, compatible with `stroke="currentColor" fill="none" stroke-width="1.25"`

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -10`
Expected: Build may fail because `dores-section.tsx` still references old `icon` property. That's expected — we'll fix it in Task 9.

- [ ] **Step 3: Commit**

```bash
git add src/lib/constants/dores.ts
git commit -m "feat: replace emoji icons with SVG paths and add solution text to dores"
```

---

## Task 7: Refactor header.tsx

**Files:**
- Modify: `src/components/proposta-publica/header.tsx`

- [ ] **Step 1: Rewrite header with monogram seal and Libre Bodoni wordmark**

Replace the entire content of `src/components/proposta-publica/header.tsx`:

```tsx
import type { Proposta } from '@/types';

interface HeaderProps {
  proposta: Proposta;
}

export function PropostaHeader({ proposta }: HeaderProps) {
  const now = new Date();
  const month = now.toLocaleString('pt-BR', { month: 'long' });
  const year = now.getFullYear();

  return (
    <header className="relative z-10 mx-auto max-w-[1100px] px-6 py-9 sm:px-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Monogram seal */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-[var(--vt-paper)]/25 transition-[border-color] duration-400 hover:border-[var(--vt-paper)]/60">
            <span className="font-display text-[22px] font-semibold leading-none text-[var(--vt-paper)]">
              J
            </span>
          </div>
          {/* Wordmark */}
          <span className="font-display text-[32px] font-semibold leading-none tracking-[0.05em] text-[var(--vt-paper)]" style={{ fontVariantCaps: 'small-caps' }}>
            Juspilot
          </span>
        </div>

        <div className="hidden items-center gap-4 sm:flex">
          <span className="text-xs uppercase tracking-[0.06em] text-[var(--vt-mute)]">
            {proposta.escritorio_cidade} — {proposta.escritorio_uf}
          </span>
          <span className="h-4 w-px bg-[var(--vt-graphite)]" />
          <span className="text-xs uppercase tracking-[0.06em] text-[var(--vt-mute)]">
            {month} {year}
          </span>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -10`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/proposta-publica/header.tsx
git commit -m "feat: redesign header with monogram seal and Libre Bodoni wordmark"
```

---

## Task 8: Refactor hero-section.tsx

**Files:**
- Modify: `src/components/proposta-publica/hero-section.tsx`

- [ ] **Step 1: Rewrite hero with left-aligned layout and typing effect**

Replace the entire content of `src/components/proposta-publica/hero-section.tsx`:

```tsx
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
        <span className="h-px w-8 bg-[var(--vt-graphite)]" />
        Proposta comercial
      </div>

      <h1
        ref={heading.ref}
        className={`vt-reveal ${heading.isVisible ? 'visible' : ''} font-display max-w-[820px] text-5xl font-semibold leading-[1.06] text-[var(--vt-paper)] sm:text-[64px]`}
        style={{ transitionDelay: '0.1s' }}
      >
        A Advocacia,
        <br />
        <em className="font-normal italic text-[var(--vt-whisper)]">
          preparada para fazer
          <br />
          mais com menos.
        </em>
      </h1>

      <p
        ref={subtitle.ref}
        className={`vt-reveal ${subtitle.isVisible ? 'visible' : ''} mt-7 max-w-[520px] text-[17px] leading-[1.65] text-[var(--vt-whisper)]`}
        style={{ transitionDelay: '0.2s' }}
      >
        {displayText || '\u00A0'}
      </p>

      {proposta.lead_nome && (
        <div
          ref={badge.ref}
          className={`vt-reveal ${badge.isVisible ? 'visible' : ''} mt-14 flex w-fit items-center gap-3.5 border border-[var(--vt-graphite)] px-5 py-4 transition-[border-color,background] duration-300 hover:border-[var(--vt-mute)] hover:bg-[var(--vt-ink-soft)]`}
          style={{ transitionDelay: '0.3s' }}
        >
          <div className="flex h-11 w-11 items-center justify-center bg-[var(--vt-graphite)] text-sm font-semibold tracking-[0.04em] text-[var(--vt-paper)]">
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
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -10`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/proposta-publica/hero-section.tsx
git commit -m "feat: redesign hero with left-aligned layout and typing effect"
```

---

## Task 9: Refactor dores-section.tsx (accordion cards)

**Files:**
- Modify: `src/components/proposta-publica/dores-section.tsx`

- [ ] **Step 1: Rewrite with accordion cards and SVG icons**

Replace the entire content of `src/components/proposta-publica/dores-section.tsx`:

```tsx
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
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -10`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/proposta-publica/dores-section.tsx
git commit -m "feat: redesign dores section with accordion cards and SVG icons"
```

---

## Task 10: Refactor roi-section.tsx

**Files:**
- Modify: `src/components/proposta-publica/roi-section.tsx`

- [ ] **Step 1: Rewrite with useCounter hook and mosaic grid**

Replace the entire content of `src/components/proposta-publica/roi-section.tsx`:

```tsx
'use client';

import type { Proposta } from '@/types';
import { useReveal } from '@/hooks/use-reveal';
import { useCounter } from '@/hooks/use-counter';

interface ROISectionProps {
  proposta: Proposta;
}

function ROICard({ target, unit, label, decimals = 0, prefix = '', index }: {
  target: number; unit: string; label: string; decimals?: number; prefix?: string; index: number;
}) {
  const { ref, isVisible } = useReveal();
  const value = useCounter(target, { enabled: isVisible, decimals });

  return (
    <div
      ref={ref}
      className={`vt-reveal ${isVisible ? 'visible' : ''} relative overflow-hidden bg-[var(--vt-ink)] py-14 px-9 text-center transition-[background] duration-300 hover:bg-[var(--vt-ink-soft)]`}
      style={{ transitionDelay: `${index * 0.08}s` }}
    >
      {/* Bottom accent line on hover */}
      <div className="absolute bottom-0 left-1/2 h-[2px] w-0 -translate-x-1/2 bg-[var(--vt-paper)] transition-[width] duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-3/5" />

      <div className="font-display text-[60px] font-semibold leading-none text-[var(--vt-paper)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {prefix}{decimals > 0 ? value.toFixed(decimals) : value}
        <span className="text-2xl font-normal text-[var(--vt-whisper)]">{unit}</span>
      </div>
      <div className="mt-3.5 text-[13px] leading-[1.4] text-[var(--vt-mute)]">
        {label}
      </div>
    </div>
  );
}

export function ROISection({ proposta }: ROISectionProps) {
  const label = useReveal();
  const title = useReveal();

  return (
    <section id="numeros" className="mx-auto max-w-[1100px] px-6 py-24 sm:px-12">
      <div
        ref={label.ref}
        className={`vt-reveal ${label.isVisible ? 'visible' : ''} mb-3.5 flex items-center gap-4 text-[11px] uppercase tracking-[0.14em] text-[var(--vt-mute)]`}
      >
        <span className="h-px w-6 bg-[var(--vt-graphite)]" />
        Os números
      </div>
      <div
        ref={title.ref}
        className={`vt-reveal ${title.isVisible ? 'visible' : ''} mb-14 font-display text-4xl font-semibold leading-[1.12] text-[var(--vt-paper)]`}
        style={{ transitionDelay: '0.1s' }}
      >
        O retorno do seu investimento
      </div>

      <div className="mosaic-grid grid-cols-1 sm:grid-cols-3 mb-18">
        <ROICard target={proposta.roi_horas_economizadas_total || 0} unit="h" label={`Horas economizadas\npor mês`} index={0} />
        <ROICard target={Math.round((proposta.roi_valor_gerado || 0) / 1000)} unit="mil" label={`Valor gerado\npor mês`} prefix="R$" index={1} />
        <ROICard target={Number(proposta.roi_multiplo) || 0} unit="x" label={`Retorno sobre\ninvestimento`} decimals={1} index={2} />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -10`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/proposta-publica/roi-section.tsx
git commit -m "feat: redesign ROI section with useCounter hook and mosaic grid"
```

---

## Task 11: Refactor features-section.tsx

**Files:**
- Modify: `src/components/proposta-publica/features-section.tsx`

- [ ] **Step 1: Rewrite with SVG icons and tooltip details**

Replace the entire content of `src/components/proposta-publica/features-section.tsx`:

```tsx
'use client';

import { useReveal } from '@/hooks/use-reveal';

const FEATURES = [
  {
    title: 'IA Jurídica',
    description: 'Minutas, petições e contratos gerados com contexto do caso.',
    detail: 'Gere minutas, petições e contratos com IA treinada em jurisprudência brasileira.',
    iconPath: 'M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93V12h3.75a2.5 2.5 0 0 1 2.5 2.5V16a4 4 0 1 1-2 0v-1.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5V16a4 4 0 1 1-2 0v-1.5A2.5 2.5 0 0 1 7.5 12h3.75V9.93A4 4 0 0 1 12 2Z',
  },
  {
    title: 'Base de Conhecimento',
    description: 'Documentos indexados e pesquisáveis com IA.',
    detail: 'Indexe documentos do escritório e encontre qualquer informação com busca semântica.',
    iconPath: 'M11 11m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0 M21 21l-4.35-4.35',
  },
  {
    title: 'Gestão de Casos',
    description: 'Prazos, tarefas e andamentos centralizados.',
    detail: 'Centralize prazos, tarefas e andamentos processuais em uma única interface.',
    iconPath: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  },
  {
    title: 'Workflows',
    description: 'Automação de rotinas com agentes inteligentes.',
    detail: 'Automatize rotinas repetitivas com agentes inteligentes configurados para o seu fluxo.',
    iconPath: 'M16 3l5 0 0 5 M4 20l17-17 M21 16l0 5-5 0 M15 15l6 6 M4 4l5 5',
  },
  {
    title: 'CRM Jurídico',
    description: 'Clientes, captação e relacionamento em um só lugar.',
    detail: 'Gerencie clientes, captação e relacionamento com visão completa do ciclo de vida.',
    iconPath: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0 M19 8v6 M22 11h-6',
  },
  {
    title: 'Jurisprudência',
    description: 'Base curada do STF, STJ, TJs e TST com alertas.',
    detail: 'Acesse jurisprudência do STF, STJ, TJs e TST com alertas de mudança de entendimento.',
    iconPath: 'M12 2L2 7l10 5 10-5-10-5Z M2 17l10 5 10-5 M2 12l10 5 10-5',
  },
];

function FeatureCell({ feature, index }: { feature: typeof FEATURES[number]; index: number }) {
  const { ref, isVisible } = useReveal();

  return (
    <div
      ref={ref}
      className={`vt-reveal ${isVisible ? 'visible' : ''} group relative flex items-start gap-4 bg-[var(--vt-ink)] p-8 transition-[background] duration-300 hover:bg-[var(--vt-ink-soft)]`}
      style={{ transitionDelay: `${index * 0.08}s` }}
    >
      {/* Tooltip */}
      <div className="pointer-events-none absolute bottom-[calc(100%+8px)] left-8 right-8 z-10 border border-[var(--vt-graphite)] bg-[var(--vt-ink-soft)] px-4 py-3 text-xs leading-[1.5] text-[var(--vt-whisper)] opacity-0 transition-[opacity,transform] duration-300 translate-y-1 group-hover:translate-y-0 group-hover:opacity-100">
        {feature.detail}
      </div>

      {/* Icon */}
      <div className="mt-0.5 shrink-0 text-[var(--vt-graphite)] transition-colors duration-300 group-hover:text-[var(--vt-whisper)]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d={feature.iconPath} />
        </svg>
      </div>

      <div>
        <div className="text-sm font-semibold text-[var(--vt-paper)]">{feature.title}</div>
        <div className="mt-1.5 text-[13px] leading-[1.5] text-[var(--vt-mute)]">{feature.description}</div>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const label = useReveal();

  return (
    <div className="mx-auto max-w-[1100px] px-6 sm:px-12">
      <div
        ref={label.ref}
        className={`vt-reveal ${label.isVisible ? 'visible' : ''} mb-6 flex items-center gap-4 text-[11px] uppercase tracking-[0.14em] text-[var(--vt-mute)]`}
      >
        <span className="h-px w-6 bg-[var(--vt-graphite)]" />
        A plataforma
      </div>
      <div className="mosaic-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <FeatureCell key={f.title} feature={f} index={i} />
        ))}
      </div>
    </div>
  );
}
```

Note: `FeaturesSection` is now rendered inside the ROI/Numeros section container in `page.tsx` (Task 14). It is NOT a standalone section with its own label/title — it's a sub-section of "Os números".

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -10`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/proposta-publica/features-section.tsx
git commit -m "feat: redesign features section with SVG icons and hover tooltips"
```

---

## Task 12: Refactor pricing-section.tsx (merge CTA)

**Files:**
- Modify: `src/components/proposta-publica/pricing-section.tsx`

- [ ] **Step 1: Rewrite with monochrome card, CTA row, and validity badge**

Replace the entire content of `src/components/proposta-publica/pricing-section.tsx`:

```tsx
'use client';

import type { Proposta } from '@/types';
import { formatCurrency } from '@/lib/utils/format';
import { FEATURES_INCLUIDAS } from '@/lib/constants/precos';
import { useReveal } from '@/hooks/use-reveal';

interface PricingSectionProps {
  proposta: Proposta;
}

export function PricingSection({ proposta }: PricingSectionProps) {
  const label = useReveal();
  const title = useReveal();
  const card = useReveal();

  const validadeDias = proposta.validade_dias || 30;
  const criadoEm = new Date(proposta.created_at);
  const expiraEm = proposta.data_expiracao
    ? new Date(proposta.data_expiracao)
    : new Date(criadoEm.getTime() + validadeDias * 24 * 60 * 60 * 1000);
  const diasRestantes = Math.max(0, Math.ceil((expiraEm.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <section id="investimento" className="mx-auto max-w-[1100px] px-6 py-24 sm:px-12">
      <div
        ref={label.ref}
        className={`vt-reveal ${label.isVisible ? 'visible' : ''} mb-3.5 flex items-center gap-4 text-[11px] uppercase tracking-[0.14em] text-[var(--vt-mute)]`}
      >
        <span className="h-px w-6 bg-[var(--vt-graphite)]" />
        Investimento
      </div>
      <div
        ref={title.ref}
        className={`vt-reveal ${title.isVisible ? 'visible' : ''} mb-14 font-display text-4xl font-semibold leading-[1.12] text-[var(--vt-paper)]`}
        style={{ transitionDelay: '0.1s' }}
      >
        Seu plano sob medida
      </div>

      <div
        ref={card.ref}
        className={`vt-reveal ${card.isVisible ? 'visible' : ''} relative overflow-hidden border border-[var(--vt-graphite)] p-14 transition-[border-color] duration-400 hover:border-[var(--vt-mute)]`}
        style={{ transitionDelay: '0.2s' }}
      >
        {/* Top gradient line */}
        <div className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[var(--vt-paper)]/15 to-transparent" />

        {/* Pricing header */}
        <div className="flex flex-col items-start justify-between gap-8 border-b border-[var(--vt-paper)]/8 pb-12 md:flex-row">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--vt-mute)]">Setup único</div>
            <div className="mt-2.5 font-display text-[44px] font-semibold leading-[1.1] text-[var(--vt-paper)]">
              {formatCurrency(proposta.preco_setup)}
            </div>
          </div>

          <div className="hidden h-auto w-px self-stretch bg-[var(--vt-paper)]/8 md:block" />

          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--vt-mute)]">Mensalidade</div>
            <div className="mt-2.5 font-display text-[44px] font-semibold leading-[1.1] text-[var(--vt-paper)]">
              {formatCurrency(proposta.preco_mensalidade_final)}
              <span className="ml-1 font-sans text-base font-normal text-[var(--vt-whisper)]">/mês</span>
            </div>
            {proposta.preco_desconto > 0 && (
              <div className="mt-2.5 inline-block bg-[var(--vt-graphite)] px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] text-[var(--vt-paper)]">
                {proposta.preco_desconto}% de desconto aplicado
              </div>
            )}
          </div>
        </div>

        {/* Feature checklist */}
        <div className="grid gap-4 py-12 sm:grid-cols-2 sm:gap-x-10">
          {FEATURES_INCLUIDAS.map((f) => (
            <div key={f} className="flex items-center gap-3 border-b border-[var(--vt-paper)]/5 py-2 text-sm text-[var(--vt-whisper)] transition-colors duration-300 hover:text-[var(--vt-paper)]">
              <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center border-[1.5px] border-[var(--vt-paper)]">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              {f}
            </div>
          ))}
        </div>

        {/* CTA row */}
        <div className="flex flex-col items-start gap-6 border-t border-[var(--vt-paper)]/8 pt-12 sm:flex-row sm:items-center">
          <a
            href={`https://wa.me/5561984014175?text=Olá! Vi a proposta do JusPilot e gostaria de agendar uma demonstração.`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-2.5 overflow-hidden bg-[var(--vt-paper)] px-8 py-4 text-sm font-semibold tracking-[0.02em] text-[var(--vt-ink)]"
          >
            <span className="relative z-10 transition-colors duration-300 group-hover:text-[var(--vt-paper)]">Falar com consultor</span>
            <span className="relative z-10 transition-[color,transform] duration-300 group-hover:translate-x-1 group-hover:text-[var(--vt-paper)]">&#8594;</span>
            <span className="absolute inset-0 z-0 translate-y-full bg-[var(--vt-ink)] transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
          </a>

          <a href="#" className="relative pb-0.5 text-sm text-[var(--vt-whisper)] transition-colors duration-300 hover:text-[var(--vt-paper)]">
            Baixar proposta em PDF
            <span className="absolute bottom-0 left-0 h-px w-full bg-[var(--vt-graphite)] transition-[background] duration-300 hover:bg-[var(--vt-paper)]" />
          </a>

          {diasRestantes > 0 && (
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-[var(--vt-mute)] sm:ml-auto">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--vt-paper)]" />
              Válida por mais {diasRestantes} dia{diasRestantes !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npx next build 2>&1 | tail -10`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/proposta-publica/pricing-section.tsx
git commit -m "feat: redesign pricing section with CTA row and validity badge"
```

---

## Task 13: Refactor timeline-section.tsx and footer.tsx

**Files:**
- Modify: `src/components/proposta-publica/timeline-section.tsx`
- Modify: `src/components/proposta-publica/footer.tsx`

- [ ] **Step 1: Rewrite timeline with horizontal 3-step mosaic**

Replace the entire content of `src/components/proposta-publica/timeline-section.tsx`:

```tsx
'use client';

import { useReveal } from '@/hooks/use-reveal';

const STEPS = [
  { number: '01', title: 'Onboarding', period: 'Dia 1 — 7', description: 'Configuração da conta, importação de dados e treinamento da equipe.' },
  { number: '02', title: 'Calibração', period: 'Dia 8 — 21', description: 'Ajuste dos agentes de IA ao perfil do escritório e validação com casos reais.' },
  { number: '03', title: 'Operação plena', period: 'Dia 22 — 30', description: 'Equipe operando de forma autônoma com acompanhamento do time JusPilot.' },
];

function TimelineStep({ step, index }: { step: typeof STEPS[number]; index: number }) {
  const { ref, isVisible } = useReveal();

  return (
    <div
      ref={ref}
      className={`vt-reveal ${isVisible ? 'visible' : ''} group relative flex-1 bg-[var(--vt-ink)] p-9 transition-[background] duration-300 hover:bg-[var(--vt-ink-soft)]`}
      style={{ transitionDelay: `${index * 0.08}s` }}
    >
      {/* Top accent line on hover */}
      <div className="absolute left-0 top-0 h-[2px] w-0 bg-[var(--vt-paper)] transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full" />

      <div className="mb-5 font-display text-[52px] font-semibold leading-none text-[var(--vt-paper)]/6 transition-colors duration-400 group-hover:text-[var(--vt-paper)]/16">
        {step.number}
      </div>
      <div className="text-base font-semibold text-[var(--vt-paper)]">{step.title}</div>
      <div className="mt-1.5 text-[11px] uppercase tracking-[0.08em] text-[var(--vt-mute)]">{step.period}</div>
      <div className="mt-3.5 text-[13px] leading-[1.55] text-[var(--vt-whisper)]">{step.description}</div>
    </div>
  );
}

export function TimelineSection() {
  const label = useReveal();
  const title = useReveal();

  return (
    <section id="implantacao" className="mx-auto max-w-[1100px] px-6 py-24 sm:px-12">
      <div
        ref={label.ref}
        className={`vt-reveal ${label.isVisible ? 'visible' : ''} mb-3.5 flex items-center gap-4 text-[11px] uppercase tracking-[0.14em] text-[var(--vt-mute)]`}
      >
        <span className="h-px w-6 bg-[var(--vt-graphite)]" />
        Implantação
      </div>
      <div
        ref={title.ref}
        className={`vt-reveal ${title.isVisible ? 'visible' : ''} mb-14 font-display text-4xl font-semibold leading-[1.12] text-[var(--vt-paper)]`}
        style={{ transitionDelay: '0.1s' }}
      >
        Do contrato ao primeiro resultado
      </div>

      <div className="mosaic-grid flex flex-col sm:flex-row">
        {STEPS.map((step, i) => (
          <TimelineStep key={step.number} step={step} index={i} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Rewrite footer with monogram seal and compliance badges**

Replace the entire content of `src/components/proposta-publica/footer.tsx`:

```tsx
export function PropostaFooter() {
  return (
    <footer className="mx-auto max-w-[1100px] px-6 py-14 sm:px-12">
      <div className="flex items-center justify-between border-t border-[var(--vt-paper)]/6 pt-14">
        <div className="flex items-center gap-3">
          {/* Small monogram seal */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--vt-graphite)]">
            <span className="font-display text-[15px] font-semibold leading-none text-[var(--vt-graphite)]">
              J
            </span>
          </div>
          <span className="font-display text-xl font-semibold tracking-[0.06em] text-[var(--vt-graphite)]" style={{ fontVariantCaps: 'small-caps' }}>
            Juspilot
          </span>
        </div>

        <div className="flex gap-5 text-[11px] uppercase tracking-[0.06em] text-[var(--vt-graphite)]">
          {['AES-256', 'LGPD', 'AWS', 'Audit Trail'].map((item) => (
            <span key={item} className="opacity-60 transition-opacity duration-300 hover:opacity-100">
              {item}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npx next build 2>&1 | tail -10`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/proposta-publica/timeline-section.tsx src/components/proposta-publica/footer.tsx
git commit -m "feat: redesign timeline and footer with mosaic grid and compliance badges"
```

---

## Task 14: Refactor page.tsx and delete merged components

**Files:**
- Modify: `src/app/p/[slug]/page.tsx`
- Delete: `src/components/proposta-publica/compliance-section.tsx`
- Delete: `src/components/proposta-publica/cta-section.tsx`

- [ ] **Step 1: Rewrite page.tsx — remove inline styles, compose new layout**

Replace the entire content of `src/app/p/[slug]/page.tsx`:

```tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { PropostaHeader } from '@/components/proposta-publica/header';
import { HeroSection } from '@/components/proposta-publica/hero-section';
import { DoresSection } from '@/components/proposta-publica/dores-section';
import { FeaturesSection } from '@/components/proposta-publica/features-section';
import { ROISection } from '@/components/proposta-publica/roi-section';
import { PricingSection } from '@/components/proposta-publica/pricing-section';
import { TimelineSection } from '@/components/proposta-publica/timeline-section';
import { PropostaFooter } from '@/components/proposta-publica/footer';
import { TrackView } from './track-view';
import type { Proposta } from '@/types';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProposta(slug: string) {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('propostas')
    .select('*')
    .eq('slug', slug)
    .in('status', ['publicada', 'visualizada', 'aceita'])
    .single();
  return data as Proposta | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const proposta = await getProposta(slug);
  if (!proposta) return { title: 'Proposta não encontrada' };
  return {
    title: `JusPilot — Proposta para ${proposta.escritorio_nome}`,
    description: `Proposta comercial personalizada do JusPilot para ${proposta.escritorio_nome}`,
    openGraph: {
      title: `JusPilot — Proposta para ${proposta.escritorio_nome}`,
      description: 'Copiloto Jurídico com Inteligência Artificial',
    },
  };
}

export default async function PropostaPublicaPage({ params }: Props) {
  const { slug } = await params;
  const proposta = await getProposta(slug);
  if (!proposta) notFound();

  if (proposta.data_expiracao && new Date(proposta.data_expiracao) < new Date()) {
    return (
      <div className="vitrine flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-6 h-px w-16 bg-[var(--vt-paper)]/20" />
          <h1 className="font-display text-2xl font-light tracking-wide text-[var(--vt-paper)]">Proposta expirada</h1>
          <p className="mt-3 text-sm tracking-wide text-[var(--vt-mute)]">Esta proposta não está mais disponível.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TrackView propostaId={proposta.id} />
      <div className="vitrine min-h-screen">
        <div className="vitrine-grain" />

        <PropostaHeader proposta={proposta} />

        <HeroSection proposta={proposta} />

        <div className="mx-auto max-w-[1100px] px-6 sm:px-12"><hr className="vitrine-divider" /></div>

        <DoresSection proposta={proposta} />

        <div className="mx-auto max-w-[1100px] px-6 sm:px-12"><hr className="vitrine-divider" /></div>

        <ROISection proposta={proposta} />
        <FeaturesSection />

        <div className="mx-auto max-w-[1100px] px-6 sm:px-12"><hr className="vitrine-divider" /></div>

        <PricingSection proposta={proposta} />

        <div className="mx-auto max-w-[1100px] px-6 sm:px-12"><hr className="vitrine-divider" /></div>

        <TimelineSection />

        <PropostaFooter />
      </div>
    </>
  );
}
```

Key changes:
- Removed the entire `<style>` block (lines 78-173 of the old file)
- Removed `<script dangerouslySetInnerHTML>` (lines 175-188)
- Removed `ComplianceSection` import (merged into footer)
- Removed `CTASection` usage (was not imported in old page.tsx, but file existed)
- Added `vitrine` class on container div
- Added `vitrine-grain` div
- Added `vitrine-divider` `<hr>` elements between sections
- `FeaturesSection` renders after `ROISection` within the same visual section

- [ ] **Step 2: Delete merged components**

```bash
rm src/components/proposta-publica/compliance-section.tsx
rm src/components/proposta-publica/cta-section.tsx
```

- [ ] **Step 3: Verify build**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds. No import errors for deleted files.

- [ ] **Step 4: Commit**

```bash
git add -A src/app/p/[slug]/page.tsx src/components/proposta-publica/
git commit -m "feat: rebuild page.tsx with vitrine layout, remove inline styles and merged components"
```

---

## Task 15: Add navigation chrome (scroll progress, nav dots, back-to-top)

**Files:**
- Create: `src/components/proposta-publica/nav-chrome.tsx`
- Modify: `src/app/p/[slug]/page.tsx` (add import)

- [ ] **Step 1: Create nav-chrome.tsx**

Create `src/components/proposta-publica/nav-chrome.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'hero', label: 'Início' },
  { id: 'diagnostico', label: 'Diagnóstico' },
  { id: 'numeros', label: 'Números' },
  { id: 'investimento', label: 'Investimento' },
  { id: 'implantacao', label: 'Implantação' },
];

export function NavChrome() {
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    function onScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
      setShowBackToTop(scrollTop > 600);

      // Find active section
      const scrollPos = scrollTop + window.innerHeight / 3;
      let active = 0;
      SECTIONS.forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (el && scrollPos >= el.offsetTop) active = i;
      });
      setActiveSection(active);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      {/* Scroll progress bar */}
      <div
        className="vitrine-progress"
        style={{ width: `${progress}%` }}
      />

      {/* Nav dots */}
      <nav className="fixed right-8 top-1/2 z-60 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            className={`group relative h-2 w-2 border transition-all duration-300 ${
              i === activeSection
                ? 'border-[var(--vt-paper)] bg-[var(--vt-paper)]'
                : 'border-[var(--vt-graphite)] bg-transparent hover:border-[var(--vt-mute)]'
            }`}
            aria-label={s.label}
          >
            <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] uppercase tracking-[0.08em] text-[var(--vt-mute)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {s.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Back to top */}
      <button
        onClick={() => scrollTo('hero')}
        className={`fixed bottom-8 right-8 z-60 flex h-11 w-11 items-center justify-center border border-[var(--vt-graphite)] bg-[var(--vt-ink-soft)] text-[var(--vt-paper)] transition-all duration-300 hover:border-[var(--vt-mute)] hover:bg-[var(--vt-graphite)] ${
          showBackToTop ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0 pointer-events-none'
        }`}
        aria-label="Voltar ao topo"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>
    </>
  );
}
```

- [ ] **Step 2: Add NavChrome to page.tsx**

In `src/app/p/[slug]/page.tsx`, add the import at the top:

```tsx
import { NavChrome } from '@/components/proposta-publica/nav-chrome';
```

Then add `<NavChrome />` right after `<div className="vitrine-grain" />`:

```tsx
<div className="vitrine-grain" />
<NavChrome />
```

- [ ] **Step 3: Verify build**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/proposta-publica/nav-chrome.tsx src/app/p/[slug]/page.tsx
git commit -m "feat: add scroll progress bar, nav dots, and back-to-top button"
```

---

## Task 16: Final build verification and cleanup

**Files:**
- All modified files

- [ ] **Step 1: Full build check**

Run: `npx next build 2>&1 | tail -30`
Expected: Build succeeds with no errors or warnings related to the modified files.

- [ ] **Step 2: Check for any remaining hardcoded hex values**

Run: `grep -r '#c9a96e\|#0a0f1c\|#141c2e\|#1e293b\|#8b95a5\|#4a5568\|#f1f5f9' src/components/proposta-publica/ src/app/p/`
Expected: No matches. All old gold/navy colors should be replaced.

- [ ] **Step 3: Check for remaining emoji references**

Run: `grep -r "icon: '" src/lib/constants/dores.ts`
Expected: No matches. All emojis replaced with `iconPath`.

- [ ] **Step 4: Verify no orphan imports**

Run: `grep -r 'compliance-section\|cta-section' src/`
Expected: No matches. Both deleted components should have zero references.

- [ ] **Step 5: Commit cleanup if needed**

If any issues found in steps 2-4, fix them and commit:

```bash
git add -A
git commit -m "fix: clean up remaining hardcoded values and orphan references"
```
