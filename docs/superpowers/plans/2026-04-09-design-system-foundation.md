# Design System Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic shadcn-style primitives with an editorial design system aligned to the JusPilot MIV — tokens, Fraunces serif font, square corners, hairline borders, no shadows.

**Architecture:** All design tokens live in `globals.css` via Tailwind v4 `@theme inline`. Fraunces is loaded via `next/font/google` in root `layout.tsx`. Each UI primitive in `src/components/ui/` is refactored to consume tokens instead of hardcoded hex values. Two brand SVG components are created. No page is modified — the two visual languages coexist until subsequent sub-projects.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, `next/font/google` (Fraunces), TypeScript.

**Spec:** `docs/superpowers/specs/2026-04-07-design-system-foundation-design.md`

**Verification:** No test framework in the project. Each task is verified via `pnpm build` (must succeed, zero errors). Final smoke test via `pnpm dev` + manual navigation.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/app/globals.css` | Tokens, type scale utilities, border utilities |
| Modify | `src/app/layout.tsx` | Import Fraunces, expose `--font-fraunces` CSS var |
| Create | `src/components/brand/wordmark.tsx` | Inline SVG wordmark "JUSPILOT" |
| Create | `src/components/brand/seal.tsx` | Inline SVG circular monogram seal |
| Modify | `src/components/ui/button.tsx` | Refactor to tokens |
| Modify | `src/components/ui/badge.tsx` | Refactor to tokens, monochrome status mapping |
| Modify | `src/components/ui/card.tsx` | Refactor to tokens, add `variant` prop |
| Modify | `src/components/ui/input.tsx` | Refactor to underline style with tokens |
| Modify | `src/components/ui/select.tsx` | Refactor to underline style with tokens |
| Modify | `src/components/ui/checkbox.tsx` | Refactor to square style with tokens |
| Modify | `src/components/ui/slider.tsx` | Refactor to square thumb with tokens |
| Modify | `src/components/ui/toast.tsx` | Refactor to left-border style with tokens |
| Modify | `src/components/ui/dialog.tsx` | Refactor to editorial overlay with tokens |

---

### Task 1: Add design tokens to globals.css

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add color tokens and update existing theme block**

Replace the current `@theme inline` block and add utility classes after it:

```css
@import "tailwindcss";

@theme inline {
  /* Color — semantic */
  --color-ink: #0a0a0a;
  --color-ink-soft: #18181b;
  --color-graphite: #3f3f46;
  --color-mute: #71717a;
  --color-whisper: #a1a1aa;
  --color-rule: #e4e4e7;
  --color-rule-soft: #f4f4f5;
  --color-paper: #fafafa;
  --color-paper-pure: #ffffff;
  --color-danger: #991b1b;

  /* Backward compat */
  --color-background: var(--color-paper);
  --color-foreground: var(--color-ink);

  /* Typography */
  --font-display: var(--font-fraunces);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);

  /* Radius */
  --radius-none: 0;
  --radius-pill: 9999px;

  /* Measure */
  --measure: 65ch;
  --measure-wide: 75ch;
}
```

- [ ] **Step 2: Add type scale utility classes**

After the `@theme inline` block, add:

```css
/* Type scale — serif display */
@utility text-display-xl {
  font-family: var(--font-display), serif;
  font-size: 56px;
  line-height: 1.05;
  font-weight: 600;
  @media (min-width: 768px) {
    font-size: 88px;
    line-height: 1.0;
  }
}

@utility text-display-lg {
  font-family: var(--font-display), serif;
  font-size: 40px;
  line-height: 1.1;
  font-weight: 600;
  @media (min-width: 768px) {
    font-size: 64px;
    line-height: 1.05;
  }
}

@utility text-display-md {
  font-family: var(--font-display), serif;
  font-size: 32px;
  line-height: 1.15;
  font-weight: 600;
  @media (min-width: 768px) {
    font-size: 48px;
    line-height: 1.1;
  }
}

@utility text-display-sm {
  font-family: var(--font-display), serif;
  font-size: 24px;
  line-height: 1.2;
  font-weight: 600;
  @media (min-width: 768px) {
    font-size: 32px;
    line-height: 1.15;
  }
}

@utility text-quote {
  font-family: var(--font-display), serif;
  font-style: italic;
  font-size: 20px;
  line-height: 1.4;
  font-weight: 400;
  @media (min-width: 768px) {
    font-size: 28px;
  }
}

/* Type scale — sans headings */
@utility text-heading-lg {
  font-size: 20px;
  line-height: 1.3;
  font-weight: 600;
  @media (min-width: 768px) {
    font-size: 24px;
    line-height: 1.25;
  }
}

