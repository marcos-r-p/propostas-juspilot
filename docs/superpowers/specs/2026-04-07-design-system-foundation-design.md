# Design System Foundation — JusPilot MIV

**Date:** 2026-04-07
**Status:** Approved for implementation
**Sub-project:** 0 of 6 (foundation, unblocker for all other surfaces)

## Context

The JusPilot brand has a new visual identity (MIV) defined in `juspilot.pdf`:

- **Palette:** black, dark gray, white. No accent colors.
- **Typography:** Editor's Note (display serif) + Neue (sans). Editorial, classic, precise.
- **Tone:** authority, clarity, "more with less", sober.
- **Aesthetic:** magazine/editorial — strong type hierarchy, white space, deep blacks, paper-like.

The current app (`/Users/marcosrobertopereira/propostas-juspilot`) uses a generic shadcn-style aesthetic with rounded cards, soft shadows, hardcoded zinc hex values, and Geist sans only. Every surface (auth, dashboard, wizard, proposal detail, public proposal page) needs to be rebuilt against the new identity.

This is too large for one spec. The full effort is decomposed into 6 sub-projects, executed in order:

0. **Design system foundation** (this spec) — tokens, fonts, primitive refactor
1. Public proposal page `/p/[slug]`
2. Internal proposal page `/proposta/[id]`
3. Dashboard shell + home + listings
4. "Nova Proposta" wizard
5. Auth + Settings

Sub-project 0 is the unblocker. No surface work happens until the foundation is in place — otherwise every later sub-project would have to redo its primitives.

## Goals

