# Dashboard Propostas Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the `/dashboard` proposals page with Almeria-inspired KPI cards, status tabs, combined filters, and per-row actions using the editorial design system tokens.

**Architecture:** Server component (`page.tsx`) fetches all stats and filtered data from Supabase, passes to child components. Two new client components handle tabs navigation and row actions. Existing `PropostaStats`, `PropostaFilters`, and `PropostaTable` are refactored in place. A `deleteProposta` server action is added for the delete flow.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, Supabase, Zustand (toast store), TypeScript.

**Spec:** `docs/superpowers/specs/2026-04-09-dashboard-propostas-redesign-design.md`

**Verification:** No test framework. Each task is verified via `pnpm build` (must succeed, zero errors). Final smoke test via `pnpm dev` + manual navigation.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/lib/utils/format.ts` | Add `formatRef` and `formatPerfilTipo` helpers |
| Create | `src/lib/actions/propostas.ts` | Server action: `deleteProposta` |
| Modify | `src/components/propostas/proposta-stats.tsx` | New KPI cards with subtexts |
| Create | `src/components/propostas/proposta-tabs.tsx` | Status tabs (client component) |
| Modify | `src/components/propostas/proposta-filters.tsx` | Busca + tipo + periodo selects (client) |
| Create | `src/components/propostas/proposta-actions.tsx` | 7 icon buttons per row (client) |
| Modify | `src/components/propostas/proposta-table.tsx` | New column layout with actions |
| Modify | `src/app/(dashboard)/dashboard/page.tsx` | Expanded queries, new props, tabs + filters |

---

### Task 1: Add format helpers

**Files:**
- Modify: `src/lib/utils/format.ts`

- [ ] **Step 1: Add `formatRef` helper**

Add at the end of `src/lib/utils/format.ts`:

```typescript
export function formatRef(slug: string, createdAt: string): string {
  const year = new Date(createdAt).getFullYear();
  return `JP-${year}-${slug.slice(0, 4).toUpperCase()}`;
}
```

- [ ] **Step 2: Add `formatPerfilTipo` helper**

Add at the end of `src/lib/utils/format.ts`:

```typescript
export function formatPerfilTipo(perfil: string): string {
  const map: Record<string, string> = {
    massa: 'Volume',
    boutique: 'Boutique',
    misto: 'Misto',
  };
  return map[perfil] || perfil;
}
```

- [ ] **Step 3: Verify build**

Run: `pnpm build`
Expected: Success, zero errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/utils/format.ts
git commit -m "feat: add formatRef and formatPerfilTipo helpers"
```

---

### Task 2: Create deleteProposta server action

**Files:**
- Create: `src/lib/actions/propostas.ts`

- [ ] **Step 1: Create the server action file**

Create `src/lib/actions/propostas.ts`:

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase/server';

export async function deleteProposta(id: string) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Nao autorizado');

  const { error } = await supabase
    .from('propostas')
    .delete()
    .eq('id', id)
    .eq('created_by', user.id);

  if (error) throw new Error('Erro ao deletar proposta');

  revalidatePath('/dashboard');
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: Success, zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/actions/propostas.ts
git commit -m "feat: add deleteProposta server action"
```

---

### Task 3: Refactor PropostaStats with KPI cards

**Files:**
- Modify: `src/components/propostas/proposta-stats.tsx`

- [ ] **Step 1: Rewrite PropostaStats**

Replace the entire contents of `src/components/propostas/proposta-stats.tsx` with:

```typescript
import { formatCurrency } from '@/lib/utils/format';

interface PropostaStatsProps {
  total: number;
  visualizadas: number;
  enviadas: number;
  aceitas: number;
  valorAceito: number;
}