@utility text-heading-md {
  font-size: 16px;
  line-height: 1.4;
  font-weight: 600;
  @media (min-width: 768px) {
    font-size: 18px;
  }
}

@utility text-heading-sm {
  font-size: 14px;
  line-height: 1.2;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* Type scale — sans body */
@utility text-body-lg {
  font-size: 16px;
  line-height: 1.6;
}

@utility text-body {
  font-size: 14px;
  line-height: 1.55;
}

@utility text-body-sm {
  font-size: 13px;
  line-height: 1.5;
}

@utility text-caption {
  font-size: 11px;
  line-height: 1.3;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* Border utilities */
@utility border-rule {
  border: 1px solid var(--color-rule);
}

@utility border-rule-strong {
  border: 1px solid var(--color-ink);
}

@utility border-rule-double {
  border-top: 3px double var(--color-ink);
  border-bottom: 3px double var(--color-ink);
}
```

- [ ] **Step 3: Update body style and keep animation**

Keep the existing body/animation styles but update to use tokens:

```css
body {
  font-family: var(--font-sans), system-ui, sans-serif;
}

@keyframes slide-in-from-bottom-2 {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  animation: slide-in-from-bottom-2 0.2s ease-out;
}
```

Remove the old dark scrollbar CSS block (`.bg-\[\#09090b\] ::-webkit-scrollbar*`) — it targets a hardcoded class that will be removed in sub-project 1.

- [ ] **Step 4: Verify build**

Run: `pnpm build`
Expected: SUCCESS. No errors. Tokens and utilities are defined but not consumed yet — no visual change.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add design tokens, type scale, and border utilities to globals.css"
```

---

### Task 2: Import Fraunces font in root layout

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Add Fraunces import and configure font**

Update `layout.tsx` to:

```tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Fraunces } from 'next/font/google';
import { Toaster } from '@/components/ui/toast';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  axes: ['opsz'],
});