- Centralize all colors, typography, spacing, and border tokens in `globals.css` via Tailwind v4 `@theme inline`.
- Add the Fraunces variable serif (free Editor's Note alternative) alongside the existing Geist sans.
- Refactor the 9 UI primitives in `src/components/ui/` to consume the new tokens, adopt the editorial aesthetic (square corners, hairline borders, no shadows), and keep their public APIs unchanged so no consumer breaks.
- Ship the new JusPilot wordmark and seal as inline SVG components.

## Non-goals

- **Do not modify any page** (`dashboard`, `nova`, `proposta/[id]`, `p/[slug]`, `configuracoes`, auth screens). Pages keep their existing hardcoded hex values until their respective sub-projects refactor them. The two visual languages will coexist temporarily — this is by design.
- **Do not modify** `sidebar.tsx` or `user-menu.tsx` (sub-project 3).
- Do not introduce new primitives, new components, or new pages.
- Do not change primitive APIs (props, slots, variants must remain compatible).
- Do not delete the existing scrollbar styles in `globals.css` if any consumer still references the dark background selector — verify first.

## Decisions

### Theme strategy: hybrid by context

- **Work surfaces** (dashboard, wizard, settings, internal proposal) → light: `--paper` background, `--ink` text.
- **Vitrine surfaces** (public proposal `/p/[slug]`, login, future landing) → dark: `--ink` background, white serif headlines.

Sub-project 0 only defines the tokens for both. Surfaces are migrated in their own sub-projects.

### Typography: Fraunces + Geist

- **Fraunces** (Google Fonts, free, variable: `opsz`, `wght`, `soft`) replaces Editor's Note. Imported via `next/font/google` in `layout.tsx` and exposed as `--font-display`.
- **Geist** (already loaded) replaces Neue. Exposed as `--font-sans` (already done).
- **Serif usage rule:** display sizes only — `display-xl`, `display-lg`, `display-md`, `display-sm`, and `quote`. Everything else is Geist. Section labels are Geist UPPERCASE with `tracking: 0.08em` — the editorial gesture without a third font.
- **Weights:** Fraunces 400 + 600 only. Geist 400 / 500 / 600. No 700+.

### Density: editorial strict

- `border-radius: 0` everywhere. Single exception: `--radius-pill` for intentionally circular elements (avatar, brand seal).
- **No shadows.** Hairline 1px borders replace them. Single exception: `dialog`/`popover` get a dense editorial drop shadow.
- Visual model: paper / petition / business card.

## Tokens

Defined in `src/app/globals.css` via `@theme inline`:

```css
@theme inline {
  /* Color — semantic */
  --color-ink: #0a0a0a;          /* primary text + vitrine background */
  --color-ink-soft: #18181b;     /* secondary dark, dark hover */
  --color-graphite: #3f3f46;     /* secondary text on light */
  --color-mute: #71717a;         /* auxiliary text, labels */
  --color-whisper: #a1a1aa;      /* disabled, metadata */
  --color-rule: #e4e4e7;         /* 1px dividers, default border */
  --color-rule-soft: #f4f4f5;    /* subtle backgrounds, hover */
  --color-paper: #fafafa;        /* work background */
  --color-paper-pure: #ffffff;   /* card surfaces */
  --color-danger: #991b1b;       /* destructive only — wine red, not vivid */

  /* Typography */
  --font-display: var(--font-fraunces);
  --font-sans: var(--font-geist-sans);

  /* Radius */
  --radius-none: 0;
  --radius-pill: 9999px;

  /* Reading measure */
  --measure: 65ch;
  --measure-wide: 75ch;
}
```

Background and foreground tokens (`--color-background`, `--color-foreground`) remain pointing at `--color-paper` / `--color-ink` for backward compatibility with any consumer that still references them.

### Type scale (defined as utility classes, not Tailwind theme tokens)

| Class           | Family  | Mobile      | Desktop      | Use                                     |
|-----------------|---------|-------------|--------------|------------------------------------------|
| `text-display-xl` | serif | 56px / 1.05 | 88px / 1.0   | Public proposal hero                     |
| `text-display-lg` | serif | 40px / 1.1  | 64px / 1.05  | h1 vitrine                               |
| `text-display-md` | serif | 32px / 1.15 | 48px / 1.1   | h1 work surfaces                         |
| `text-display-sm` | serif | 24px / 1.2  | 32px / 1.15  | Big numbers (ROI, currency)              |
| `text-quote`      | serif italic | 20px / 1.4 | 28px / 1.4 | Pull quotes                              |
| `text-heading-lg` | sans  | 20px / 1.3  | 24px / 1.25  | h2                                       |
| `text-heading-md` | sans  | 16px / 1.4  | 18px / 1.4   | h3, card titles                          |
| `text-heading-sm` | sans  | 14px / 1.2  | 14px / 1.2   | Section labels (UPPERCASE, tracking 0.08em) |
| `text-body-lg`    | sans  | 16px / 1.6  | 16px / 1.6   | Public proposal body                     |
| `text-body`       | sans  | 14px / 1.55 | 14px / 1.55  | Default body                             |
| `text-body-sm`    | sans  | 13px / 1.5  | 13px / 1.5   | Metadata, help                           |
| `text-caption`    | sans  | 11px / 1.3  | 11px / 1.3   | Timestamps, micro-labels (UPPERCASE)     |

These are added as `@utility` declarations (Tailwind v4) in `globals.css`.

### Border / fio utilities

```css
@utility border-rule { border: 1px solid var(--color-rule); }
@utility border-rule-strong { border: 1px solid var(--color-ink); }
@utility border-rule-double { border-top: 3px double var(--color-ink); border-bottom: 3px double var(--color-ink); }
```

## Primitive refactor

All under `src/components/ui/`. Each primitive keeps its current export signature and prop names. Visual implementation rewritten to consume tokens.

### `button.tsx`
- Variants: `primary` (default), `secondary`, `ghost`, `destructive`.
  - `primary`: `bg-ink text-paper-pure hover:bg-ink-soft`
  - `secondary`: `border border-ink text-ink bg-transparent hover:bg-rule-soft`
  - `ghost`: `text-graphite hover:bg-rule-soft`
  - `destructive`: `bg-danger text-paper-pure hover:bg-danger/90`
- Sizes: `sm` (h-8 px-3 text-body-sm), `md` (h-10 px-4 text-body, default), `lg` (h-12 px-6 text-body).
- All `rounded-none`. No shadow. Font weight 500.
- Focus: `outline: 2px solid var(--color-ink); outline-offset: 2px`. No ring.

### `card.tsx`
- Default: `bg-paper-pure border-rule p-6` with no shadow, no radius.
- Optional `variant="bordered-strong"` → `border-rule-strong`.
- Keep current `className` passthrough.

### `input.tsx` / `select.tsx`
- `bg-transparent border-0 border-b border-rule rounded-none px-0 py-2 text-body`.
- Focus: `border-b-ink`.
- Disabled: `text-whisper border-rule-soft`.
- Height matches current input height (h-10) for layout compatibility.
- Labels render outside the primitive (consumer responsibility) — this matches current usage.

### `badge.tsx`
- Container: `inline-flex items-center px-2 py-0.5 text-caption uppercase tracking-[0.08em] border`.
- Status mapping (no vivid colors):
  - `rascunho` → `border-rule text-mute bg-transparent`
  - `enviada` → `border-graphite text-graphite bg-transparent`
  - `aceita` → `border-ink bg-ink text-paper-pure`
  - `expirada` → `border-rule-soft bg-rule-soft text-mute`
  - `recusada` → `border-danger text-danger bg-transparent`
- The status string mapping must match the current `PropostaStatus` type exactly — verify against `src/types`.

### `dialog.tsx`
- Overlay: `bg-ink/60 backdrop-blur-sm`.
- Panel: `bg-paper-pure border-rule-strong rounded-none p-8`.
- Drop shadow (only place shadows are allowed): `box-shadow: 0 24px 48px -12px rgba(0,0,0,0.18)`.
- Header: bottom hairline (`border-b border-rule pb-4`).

### `checkbox.tsx`
- 16x16 square. `border-[1.5px] border-ink rounded-none bg-transparent`.
- Checked: `bg-ink` with white SVG checkmark.
- Focus: `outline 2px ink offset 2px`.

### `slider.tsx`
- Track: 1px high, `bg-rule`.
- Fill: `bg-ink`.
- Thumb: 16x16 square `bg-ink`, no border, no radius.

### `toast.tsx`
- Container: `bg-paper-pure border border-rule p-4 border-l-[3px]`.
- Variant left border:
  - default → `border-l-ink`
  - error → `border-l-danger`
- No radius. No shadow (relies on viewport stacking).

## Brand assets

Two new components under `src/components/brand/`:

- `wordmark.tsx` — `<Wordmark />` renders the JusPilot wordmark as inline SVG, recreated by tracing the PDF page 5 (or approximating with Fraunces if tracing is impractical). Accepts `className` for sizing and `tone` (`'ink'` | `'paper'`) for fill color.
- `seal.tsx` — `<Seal />` renders the circular monogram seal ("J" inside circle, "JUSPILOT · MAIS COM MENOS" around) from PDF page 4. Same `className` / `tone` API. Decorative use only (capa, login background watermark).

Both are pure SVG, no dependencies, no client-side interactivity.

## Files modified

| File | Change |
|------|--------|
| `src/app/globals.css` | Add tokens, type scale `@utility` classes, `@utility border-rule*` classes, drop unused dark scrollbar selector if no consumer references it (verify first). |
| `src/app/layout.tsx` | Import Fraunces from `next/font/google`, expose `--font-fraunces` via `<html className>`. |
| `src/components/ui/button.tsx` | Refactor per spec. |
| `src/components/ui/card.tsx` | Refactor per spec. |
| `src/components/ui/input.tsx` | Refactor per spec. |
| `src/components/ui/select.tsx` | Refactor per spec. |
| `src/components/ui/badge.tsx` | Refactor per spec. |
| `src/components/ui/dialog.tsx` | Refactor per spec. |
| `src/components/ui/checkbox.tsx` | Refactor per spec. |
| `src/components/ui/slider.tsx` | Refactor per spec. |
| `src/components/ui/toast.tsx` | Refactor per spec. |

## Files created

- `src/components/brand/wordmark.tsx`
- `src/components/brand/seal.tsx`

## Execution order

1. Add tokens + utility classes to `globals.css` (no consumer change yet — invisible).
2. Add Fraunces to `layout.tsx`.
3. Create `wordmark.tsx` and `seal.tsx` (isolated, no dependencies).
4. Refactor primitives in this order, one commit each so regressions are bisectable:
   `button` → `badge` → `card` → `input` → `select` → `checkbox` → `slider` → `toast` → `dialog`.
5. Smoke test: run `pnpm dev`, navigate dashboard → nova proposta → proposta detail → proposta pública → login. Confirm no page is visually broken (it will look "mixed" — that's expected). No console errors. No layout shifts.

## Risks and mitigations

| Risk | Mitigation |
|------|-----------|
| Primitive refactor changes API and breaks pages | Public prop signatures preserved. Internal markup only. Smoke test every page after each primitive. |
| Hardcoded hex values in pages become orphans during the transition | Accepted. The two languages coexist until each page is refactored in its own sub-project. |
| Status badges losing color coding confuses users | Validated by screenshot diff before merge. If test users find it unclear, we can introduce a single icon prefix per status — but no extra colors. |
| Fraunces variable bundle weight | Subset `latin` + `opsz` + `wght` axes only. Estimate ~35kb gzip. Acceptable. |
| Input border-bottom changes form vertical rhythm | Container height (h-10) preserved. Padding rebalanced internally. Manual visual check on `nova` wizard form. |
| `globals.css` scrollbar selector `.bg-\[\#09090b\]` may still be referenced | Grep for the exact selector before deleting. If still in use, leave it — it'll be cleaned up in the public proposal sub-project. |

## Acceptance criteria

- `pnpm build` succeeds.
- `pnpm dev` runs with no console errors.
- Every existing page loads without crashing or visual regression *that breaks usability* (mixed visual language is allowed).
- All 9 primitives consume tokens; zero hardcoded hex values remain in `src/components/ui/`.
- Fraunces loads and is available as `font-display` Tailwind utility.
- `<Wordmark />` and `<Seal />` render correctly in isolation.
- New tokens and utility classes are documented inline in `globals.css` with brief comments.

## Out of scope (next sub-projects)

- Public proposal page redesign → sub-project 1
- Internal proposal page redesign → sub-project 2
- Dashboard shell, sidebar, listings → sub-project 3
- Wizard redesign → sub-project 4
- Auth + Settings redesign → sub-project 5
