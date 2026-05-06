# Redesign do Gerador de Propostas — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o redesign completo da página pública de propostas (`/p/[slug]`) com sistema de perfil adaptativo, novo header de co-branding, hero adaptativo, ROI com barra comparativa, Features Section independente, Pricing limpo e cor unificada da marca (#D97757).

**Architecture:** Sistema de `PropostaProfile` derivado em runtime a partir de dados do wizard, sem migrations. Cada componente recebe a `proposta` e usa `deriveProfile()` + `getProfileCopy()` para obter textos/estilos adaptativos. Componentes existentes são editados; um novo (`features-section.tsx`) é criado e o pricing perde o checklist.

**Tech Stack:** Next.js 16.2.2 (App Router), React 19, TypeScript, Tailwind CSS v4, CSS variables, Supabase (somente leitura de dados existentes).

---

## File Structure

### Novos arquivos
- `src/lib/utils/proposta-profile.ts` — `deriveProfile()`, `getProfileCopy()`, tipos
- `src/lib/utils/proposta-profile.test.ts` — testes de derivação de perfil
- `src/components/proposta-publica/features-section.tsx` — grid de features independente

### Arquivos editados
- `src/app/globals.css` — cor brand #D97757
- `src/app/p/[slug]/page.tsx` — ordem das seções
- `src/components/proposta-publica/header.tsx` — Brand Bar + Co-branding
- `src/components/proposta-publica/hero-section.tsx` — headline adaptativa + scroll indicator
- `src/components/proposta-publica/dores-section.tsx` — título adaptativo + ordenação por relevância
- `src/components/proposta-publica/roi-section.tsx` — título adaptativo + barra comparativa + frase âncora
- `src/components/proposta-publica/pricing-section.tsx` — remover features, título adaptativo
- `src/components/proposta-publica/timeline-section.tsx` — título adaptativo
- `src/components/proposta-publica/faq-section.tsx` — perguntas condicionais
- `src/components/proposta-publica/nav-chrome.tsx` — adicionar seção `plataforma`
- `src/components/proposta-publica/footer.tsx` — wordmark PNG
- `src/lib/constants/precos.ts` — expandir FEATURES_INCLUIDAS

---

## Task 1: Unificar cor da marca (#D97757)

**Files:**
- Modify: `src/app/globals.css:5-8,191-192`

- [ ] **Step 1: Trocar `--color-brand` no @theme inline**

Em `src/app/globals.css` linhas 5-8, substituir:

```css
  --color-brand: #D4663C;
  --color-brand-hover: #C05A33;
  --color-brand-soft: #D4663C1A;
  --color-brand-muted: #D4663C33;
```

por:

```css
  --color-brand: #D97757;
  --color-brand-hover: #C26641;
  --color-brand-soft: #D977571A;
  --color-brand-muted: #D9775733;
```

- [ ] **Step 2: Trocar `--vt-brand` na vitrine**

Em `src/app/globals.css` linhas 191-192, substituir:

```css
  --vt-brand: #D4663C;
  --vt-brand-hover: #C05A33;
```

por:

```css
  --vt-brand: #D97757;
  --vt-brand-hover: #C26641;
```

- [ ] **Step 3: Verificar que não há mais ocorrências hardcoded**

Run: `grep -rn "D4663C\|C05A33" /Users/marcosrobertopereira/propostas-juspilot/src`
Expected: Sem resultados (apenas o `globals.css` editado, sem D4663C).

- [ ] **Step 4: Build de verificação**

Run: `cd /Users/marcosrobertopereira/propostas-juspilot && npm run build`
Expected: Build passa sem erros.

- [ ] **Step 5: Commit**

```bash
cd /Users/marcosrobertopereira/propostas-juspilot
git add src/app/globals.css
git commit -m "feat(brand): unify brand color to MIV canonical #D97757"
```

---

## Task 2: Sistema de Perfil Adaptativo (PropostaProfile)

**Files:**
- Create: `src/lib/utils/proposta-profile.ts`
- Create: `src/lib/utils/proposta-profile.test.ts`

- [ ] **Step 1: Escrever os testes (TDD)**

Criar `src/lib/utils/proposta-profile.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { deriveProfile, getProfileCopy } from './proposta-profile';
import type { Proposta } from '@/types';

const baseProposta: Partial<Proposta> = {
  qtd_advogados: 8,
  areas: [],
  perfil: 'boutique',
  escritorio_nome: 'Teste Advogados',
  escritorio_cidade: 'São Paulo',
  escritorio_uf: 'SP',
};

describe('deriveProfile', () => {
  it('returns boutique_publico when small firm with public law areas', () => {
    const p = { ...baseProposta, qtd_advogados: 8, areas: ['direito_publico'] } as Proposta;
    expect(deriveProfile(p).id).toBe('boutique_publico');
  });

  it('returns boutique_empresarial when small firm with corporate areas', () => {
    const p = { ...baseProposta, qtd_advogados: 10, areas: ['empresarial', 'societario'] } as Proposta;
    expect(deriveProfile(p).id).toBe('boutique_empresarial');
  });

  it('returns boutique_criminal when small firm with criminal areas', () => {
    const p = { ...baseProposta, qtd_advogados: 5, areas: ['penal'] } as Proposta;
    expect(deriveProfile(p).id).toBe('boutique_criminal');
  });

  it('returns contencioso_massa when firm has more than 30 lawyers', () => {
    const p = { ...baseProposta, qtd_advogados: 50, areas: ['trabalhista'] } as Proposta;
    expect(deriveProfile(p).id).toBe('contencioso_massa');
  });

  it('returns contencioso_massa when perfil flag is contencioso_massa', () => {
    const p = { ...baseProposta, qtd_advogados: 10, perfil: 'massa', areas: [] } as Proposta;
    expect(deriveProfile(p).id).toBe('contencioso_massa');
  });

  it('returns misto when no specific match', () => {
    const p = { ...baseProposta, qtd_advogados: 20, areas: [], perfil: 'misto' } as Proposta;
    expect(deriveProfile(p).id).toBe('misto');
  });
});

describe('getProfileCopy', () => {
  it('provides hero headline for each profile', () => {
    expect(getProfileCopy('boutique_publico').heroHeadline).toContain('Direito Público');
    expect(getProfileCopy('contencioso_massa').heroHeadline).toContain('Escale');
    expect(getProfileCopy('misto').heroHeadline).toContain('amplificado');
  });

  it('provides diagnostico title for each profile', () => {
    expect(getProfileCopy('boutique_publico').diagnosticoTitle).toContain('desafios');
    expect(getProfileCopy('contencioso_massa').diagnosticoTitle).toContain('Gargalos');
  });
});
```