export const metadata: Metadata = {
  title: 'JusPilot Propostas',
  description: 'Gerador de Propostas Comerciais',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

Key changes:
- Import and configure `Fraunces` with `variable: '--font-fraunces'` and `axes: ['opsz']`.
- Add `fraunces.variable` to `<html className>`.
- Replace `bg-[#fafafa]` with `bg-paper` and `text-[#09090b]` with `text-ink` on `<body>`.

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: SUCCESS. Fraunces is downloaded and self-hosted. `font-display` utility now works via `--font-fraunces` → `--font-display`.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: add Fraunces serif font, use semantic token classes on body"
```

---

### Task 3: Create brand SVG components

**Files:**
- Create: `src/components/brand/wordmark.tsx`
- Create: `src/components/brand/seal.tsx`

- [ ] **Step 1: Create the brand directory**

Run: `mkdir -p src/components/brand`

- [ ] **Step 2: Create wordmark component**

Create `src/components/brand/wordmark.tsx`:

```tsx
import { cn } from '@/lib/utils/cn';

interface WordmarkProps {
  tone?: 'ink' | 'paper';
  className?: string;
}

export function Wordmark({ tone = 'ink', className }: WordmarkProps) {
  const fill = tone === 'ink' ? 'var(--color-ink)' : 'var(--color-paper-pure)';

  return (
    <svg
      viewBox="0 0 320 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-8', className)}
      aria-label="JusPilot"
    >
      <text
        x="0"
        y="32"
        fill={fill}
        fontFamily="var(--font-display), 'Fraunces', serif"
        fontSize="38"
        fontWeight="400"
        letterSpacing="0.06em"
        style={{ fontVariantCaps: 'small-caps' }}
      >
        Juspilot
      </text>
    </svg>
  );
}
```

Note: This uses an SVG `<text>` element with Fraunces + small-caps to recreate the wordmark from the PDF (page 5). The font must be loaded on the page for it to render correctly. If a fully traced vector path is needed later, it can replace this implementation without changing the API.

- [ ] **Step 3: Create seal component**

Create `src/components/brand/seal.tsx`:

```tsx
import { cn } from '@/lib/utils/cn';

interface SealProps {
  tone?: 'ink' | 'paper';
  className?: string;
}

export function Seal({ tone = 'ink', className }: SealProps) {
  const primary = tone === 'ink' ? 'var(--color-ink)' : 'var(--color-paper-pure)';
  const secondary = tone === 'ink' ? 'var(--color-graphite)' : 'var(--color-whisper)';
  const bg = tone === 'ink' ? 'var(--color-paper-pure)' : 'var(--color-ink)';

  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-16 w-16', className)}
      aria-label="JusPilot seal"
    >
      {/* Outer circle */}
      <circle cx="60" cy="60" r="58" fill={secondary} />
      {/* Inner white circle */}
      <circle cx="60" cy="60" r="34" fill={bg} />
      {/* J monogram */}
      <text
        x="60"
        y="72"
        textAnchor="middle"
        fill={primary}
        fontFamily="var(--font-display), 'Fraunces', serif"
        fontSize="42"
        fontWeight="400"
      >
        J
      </text>
      {/* Circular text — JUSPILOT · MAIS COM MENOS */}
      <path
        id="seal-circle-top"
        d="M 60 12 A 48 48 0 0 1 108 60"
        fill="none"
      />
      <text fill={bg} fontSize="7.5" letterSpacing="0.14em" fontFamily="var(--font-display), 'Fraunces', serif">
        <textPath href="#seal-circle-top" startOffset="10%">
          JUSPILOT
        </textPath>
      </text>
      <path
        id="seal-circle-bottom"
        d="M 108 60 A 48 48 0 0 1 12 60"
        fill="none"
      />
      <text fill={bg} fontSize="7.5" letterSpacing="0.14em" fontFamily="var(--font-display), 'Fraunces', serif">
        <textPath href="#seal-circle-bottom" startOffset="5%">
          MAIS COM MENOS
        </textPath>
      </text>
      {/* Dots between words */}
      <circle cx="17" cy="60" r="1.5" fill={bg} />
      <circle cx="103" cy="60" r="1.5" fill={bg} />
    </svg>
  );
}
```

Note: The circular text positioning may need fine-tuning after visual inspection in the browser. The API is stable — only the SVG internals change.

- [ ] **Step 4: Verify build**

Run: `pnpm build`
Expected: SUCCESS. Components are created but not imported anywhere yet.

- [ ] **Step 5: Commit**

```bash
git add src/components/brand/
git commit -m "feat: add Wordmark and Seal brand SVG components"
```

---

### Task 4: Refactor button.tsx

**Files:**
- Modify: `src/components/ui/button.tsx`

- [ ] **Step 1: Rewrite button with tokens**

Replace the full content of `src/components/ui/button.tsx`:

```tsx
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-paper-pure hover:bg-ink-soft',
  secondary: 'border border-ink text-ink bg-transparent hover:bg-rule-soft',
  destructive: 'bg-danger text-paper-pure hover:bg-danger/90',
  ghost: 'text-graphite hover:bg-rule-soft',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-body-sm',
  md: 'h-10 px-4 text-body',
  lg: 'h-12 px-6 text-body',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-none font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