export function PropostaStats({ total, visualizadas, enviadas, aceitas, valorAceito }: PropostaStatsProps) {
  const taxaConversao = enviadas > 0 ? Math.round((aceitas / enviadas) * 100) : 0;
  const pctVisualizadas = enviadas > 0 ? Math.round((visualizadas / enviadas) * 100) : 0;

  const stats = [
    { label: 'Total propostas', value: String(total), sub: 'este mes' },
    { label: 'Visualizadas', value: String(visualizadas), sub: `${pctVisualizadas}% das enviadas` },
    { label: 'Taxa de conversao', value: `${taxaConversao}%`, sub: 'aceitas / enviadas' },
    { label: 'Valor aceito', value: formatCurrency(valorAceito), sub: 'acumulado do mes' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="border border-rule bg-paper-pure p-5">
          <div className="text-caption font-medium text-mute">{stat.label}</div>
          <div className="mt-2 text-[28px] font-bold leading-none tracking-tight text-ink">{stat.value}</div>
          <div className="mt-1 text-xs text-whisper">{stat.sub}</div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: Build will fail because `page.tsx` still passes old props. That's expected — we'll fix it in Task 7.

- [ ] **Step 3: Commit**

```bash
git add src/components/propostas/proposta-stats.tsx
git commit -m "feat: refactor PropostaStats with KPI cards and subtexts"
```

---

### Task 4: Create PropostaTabs component

**Files:**
- Create: `src/components/propostas/proposta-tabs.tsx`

- [ ] **Step 1: Create the tabs component**

Create `src/components/propostas/proposta-tabs.tsx`:

```typescript
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

interface TabItem {
  label: string;
  value: string;
  count: number;
}

interface PropostaTabsProps {
  counts: {
    total: number;
    publicadas: number;
    visualizadas: number;
    aceitas: number;
    recusadas: number;
  };
}

export function PropostaTabs({ counts }: PropostaTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status') || 'all';

  const tabs: TabItem[] = [
    { label: 'Todas', value: 'all', count: counts.total },
    { label: 'Publicadas', value: 'publicada', count: counts.publicadas },
    { label: 'Visualizadas', value: 'visualizada', count: counts.visualizadas },
    { label: 'Aceitas', value: 'aceita', count: counts.aceitas },
    { label: 'Recusadas', value: 'recusada', count: counts.recusadas },
  ];

  function handleTabClick(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete('status');
    } else {
      params.set('status', value);
    }
    params.delete('page');
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <div className="flex gap-6 overflow-x-auto border-b border-rule">
      {tabs.map((tab) => {
        const isActive = currentStatus === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => handleTabClick(tab.value)}
            className={cn(
              'whitespace-nowrap border-b-2 pb-3 text-body transition-colors',
              isActive
                ? 'border-ink font-semibold text-ink'
                : 'border-transparent text-mute hover:text-ink'
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={cn(
                  'ml-1.5 inline-flex items-center px-1.5 py-px text-caption',
                  isActive
                    ? 'bg-ink text-paper'
                    : 'bg-rule-soft text-mute'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: Success (component not yet imported anywhere).

- [ ] **Step 3: Commit**

```bash
git add src/components/propostas/proposta-tabs.tsx
git commit -m "feat: create PropostaTabs status tabs component"
```

---

### Task 5: Refactor PropostaFilters with combined filters

**Files:**
- Modify: `src/components/propostas/proposta-filters.tsx`

- [ ] **Step 1: Rewrite PropostaFilters**

Replace the entire contents of `src/components/propostas/proposta-filters.tsx` with:

```typescript
'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function PropostaFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get('search') || '';
  const currentTipo = searchParams.get('tipo') || '';
  const currentPeriodo = searchParams.get('periodo') || '';

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <input
        type="text"
        placeholder="Buscar por escritorio ou lead..."
        defaultValue={currentSearch}
        onChange={(e) => {
          clearTimeout((window as any).__searchTimeout);
          (window as any).__searchTimeout = setTimeout(() => {
            updateParams('search', e.target.value);
          }, 400);
        }}
        className="w-full border-b border-rule bg-transparent pb-2 text-body-sm text-ink placeholder:text-whisper focus:border-ink focus:outline-none sm:w-64"
      />
      <select
        value={currentTipo}
        onChange={(e) => updateParams('tipo', e.target.value)}
        className="border-b border-rule bg-transparent pb-2 text-body-sm text-mute focus:border-ink focus:outline-none"
      >
        <option value="">Todos os tipos</option>
        <option value="massa">Volume</option>
        <option value="boutique">Boutique</option>
        <option value="misto">Misto</option>
      </select>
      <select
        value={currentPeriodo}
        onChange={(e) => updateParams('periodo', e.target.value)}
        className="border-b border-rule bg-transparent pb-2 text-body-sm text-mute focus:border-ink focus:outline-none"
      >
        <option value="">Qualquer data</option>
        <option value="1m">Ultimo mes</option>
        <option value="3m">Ultimos 3 meses</option>
        <option value="6m">Ultimos 6 meses</option>
      </select>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: Success.

- [ ] **Step 3: Commit**

```bash
git add src/components/propostas/proposta-filters.tsx
git commit -m "feat: refactor PropostaFilters with search, tipo, and periodo"
```

---

### Task 6: Create PropostaActions component

**Files:**
- Create: `src/components/propostas/proposta-actions.tsx`

- [ ] **Step 1: Create the actions component**

Create `src/components/propostas/proposta-actions.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { deleteProposta } from '@/lib/actions/propostas';

interface PropostaActionsProps {
  id: string;
  slug: string;
}

export function PropostaActions({ id, slug }: PropostaActionsProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleCopyLink() {
    const url = `${window.location.origin}/p/${slug}`;
    await navigator.clipboard.writeText(url);
    toast({ title: 'Link copiado', description: url });
  }

  function handlePlaceholder(label: string) {
    toast({ title: `${label}`, description: 'Funcionalidade em breve.' });
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteProposta(id);
      setDeleteOpen(false);
      toast({ title: 'Proposta excluida' });
    } catch {
      toast({ title: 'Erro ao excluir', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="flex gap-1">
        {/* Visualizar */}
        <button
          onClick={() => router.push(`/proposta/${id}/preview`)}
          className="flex h-[30px] w-[30px] items-center justify-center text-whisper transition-colors hover:bg-rule-soft hover:text-ink"
          title="Visualizar"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>

        {/* Editar */}
        <button
          onClick={() => router.push(`/proposta/${id}`)}
          className="flex h-[30px] w-[30px] items-center justify-center text-whisper transition-colors hover:bg-rule-soft hover:text-ink"
          title="Editar"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>

        {/* Copiar link */}
        <button
          onClick={handleCopyLink}
          className="flex h-[30px] w-[30px] items-center justify-center text-whisper transition-colors hover:bg-rule-soft hover:text-ink"
          title="Copiar link"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
          </svg>
        </button>

        {/* Download PDF */}
        <button
          onClick={() => handlePlaceholder('Download PDF')}
          className="flex h-[30px] w-[30px] items-center justify-center text-whisper transition-colors hover:bg-rule-soft hover:text-ink"
          title="Download PDF"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>

        {/* Duplicar */}
        <button
          onClick={() => handlePlaceholder('Duplicar')}
          className="flex h-[30px] w-[30px] items-center justify-center text-whisper transition-colors hover:bg-rule-soft hover:text-ink"
          title="Duplicar"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="0" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        </button>

        {/* Enviar */}
        <button
          onClick={() => handlePlaceholder('Enviar')}
          className="flex h-[30px] w-[30px] items-center justify-center text-whisper transition-colors hover:bg-rule-soft hover:text-ink"
          title="Enviar"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22,2 15,22 11,13 2,9" />
          </svg>
        </button>

        {/* Deletar */}
        <button
          onClick={() => setDeleteOpen(true)}
          className="flex h-[30px] w-[30px] items-center justify-center text-whisper transition-colors hover:bg-red-50 hover:text-danger"
          title="Deletar"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3,6 5,6 21,6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
      </div>

      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Excluir proposta"
        description="Tem certeza? Esta acao nao pode ser desfeita."
      >
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: Success (component not yet imported).

- [ ] **Step 3: Commit**

```bash
git add src/components/propostas/proposta-actions.tsx
git commit -m "feat: create PropostaActions with 7 row actions"
```

---

### Task 7: Refactor PropostaTable with new columns

**Files:**
- Modify: `src/components/propostas/proposta-table.tsx`

- [ ] **Step 1: Rewrite PropostaTable**

Replace the entire contents of `src/components/propostas/proposta-table.tsx` with:

```typescript
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, formatRef, formatPerfilTipo } from '@/lib/utils/format';
import { PropostaActions } from '@/components/propostas/proposta-actions';
import type { Proposta, PropostaStatus } from '@/types';

interface PropostaTableProps {
  propostas: Proposta[];
}

export function PropostaTable({ propostas }: PropostaTableProps) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden border border-rule bg-paper-pure md:block">
        <div className="grid grid-cols-[140px_2fr_1fr_100px_110px_110px_220px] border-b border-rule bg-paper px-4 py-3">
          <div className="text-caption font-semibold text-mute">REF</div>
          <div className="text-caption font-semibold text-mute">Escritorio</div>
          <div className="text-caption font-semibold text-mute">Tipo</div>
          <div className="text-caption font-semibold text-mute">Data</div>
          <div className="text-caption font-semibold text-mute">Valor</div>
          <div className="text-caption font-semibold text-mute">Status</div>
          <div className="text-caption font-semibold text-mute">Acoes</div>
        </div>
        {propostas.map((p) => (
          <div
            key={p.id}
            className="grid grid-cols-[140px_2fr_1fr_100px_110px_110px_220px] items-center border-b border-rule-soft px-4 py-3.5 text-body-sm transition-colors last:border-0 hover:bg-rule-soft/50"
          >
            <div className="text-xs font-semibold tracking-wide text-ink">
              {formatRef(p.slug, p.created_at)}
            </div>
            <div>
              <div className="font-medium text-ink">{p.escritorio_nome}</div>
              <div className="text-xs text-mute">{p.lead_nome || '\u2014'}</div>
            </div>
            <div className="text-mute">{formatPerfilTipo(p.escritorio_perfil)}</div>
            <div className="text-mute">{formatDate(p.created_at)}</div>
            <div className="font-medium text-ink">{formatCurrency(p.preco_mensalidade_final)}</div>
            <div><Badge status={p.status as PropostaStatus} /></div>
            <div><PropostaActions id={p.id} slug={p.slug} /></div>
          </div>
        ))}
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {propostas.map((p) => (
          <div key={p.id} className="border border-rule bg-paper-pure p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold tracking-wide text-mute">
                  {formatRef(p.slug, p.created_at)}
                </div>
                <div className="mt-1 truncate text-body font-medium text-ink">{p.escritorio_nome}</div>
                <div className="truncate text-xs text-mute">{p.lead_nome || '\u2014'}</div>
              </div>
              <Badge status={p.status as PropostaStatus} />
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-whisper">
              <span className="font-medium text-ink">{formatCurrency(p.preco_mensalidade_final)}</span>
              <span>{formatPerfilTipo(p.escritorio_perfil)}</span>
              <span>{formatDate(p.created_at)}</span>
            </div>
            <div className="mt-3 border-t border-rule-soft pt-3">
              <PropostaActions id={p.id} slug={p.slug} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: May fail due to page.tsx props mismatch — that's expected, fixed in Task 8.

- [ ] **Step 3: Commit**

```bash
git add src/components/propostas/proposta-table.tsx
git commit -m "feat: refactor PropostaTable with REF, tipo, actions columns"
```

---

### Task 8: Refactor dashboard page.tsx with expanded queries

**Files:**
- Modify: `src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Rewrite the dashboard page**

Replace the entire contents of `src/app/(dashboard)/dashboard/page.tsx` with:

```typescript
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { PropostaStats } from '@/components/propostas/proposta-stats';
import { PropostaTabs } from '@/components/propostas/proposta-tabs';
import { PropostaFilters } from '@/components/propostas/proposta-filters';
import { PropostaTable } from '@/components/propostas/proposta-table';
import { EmptyState } from '@/components/shared/empty-state';
import type { Proposta } from '@/types';

interface Props {
  searchParams: Promise<{
    status?: string;
    search?: string;
    tipo?: string;
    periodo?: string;
    page?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createServerClient();

  // Stats: counts by status
  const now = new Date();
  const mesInicio = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { count: totalMes },
    { count: totalGeral },
    { count: publicadas },
    { count: visualizadas },
    { count: aceitas },
    { count: recusadas },
  ] = await Promise.all([
    supabase.from('propostas').select('*', { count: 'exact', head: true }).gte('created_at', mesInicio),
    supabase.from('propostas').select('*', { count: 'exact', head: true }),
    supabase.from('propostas').select('*', { count: 'exact', head: true }).eq('status', 'publicada'),
    supabase.from('propostas').select('*', { count: 'exact', head: true }).eq('status', 'visualizada'),
    supabase.from('propostas').select('*', { count: 'exact', head: true }).eq('status', 'aceita'),
    supabase.from('propostas').select('*', { count: 'exact', head: true }).eq('status', 'recusada'),
  ]);

  // Valor aceito do mes
  const { data: aceitasData } = await supabase
    .from('propostas')
    .select('preco_mensalidade_final')
    .eq('status', 'aceita')
    .gte('created_at', mesInicio);
  const valorAceito = (aceitasData || []).reduce(
    (sum, p) => sum + (p.preco_mensalidade_final || 0),
    0
  );

  const enviadasCount = (publicadas || 0) + (visualizadas || 0) + (aceitas || 0) + (recusadas || 0);

  // Filtered list query
  let query = supabase
    .from('propostas')
    .select('*')
    .order('created_at', { ascending: false })
    .range(0, 19);

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status);
  }
  if (params.search) {
    query = query.or(
      `escritorio_nome.ilike.%${params.search}%,lead_nome.ilike.%${params.search}%`
    );
  }
  if (params.tipo) {
    query = query.eq('escritorio_perfil', params.tipo);
  }
  if (params.periodo) {
    const periodoMap: Record<string, number> = { '1m': 1, '3m': 3, '6m': 6 };
    const meses = periodoMap[params.periodo];
    if (meses) {
      const desde = new Date();
      desde.setMonth(desde.getMonth() - meses);
      query = query.gte('created_at', desde.toISOString());
    }
  }

  const { data: propostas } = await query;

  return (
    <div>
      {/* Header */}
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-heading-lg text-ink">Propostas</h1>
          <p className="mt-0.5 text-body-sm text-mute">
            Gerencie todas as propostas criadas e enviadas
          </p>
        </div>
        <Link href="/nova">
          <Button className="w-full sm:w-auto">+ Nova Proposta</Button>
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="mb-7">
        <PropostaStats
          total={totalMes || 0}
          visualizadas={visualizadas || 0}
          enviadas={enviadasCount}
          aceitas={aceitas || 0}
          valorAceito={valorAceito}
        />
      </div>

      {/* Tabs */}
      <div className="mb-4">
        <PropostaTabs
          counts={{
            total: totalGeral || 0,
            publicadas: publicadas || 0,
            visualizadas: visualizadas || 0,
            aceitas: aceitas || 0,
            recusadas: recusadas || 0,
          }}
        />
      </div>

      {/* Filters */}
      <div className="mb-5">
        <PropostaFilters />
      </div>

      {/* Table or Empty State */}
      {propostas && propostas.length > 0 ? (
        <PropostaTable propostas={propostas as Proposta[]} />
      ) : (
        <EmptyState
          title="Nenhuma proposta encontrada"
          description="Crie sua primeira proposta para comecar."
          action={{ label: '+ Nova Proposta', href: '/nova' }}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: Success, zero errors. All components now receive correct props.

- [ ] **Step 3: Smoke test**

Run: `pnpm dev`
Navigate to `http://localhost:3000/dashboard` (or the configured port).
Verify:
- 4 KPI cards render with labels and subtexts
- Tabs show with counts, clicking filters the table
- Search, tipo, and periodo filters work
- Table shows REF, Escritorio+Lead, Tipo, Data, Valor, Status, Acoes
- Action icons are visible, hover states work
- Copiar link copies to clipboard and shows toast
- Placeholder actions (PDF, Duplicar, Enviar) show "Em breve" toast
- Deletar opens confirmation dialog
- Mobile view shows cards instead of table

- [ ] **Step 4: Commit**

```bash
git add src/app/(dashboard)/dashboard/page.tsx
git commit -m "feat: refactor dashboard page with KPIs, tabs, filters, and actions"
```