- [ ] **Step 2: Rodar testes para confirmar que falham**

Run: `cd /Users/marcosrobertopereira/propostas-juspilot && npx vitest run src/lib/utils/proposta-profile.test.ts`
Expected: FAIL — `Cannot find module './proposta-profile'`.

- [ ] **Step 3: Criar `proposta-profile.ts` com a implementação**

Criar `src/lib/utils/proposta-profile.ts`:

```ts
import type { Proposta, AreaAtuacao } from '@/types';

export type PropostaProfileId =
  | 'boutique_publico'
  | 'boutique_empresarial'
  | 'boutique_criminal'
  | 'contencioso_massa'
  | 'misto';

export interface PropostaProfileCopy {
  heroHeadline: string;
  diagnosticoTitle: string;
  roiTitle: string;
  featuresTitle: string;
  pricingTitle: string;
  timelineTitle: string;
  ctaLabel: string;
}

export interface PropostaProfile extends PropostaProfileCopy {
  id: PropostaProfileId;
  tone: 'consultivo' | 'tecnico' | 'executivo';
}

const PUBLIC_AREAS: AreaAtuacao[] = ['direito_publico', 'administrativo', 'licitacoes', 'tributario_publico'];
const CORPORATE_AREAS: AreaAtuacao[] = ['empresarial', 'societario', 'tributario', 'contratos', 'ma'];
const CRIMINAL_AREAS: AreaAtuacao[] = ['penal', 'criminal'];

function hasAnyArea(areas: AreaAtuacao[] | undefined, candidates: AreaAtuacao[]): boolean {
  if (!areas) return false;
  return areas.some((a) => candidates.includes(a));
}

export function deriveProfile(proposta: Proposta): PropostaProfile {
  const id = deriveProfileId(proposta);
  const copy = getProfileCopy(id);
  const tone = id === 'contencioso_massa' ? 'executivo' : id === 'misto' ? 'consultivo' : 'consultivo';
  return { id, tone, ...copy };
}

function deriveProfileId(proposta: Proposta): PropostaProfileId {
  const qtd = proposta.qtd_advogados ?? 0;
  const areas = proposta.areas ?? [];
  const perfil = proposta.perfil;

  if (qtd > 30 || perfil === 'massa') return 'contencioso_massa';

  if (qtd <= 15) {
    if (hasAnyArea(areas, PUBLIC_AREAS)) return 'boutique_publico';
    if (hasAnyArea(areas, CORPORATE_AREAS)) return 'boutique_empresarial';
    if (hasAnyArea(areas, CRIMINAL_AREAS)) return 'boutique_criminal';
  }

  return 'misto';
}

const PROFILE_COPY: Record<PropostaProfileId, PropostaProfileCopy> = {
  boutique_publico: {
    heroHeadline: 'Inteligência artificial a serviço do Direito Público',
    diagnosticoTitle: 'Os desafios que identificamos no seu escritório',
    roiTitle: 'O impacto financeiro no seu escritório',
    featuresTitle: 'Tudo que seu escritório precisa em um só lugar',
    pricingTitle: 'Seu plano sob medida',
    timelineTitle: 'Implantação cuidadosa em 90 dias',
    ctaLabel: 'Agendar conversa',
  },
  boutique_empresarial: {
    heroHeadline: 'Potencialize sua advocacia empresarial com IA',
    diagnosticoTitle: 'Os desafios que identificamos no seu escritório',
    roiTitle: 'O impacto financeiro no seu escritório',
    featuresTitle: 'Tudo que seu escritório precisa em um só lugar',
    pricingTitle: 'Seu plano sob medida',
    timelineTitle: 'Implantação cuidadosa em 90 dias',
    ctaLabel: 'Agendar conversa',
  },
  boutique_criminal: {
    heroHeadline: 'Defesa criminal potencializada por inteligência artificial',
    diagnosticoTitle: 'Os desafios que identificamos no seu escritório',
    roiTitle: 'O impacto financeiro no seu escritório',
    featuresTitle: 'Tudo que seu escritório precisa em um só lugar',
    pricingTitle: 'Seu plano sob medida',
    timelineTitle: 'Implantação cuidadosa em 90 dias',
    ctaLabel: 'Agendar conversa',
  },
  contencioso_massa: {
    heroHeadline: 'Escale sua operação jurídica sem escalar custos',
    diagnosticoTitle: 'Gargalos que travam sua operação',
    roiTitle: 'Quanto sua operação ganha em escala',
    featuresTitle: 'Ferramentas para operação em escala',
    pricingTitle: 'Investimento proporcional à sua operação',
    timelineTitle: 'Implantação estruturada em 90 dias',
    ctaLabel: 'Agendar conversa',
  },
  misto: {
    heroHeadline: 'Seu escritório, amplificado por inteligência artificial',
    diagnosticoTitle: 'O que está limitando seu crescimento',
    roiTitle: 'Números que justificam a decisão',
    featuresTitle: 'O que está incluso no seu plano',
    pricingTitle: 'Condições exclusivas para seu escritório',
    timelineTitle: 'Seu roadmap de implantação',
    ctaLabel: 'Agendar conversa',
  },
};

export function getProfileCopy(id: PropostaProfileId): PropostaProfileCopy {
  return PROFILE_COPY[id];
}
```

