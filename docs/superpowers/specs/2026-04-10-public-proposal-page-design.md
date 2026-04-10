# Public Proposal Page `/p/[slug]` — JusPilot MIV

**Date:** 2026-04-10
**Status:** Approved for implementation
**Sub-project:** 1 of 6
**Depends on:** Sub-project 0 (Design System Foundation) — merged

## Context

The public proposal page at `/p/[slug]` is the client-facing vitrine of JusPilot — the first thing a prospect sees. The current implementation uses inline `<style>` tags with externally loaded Google Fonts (Playfair Display + DM Sans), a gold/navy color palette (#c9a96e, #0a0f1c), `dangerouslySetInnerHTML` for JavaScript animations, and hardcoded hex values throughout 10 components.

This sub-project rebuilds the page against the new MIV identity established in sub-project 0, replacing inline styles with design tokens, switching to Libre Bodoni via `next/font/google`, and introducing proper React patterns for animations.

## Goals

- Migrate all 10 `src/components/proposta-publica/` components from inline styles + external fonts to design system tokens + self-hosted fonts.
- Replace the gold/navy palette with the monochrome MIV palette (ink, paper, graphite, mute, whisper).
- Replace `dangerouslySetInnerHTML` JavaScript with proper React hooks (`useReveal`, `useCounter`).
- Remove the inline `<style>` block from `src/app/p/[slug]/page.tsx`.
- Add interactivity: expandable diagnostic cards, feature tooltips, typing effect on hero subtitle.
- Maintain the dark vitrine theme (`--ink` background, `--paper` text).

## Non-goals

- Do not modify any other page (dashboard, wizard, internal proposal, settings, auth).
- Do not add new routes or API endpoints.
- Do not change the data model or Supabase queries — the page consumes the same `proposta` object.
- Do not introduce third-party animation libraries (framer-motion, GSAP, etc.). Vanilla CSS transitions + lightweight React hooks only.

## Decisions

### Font: Libre Bodoni replaces Fraunces

During brainstorming, the user identified that Fraunces (selected in sub-project 0) does not match the brand's "J" monogram, which has Didone characteristics — high contrast between thick/thin strokes, hairline serifs, vertical stress. **Libre Bodoni** is the correct free alternative.

**Impact on sub-project 0:** The `--font-display` token in `globals.css` and the `next/font/google` import in `layout.tsx` must be updated from Fraunces to Libre Bodoni. This is a 2-line change in `layout.tsx` and a variable name update — no API change, no consumer breakage.

```tsx
// layout.tsx — before
import { Fraunces } from 'next/font/google';
const fraunces = Fraunces({ variable: '--font-fraunces', subsets: ['latin'], axes: ['opsz'] });

// layout.tsx — after
import { Libre_Bodoni } from 'next/font/google';
const libreBodoni = Libre_Bodoni({ variable: '--font-display', subsets: ['latin'], weight: ['400', '500', '600', '700'], style: ['normal', 'italic'] });
```

### 7-section structure

The page is organized into 7 sections separated by double-line (fio duplo) editorial dividers:

| # | Section | Source data | Interactive behavior |
|---|---------|-------------|---------------------|
| 1 | **Header** | `proposta.escritorio_nome`, `proposta.escritorio_cidade`, `proposta.escritorio_uf` | Static |
| 2 | **Hero** | `proposta.escritorio_nome`, `proposta.lead_nome`, `proposta.lead_cargo` | Typing effect on subtitle, reveal on scroll |
| 3 | **Diagnostico** | `proposta.escritorio_dores[]` (dynamic array) | Expandable accordion cards (click to reveal JusPilot solution), left-border reveal on hover |
| 4 | **Numeros** | `proposta.roi_horas`, `proposta.roi_valor`, `proposta.roi_multiplicador` + 6 static features | Animated counters on scroll, feature tooltips on hover |
| 5 | **Investimento** | `proposta.setup_valor`, `proposta.mensalidade_valor`, `proposta.desconto_percentual`, `proposta.features_inclusos[]`, `proposta.validade_dias` | CTA button with fill-invert hover, validity countdown |
| 6 | **Implantacao** | 3 static steps (onboarding, calibracao, operacao plena) | Top-border reveal on hover, ghost numbers that brighten |
| 7 | **Footer** | Static: brand + compliance badges | Compliance badge hover opacity |

### Navigation & chrome

- **Scroll progress bar:** 2px white bar at top of viewport, width tracks scroll position.
- **Section nav dots:** Fixed right-side dots (5), each with hover label. Click scrolls to section.
- **Back-to-top button:** Square 44px button, fixed bottom-right, appears after 600px scroll. SVG chevron icon.

### Dark vitrine theme

All colors use CSS custom properties mapped to the design system:

| Token | Value | Usage |
|-------|-------|-------|
| `--ink` | `#0a0a0a` | Page background |
| `--ink-soft` | `#141416` | Card hover background |
| `--graphite` | `#3f3f46` | Mosaic grid gaps, subtle borders, ghost numbers |
| `--mute` | `#71717a` | Section labels, secondary text |
| `--whisper` | `#a1a1aa` | Body text, descriptions |
| `--paper` | `#fafafa` | Headlines, primary text, CTA background |

### Typography

| Element | Font | Size | Weight | Style |
|---------|------|------|--------|-------|
| Wordmark | Libre Bodoni | 32px | 600 | small-caps |
| Hero h1 | Libre Bodoni | 64px | 600 | normal + italic for emphasis |
| Section titles | Libre Bodoni | 36px | 600 | normal |
| ROI numbers | Libre Bodoni | 60px | 600 | tabular-nums |
| Pricing values | Libre Bodoni | 44px | 600 | normal |
| Timeline ghost numbers | Libre Bodoni | 52px | 600 | 6% opacity |
| Section labels | system-ui | 11px | 400 | uppercase, tracking 0.14em |
| Body text | system-ui | 14-17px | 400 | normal |
| Captions | system-ui | 13px | 400 | normal |

### Icons

All icons are inline SVG with consistent properties:
- **Stroke-only**, no fill
- **stroke-width: 1.25** (diagnostic cards), **1.5** (features, navigation)
- **stroke-linecap: round**, **stroke-linejoin: round**
- Color inherits from parent via `currentColor`
- Transitions on hover (mute → paper for diagnostics, graphite → whisper for features)

**No emojis anywhere.** The user explicitly flagged that emojis infantilize a professional proposal.

### Grid system: 1px mosaic

All grids use the 1px-gap mosaic pattern:
- Parent has `background: var(--graphite)` (the gap color) and `gap: 1px`
- Children have `background: var(--ink)` (the cell color)
- This creates hairline dividers without borders

Grids:
- Diagnostico: 2 columns
- ROI: 3 columns
- Features: 3 columns
- Timeline: 3 columns (flex, not grid)

### Animations

| Animation | Trigger | Duration | Easing |
|-----------|---------|----------|--------|
| **Reveal** | IntersectionObserver (threshold 0.15) | 800ms | cubic-bezier(0.16, 1, 0.3, 1) |
| **Stagger** | Children of reveal parent | +80ms per child | same |
| **Counter** | Reveal of ROI cards | 1800ms | ease-out cubic |
| **Typing** | Hero subtitle visible | 25ms/char, 80ms comma, 100ms period | linear |
| **Hover states** | Mouse enter | 300-400ms | ease / cubic-bezier |

### Interactivity details

**Diagnostic accordion:**
- Click toggles `.expanded` class on card
- Expanded state reveals `.dor-expand` div with `max-height` transition (0 → 120px)
- Content shows how JusPilot solves that pain point
- Chevron arrow rotates 180deg when expanded
- Left border animates height from 0 to full on hover

**Feature tooltips:**
- Each feature cell has a `data-detail` attribute with extended description
- CSS `::before` pseudo-element positioned above cell
- Appears on hover with opacity + translateY transition
- Background: `--ink-soft`, border: `--graphite`

**CTA button fill-invert:**
- White background with black text (default)
- On hover: `::after` pseudo-element slides up from bottom (black fill)
- Text color transitions to white via z-index layering
- Arrow shifts 4px right on hover

## Component mapping

Each existing component is refactored in-place:

| File | Current | New |
|------|---------|-----|
| `header.tsx` | Logo text + city | Monogram seal (48px circle with "J") + Libre Bodoni wordmark 32px + city/UF/date |
| `hero-section.tsx` | Centered, gold accents | Left-aligned, Libre Bodoni 64px, typing subtitle, lead badge card |
| `dores-section.tsx` | Static cards from `escritorio_dores` | Accordion cards with SVG icons, expand to show solution |
| `features-section.tsx` | 6 static tiles | 3x2 mosaic grid with SVG icons + tooltip details |
| `roi-section.tsx` | Animated counters (inline JS) | React `useCounter` hook, 3-column mosaic grid |
| `compliance-section.tsx` | 4 security items | Merged into footer as compliance badges |
| `pricing-section.tsx` | Gold pricing card | Monochrome pricing card with setup/mensalidade split, discount badge, feature checklist |
| `timeline-section.tsx` | 5-step vertical | 3-step horizontal mosaic with ghost numbers |
| `footer.tsx` | Minimal | Monogram seal + wordmark + compliance badges |
| `cta-section.tsx` | WhatsApp CTA + countdown | Merged into pricing section as CTA row |

**Net change:** 10 components → 8 components (compliance merged into footer, CTA merged into pricing).

## New files

| File | Purpose |
|------|---------|
| `src/hooks/use-reveal.ts` | IntersectionObserver hook for scroll reveal animations |
| `src/hooks/use-counter.ts` | Animated counter hook with easing |
| `src/hooks/use-typing.ts` | Typing effect hook for hero subtitle |

## Files modified

| File | Change |
|------|--------|
| `src/app/p/[slug]/page.tsx` | Remove inline `<style>` block, remove `dangerouslySetInnerHTML` script, import refactored components |
| `src/app/layout.tsx` | Replace Fraunces import with Libre Bodoni |
| `src/app/globals.css` | Update `--font-display` reference, add vitrine-specific utilities if needed |
| `src/components/proposta-publica/*.tsx` | All 10 files refactored (8 remain, 2 merged) |

## Risk & mitigation

| Risk | Mitigation |
|------|-----------|
| Libre Bodoni font swap affects sub-project 0 primitives | Libre Bodoni is also a serif with similar weight range. The `--font-display` variable is the only coupling point. Visual regression check on wordmark + seal components. |
| Accordion/tooltip JS in a server component | The page layout (`page.tsx`) remains a server component. Interactive sections (diagnostico, roi, hero) become client components with `'use client'` directive. |
| Dynamic `escritorio_dores` array may have fewer or more than 4 items | Grid uses `grid-template-columns: 1fr 1fr` — works with any even count. For odd counts, last card spans full width via CSS `:last-child:nth-child(odd)`. |
| Removing compliance-section and cta-section as standalone components | Any import references in `page.tsx` must be updated. No other page imports these components. |