```

Key changes from original:
- `rounded-md` → `rounded-none`
- `focus-visible:ring-*` → `focus-visible:outline-*`
- All hex values replaced with semantic token classes (`bg-[#09090b]` → `bg-ink`, etc.)
- Sizes now use fixed heights (`h-8`/`h-10`/`h-12`) and type scale utilities.

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: SUCCESS.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/button.tsx
git commit -m "refactor: button primitive to editorial tokens, square corners"
```

---

### Task 5: Refactor badge.tsx

**Files:**
- Modify: `src/components/ui/badge.tsx`

- [ ] **Step 1: Rewrite badge with monochrome status mapping**

Replace the full content of `src/components/ui/badge.tsx`:

```tsx
import { cn } from '@/lib/utils/cn';
import type { PropostaStatus } from '@/types';

const statusStyles: Record<PropostaStatus, string> = {
  rascunho: 'border-rule text-mute bg-transparent',
  publicada: 'border-graphite text-graphite bg-transparent',
  visualizada: 'border-ink text-ink bg-transparent',
  aceita: 'border-ink bg-ink text-paper-pure',
  recusada: 'border-danger text-danger bg-transparent',
  expirada: 'border-rule-soft bg-rule-soft text-mute',
};

const statusLabels: Record<PropostaStatus, string> = {
  rascunho: 'Rascunho',
  publicada: 'Publicada',
  visualizada: 'Visualizada',
  aceita: 'Aceita',
  recusada: 'Recusada',
  expirada: 'Expirada',
};

interface BadgeProps {
  status: PropostaStatus;
  className?: string;
}

export function Badge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-none border px-2 py-0.5 text-caption',
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
```

Key changes:
- `rounded-full` → `rounded-none`
- Colored backgrounds → monochrome (fill vs outline + intensity)
- `text-xs font-medium` → `text-caption` (11px uppercase tracking-wide)
- All hex values → semantic tokens.

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: SUCCESS.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/badge.tsx
git commit -m "refactor: badge primitive to monochrome editorial style"
```

---

### Task 6: Refactor card.tsx

**Files:**
- Modify: `src/components/ui/card.tsx`

- [ ] **Step 1: Rewrite card with tokens and variant prop**

Replace the full content of `src/components/ui/card.tsx`:

```tsx
import { cn } from '@/lib/utils/cn';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered-strong';
}

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-none bg-paper-pure p-6',
        variant === 'bordered-strong' ? 'border border-ink' : 'border border-rule',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

Key changes:
- `rounded-lg` → `rounded-none`
- `border-[#e4e4e7]` → `border-rule` (semantic)
- `bg-white` → `bg-paper-pure`
- `p-4` → `p-6` (more breathing room per spec)
- Added `variant` prop with `'bordered-strong'` option.

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: SUCCESS.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/card.tsx
git commit -m "refactor: card primitive to editorial tokens, add bordered-strong variant"
```

---

### Task 7: Refactor input.tsx

**Files:**
- Modify: `src/components/ui/input.tsx`

- [ ] **Step 1: Rewrite input with underline style**

Replace the full content of `src/components/ui/input.tsx`:

```tsx
import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label htmlFor={id} className="mb-1.5 block text-body-sm font-medium text-ink">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'h-10 w-full rounded-none border-0 border-b bg-transparent px-0 py-2 text-body text-ink placeholder:text-whisper transition-colors focus:border-b-ink focus:outline-none',
            error ? 'border-b-danger' : 'border-b-rule',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-caption text-danger">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
```

Key changes:
- Box style → underline style (`border-0 border-b`)
- `rounded-md` → `rounded-none`
- `px-3` → `px-0` (flush left, underline style)
- `bg-white` → `bg-transparent`
- Focus: `ring-*` → `border-b-ink`
- Error: `border-red-500` → `border-b-danger`, `text-red-600` → `text-danger`
- Label: hardcoded hex → `text-ink`
- Error text: `text-xs` → `text-caption`

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: SUCCESS.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/input.tsx
git commit -m "refactor: input primitive to underline editorial style"
```

---

### Task 8: Refactor select.tsx

**Files:**
- Modify: `src/components/ui/select.tsx`

- [ ] **Step 1: Rewrite select with underline style**

Replace the full content of `src/components/ui/select.tsx`:

```tsx
import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label htmlFor={id} className="mb-1.5 block text-body-sm font-medium text-ink">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            'h-10 w-full appearance-none rounded-none border-0 border-b bg-transparent px-0 py-2 text-body text-ink transition-colors focus:border-b-ink focus:outline-none',
            error ? 'border-b-danger' : 'border-b-rule',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-caption text-danger">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
```

Same changes as input: underline style, semantic tokens, no border radius, transparent bg.

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: SUCCESS.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/select.tsx
git commit -m "refactor: select primitive to underline editorial style"
```

---

### Task 9: Refactor checkbox.tsx

**Files:**
- Modify: `src/components/ui/checkbox.tsx`

- [ ] **Step 1: Rewrite checkbox with square style**

Replace the full content of `src/components/ui/checkbox.tsx`:

```tsx
'use client';

import { cn } from '@/lib/utils/cn';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  className?: string;
}

export function Checkbox({ checked, onChange, label, description, className }: CheckboxProps) {
  return (
    <label className={cn('flex cursor-pointer items-start gap-3', className)}>
      <div
        className={cn(
          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-none border-[1.5px] transition-colors',
          checked
            ? 'border-ink bg-ink text-paper-pure'
            : 'border-ink bg-transparent'
        )}
        onClick={(e) => {
          e.preventDefault();
          onChange(!checked);
        }}
      >
        {checked && (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      {(label || description) && (
        <div>
          {label && <div className="text-body font-medium text-ink">{label}</div>}
          {description && <div className="text-body-sm text-whisper">{description}</div>}
        </div>
      )}
    </label>
  );
}
```

Key changes:
- `rounded` → `rounded-none`
- `border-[#d4d4d8]` (unchecked) → `border-ink` (always black border per spec)
- `text-sm` → `text-body`, `text-xs` → `text-body-sm`
- All hex → semantic tokens.

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: SUCCESS.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/checkbox.tsx
git commit -m "refactor: checkbox primitive to square editorial style"
```

---

### Task 10: Refactor slider.tsx

**Files:**
- Modify: `src/components/ui/slider.tsx`

- [ ] **Step 1: Rewrite slider with square thumb**

Replace the full content of `src/components/ui/slider.tsx`:

```tsx
'use client';

import { cn } from '@/lib/utils/cn';

interface SliderProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  className?: string;
}

export function Slider({ label, value, onChange, min, max, step = 1, suffix, className }: SliderProps) {
  return (
    <div className={className}>
      {label && (
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-body font-medium text-ink">{label}</label>
          <span className="text-body font-medium text-ink">
            {value}{suffix}
          </span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          'w-full appearance-none h-px bg-rule outline-none',
          '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:bg-ink [&::-webkit-slider-thumb]:cursor-pointer',
        )}
      />
    </div>
  );
}
```

Key changes:
- Track: `h-1 rounded-full bg-[#e4e4e7]` → `h-px bg-rule` (1px hairline)
- Thumb: `rounded-full bg-[#09090b]` → `rounded-none bg-ink` (square)
- Label text: hex → tokens.

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: SUCCESS.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/slider.tsx
git commit -m "refactor: slider primitive to square thumb, hairline track"
```

---

### Task 11: Refactor toast.tsx

**Files:**
- Modify: `src/components/ui/toast.tsx`

- [ ] **Step 1: Rewrite toast with left-border style**

Replace the full content of `src/components/ui/toast.tsx`:

```tsx
'use client';

import { useToastStore } from '@/hooks/use-toast';
import { cn } from '@/lib/utils/cn';

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'w-80 rounded-none border border-rule bg-paper-pure p-4 transition-all border-l-[3px]',
            t.variant === 'destructive'
              ? 'border-l-danger'
              : 'border-l-ink'
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-body font-medium text-ink">{t.title}</p>
              {t.description && (
                <p className="mt-1 text-body-sm text-mute">{t.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-whisper hover:text-ink transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

Key changes:
- `rounded-lg` → `rounded-none`
- `shadow-lg` → removed
- Destructive: `border-red-200 bg-red-50 text-red-900` → `border-l-danger` + white bg
- Default: hex borders → `border-rule` + `border-l-ink`
- Left accent border: `border-l-[3px]`
- All text hex → tokens.

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: SUCCESS.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/toast.tsx
git commit -m "refactor: toast primitive to left-border editorial style"
```

---

### Task 12: Refactor dialog.tsx

**Files:**
- Modify: `src/components/ui/dialog.tsx`

- [ ] **Step 1: Rewrite dialog with editorial overlay**

Replace the full content of `src/components/ui/dialog.tsx`:

```tsx
'use client';

import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          'relative z-10 w-full max-w-md rounded-none border border-ink bg-paper-pure p-8 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18)]',
          className
        )}
      >
        <h3 className="text-heading-lg text-ink">{title}</h3>
        {description && <p className="mt-1 text-body text-mute">{description}</p>}
        <div className="mt-4 border-t border-rule pt-4">{children}</div>
      </div>
    </div>
  );
}
```

Key changes:
- Overlay: `bg-black/40` → `bg-ink/60 backdrop-blur-sm`
- Panel: `rounded-lg border-[#e4e4e7] shadow-lg` → `rounded-none border-ink shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18)]`
- `p-6` → `p-8`
- Header: `text-lg font-semibold text-[#09090b]` → `text-heading-lg text-ink`
- Description: hex → `text-mute`
- Content area separated by `border-t border-rule pt-4` (hairline above content).

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: SUCCESS.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/dialog.tsx
git commit -m "refactor: dialog primitive to editorial overlay with dense shadow"
```

---

### Task 13: Final smoke test

**Files:** None modified — verification only.

- [ ] **Step 1: Full build**

Run: `pnpm build`
Expected: SUCCESS. Zero errors, zero warnings related to our changes.

- [ ] **Step 2: Visual smoke test**

Run: `pnpm dev`

Navigate to each route and verify no crashes/layout explosions:
1. `/` (landing/redirect)
2. `/login`
3. Dashboard home (after login)
4. `/nova` (wizard)
5. `/proposta/[any-id]` (internal detail)
6. `/p/[any-slug]` (public proposal)

Expected: Pages render. Visual will look "mixed" (pages still have hardcoded hex, but primitives use new tokens). No console errors. No blank screens.

- [ ] **Step 3: Verify no hardcoded hex in ui/ folder**

Run: `grep -r '#[0-9a-fA-F]\{6\}' src/components/ui/`
Expected: Zero matches. All hex values have been replaced by semantic tokens.

- [ ] **Step 4: Final commit (if any fixes needed)**

If the smoke test revealed issues and fixes were applied, commit them:

```bash
git add -A
git commit -m "fix: address smoke test issues in design system foundation"
```