- [ ] **Step 4: Rodar testes para confirmar que passam**

Run: `cd /Users/marcosrobertopereira/propostas-juspilot && npx vitest run src/lib/utils/proposta-profile.test.ts`
Expected: PASS — todos os 8 testes verdes.

- [ ] **Step 5: Commit**

```bash
cd /Users/marcosrobertopereira/propostas-juspilot
git add src/lib/utils/proposta-profile.ts src/lib/utils/proposta-profile.test.ts
git commit -m "feat(profile): add adaptive PropostaProfile derivation system"
```

---

## Task 3: Header — Brand Bar + Co-branding

**Files:**
- Modify: `src/components/proposta-publica/header.tsx`

- [ ] **Step 1: Reescrever o header com duas camadas**

Substituir o conteúdo completo de `src/components/proposta-publica/header.tsx` por:

```tsx
import type { Proposta } from '@/types';

interface HeaderProps {
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

export function PropostaHeader({ proposta }: HeaderProps) {
  const now = new Date();
  const month = now.toLocaleString('pt-BR', { month: 'long' });
  const year = now.getFullYear();
  const hasLogo = !!proposta.escritorio_logo_url;

  return (
    <header className="relative z-10">
      {/* Brand Bar (top) */}
      <div className="bg-[var(--vt-brand)]">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-2.5 sm:px-12">
          <div className="flex items-center gap-2">
            <img
              src="/brand/symbol-light.png"
              alt="JusPilot"
              className="h-5 w-5"
            />
            <span className="text-[13px] font-semibold tracking-tight text-white">
              Juspilot
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.14em] text-white/70">
            Proposta Comercial
          </span>
        </div>
      </div>

      {/* Main area (escritório) */}
      <div className="mx-auto max-w-[1100px] px-6 py-7 sm:px-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {hasLogo ? (
              <img
                src={proposta.escritorio_logo_url!}
                alt={`Logo ${proposta.escritorio_nome}`}
                className="max-h-10 object-contain"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[var(--vt-brand)] text-sm font-bold tracking-[0.04em] text-white">
                {getInitials(proposta.escritorio_nome)}
              </div>
            )}
            <div>
              <div className="text-base font-semibold tracking-tight text-[var(--vt-paper)]">
                {proposta.escritorio_nome}
              </div>
              <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--vt-mute)]">
                Advogados — {proposta.escritorio_cidade}, {proposta.escritorio_uf}
              </div>
            </div>
          </div>

          <div className="hidden sm:block">
            <span className="text-[11px] uppercase tracking-[0.06em] text-[var(--vt-mute)]">
              {month} {year}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Verificar que arquivo `/public/brand/symbol-light.png` existe**

Run: `ls /Users/marcosrobertopereira/propostas-juspilot/public/brand/symbol-light.png`
Expected: Arquivo existe (já foi criado em sessão anterior).

- [ ] **Step 3: Iniciar dev server e validar visualmente**

Run: `cd /Users/marcosrobertopereira/propostas-juspilot && npm run dev`
Abrir uma proposta publicada (`/p/{slug}`).
Expected: Barra terracota no topo com logo e "Juspilot"; abaixo nome do escritório com iniciais ou logo do escritório.

- [ ] **Step 4: Commit**

```bash
cd /Users/marcosrobertopereira/propostas-juspilot
git add src/components/proposta-publica/header.tsx
git commit -m "feat(header): redesign with brand bar and co-branding layout"
```

---

## Task 4: Hero Section — headline adaptativa

**Files:**
- Modify: `src/components/proposta-publica/hero-section.tsx`

- [ ] **Step 1: Substituir hero pelo adaptativo**

Substituir todo o conteúdo de `src/components/proposta-publica/hero-section.tsx` por:

```tsx
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
```

- [ ] **Step 2: Adicionar a animação `bounce` para o scroll indicator**

Adicionar no final de `src/app/globals.css`:

```css
/* Hero scroll indicator */
@keyframes hero-bounce {
  0%, 100% { transform: translateY(0); opacity: 0.6; }
  50% { transform: translateY(6px); opacity: 1; }
}
.hero-scroll-indicator {
  animation: hero-bounce 2s ease-in-out infinite;
}
```

- [ ] **Step 3: Build e dev server para verificar**

Run: `cd /Users/marcosrobertopereira/propostas-juspilot && npm run build`
Expected: Build passa.

Abrir `/p/{slug}` no dev server.
Expected: Headline muda conforme perfil do escritório; subtítulo mostra cidade/UF; seta animada bounce ao final do hero.

- [ ] **Step 4: Commit**

```bash
cd /Users/marcosrobertopereira/propostas-juspilot
git add src/components/proposta-publica/hero-section.tsx src/app/globals.css
git commit -m "feat(hero): adaptive headline by profile and scroll indicator"
```

---

## Task 5: Diagnóstico Section — título adaptativo + ordenação

**Files:**
- Modify: `src/components/proposta-publica/dores-section.tsx`

- [ ] **Step 1: Ler o arquivo atual completo**

Run: `cat /Users/marcosrobertopereira/propostas-juspilot/src/components/proposta-publica/dores-section.tsx`
Expected: Mostra o componente atual; identificar o título hardcoded e a ordem das dores.

- [ ] **Step 2: Adicionar título adaptativo**

Substituir o título hardcoded por:

```tsx
import { deriveProfile } from '@/lib/utils/proposta-profile';
import { getSuggestedDores } from '@/lib/constants/dores';

// dentro do componente:
const profile = deriveProfile(proposta);

// usar profile.diagnosticoTitle no h2/título da seção
<h2 className="...">{profile.diagnosticoTitle}</h2>
```

- [ ] **Step 3: Ordenar dores com sugeridas primeiro**

Antes do map dos cards, calcular dores sugeridas e ordenar:

```tsx
const suggestedIds = new Set(
  getSuggestedDores(proposta.areas ?? [], proposta.perfil).map((d) => d.id)
);
const sortedDores = [...dores].sort((a, b) => {
  const aSuggested = suggestedIds.has(a.id);
  const bSuggested = suggestedIds.has(b.id);
  if (aSuggested && !bSuggested) return -1;
  if (!aSuggested && bSuggested) return 1;
  return 0;
});
```

- [ ] **Step 4: Adicionar borda lateral terracota nas sugeridas**

Cada card recebe `data-suggested={suggestedIds.has(dor.id)}` e via classe condicional:

```tsx
<div
  key={dor.id}
  className={`${isLastOdd ? 'md:col-span-2' : ''} ${suggestedIds.has(dor.id) ? 'border-l-2 border-[var(--vt-brand)]/40' : ''}`}
>
```

- [ ] **Step 5: Build e teste visual**

Run: `cd /Users/marcosrobertopereira/propostas-juspilot && npm run build`
Expected: Sem erros.

Verificar `/p/{slug}` no dev server.
Expected: Título muda por perfil; dores sugeridas aparecem primeiro com borda lateral terracota sutil.

- [ ] **Step 6: Commit**

```bash
cd /Users/marcosrobertopereira/propostas-juspilot
git add src/components/proposta-publica/dores-section.tsx
git commit -m "feat(dores): adaptive title and relevance-based ordering"
```

---

## Task 6: ROI Section — título adaptativo + barra comparativa + frase âncora

**Files:**
- Modify: `src/components/proposta-publica/roi-section.tsx`

- [ ] **Step 1: Reescrever ROI com adaptativo + barra comparativa**

Substituir todo o conteúdo de `src/components/proposta-publica/roi-section.tsx` por:

```tsx
'use client';

import type { Proposta } from '@/types';
import { useReveal } from '@/hooks/use-reveal';
import { useCounter } from '@/hooks/use-counter';
import { deriveProfile } from '@/lib/utils/proposta-profile';

interface ROISectionProps {
  proposta: Proposta;
}

function ROICard({
  target,
  unit,
  label,
  decimals = 0,
  prefix = '',
  index,
}: {
  target: number;
  unit: string;
  label: string;
  decimals?: number;
  prefix?: string;
  index: number;
}) {
  const { ref, isVisible } = useReveal();
  const value = useCounter(target, { enabled: isVisible, decimals });

  return (
    <div
      ref={ref}
      className={`vt-reveal ${isVisible ? 'visible' : ''} group relative overflow-hidden bg-[var(--vt-ink)] px-9 py-14 text-center transition-[background] duration-300 hover:bg-[var(--vt-ink-soft)]`}
      style={{ transitionDelay: `${index * 0.08}s` }}
    >
      <div className="absolute bottom-0 left-1/2 h-[2px] w-0 -translate-x-1/2 bg-[var(--vt-brand)] transition-[width] duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-3/5" />

      <div className="text-[60px] font-extrabold leading-none text-[var(--vt-paper)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {prefix}
        {decimals > 0 ? value.toFixed(decimals) : value}
        <span className="text-2xl font-normal text-[var(--vt-whisper)]">{unit}</span>
      </div>
      <div
        className="mt-3.5 text-[13px] leading-[1.4] text-[var(--vt-mute)]"
        dangerouslySetInnerHTML={{ __html: label.replace('\n', '<br/>') }}
      />
    </div>
  );
}

function CompareBar({ mensalidade, valorGerado }: { mensalidade: number; valorGerado: number }) {
  const { ref, isVisible } = useReveal();
  const total = mensalidade + valorGerado;
  const mensalidadePct = total > 0 ? (mensalidade / total) * 100 : 0;
  const valorPct = total > 0 ? (valorGerado / total) * 100 : 0;

  return (
    <div ref={ref} className={`vt-reveal ${isVisible ? 'visible' : ''} mt-12`} style={{ transitionDelay: '0.3s' }}>
      <div className="mb-3 flex items-center justify-between text-[12px] uppercase tracking-[0.08em] text-[var(--vt-mute)]">
        <span>Mensalidade</span>
        <span>Valor gerado</span>
      </div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-[var(--vt-graphite)]">
        <div
          className="h-full bg-[var(--vt-graphite)] transition-[width] duration-1000 ease-out"
          style={{ width: isVisible ? `${mensalidadePct}%` : '0%' }}
        />
        <div
          className="h-full bg-[var(--vt-brand)] transition-[width] duration-1000 ease-out"
          style={{ width: isVisible ? `${valorPct}%` : '0%', transitionDelay: '0.2s' }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between text-sm text-[var(--vt-whisper)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
        <span>R$ {mensalidade.toLocaleString('pt-BR')}</span>
        <span className="font-semibold text-[var(--vt-paper)]">R$ {valorGerado.toLocaleString('pt-BR')}</span>
      </div>
    </div>
  );
}

export function ROISection({ proposta }: ROISectionProps) {
  const profile = deriveProfile(proposta);
  const label = useReveal();
  const title = useReveal();
  const anchor = useReveal();

  const valorGerado = proposta.roi_valor_gerado || 0;
  const mensalidade = proposta.mensalidade_final || proposta.mensalidade || 0;
  const multiplo = Number(proposta.roi_multiplo) || 0;

  return (
    <section id="numeros" className="mx-auto max-w-[1100px] px-6 py-24 sm:px-12">
      <div
        ref={label.ref}
        className={`vt-reveal ${label.isVisible ? 'visible' : ''} mb-3.5 flex items-center gap-4 text-[11px] uppercase tracking-[0.14em] text-[var(--vt-mute)]`}
      >
        <span className="h-px w-6 bg-[var(--vt-brand)]" />
        Retorno sobre investimento
      </div>
      <div
        ref={title.ref}
        className={`vt-reveal ${title.isVisible ? 'visible' : ''} mb-14 text-4xl font-extrabold leading-[1.12] text-[var(--vt-paper)]`}
        style={{ transitionDelay: '0.1s' }}
      >
        {profile.roiTitle}
      </div>

      <div className="mosaic-grid mb-2 grid-cols-1 sm:grid-cols-3">
        <ROICard
          target={proposta.roi_horas_economizadas_total || 0}
          unit="h"
          label={`Horas economizadas\npor mês`}
          index={0}
        />
        <ROICard
          target={Math.round(valorGerado / 1000)}
          unit="mil"
          label={`Valor gerado\npor mês`}
          prefix="R$"
          index={1}
        />
        <ROICard target={multiplo} unit="x" label={`Retorno sobre\ninvestimento`} decimals={1} index={2} />
      </div>

      <CompareBar mensalidade={mensalidade} valorGerado={valorGerado} />

      <p
        ref={anchor.ref}
        className={`vt-reveal ${anchor.isVisible ? 'visible' : ''} mt-10 text-center text-base text-[var(--vt-whisper)]`}
        style={{ transitionDelay: '0.4s' }}
      >
        Para cada R$ 1 investido, seu escritório recupera{' '}
        <span className="font-semibold text-[var(--vt-paper)]">R$ {multiplo.toFixed(1)}</span> em produtividade.
      </p>
    </section>
  );
}
```

- [ ] **Step 2: Build e teste visual**

Run: `cd /Users/marcosrobertopereira/propostas-juspilot && npm run build`
Expected: Build passa.

Verificar no dev server `/p/{slug}`.
Expected: Título adaptativo, 3 cards de métrica, barra comparativa horizontal animada, frase âncora abaixo.

- [ ] **Step 3: Commit**

```bash
cd /Users/marcosrobertopereira/propostas-juspilot
git add src/components/proposta-publica/roi-section.tsx
git commit -m "feat(roi): adaptive title, comparison bar and anchor sentence"
```

---

## Task 7: Features Section — componente independente

**Files:**
- Modify: `src/lib/constants/precos.ts`
- Create: `src/components/proposta-publica/features-section.tsx` (substitui o existente)

- [ ] **Step 1: Expandir FEATURES_INCLUIDAS para objetos**

Substituir o conteúdo de `src/lib/constants/precos.ts` por:

```ts
import type { PropostaProfileId } from '@/lib/utils/proposta-profile';

export const FAIXAS_PRECO = [
  { min: 1, max: 3, setup: 2000, mensalidade: 1500, usuarios: 5 },
  { min: 4, max: 10, setup: 3500, mensalidade: 3000, usuarios: 10 },
  { min: 11, max: 20, setup: 5000, mensalidade: 5000, usuarios: 20 },
  { min: 21, max: Infinity, setup: 8000, mensalidade: 8000, usuarios: null },
] as const;

export const DESCONTO_MAX = 30;

export interface FeatureItem {
  name: string;
  description: string;
  highlight?: PropostaProfileId[];
}

export const FEATURES_INCLUIDAS: FeatureItem[] = [
  {
    name: 'Acesso ilimitado a todos os módulos',
    description: 'Sem limitação de uso por advogado ou função.',
  },
  {
    name: 'IA multimodelo sem restrição',
    description: 'GPT-4, Claude, Gemini — escolha o modelo por tarefa.',
    highlight: ['contencioso_massa'],
  },
  {
    name: 'Base de jurisprudência curada',
    description: 'STF, STJ, TJs e TST com alertas de mudança de entendimento.',
  },
  {
    name: 'Base de conhecimento personalizada',
    description: 'Indexe documentos do escritório com busca semântica.',
  },
  {
    name: 'Workflows ilimitados',
    description: 'Automatize rotinas com agentes inteligentes configuráveis.',
    highlight: ['contencioso_massa'],
  },
  {
    name: 'Integrações Gmail e Google Drive',
    description: 'Email, anexos e documentos sincronizados automaticamente.',
  },
  {
    name: 'API REST',
    description: 'Conecte com ERP, CRM, sistemas internos e integrações custom.',
    highlight: ['contencioso_massa'],
  },
  {
    name: 'Suporte prioritário',
    description: 'Resposta em até 4 horas em horário comercial.',
  },
];
```

- [ ] **Step 2: Reescrever features-section.tsx**

Substituir todo o conteúdo de `src/components/proposta-publica/features-section.tsx` por:

```tsx
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
```

- [ ] **Step 3: Build de verificação**

Run: `cd /Users/marcosrobertopereira/propostas-juspilot && npm run build`
Expected: Build passa.

- [ ] **Step 4: Commit**

```bash
cd /Users/marcosrobertopereira/propostas-juspilot
git add src/components/proposta-publica/features-section.tsx src/lib/constants/precos.ts
git commit -m "feat(features): independent section with descriptions and profile highlights"
```

---

## Task 8: Pricing Section — remover features, título adaptativo

**Files:**
- Modify: `src/components/proposta-publica/pricing-section.tsx`

- [ ] **Step 1: Ler arquivo atual completo**

Run: `cat /Users/marcosrobertopereira/propostas-juspilot/src/components/proposta-publica/pricing-section.tsx`
Expected: Mostra o componente atual; identificar checklist de features e título hardcoded.

- [ ] **Step 2: Adicionar import e usar perfil**

No topo do arquivo, garantir o import:

```tsx
import { deriveProfile } from '@/lib/utils/proposta-profile';
```

Dentro do componente:

```tsx
const profile = deriveProfile(proposta);
```

- [ ] **Step 3: Substituir título pelo `profile.pricingTitle`**

Localizar a tag de título principal (h2 com texto "Investimento" ou similar) e usar `{profile.pricingTitle}`.

- [ ] **Step 4: Remover bloco de FEATURES_INCLUIDAS**

Localizar o `{FEATURES_INCLUIDAS.map(...)` ou trecho similar que renderiza o checklist dentro do card de pricing e removê-lo. Remover também o import de `FEATURES_INCLUIDAS` se ficar sem uso.

- [ ] **Step 5: Verificar CTA usa `profile.ctaLabel`**

Localizar o botão de CTA e garantir que o texto seja `{profile.ctaLabel}` (ou hardcoded "Agendar conversa" se já estiver).

- [ ] **Step 6: Build e teste**

Run: `cd /Users/marcosrobertopereira/propostas-juspilot && npm run build`
Expected: Sem erros de tipo, sem imports não utilizados.

- [ ] **Step 7: Commit**

```bash
cd /Users/marcosrobertopereira/propostas-juspilot
git add src/components/proposta-publica/pricing-section.tsx
git commit -m "feat(pricing): remove inline features and adopt adaptive title"
```

---

## Task 9: Timeline Section — título adaptativo

**Files:**
- Modify: `src/components/proposta-publica/timeline-section.tsx`

- [ ] **Step 1: Adaptar para usar perfil**

Mudar o componente para receber `proposta` como prop e usar `profile.timelineTitle`:

```tsx
'use client';

import type { Proposta } from '@/types';
import { useReveal } from '@/hooks/use-reveal';
import { deriveProfile } from '@/lib/utils/proposta-profile';

interface TimelineSectionProps {
  proposta: Proposta;
}

export function TimelineSection({ proposta }: TimelineSectionProps) {
  const profile = deriveProfile(proposta);
  // ... resto igual, trocando o título por profile.timelineTitle
}
```

Localizar o título da seção e substituir o texto fixo por `{profile.timelineTitle}`.

- [ ] **Step 2: Atualizar a chamada em `page.tsx`**

Em `src/app/p/[slug]/page.tsx` linha 94, trocar:

```tsx
<TimelineSection />
```

por:

```tsx
<TimelineSection proposta={proposta} />
```

- [ ] **Step 3: Build de verificação**

Run: `cd /Users/marcosrobertopereira/propostas-juspilot && npm run build`
Expected: Sem erros.

- [ ] **Step 4: Commit**

```bash
cd /Users/marcosrobertopereira/propostas-juspilot
git add src/components/proposta-publica/timeline-section.tsx src/app/p/[slug]/page.tsx
git commit -m "feat(timeline): adaptive title by profile"
```

---

## Task 10: FAQ Section — perguntas condicionais

**Files:**
- Modify: `src/components/proposta-publica/faq-section.tsx`

- [ ] **Step 1: Adaptar FAQ para receber proposta e adicionar perguntas condicionais**

No topo do arquivo, adicionar:

```tsx
import type { Proposta } from '@/types';
import { deriveProfile, type PropostaProfileId } from '@/lib/utils/proposta-profile';

interface FAQSectionProps {
  proposta: Proposta;
}
```

Trocar a assinatura para `export function FAQSection({ proposta }: FAQSectionProps)`.

Logo após os `FAQ_ITEMS` existentes, adicionar perguntas condicionais:

```tsx
const PROFILE_FAQ_ITEMS: Record<PropostaProfileId, { q: string; a: string }[]> = {
  boutique_publico: [
    {
      q: 'Como a IA mantém o padrão de qualidade do meu escritório?',
      a: 'Treinamos a base de conhecimento com peças, jurisprudência e padrões redacionais do próprio escritório, garantindo aderência ao seu estilo e tese.',
    },
  ],
  boutique_empresarial: [
    {
      q: 'Como a IA mantém o padrão de qualidade do meu escritório?',
      a: 'Treinamos a base de conhecimento com peças, contratos e modelos do próprio escritório, garantindo aderência ao seu padrão.',
    },
  ],
  boutique_criminal: [
    {
      q: 'Como garantem o sigilo profissional e segredo de justiça?',
      a: 'Workspace dedicado, criptografia AES-256, logs auditáveis e DPA assinado garantem proteção integral. Conformidade com LGPD e OAB.',
    },
  ],
  contencioso_massa: [
    {
      q: 'Qual o limite de processos simultâneos?',
      a: 'Não há limite de processos. A plataforma escala horizontalmente — todos os usuários incluídos podem operar em paralelo sem degradação.',
    },
    {
      q: 'Como funciona a integração com sistemas internos do escritório?',
      a: 'API REST permite integração bidirecional com ERPs, CRMs e sistemas de gestão. Webhooks notificam eventos em tempo real.',
    },
  ],
  misto: [],
};
```

- [ ] **Step 2: Combinar arrays no render**

Dentro do componente:

```tsx
const profile = deriveProfile(proposta);
const items = [...FAQ_ITEMS, ...PROFILE_FAQ_ITEMS[profile.id]];

// usar `items` no render em vez de FAQ_ITEMS
```

- [ ] **Step 3: Atualizar a chamada em `page.tsx`**

Em `src/app/p/[slug]/page.tsx` linha 98:

```tsx
<FAQSection proposta={proposta} />
```

- [ ] **Step 4: Build**

Run: `cd /Users/marcosrobertopereira/propostas-juspilot && npm run build`
Expected: Sem erros.

- [ ] **Step 5: Commit**

```bash
cd /Users/marcosrobertopereira/propostas-juspilot
git add src/components/proposta-publica/faq-section.tsx src/app/p/[slug]/page.tsx
git commit -m "feat(faq): conditional questions per profile"
```

---

## Task 11: Footer com wordmark

**Files:**
- Modify: `src/components/proposta-publica/footer.tsx`

- [ ] **Step 1: Verificar arquivo wordmark**

Run: `ls /Users/marcosrobertopereira/propostas-juspilot/public/brand/wordmark-light.png`
Expected: Arquivo existe.

- [ ] **Step 2: Reescrever footer**

Substituir todo o conteúdo de `src/components/proposta-publica/footer.tsx` por:

```tsx
import type { Proposta } from '@/types';

interface FooterProps {
  proposta: Proposta;
}

export function PropostaFooter({ proposta: _proposta }: FooterProps) {
  return (
    <footer className="bg-[#0a0a0a]">
      <div className="mx-auto max-w-[1100px] px-6 py-14 sm:px-12">
        <div className="flex flex-col items-center gap-6 border-t border-[var(--vt-paper)]/6 pt-14 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-center gap-3 sm:items-start">
            <img
              src="/brand/wordmark-light.png"
              alt="Juspilot"
              className="h-7 w-auto opacity-90"
            />
            <span className="text-[12px] tracking-wide text-[var(--vt-mute)]">
              Proposta gerada por JusPilot — Copiloto Jurídico com IA
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-[11px] uppercase tracking-[0.06em] text-[var(--vt-graphite)]">
            <a href="https://juspilot.com.br" target="_blank" rel="noopener noreferrer" className="opacity-60 transition-opacity duration-300 hover:opacity-100">
              Site
            </a>
            <a href="https://juspilot.com.br/termos" target="_blank" rel="noopener noreferrer" className="opacity-60 transition-opacity duration-300 hover:opacity-100">
              Termos
            </a>
            <a href="https://juspilot.com.br/privacidade" target="_blank" rel="noopener noreferrer" className="opacity-60 transition-opacity duration-300 hover:opacity-100">
              Privacidade
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Build e teste visual**

Run: `cd /Users/marcosrobertopereira/propostas-juspilot && npm run build`
Expected: Sem erros.

Verificar no dev server.
Expected: Footer com wordmark à esquerda, links à direita, fundo `#0a0a0a` ligeiramente mais escuro que o body.

- [ ] **Step 4: Commit**

```bash
cd /Users/marcosrobertopereira/propostas-juspilot
git add src/components/proposta-publica/footer.tsx
git commit -m "feat(footer): wordmark image and policy links"
```

---

## Task 12: NavChrome — adicionar seção Plataforma

**Files:**
- Modify: `src/components/proposta-publica/nav-chrome.tsx:5-13`

- [ ] **Step 1: Atualizar lista SECTIONS**

Em `src/components/proposta-publica/nav-chrome.tsx` substituir o array `SECTIONS` (linhas 5-13) por:

```tsx
const SECTIONS = [
  { id: 'hero', label: 'Início' },
  { id: 'diagnostico', label: 'Diagnóstico' },
  { id: 'numeros', label: 'Números' },
  { id: 'plataforma', label: 'Plataforma' },
  { id: 'investimento', label: 'Investimento' },
  { id: 'seguranca', label: 'Segurança' },
  { id: 'implantacao', label: 'Implantação' },
  { id: 'faq', label: 'FAQ' },
];
```

- [ ] **Step 2: Build e teste**

Run: `cd /Users/marcosrobertopereira/propostas-juspilot && npm run build`
Expected: Sem erros.

Verificar no dev server.
Expected: 8 dots na navegação lateral; ao rolar, dot ativo segue a seção visível.

- [ ] **Step 3: Commit**

```bash
cd /Users/marcosrobertopereira/propostas-juspilot
git add src/components/proposta-publica/nav-chrome.tsx
git commit -m "feat(nav): add platform section to scroll dots"
```

---

## Task 13: Page layout — atualizar ordem e props das seções

**Files:**
- Modify: `src/app/p/[slug]/page.tsx`

- [ ] **Step 1: Atualizar imports e uso**

Em `src/app/p/[slug]/page.tsx`, substituir o JSX a partir do `<DoresSection>` (linha 77) até o `<FAQSection />` (linha 98) por:

```tsx
        <DoresSection proposta={proposta} />

        <div className="mx-auto max-w-[1100px] px-6 sm:px-12"><hr className="vitrine-divider" /></div>

        <ROISection proposta={proposta} />

        <div className="mx-auto max-w-[1100px] px-6 sm:px-12"><hr className="vitrine-divider" /></div>

        <FeaturesSection proposta={proposta} />

        <div className="mx-auto max-w-[1100px] px-6 sm:px-12"><hr className="vitrine-divider" /></div>

        <PricingSection proposta={proposta} />

        <div className="mx-auto max-w-[1100px] px-6 sm:px-12"><hr className="vitrine-divider" /></div>

        <SecuritySection />

        <div className="mx-auto max-w-[1100px] px-6 sm:px-12"><hr className="vitrine-divider" /></div>

        <TimelineSection proposta={proposta} />

        <div className="mx-auto max-w-[1100px] px-6 sm:px-12"><hr className="vitrine-divider" /></div>

        <FAQSection proposta={proposta} />
```

A ordem final é: Hero → Dores → ROI → Features → Pricing → Security → Timeline → FAQ → Footer.

- [ ] **Step 2: Build de verificação**

Run: `cd /Users/marcosrobertopereira/propostas-juspilot && npm run build`
Expected: Build passa sem erros de tipo.

- [ ] **Step 3: Teste visual completo**

Abrir `/p/{slug}` no dev server e validar fluxo completo:
- Header com brand bar terracota
- Hero com headline adaptativa
- Dores com sugeridas primeiro
- ROI com barra comparativa
- **Features section nova entre ROI e Pricing**
- Pricing sem features inline
- Security
- Timeline com título adaptativo
- FAQ com perguntas extras por perfil
- Footer com wordmark

Expected: Sem erros visuais; navegação dots funciona em todas as 8 seções.

- [ ] **Step 4: Commit**

```bash
cd /Users/marcosrobertopereira/propostas-juspilot
git add src/app/p/[slug]/page.tsx
git commit -m "feat(layout): reorder sections and pass proposta to all section props"
```

---

## Task 14: Verificação final integrada

- [ ] **Step 1: Lint completo**

Run: `cd /Users/marcosrobertopereira/propostas-juspilot && npm run lint`
Expected: Sem erros.

- [ ] **Step 2: Type check**

Run: `cd /Users/marcosrobertopereira/propostas-juspilot && npx tsc --noEmit`
Expected: Sem erros de tipo.

- [ ] **Step 3: Suite completa de testes**

Run: `cd /Users/marcosrobertopereira/propostas-juspilot && npx vitest run`
Expected: Todos os testes passam.

- [ ] **Step 4: Build final**

Run: `cd /Users/marcosrobertopereira/propostas-juspilot && npm run build`
Expected: Build de produção sem erros, sem avisos de tamanho de imagem.

- [ ] **Step 5: Smoke test em propostas reais**

Abrir 3 propostas distintas (ex: uma boutique pública, uma empresarial e uma de massa) e validar que o conteúdo adaptativo muda conforme o perfil derivado.

Expected:
- Boutique pública mostra "Direito Público" no headline
- Empresarial mostra "advocacia empresarial"
- Massa mostra "operação jurídica sem escalar custos"
- FAQ extras aparecem conforme perfil
- Features destacadas com dot só em `contencioso_massa`

- [ ] **Step 6: Commit final de polimento (se houver ajustes)**

```bash
cd /Users/marcosrobertopereira/propostas-juspilot
git status
# Se houver mudanças:
git add .
git commit -m "chore: final polish from end-to-end review"
```

---

## Notas para o engenheiro

- **Acentos:** sempre preservar acentuação portuguesa nos textos do `proposta-profile.ts`. Não trocar "ã" por "a", "ç" por "c", etc.
- **Cor da marca:** sempre `#D97757`. Se encontrar `#D4663C` em qualquer arquivo após Task 1, é bug.
- **PropostaProfile é puro:** nunca depende de banco. Apenas lê `proposta` (já carregada). Mudanças nas regras de derivação devem ter teste unitário em `proposta-profile.test.ts`.
- **Imagens em `/public/brand/`:** já estão criadas. Se faltar alguma, abortar e avisar.
- **DRY:** `getInitials()` aparece em `header.tsx` e `hero-section.tsx`. Se aparecer em um terceiro lugar, extrair para `src/lib/utils/initials.ts`.
- **TDD:** somente Task 2 tem testes unitários (lógica pura). As demais são componentes visuais — validar via dev server e screenshots em browser.
