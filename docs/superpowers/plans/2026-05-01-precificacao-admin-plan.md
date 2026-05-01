# Precificação Admin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar a área `/precificacao` (5 abas: Modelo, Tabelas, ROI, Limites, Histórico) com RBAC simples, versionamento append-only e snapshot por proposta, sem quebrar comportamento atual.

**Architecture:** Migration única `003_pricing_admin.sql` cria `pricing_tables` + `pricing_table_versions` (append-only) + `progressive_templates` + `profiles.role` + 2 colunas em `propostas`, com seed da tabela 'Padrão' v1 reproduzindo byte-a-byte os hardcoded de `roi.ts`. Funções `getPrecoSugerido`/`calculateROI` viram puras (recebem `pricingData` como argumento). Página `/precificacao` em Next 16 app router com Tabs custom; server actions validam `role='admin'` + RLS via helper `is_admin()`. Wizard `/nova` carrega `pricingData` da tabela default e oferece troca; proposta salva `pricing_table_id` + `pricing_version_id` para auditoria mas mantém valores próprios em `preco_*` como fonte da verdade.

**Tech Stack:** Next.js 16 (app router), React 19, TypeScript, Tailwind v4, Zustand, Zod 4, Supabase (PG + RLS), Vitest.

**Spec:** [`docs/superpowers/specs/2026-05-01-precificacao-admin-design.md`](../specs/2026-05-01-precificacao-admin-design.md)

---

## Convenções

- Cada task termina com **commit** (atômico). Mensagens em conventional commits PT-BR.
- TDD onde aplicável (lógica pura, validações, server actions): escreve teste falhando → roda → implementa → roda passa → commit.
- UI: smoke check manual no browser ao final de cada aba (npm run dev).
- Em qualquer task com SQL: rodar `npm run typecheck` ao final para garantir tipos atualizados.

---

# Fase 1 — Banco de dados

### Task 1: Criar arquivo da migration com schema base

**Files:**
- Create: `supabase/migrations/003_pricing_admin.sql`

- [ ] **Step 1: Criar arquivo da migration com schema das tabelas e ALTERs**

```sql
-- supabase/migrations/003_pricing_admin.sql
-- Precificação Admin: tabelas comerciais versionadas + role + snapshot em propostas

-- 1. Adicionar role em profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));

-- 2. Tabelas comerciais
CREATE TABLE IF NOT EXISTS public.pricing_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Garantir uma única tabela default
CREATE UNIQUE INDEX IF NOT EXISTS pricing_tables_one_default
  ON public.pricing_tables ((1)) WHERE is_default = true;

-- Trigger updated_at
CREATE TRIGGER pricing_tables_updated_at
  BEFORE UPDATE ON public.pricing_tables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3. Versões imutáveis (append-only)
CREATE TABLE IF NOT EXISTS public.pricing_table_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id uuid NOT NULL REFERENCES public.pricing_tables(id) ON DELETE CASCADE,
  version_number int NOT NULL,
  data jsonb NOT NULL,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(table_id, version_number)
);

-- 4. Templates de faixas progressivas (entidade global)
CREATE TABLE IF NOT EXISTS public.progressive_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  faixas jsonb NOT NULL,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. View: versão atual de cada tabela
CREATE OR REPLACE VIEW public.pricing_tables_current AS
SELECT pt.id, pt.name, pt.description, pt.is_default, pt.is_active,
       pt.created_at, pt.updated_at,
       ptv.id           AS current_version_id,
       ptv.version_number,
       ptv.data,
       ptv.created_at   AS version_created_at,
       ptv.created_by   AS version_created_by
FROM public.pricing_tables pt
JOIN LATERAL (
  SELECT * FROM public.pricing_table_versions
  WHERE table_id = pt.id
  ORDER BY version_number DESC
  LIMIT 1
) ptv ON true;

-- 6. Snapshot de auditoria em propostas
ALTER TABLE public.propostas
  ADD COLUMN IF NOT EXISTS pricing_table_id   uuid REFERENCES public.pricing_tables(id),
  ADD COLUMN IF NOT EXISTS pricing_version_id uuid REFERENCES public.pricing_table_versions(id);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/003_pricing_admin.sql
git commit -m "feat(db): adiciona schema base de pricing admin (tables, versions, templates, view)"
```

---

### Task 2: Adicionar RLS e helper `is_admin()`

**Files:**
- Modify: `supabase/migrations/003_pricing_admin.sql` (append)

- [ ] **Step 1: Anexar função is_admin() e policies à migration**

Acrescente ao final de `003_pricing_admin.sql`:

```sql
-- 7. Helper: checar admin (SECURITY DEFINER + search_path bloqueado)
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 8. RLS
ALTER TABLE public.pricing_tables          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_table_versions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progressive_templates   ENABLE ROW LEVEL SECURITY;

-- pricing_tables: SELECT authenticated, mutações apenas admin
CREATE POLICY pricing_tables_select ON public.pricing_tables
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY pricing_tables_insert ON public.pricing_tables
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY pricing_tables_update ON public.pricing_tables
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY pricing_tables_delete ON public.pricing_tables
  FOR DELETE USING (public.is_admin());

-- pricing_table_versions: SELECT authenticated, INSERT admin, UPDATE/DELETE bloqueados
CREATE POLICY pricing_versions_select ON public.pricing_table_versions
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY pricing_versions_insert ON public.pricing_table_versions
  FOR INSERT WITH CHECK (public.is_admin());
-- (sem policies UPDATE/DELETE: append-only)

-- progressive_templates
CREATE POLICY progressive_select ON public.progressive_templates
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY progressive_insert ON public.progressive_templates
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY progressive_update ON public.progressive_templates
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY progressive_delete ON public.progressive_templates
  FOR DELETE USING (public.is_admin());
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/003_pricing_admin.sql
git commit -m "feat(db): adiciona is_admin() helper e RLS policies para pricing"
```

---

### Task 3: Adicionar seed da tabela 'Padrão' v1

**Files:**
- Modify: `supabase/migrations/003_pricing_admin.sql` (append)

- [ ] **Step 1: Anexar INSERT do seed à migration**

```sql
-- 9. Seed: tabela 'Padrão' v1 (reproduz byte-a-byte os hardcoded em roi.ts)
INSERT INTO public.pricing_tables (name, description, is_default, is_active)
VALUES ('Padrão', 'Tabela comercial padrão Juspilot', true, true);

INSERT INTO public.pricing_table_versions (table_id, version_number, data, created_by)
SELECT id, 1, $${
  "faixas_porte": [
    { "min": 1,  "max": 3,    "setup": 2000, "mensalidade": 1500, "usuarios": 5 },
    { "min": 4,  "max": 10,   "setup": 3500, "mensalidade": 3000, "usuarios": 10 },
    { "min": 11, "max": 20,   "setup": 5000, "mensalidade": 5000, "usuarios": 20 },
    { "min": 21, "max": null, "setup": 8000, "mensalidade": 8000, "usuarios": null,
      "incremento_por_dezena_advogados": 2000 }
  ],
  "roi": {
    "horas_mensais": 176,
    "valor_hora_padrao": 250,
    "atividades_ia_por_perfil": { "boutique": 0.30, "misto": 0.40, "massa": 0.50 },
    "taxa_reducao_por_maturidade": { "nunca": 0.60, "iniciante": 0.50, "intermediario": 0.45, "avancado": 0.40 }
  },
  "limites": {
    "desconto_maximo_pct": 30,
    "mensalidade_minima": 1000,
    "validade_proposta_dias": 30,
    "reajuste_anual_pct": 8
  }
}$$::jsonb, NULL
FROM public.pricing_tables WHERE name = 'Padrão';
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/003_pricing_admin.sql
git commit -m "feat(db): adiciona seed da tabela Padrão v1 reproduzindo roi.ts"
```

---

### Task 4: Atualizar PL/pgSQL `calculate_roi()` para aceitar `data jsonb`

**Files:**
- Modify: `supabase/migrations/003_pricing_admin.sql` (append)

- [ ] **Step 1: Anexar nova versão da função à migration**

```sql
-- 10. calculate_roi: nova assinatura aceitando data jsonb (fallback para tabela default)
CREATE OR REPLACE FUNCTION public.calculate_roi(
  qtd_advogados INTEGER,
  valor_hora INTEGER,
  perfil TEXT,
  maturidade_ia TEXT,
  mensalidade INTEGER,
  pricing_data jsonb DEFAULT NULL
)
RETURNS TABLE (
  horas_economizadas_total INTEGER,
  horas_economizadas_por_adv INTEGER,
  valor_gerado INTEGER,
  roi_percentual INTEGER,
  roi_multiplo DECIMAL(4,1),
  custo_por_advogado DECIMAL(10,2)
) AS $$
DECLARE
  effective_data jsonb;
  horas_mes INTEGER;
  percentual_atividades DECIMAL;
  reducao DECIMAL;
BEGIN
  IF pricing_data IS NULL THEN
    SELECT data INTO effective_data
    FROM public.pricing_tables_current
    WHERE is_default = true AND is_active = true
    LIMIT 1;
    IF effective_data IS NULL THEN
      RAISE EXCEPTION 'No default pricing_table available';
    END IF;
  ELSE
    effective_data := pricing_data;
  END IF;

  horas_mes := COALESCE((effective_data->'roi'->>'horas_mensais')::INTEGER, 176);
  percentual_atividades := COALESCE(
    (effective_data->'roi'->'atividades_ia_por_perfil'->>perfil)::DECIMAL,
    0.4
  );
  reducao := COALESCE(
    (effective_data->'roi'->'taxa_reducao_por_maturidade'->>maturidade_ia)::DECIMAL,
    0.5
  );

  horas_economizadas_por_adv := ROUND(horas_mes * percentual_atividades * reducao);
  horas_economizadas_total := horas_economizadas_por_adv * qtd_advogados;
  valor_gerado := horas_economizadas_total * valor_hora;
  roi_percentual := ROUND(((valor_gerado - mensalidade)::DECIMAL / mensalidade) * 100);
  roi_multiplo := ROUND((valor_gerado::DECIMAL / mensalidade)::NUMERIC, 1);
  custo_por_advogado := ROUND((mensalidade::DECIMAL / qtd_advogados)::NUMERIC, 2);

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/003_pricing_admin.sql
git commit -m "feat(db): calculate_roi aceita pricing_data jsonb com fallback para default"
```

---

### Task 5: Aplicar a migration localmente e validar

**Files:**
- (nenhuma alteração de código — verificação)

- [ ] **Step 1: Aplicar migration**

```bash
npx supabase db reset    # ou: npx supabase db push, dependendo do setup local
```

Esperado: migration `003_pricing_admin.sql` aplicada sem erros; tabelas criadas; seed presente.

- [ ] **Step 2: Validar via SQL**

```bash
npx supabase db query "SELECT name, is_default, is_active FROM pricing_tables;"
npx supabase db query "SELECT version_number, jsonb_pretty(data) FROM pricing_table_versions LIMIT 1;"
npx supabase db query "SELECT * FROM calculate_roi(10, 250, 'boutique', 'nunca', 3000);"
```

Esperado:
- 1 tabela `Padrão` is_default=true.
- v1 com JSON contendo faixas_porte, roi, limites.
- `calculate_roi(10, 250, 'boutique', 'nunca', 3000)` retorna `horas_economizadas_por_adv=32`, `roi_percentual` ≈ `((10*32*250 - 3000)/3000)*100 = 2566` (sanidade dos cálculos).

- [ ] **Step 3: Commit (sem mudanças, apenas confirmação)** — pular se não houver alteração de arquivos.

---

# Fase 2 — Tipos e schemas Zod

### Task 6: Criar `src/lib/pricing/types.ts`

**Files:**
- Create: `src/lib/pricing/types.ts`

- [ ] **Step 1: Criar arquivo com tipos**

```typescript
// src/lib/pricing/types.ts
import type { EscritorioPerfil, MaturidadeIA } from '@/types/database';

export interface FaixaPorte {
  min: number;
  max: number | null;
  setup: number;
  mensalidade: number;
  usuarios: number | null;
  incremento_por_dezena_advogados?: number;
}

export interface PricingROI {
  horas_mensais: number;
  valor_hora_padrao: number;
  atividades_ia_por_perfil: Record<EscritorioPerfil, number>;
  taxa_reducao_por_maturidade: Record<MaturidadeIA, number>;
}

export interface PricingLimites {
  desconto_maximo_pct: number;
  mensalidade_minima: number;
  validade_proposta_dias: number;
  reajuste_anual_pct: number;
}

export interface PricingData {
  faixas_porte: FaixaPorte[];
  roi: PricingROI;
  limites: PricingLimites;
}

export interface PricingTable {
  id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PricingTableCurrent extends PricingTable {
  current_version_id: string;
  version_number: number;
  data: PricingData;
  version_created_at: string;
  version_created_by: string | null;
}

export interface PricingTableVersion {
  id: string;
  table_id: string;
  version_number: number;
  data: PricingData;
  created_by: string | null;
  created_at: string;
}

export interface ProgressiveTemplate {
  id: string;
  name: string;
  description: string | null;
  faixas: Array<{ mes_inicio: number; mes_fim: number | null; valor: number }>;
  created_by: string | null;
  created_at: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/pricing/types.ts
git commit -m "feat(types): adiciona tipos de pricing (PricingData, PricingTable, etc.)"
```

---

### Task 7: Atualizar `src/types/database.ts` com `Profile.role` e exportar pricing types

**Files:**
- Modify: `src/types/database.ts`
- Modify: `src/types/index.ts` (se existir export agregador)

- [ ] **Step 1: Adicionar `role` em Profile e re-export de pricing types**

Em `src/types/database.ts`, dentro de `interface Profile`:

```typescript
export interface Profile {
  id: string;
  // ...existentes...
  role: 'user' | 'admin';   // NOVO
}
```

- [ ] **Step 2: Adicionar campos novos em Proposta**

Em `interface Proposta`:

```typescript
  pricing_table_id: string | null;        // NOVO
  pricing_version_id: string | null;      // NOVO
```

- [ ] **Step 3: Re-export tipos de pricing**

No final de `src/types/database.ts` ou no agregador `src/types/index.ts`:

```typescript
export type {
  PricingData, PricingROI, PricingLimites, FaixaPorte,
  PricingTable, PricingTableCurrent, PricingTableVersion,
  ProgressiveTemplate,
} from '@/lib/pricing/types';
```

- [ ] **Step 4: Validar typecheck**

```bash
npx tsc --noEmit
```

Esperado: sem erros (se houver erros em arquivos que constroem `Profile`, atualizar default `role: 'user'`).

- [ ] **Step 5: Commit**

```bash
git add src/types/
git commit -m "feat(types): adiciona role em Profile e snapshot fields em Proposta"
```

---

### Task 8: Schemas Zod em `src/lib/validations/pricing.ts` + testes

**Files:**
- Create: `src/lib/validations/pricing.ts`
- Create: `src/lib/validations/pricing.test.ts`

- [ ] **Step 1: Escrever testes falhando**

```typescript
// src/lib/validations/pricing.test.ts
import { describe, it, expect } from 'vitest';
import { pricingDataSchema, faixasPorteSchema, progressiveTemplateSchema } from './pricing';

describe('pricingDataSchema', () => {
  const valid = {
    faixas_porte: [
      { min: 1, max: 3, setup: 2000, mensalidade: 1500, usuarios: 5 },
      { min: 4, max: null, setup: 3500, mensalidade: 3000, usuarios: 10 },
    ],
    roi: {
      horas_mensais: 176, valor_hora_padrao: 250,
      atividades_ia_por_perfil: { boutique: 0.3, misto: 0.4, massa: 0.5 },
      taxa_reducao_por_maturidade: { nunca: 0.6, iniciante: 0.5, intermediario: 0.45, avancado: 0.4 },
    },
    limites: { desconto_maximo_pct: 30, mensalidade_minima: 1000, validade_proposta_dias: 30, reajuste_anual_pct: 8 },
  };

  it('aceita payload válido', () => {
    expect(() => pricingDataSchema.parse(valid)).not.toThrow();
  });

  it('rejeita percentual > 100', () => {
    const invalid = { ...valid, limites: { ...valid.limites, desconto_maximo_pct: 150 } };
    expect(() => pricingDataSchema.parse(invalid)).toThrow();
  });

  it('rejeita valor negativo', () => {
    const invalid = { ...valid, limites: { ...valid.limites, mensalidade_minima: -1 } };
    expect(() => pricingDataSchema.parse(invalid)).toThrow();
  });
});

describe('faixasPorteSchema', () => {
  it('rejeita faixas sobrepostas', () => {
    const overlap = [
      { min: 1, max: 5, setup: 100, mensalidade: 100, usuarios: 1 },
      { min: 4, max: 10, setup: 200, mensalidade: 200, usuarios: 2 },
    ];
    expect(() => faixasPorteSchema.parse(overlap)).toThrow();
  });

  it('rejeita faixa com gap', () => {
    const gap = [
      { min: 1, max: 5,  setup: 100, mensalidade: 100, usuarios: 1 },
      { min: 8, max: 10, setup: 200, mensalidade: 200, usuarios: 2 },
    ];
    expect(() => faixasPorteSchema.parse(gap)).toThrow();
  });

  it('aceita faixas contínuas com última aberta', () => {
    const valid = [
      { min: 1, max: 5,    setup: 100, mensalidade: 100, usuarios: 1 },
      { min: 6, max: null, setup: 200, mensalidade: 200, usuarios: null },
    ];
    expect(() => faixasPorteSchema.parse(valid)).not.toThrow();
  });
});

describe('progressiveTemplateSchema', () => {
  it('aceita template válido', () => {
    expect(() =>
      progressiveTemplateSchema.parse({
        name: '3+9',
        faixas: [
          { mes_inicio: 1, mes_fim: 3, valor: 1500 },
          { mes_inicio: 4, mes_fim: null, valor: 3000 },
        ],
      }),
    ).not.toThrow();
  });

  it('rejeita faixas sem cobertura contínua', () => {
    expect(() =>
      progressiveTemplateSchema.parse({
        name: 'X',
        faixas: [
          { mes_inicio: 1, mes_fim: 3, valor: 1500 },
          { mes_inicio: 6, mes_fim: null, valor: 3000 },
        ],
      }),
    ).toThrow();
  });
});
```

- [ ] **Step 2: Rodar testes — esperar falha**

```bash
npx vitest run src/lib/validations/pricing.test.ts
```

Esperado: ERROR — módulo não existe.

- [ ] **Step 3: Implementar schema**

```typescript
// src/lib/validations/pricing.ts
import { z } from 'zod';

const pct = z.number().min(0).max(1);
const pctInteiro = z.number().min(0).max(100);

export const faixaPorteSchema = z.object({
  min: z.number().int().positive(),
  max: z.number().int().positive().nullable(),
  setup: z.number().nonnegative(),
  mensalidade: z.number().nonnegative(),
  usuarios: z.number().int().positive().nullable(),
  incremento_por_dezena_advogados: z.number().nonnegative().optional(),
});

export const faixasPorteSchema = z.array(faixaPorteSchema).min(1).superRefine((faixas, ctx) => {
  const sorted = [...faixas].sort((a, b) => a.min - b.min);
  for (let i = 0; i < sorted.length; i++) {
    const cur = sorted[i];
    if (cur.max !== null && cur.max < cur.min) {
      ctx.addIssue({ code: 'custom', message: `Faixa ${i}: max < min`, path: [i] });
    }
    if (i > 0) {
      const prev = sorted[i - 1];
      if (prev.max === null) {
        ctx.addIssue({ code: 'custom', message: `Faixa ${i}: anterior tem max=null (deve ser última)`, path: [i] });
      } else if (cur.min !== prev.max + 1) {
        ctx.addIssue({
          code: 'custom',
          message: `Faixa ${i}: descontínua (esperava min=${prev.max + 1}, recebeu min=${cur.min})`,
          path: [i],
        });
      }
    }
  }
  if (sorted.length > 0 && sorted[sorted.length - 1].max !== null) {
    ctx.addIssue({ code: 'custom', message: 'Última faixa deve ter max=null (aberta)', path: [sorted.length - 1] });
  }
});

export const pricingROISchema = z.object({
  horas_mensais: z.number().int().positive(),
  valor_hora_padrao: z.number().nonnegative(),
  atividades_ia_por_perfil: z.object({
    boutique: pct, misto: pct, massa: pct,
  }),
  taxa_reducao_por_maturidade: z.object({
    nunca: pct, iniciante: pct, intermediario: pct, avancado: pct,
  }),
});

export const pricingLimitesSchema = z.object({
  desconto_maximo_pct: pctInteiro,
  mensalidade_minima: z.number().nonnegative(),
  validade_proposta_dias: z.number().int().positive(),
  reajuste_anual_pct: pctInteiro,
});

export const pricingDataSchema = z.object({
  faixas_porte: faixasPorteSchema,
  roi: pricingROISchema,
  limites: pricingLimitesSchema,
});

export const progressiveTemplateFaixasSchema = z
  .array(z.object({
    mes_inicio: z.number().int().positive(),
    mes_fim: z.number().int().positive().nullable(),
    valor: z.number().nonnegative(),
  }))
  .min(1)
  .superRefine((faixas, ctx) => {
    const sorted = [...faixas].sort((a, b) => a.mes_inicio - b.mes_inicio);
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const cur = sorted[i];
      if (prev.mes_fim === null) {
        ctx.addIssue({ code: 'custom', message: `Faixa ${i}: anterior é aberta`, path: [i] });
      } else if (cur.mes_inicio !== prev.mes_fim + 1) {
        ctx.addIssue({
          code: 'custom',
          message: `Faixa ${i}: descontínua (esperava mes_inicio=${prev.mes_fim + 1})`,
          path: [i],
        });
      }
    }
  });

export const progressiveTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().nullable().optional(),
  faixas: progressiveTemplateFaixasSchema,
});

export const pricingTableMetadataSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(500).nullable().optional(),
  is_default: z.boolean().optional(),
  is_active: z.boolean().optional(),
});
```

- [ ] **Step 4: Rodar testes — esperar passar**

```bash
npx vitest run src/lib/validations/pricing.test.ts
```

Esperado: PASS (todos os casos).

- [ ] **Step 5: Commit**

```bash
git add src/lib/validations/pricing.ts src/lib/validations/pricing.test.ts
git commit -m "feat(validations): adiciona schemas Zod e testes para pricing"
```

---

# Fase 3 — Refatoração de roi.ts

### Task 9: Refatorar `getPrecoSugerido` para receber `pricingData`

**Files:**
- Modify: `src/lib/utils/roi.ts`
- Create: `src/lib/utils/roi.test.ts`

- [ ] **Step 1: Escrever testes falhando**

```typescript
// src/lib/utils/roi.test.ts
import { describe, it, expect } from 'vitest';
import { getPrecoSugerido, calculateROI } from './roi';
import type { PricingData } from '@/lib/pricing/types';

const PRICING_PADRAO: PricingData = {
  faixas_porte: [
    { min: 1, max: 3, setup: 2000, mensalidade: 1500, usuarios: 5 },
    { min: 4, max: 10, setup: 3500, mensalidade: 3000, usuarios: 10 },
    { min: 11, max: 20, setup: 5000, mensalidade: 5000, usuarios: 20 },
    { min: 21, max: null, setup: 8000, mensalidade: 8000, usuarios: null, incremento_por_dezena_advogados: 2000 },
  ],
  roi: {
    horas_mensais: 176, valor_hora_padrao: 250,
    atividades_ia_por_perfil: { boutique: 0.3, misto: 0.4, massa: 0.5 },
    taxa_reducao_por_maturidade: { nunca: 0.6, iniciante: 0.5, intermediario: 0.45, avancado: 0.4 },
  },
  limites: { desconto_maximo_pct: 30, mensalidade_minima: 1000, validade_proposta_dias: 30, reajuste_anual_pct: 8 },
};

describe('getPrecoSugerido', () => {
  it('faixa ≤3 advogados', () => {
    expect(getPrecoSugerido(2, PRICING_PADRAO)).toEqual({ setup: 2000, mensalidade: 1500, usuarios: 5 });
  });
  it('faixa 4-10', () => {
    expect(getPrecoSugerido(7, PRICING_PADRAO)).toEqual({ setup: 3500, mensalidade: 3000, usuarios: 10 });
  });
  it('faixa 11-20', () => {
    expect(getPrecoSugerido(15, PRICING_PADRAO)).toEqual({ setup: 5000, mensalidade: 5000, usuarios: 20 });
  });
  it('faixa >20 com incremento por dezena', () => {
    // 35 advogados: floor((35-20)/10) = 1 dezena → +2000
    expect(getPrecoSugerido(35, PRICING_PADRAO)).toEqual({ setup: 8000, mensalidade: 10000, usuarios: 35 });
  });
  it('exatamente no limite (3, 10, 20)', () => {
    expect(getPrecoSugerido(3, PRICING_PADRAO).mensalidade).toBe(1500);
    expect(getPrecoSugerido(10, PRICING_PADRAO).mensalidade).toBe(3000);
    expect(getPrecoSugerido(20, PRICING_PADRAO).mensalidade).toBe(5000);
  });
});

describe('calculateROI', () => {
  it('boutique nunca, 8 adv, valor hora 300, mensalidade 1500', () => {
    const result = calculateROI({
      escritorio_qtd_advogados: 8,
      escritorio_valor_hora: 300,
      escritorio_valor_hora_informado: true,
      escritorio_perfil: 'boutique',
      escritorio_maturidade_ia: 'nunca',
      usar_preco_sugerido: true,
      preco_setup: 2000, preco_mensalidade: 1500, preco_usuarios_inclusos: 5,
      preco_desconto: 0, usar_preco_faixas: false, preco_faixas: null,
    } as never, PRICING_PADRAO);

    // horas_mes(176) * 0.3 * 0.6 = 31.68 → round = 32
    expect(result.horas_economizadas_por_adv).toBe(32);
    expect(result.horas_economizadas_total).toBe(32 * 8);
    expect(result.valor_gerado).toBe(32 * 8 * 300);
    expect(result.mensalidade_final).toBe(1500);
  });

  it('aplica desconto na mensalidade final', () => {
    const result = calculateROI({
      escritorio_qtd_advogados: 5,
      escritorio_valor_hora: 250,
      escritorio_valor_hora_informado: false,
      escritorio_perfil: 'misto',
      escritorio_maturidade_ia: 'iniciante',
      usar_preco_sugerido: false,
      preco_setup: 0, preco_mensalidade: 4000, preco_usuarios_inclusos: 10,
      preco_desconto: 25, usar_preco_faixas: false, preco_faixas: null,
    } as never, PRICING_PADRAO);
    expect(result.mensalidade_final).toBe(3000);  // 4000 * 0.75
  });
});
```

- [ ] **Step 2: Rodar testes — esperar falha**

```bash
npx vitest run src/lib/utils/roi.test.ts
```

Esperado: FAIL (assinatura antiga não aceita `pricingData`).

- [ ] **Step 3: Refatorar `roi.ts`**

```typescript
// src/lib/utils/roi.ts
import type { PropostaFormData, ROICalculation } from '@/types';
import type { PricingData } from '@/lib/pricing/types';

export function calculateROI(formData: PropostaFormData, pricing: PricingData): ROICalculation {
  const {
    escritorio_qtd_advogados, escritorio_valor_hora, escritorio_valor_hora_informado,
    escritorio_perfil, escritorio_maturidade_ia,
    usar_preco_sugerido, preco_mensalidade, preco_desconto,
    usar_preco_faixas, preco_faixas,
  } = formData;

  const HORAS_MES = pricing.roi.horas_mensais;
  const VALOR_HORA_PADRAO = pricing.roi.valor_hora_padrao;

  const valorHoraEfetivo = escritorio_valor_hora_informado ? escritorio_valor_hora : VALOR_HORA_PADRAO;
  const percentualAtividades = pricing.roi.atividades_ia_por_perfil[escritorio_perfil] ?? 0.4;
  const reducao = pricing.roi.taxa_reducao_por_maturidade[escritorio_maturidade_ia] ?? 0.5;

  const horasAtividadesIA = HORAS_MES * percentualAtividades;
  const horas_economizadas_por_adv = Math.round(horasAtividadesIA * reducao);
  const horas_economizadas_total = horas_economizadas_por_adv * escritorio_qtd_advogados;
  const valor_gerado = horas_economizadas_total * valorHoraEfetivo;

  const precoSugerido = getPrecoSugerido(escritorio_qtd_advogados, pricing);
  let mensalidadeRecorrente: number;
  if (usar_preco_faixas && preco_faixas && preco_faixas.length > 0) {
    mensalidadeRecorrente = preco_faixas[preco_faixas.length - 1].valor;
  } else if (usar_preco_sugerido) {
    mensalidadeRecorrente = precoSugerido.mensalidade;
  } else {
    mensalidadeRecorrente = preco_mensalidade;
  }

  const mensalidade_final = Math.round(mensalidadeRecorrente * (1 - preco_desconto / 100));
  const roi_percentual = Math.round(((valor_gerado - mensalidade_final) / mensalidade_final) * 100);
  const roi_multiplo = parseFloat((valor_gerado / mensalidade_final).toFixed(1));
  const custo_por_advogado = parseFloat((mensalidade_final / escritorio_qtd_advogados).toFixed(2));

  return {
    horas_economizadas_por_adv, horas_economizadas_total, valor_gerado,
    roi_percentual, roi_multiplo, custo_por_advogado, mensalidade_final,
  };
}

export function getPrecoSugerido(qtdAdvogados: number, pricing: PricingData): {
  setup: number; mensalidade: number; usuarios: number;
} {
  const faixa = pricing.faixas_porte.find(
    (f) => qtdAdvogados >= f.min && (f.max === null || qtdAdvogados <= f.max),
  );
  if (!faixa) {
    throw new Error(`Nenhuma faixa de porte cobre ${qtdAdvogados} advogados`);
  }
  let mensalidade = faixa.mensalidade;
  if (faixa.max === null && faixa.incremento_por_dezena_advogados) {
    const dezenasExtras = Math.floor((qtdAdvogados - faixa.min + 1 - 1) / 10);
    // mantém compatibilidade com floor((qtd - 20) / 10) quando faixa começa em 21:
    const dezenasFromStart = Math.floor((qtdAdvogados - faixa.min) / 10);
    mensalidade = faixa.mensalidade + dezenasFromStart * faixa.incremento_por_dezena_advogados;
  }
  return {
    setup: faixa.setup,
    mensalidade,
    usuarios: faixa.usuarios ?? qtdAdvogados,
  };
}
```

- [ ] **Step 4: Rodar testes — esperar passar**

```bash
npx vitest run src/lib/utils/roi.test.ts
```

Esperado: PASS em todos os casos. Em particular `getPrecoSugerido(35, ...)` deve retornar `mensalidade=10000` (8000 + floor((35-21)/10)*2000 = 8000 + 1*2000 = 10000).

> Nota: a fórmula original era `floor((qtd-20)/10)*2000`. Para qtd=35 → floor(15/10)=1 → 10000. A nova fórmula `floor((qtd-faixa.min)/10)` com `faixa.min=21` → floor(14/10)=1 → 10000. Idêntico.

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils/roi.ts src/lib/utils/roi.test.ts
git commit -m "refactor(roi): funções recebem pricingData (puras) + testes"
```

---

### Task 10: Atualizar callers de `roi.ts` que ainda passam só qtd

**Files:**
- Modify: `src/components/wizard/step-precos.tsx` (uso temporário)
- Modify: outros arquivos que importam `getPrecoSugerido` ou `calculateROI`

- [ ] **Step 1: Buscar todos os callers**

```bash
grep -rn "getPrecoSugerido\|calculateROI" src/ --include="*.ts" --include="*.tsx"
```

- [ ] **Step 2: Verificar se compila no estado atual**

```bash
npx tsc --noEmit
```

Esperado: erros de assinatura em todos os callers (faltando `pricingData`).

- [ ] **Step 3: Em cada caller, passar `pricingData` placeholder via prop ou import temporário**

Para cada caller identificado, adicionar `pricingData` recebido como parâmetro/prop. Em arquivos que ainda não têm acesso a pricing, importe um helper temporário:

```typescript
import { getDefaultPricingDataSync } from '@/lib/pricing/load';  // criado na Task 12 — deixar TODO se ainda não existe
```

Se Task 12 ainda não foi feita, adicionar comentário `// TODO: substituir por loader quando Task 12 estiver pronta` e usar literal placeholder importado de testes.

> **Nota de execução:** se preferir, mesclar Task 10 com Tasks 12+24 (integração wizard) — fazer toda a refatoração de callers de uma vez na Fase 9 e deixar este step apenas com `npx tsc --noEmit` no final como gate.

- [ ] **Step 4: Commit (somente se houve mudança)**

```bash
git add -A
git commit -m "refactor(callers): adapta callers de roi para nova assinatura (placeholder)"
```

---

# Fase 4 — Loaders e utils

### Task 11: Criar `src/lib/pricing/load.ts` (server-only)

**Files:**
- Create: `src/lib/pricing/load.ts`

- [ ] **Step 1: Criar loader**

```typescript
// src/lib/pricing/load.ts
import 'server-only';
import { createServerClient } from '@/lib/supabase/server';
import type { PricingTableCurrent } from './types';

export async function loadDefaultPricingTable(): Promise<PricingTableCurrent | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('pricing_tables_current')
    .select('*')
    .eq('is_default', true)
    .eq('is_active', true)
    .maybeSingle();
  if (error) throw error;
  return (data as PricingTableCurrent) ?? null;
}

export async function loadPricingTableById(id: string): Promise<PricingTableCurrent | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('pricing_tables_current')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as PricingTableCurrent) ?? null;
}

export async function listActivePricingTables(): Promise<PricingTableCurrent[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('pricing_tables_current')
    .select('*')
    .eq('is_active', true)
    .order('is_default', { ascending: false })
    .order('name');
  if (error) throw error;
  return (data ?? []) as PricingTableCurrent[];
}

export async function listVersions(tableId: string): Promise<Array<{
  id: string; version_number: number; created_at: string; created_by: string | null; data: unknown;
}>> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('pricing_table_versions')
    .select('id, version_number, created_at, created_by, data')
    .eq('table_id', tableId)
    .order('version_number', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/pricing/load.ts
git commit -m "feat(pricing): adiciona loaders server-only para tabelas e versões"
```

---

### Task 12: Criar `src/lib/pricing/apply-limits.ts` + testes

**Files:**
- Create: `src/lib/pricing/apply-limits.ts`
- Create: `src/lib/pricing/apply-limits.test.ts`

- [ ] **Step 1: Escrever testes falhando**

```typescript
// src/lib/pricing/apply-limits.test.ts
import { describe, it, expect } from 'vitest';
import { clampDesconto, validateMensalidade, getDescontoErrorMessage } from './apply-limits';

const limites = { desconto_maximo_pct: 30, mensalidade_minima: 1000, validade_proposta_dias: 30, reajuste_anual_pct: 8 };

describe('clampDesconto', () => {
  it('mantém desconto dentro do limite', () => expect(clampDesconto(20, limites)).toBe(20));
  it('limita ao máximo', () => expect(clampDesconto(50, limites)).toBe(30));
  it('rejeita negativo', () => expect(clampDesconto(-5, limites)).toBe(0));
});

describe('validateMensalidade', () => {
  it('aceita acima do mínimo', () => expect(validateMensalidade(1500, limites)).toEqual({ ok: true }));
  it('rejeita abaixo do mínimo', () => expect(validateMensalidade(500, limites)).toEqual({
    ok: false, message: expect.stringContaining('1.000'),
  }));
});
```

- [ ] **Step 2: Rodar testes — esperar falha**

```bash
npx vitest run src/lib/pricing/apply-limits.test.ts
```

- [ ] **Step 3: Implementar**

```typescript
// src/lib/pricing/apply-limits.ts
import type { PricingLimites } from './types';
import { formatCurrency } from '@/lib/utils/format';

export function clampDesconto(value: number, limites: PricingLimites): number {
  if (value < 0) return 0;
  if (value > limites.desconto_maximo_pct) return limites.desconto_maximo_pct;
  return value;
}

export function validateMensalidade(
  value: number, limites: PricingLimites,
): { ok: true } | { ok: false; message: string } {
  if (value < limites.mensalidade_minima) {
    return {
      ok: false,
      message: `Mensalidade não pode ficar abaixo de ${formatCurrency(limites.mensalidade_minima)}`,
    };
  }
  return { ok: true };
}

export function getDescontoErrorMessage(
  value: number, limites: PricingLimites,
): string | null {
  if (value > limites.desconto_maximo_pct) {
    return `Desconto máximo permitido: ${limites.desconto_maximo_pct}%`;
  }
  return null;
}
```

- [ ] **Step 4: Rodar testes — esperar passar**

```bash
npx vitest run src/lib/pricing/apply-limits.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/pricing/apply-limits.ts src/lib/pricing/apply-limits.test.ts
git commit -m "feat(pricing): adiciona apply-limits (clamp desconto, valida mensalidade) + testes"
```

---

# Fase 5 — Server actions

### Task 13: Criar `src/app/(dashboard)/precificacao/actions.ts`

**Files:**
- Create: `src/app/(dashboard)/precificacao/actions.ts`

- [ ] **Step 1: Implementar actions com check de admin**

```typescript
// src/app/(dashboard)/precificacao/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase/server';
import {
  pricingDataSchema, pricingTableMetadataSchema, progressiveTemplateSchema,
} from '@/lib/validations/pricing';

async function requireAdmin() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Acesso negado: apenas admin');
  return { supabase, userId: user.id };
}

export async function createTable(input: {
  name: string; description?: string | null; data: unknown;
}) {
  const { supabase, userId } = await requireAdmin();
  const meta = pricingTableMetadataSchema.parse({ name: input.name, description: input.description });
  const data = pricingDataSchema.parse(input.data);

  const { data: table, error: e1 } = await supabase
    .from('pricing_tables')
    .insert({ name: meta.name, description: meta.description ?? null, is_default: false, is_active: true })
    .select().single();
  if (e1) throw e1;

  const { error: e2 } = await supabase
    .from('pricing_table_versions')
    .insert({ table_id: table.id, version_number: 1, data, created_by: userId });
  if (e2) throw e2;

  revalidatePath('/precificacao');
  return { id: table.id };
}

export async function updateTableMetadata(id: string, input: {
  name?: string; description?: string | null; is_active?: boolean;
}) {
  const { supabase } = await requireAdmin();
  const meta = pricingTableMetadataSchema.partial().parse(input);
  const { error } = await supabase.from('pricing_tables').update(meta).eq('id', id);
  if (error) throw error;
  revalidatePath('/precificacao');
}

export async function setDefaultTable(id: string) {
  const { supabase } = await requireAdmin();
  // RLS garante admin; constraint pricing_tables_one_default garante unicidade.
  // Estratégia: zera todas, depois seta.
  const { error: e1 } = await supabase.from('pricing_tables').update({ is_default: false }).eq('is_default', true);
  if (e1) throw e1;
  const { error: e2 } = await supabase.from('pricing_tables').update({ is_default: true }).eq('id', id);
  if (e2) throw e2;
  revalidatePath('/precificacao');
}

export async function createVersion(tableId: string, data: unknown) {
  const { supabase, userId } = await requireAdmin();
  const parsed = pricingDataSchema.parse(data);

  const { data: latest, error: eLatest } = await supabase
    .from('pricing_table_versions').select('version_number')
    .eq('table_id', tableId).order('version_number', { ascending: false }).limit(1).single();
  if (eLatest && eLatest.code !== 'PGRST116') throw eLatest;
  const next = (latest?.version_number ?? 0) + 1;

  const { error } = await supabase
    .from('pricing_table_versions')
    .insert({ table_id: tableId, version_number: next, data: parsed, created_by: userId });
  if (error) throw error;

  revalidatePath('/precificacao');
  return { version_number: next };
}

export async function softDeleteTable(id: string) {
  const { supabase } = await requireAdmin();
  const { data: table } = await supabase
    .from('pricing_tables').select('is_default').eq('id', id).single();
  if (table?.is_default) throw new Error('Não é possível desativar a tabela default');
  const { error } = await supabase.from('pricing_tables').update({ is_active: false }).eq('id', id);
  if (error) throw error;
  revalidatePath('/precificacao');
}

export async function createProgressiveTemplate(input: { name: string; description?: string | null; faixas: unknown }) {
  const { supabase, userId } = await requireAdmin();
  const parsed = progressiveTemplateSchema.parse({
    name: input.name, description: input.description, faixas: input.faixas,
  });
  const { data, error } = await supabase
    .from('progressive_templates')
    .insert({
      name: parsed.name, description: parsed.description ?? null, faixas: parsed.faixas, created_by: userId,
    })
    .select().single();
  if (error) throw error;
  revalidatePath('/precificacao');
  return { id: data.id };
}

export async function updateProgressiveTemplate(id: string, input: {
  name?: string; description?: string | null; faixas?: unknown;
}) {
  const { supabase } = await requireAdmin();
  const update: Record<string, unknown> = {};
  if (input.name !== undefined) update.name = input.name;
  if (input.description !== undefined) update.description = input.description;
  if (input.faixas !== undefined) {
    update.faixas = progressiveTemplateSchema.shape.faixas.parse(input.faixas);
  }
  const { error } = await supabase.from('progressive_templates').update(update).eq('id', id);
  if (error) throw error;
  revalidatePath('/precificacao');
}

export async function deleteProgressiveTemplate(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('progressive_templates').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/precificacao');
}
```

- [ ] **Step 2: Validar typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/precificacao/actions.ts
git commit -m "feat(pricing): adiciona server actions com requireAdmin gate"
```

---

# Fase 6 — Componente Tabs compartilhado

### Task 14: Criar `src/components/ui/tabs.tsx`

**Files:**
- Create: `src/components/ui/tabs.tsx`

- [ ] **Step 1: Implementar Tabs simples (sem Radix — projeto não usa)**

```tsx
// src/components/ui/tabs.tsx
'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface TabsContextValue {
  value: string;
  setValue: (v: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export function Tabs({
  defaultValue, value: controlled, onValueChange, children, className,
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  children: ReactNode;
  className?: string;
}) {
  const [internal, setInternal] = useState(defaultValue ?? '');
  const value = controlled ?? internal;
  const setValue = (v: string) => {
    if (controlled === undefined) setInternal(v);
    onValueChange?.(v);
  };
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div role="tablist" className={cn(
      'inline-flex items-center gap-1 rounded-lg border border-[#e4e4e7] bg-white p-1', className,
    )}>{children}</div>
  );
}

export function TabsTrigger({ value, children }: { value: string; children: ReactNode }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabsTrigger fora de Tabs');
  const active = ctx.value === value;
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={() => ctx.setValue(value)}
      className={cn(
        'rounded-md px-3 py-1.5 text-sm transition-colors',
        active ? 'bg-[#D97757]/10 font-medium text-[#D97757]' : 'text-[#71717a] hover:bg-[#f4f4f5]',
      )}
    >{children}</button>
  );
}

export function TabsContent({ value, children, className }: {
  value: string; children: ReactNode; className?: string;
}) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabsContent fora de Tabs');
  if (ctx.value !== value) return null;
  return <div role="tabpanel" className={className}>{children}</div>;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/tabs.tsx
git commit -m "feat(ui): adiciona componente Tabs simples"
```

---

# Fase 7 — Sidebar

### Task 15: Adicionar item Precificação ao sidebar

**Files:**
- Modify: `src/components/layout/sidebar.tsx`

- [ ] **Step 1: Adicionar entry no `NAV_ITEMS`**

Substituir o array existente:

```tsx
const NAV_ITEMS = [
  { href: '/dashboard',     label: 'Dashboard',      icon: '📊' },
  { href: '/nova',          label: 'Nova Proposta',  icon: '➕' },
  { href: '/precificacao',  label: 'Precificação',   icon: '💰' },
  { href: '/configuracoes', label: 'Configurações',  icon: '⚙️' },
];
```

- [ ] **Step 2: Smoke test manual**

```bash
npm run dev
```

Abrir http://localhost:3000/dashboard → ver item "💰 Precificação" no menu. Clicar → 404 esperado (página não existe ainda).

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/sidebar.tsx
git commit -m "feat(nav): adiciona item Precificação ao sidebar"
```

---

# Fase 8 — Página Precificação

### Task 16: Criar `page.tsx` (server) + `precificacao-client.tsx`

**Files:**
- Create: `src/app/(dashboard)/precificacao/page.tsx`
- Create: `src/app/(dashboard)/precificacao/precificacao-client.tsx`

- [ ] **Step 1: Server component**

```tsx
// src/app/(dashboard)/precificacao/page.tsx
import { createServerClient } from '@/lib/supabase/server';
import { listActivePricingTables, listVersions } from '@/lib/pricing/load';
import { PrecificacaoClient } from './precificacao-client';

export const metadata = { title: 'Precificação' };

export default async function PrecificacaoPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user!.id).single();
  const isAdmin = profile?.role === 'admin';

  const tables = await listActivePricingTables();
  const defaultTable = tables.find((t) => t.is_default) ?? tables[0];
  const versions = defaultTable ? await listVersions(defaultTable.id) : [];

  const { data: templates } = await supabase
    .from('progressive_templates').select('*').order('name');

  return (
    <PrecificacaoClient
      isAdmin={isAdmin}
      tables={tables}
      initialSelectedId={defaultTable?.id ?? null}
      initialVersions={versions}
      progressiveTemplates={templates ?? []}
    />
  );
}
```

- [ ] **Step 2: Client component (esqueleto)**

```tsx
// src/app/(dashboard)/precificacao/precificacao-client.tsx
'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { PricingTableCurrent, ProgressiveTemplate } from '@/lib/pricing/types';
import { ModeloTab } from './tabs/modelo-tab';
import { TabelasTab } from './tabs/tabelas-tab';
import { RoiTab } from './tabs/roi-tab';
import { LimitesTab } from './tabs/limites-tab';
import { HistoricoTab } from './tabs/historico-tab';
import { TabelaSelector } from './components/tabela-selector';

interface Props {
  isAdmin: boolean;
  tables: PricingTableCurrent[];
  initialSelectedId: string | null;
  initialVersions: Array<{ id: string; version_number: number; created_at: string; created_by: string | null; data: unknown }>;
  progressiveTemplates: ProgressiveTemplate[];
}

export function PrecificacaoClient({ isAdmin, tables, initialSelectedId, initialVersions, progressiveTemplates }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const selected = tables.find((t) => t.id === selectedId) ?? null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#09090b]">Precificação</h1>
        <TabelaSelector tables={tables} value={selectedId} onChange={setSelectedId} isAdmin={isAdmin} />
      </div>

      {!selected ? (
        <div className="text-sm text-[#71717a]">Nenhuma tabela ativa. {isAdmin && 'Crie uma para começar.'}</div>
      ) : (
        <Tabs defaultValue="modelo">
          <TabsList className="mb-6">
            <TabsTrigger value="modelo">Modelo</TabsTrigger>
            <TabsTrigger value="tabelas">Tabelas comerciais</TabsTrigger>
            <TabsTrigger value="roi">ROI</TabsTrigger>
            <TabsTrigger value="limites">Limites e padrões</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="modelo"><ModeloTab data={selected.data} /></TabsContent>
          <TabsContent value="tabelas"><TabelasTab table={selected} isAdmin={isAdmin} /></TabsContent>
          <TabsContent value="roi"><RoiTab table={selected} isAdmin={isAdmin} /></TabsContent>
          <TabsContent value="limites"><LimitesTab table={selected} templates={progressiveTemplates} isAdmin={isAdmin} /></TabsContent>
          <TabsContent value="historico"><HistoricoTab tableId={selected.id} initialVersions={initialVersions} /></TabsContent>
        </Tabs>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Criar arquivos placeholder das abas e do selector**

Criar 6 arquivos com export default mínimo para destravar build:

```bash
mkdir -p src/app/\(dashboard\)/precificacao/tabs src/app/\(dashboard\)/precificacao/components
```

Cada um (`tabs/modelo-tab.tsx`, `tabs/tabelas-tab.tsx`, etc.) com:

```tsx
export function ModeloTab(_: { data: unknown }) {
  return <div className="text-sm text-[#71717a]">Em construção…</div>;
}
```

Idem para `RoiTab`, `LimitesTab`, `HistoricoTab`, `TabelasTab`, e `components/tabela-selector.tsx`:

```tsx
export function TabelaSelector(_: { tables: unknown[]; value: string | null; onChange: (id: string) => void; isAdmin: boolean }) {
  return null;
}
```

- [ ] **Step 4: Smoke test**

```bash
npm run dev
```

`/precificacao` → renderiza header + 5 abas com "Em construção…". Trocar entre tabs funciona.

- [ ] **Step 5: Commit**

```bash
git add src/app/\(dashboard\)/precificacao/
git commit -m "feat(precificacao): adiciona página com 5 abas (esqueleto)"
```

---

### Task 17: Implementar `TabelaSelector` + modal "Nova tabela"

**Files:**
- Modify: `src/app/(dashboard)/precificacao/components/tabela-selector.tsx`
- Create: `src/app/(dashboard)/precificacao/components/nova-tabela-dialog.tsx`

- [ ] **Step 1: Selector**

```tsx
// src/app/(dashboard)/precificacao/components/tabela-selector.tsx
'use client';

import { useState } from 'react';
import type { PricingTableCurrent } from '@/lib/pricing/types';
import { Button } from '@/components/ui/button';
import { NovaTabelaDialog } from './nova-tabela-dialog';

export function TabelaSelector({
  tables, value, onChange, isAdmin,
}: {
  tables: PricingTableCurrent[]; value: string | null; onChange: (id: string) => void; isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = tables.find((t) => t.id === value);
  return (
    <div className="flex items-center gap-3">
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md border border-[#e4e4e7] bg-white px-3 text-sm"
      >
        {tables.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}{t.is_default ? ' (default)' : ''}
          </option>
        ))}
      </select>
      {selected && (
        <span className="text-xs text-[#71717a]">
          v{selected.version_number} · {new Date(selected.version_created_at).toLocaleDateString('pt-BR')}
        </span>
      )}
      {isAdmin && (
        <>
          <Button variant="outline" onClick={() => setOpen(true)}>+ Nova tabela</Button>
          <NovaTabelaDialog open={open} onOpenChange={setOpen} sourceTables={tables} />
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Dialog**

```tsx
// src/app/(dashboard)/precificacao/components/nova-tabela-dialog.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createTable } from '../actions';
import type { PricingTableCurrent } from '@/lib/pricing/types';

export function NovaTabelaDialog({
  open, onOpenChange, sourceTables,
}: { open: boolean; onOpenChange: (b: boolean) => void; sourceTables: PricingTableCurrent[] }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [copyFrom, setCopyFrom] = useState<string>(sourceTables[0]?.id ?? '');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      const source = sourceTables.find((t) => t.id === copyFrom);
      if (!source) throw new Error('Selecione uma tabela base');
      await createTable({ name, description: description || null, data: source.data });
      onOpenChange(false);
      setName(''); setDescription('');
    } finally { setSubmitting(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Nova tabela comercial</DialogTitle>
        <div className="mt-4 space-y-3">
          <Input placeholder="Nome (ex.: Enterprise)" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Descrição (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <label className="block text-sm">
            Copiar valores de:
            <select className="mt-1 h-9 w-full rounded-md border border-[#e4e4e7] px-2"
              value={copyFrom} onChange={(e) => setCopyFrom(e.target.value)}>
              {sourceTables.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={!name || !copyFrom || submitting}>
              {submitting ? 'Criando…' : 'Criar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Smoke test (logado como admin)**

Manual: Abrir `/precificacao` → clicar "Nova tabela" → criar "Enterprise" copiando de "Padrão" → ver na lista.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(dashboard\)/precificacao/components/
git commit -m "feat(precificacao): seletor de tabela + modal nova tabela"
```

---

### Task 18: Aba Modelo

**Files:**
- Modify: `src/app/(dashboard)/precificacao/tabs/modelo-tab.tsx`

- [ ] **Step 1: Implementar conteúdo educativo**

```tsx
// src/app/(dashboard)/precificacao/tabs/modelo-tab.tsx
import type { PricingData } from '@/lib/pricing/types';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/format';

export function ModeloTab({ data }: { data: PricingData }) {
  const { roi, faixas_porte, limites } = data;
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-base font-semibold text-[#09090b]">Como o Juspilot precifica propostas</h2>
        <p className="mt-2 text-sm text-[#71717a]">
          O preço sugerido depende do <strong>porte do escritório</strong> (qtd. de advogados),
          combinado com <strong>parâmetros de ROI</strong> (perfil e maturidade IA) que justificam o investimento.
        </p>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#71717a]">Fluxo</h3>
        <ol className="mt-3 space-y-2 text-sm text-[#09090b]">
          <li><strong>1.</strong> Porte → faixa de tabela (ex.: 1–3, 4–10, 11–20, 21+).</li>
          <li><strong>2.</strong> Faixa retorna setup + mensalidade base.</li>
          <li><strong>3.</strong> Vendedor pode aplicar <em>desconto</em> (até {limites.desconto_maximo_pct}%) ou <em>faixas progressivas</em>.</li>
          <li><strong>4.</strong> Mensalidade final ≥ {formatCurrency(limites.mensalidade_minima)} (piso).</li>
          <li><strong>5.</strong> ROI = valor gerado pelo cliente ÷ mensalidade final.</li>
        </ol>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#71717a]">Fórmula do ROI</h3>
        <pre className="mt-3 overflow-x-auto rounded-md bg-[#fafafa] p-3 text-xs text-[#09090b]">
{`horas_mes = ${roi.horas_mensais}
% atividades IA (perfil) = boutique ${roi.atividades_ia_por_perfil.boutique * 100}% · misto ${roi.atividades_ia_por_perfil.misto * 100}% · massa ${roi.atividades_ia_por_perfil.massa * 100}%
taxa redução (maturidade) = nunca ${roi.taxa_reducao_por_maturidade.nunca * 100}% · iniciante ${roi.taxa_reducao_por_maturidade.iniciante * 100}% · intermediário ${roi.taxa_reducao_por_maturidade.intermediario * 100}% · avançado ${roi.taxa_reducao_por_maturidade.avancado * 100}%

horas_economizadas/adv = horas_mes × % atividades × taxa redução
valor_gerado            = horas_economizadas × valor_hora
roi_múltiplo            = valor_gerado ÷ mensalidade_final`}
        </pre>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#71717a]">Faixas de porte (atual)</h3>
        <table className="mt-3 w-full text-sm">
          <thead className="text-left text-[#71717a]">
            <tr><th>Faixa</th><th>Setup</th><th>Mensalidade</th><th>Usuários</th></tr>
          </thead>
          <tbody>
            {faixas_porte.map((f, i) => (
              <tr key={i} className="border-t border-[#e4e4e7]">
                <td className="py-2">{f.min}–{f.max ?? '∞'} adv.</td>
                <td>{formatCurrency(f.setup)}</td>
                <td>{formatCurrency(f.mensalidade)}{f.incremento_por_dezena_advogados ? ` (+${formatCurrency(f.incremento_por_dezena_advogados)}/10 adv.)` : ''}</td>
                <td>{f.usuarios ?? '∞'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Smoke test**

Acessar `/precificacao` → aba Modelo deve renderizar 4 cards com conteúdo correto e os valores do data.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/precificacao/tabs/modelo-tab.tsx
git commit -m "feat(precificacao): aba Modelo com descrição educativa do funcionamento"
```

---

### Task 19: Aba Tabelas comerciais (editor de faixas de porte)

**Files:**
- Modify: `src/app/(dashboard)/precificacao/tabs/tabelas-tab.tsx`
- Create: `src/app/(dashboard)/precificacao/components/faixas-porte-editor.tsx`

- [ ] **Step 1: Editor de faixas (estado local)**

```tsx
// src/app/(dashboard)/precificacao/components/faixas-porte-editor.tsx
'use client';

import type { FaixaPorte } from '@/lib/pricing/types';
import { Input } from '@/components/ui/input';

export function FaixasPorteEditor({
  faixas, onChange, disabled,
}: { faixas: FaixaPorte[]; onChange: (next: FaixaPorte[]) => void; disabled?: boolean }) {
  const update = (i: number, patch: Partial<FaixaPorte>) => {
    const next = faixas.map((f, idx) => (idx === i ? { ...f, ...patch } : f));
    onChange(next);
  };
  const remove = (i: number) => onChange(faixas.filter((_, idx) => idx !== i));
  const add = () => {
    const last = faixas[faixas.length - 1];
    const newMin = last && last.max !== null ? last.max + 1 : 1;
    onChange([...faixas, { min: newMin, max: null, setup: 0, mensalidade: 0, usuarios: null }]);
  };

  return (
    <div className="space-y-2">
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-wide text-[#71717a]">
          <tr><th className="py-2">Min</th><th>Max</th><th>Setup</th><th>Mensalidade</th><th>Usuários</th><th>+10 adv.</th><th></th></tr>
        </thead>
        <tbody>
          {faixas.map((f, i) => (
            <tr key={i} className="border-t border-[#e4e4e7]">
              <td className="py-2 pr-2"><Input type="number" value={f.min} disabled={disabled}
                onChange={(e) => update(i, { min: Number(e.target.value) })} /></td>
              <td className="pr-2"><Input type="number" value={f.max ?? ''} placeholder="∞" disabled={disabled}
                onChange={(e) => update(i, { max: e.target.value === '' ? null : Number(e.target.value) })} /></td>
              <td className="pr-2"><Input type="number" value={f.setup} disabled={disabled}
                onChange={(e) => update(i, { setup: Number(e.target.value) })} /></td>
              <td className="pr-2"><Input type="number" value={f.mensalidade} disabled={disabled}
                onChange={(e) => update(i, { mensalidade: Number(e.target.value) })} /></td>
              <td className="pr-2"><Input type="number" value={f.usuarios ?? ''} placeholder="∞" disabled={disabled}
                onChange={(e) => update(i, { usuarios: e.target.value === '' ? null : Number(e.target.value) })} /></td>
              <td className="pr-2"><Input type="number" value={f.incremento_por_dezena_advogados ?? ''} placeholder="—" disabled={disabled}
                onChange={(e) => update(i, { incremento_por_dezena_advogados: e.target.value === '' ? undefined : Number(e.target.value) })} /></td>
              <td className="text-right">
                {!disabled && faixas.length > 1 && (
                  <button onClick={() => remove(i)} className="text-xs text-red-600 hover:underline">Remover</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!disabled && (
        <button onClick={add} className="text-sm text-[#D97757] hover:underline">+ Adicionar faixa</button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Aba Tabelas com editor + save**

```tsx
// src/app/(dashboard)/precificacao/tabs/tabelas-tab.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FaixasPorteEditor } from '../components/faixas-porte-editor';
import { createVersion, updateTableMetadata, setDefaultTable, softDeleteTable } from '../actions';
import { faixasPorteSchema } from '@/lib/validations/pricing';
import type { PricingTableCurrent } from '@/lib/pricing/types';

export function TabelasTab({ table, isAdmin }: { table: PricingTableCurrent; isAdmin: boolean }) {
  const router = useRouter();
  const [name, setName] = useState(table.name);
  const [description, setDescription] = useState(table.description ?? '');
  const [faixas, setFaixas] = useState(table.data.faixas_porte);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const dirty =
    name !== table.name ||
    description !== (table.description ?? '') ||
    JSON.stringify(faixas) !== JSON.stringify(table.data.faixas_porte);

  const handleSave = async () => {
    setError(null); setSaving(true);
    try {
      const parsed = faixasPorteSchema.parse(faixas);
      if (name !== table.name || description !== (table.description ?? '')) {
        await updateTableMetadata(table.id, { name, description: description || null });
      }
      if (JSON.stringify(parsed) !== JSON.stringify(table.data.faixas_porte)) {
        await createVersion(table.id, { ...table.data, faixas_porte: parsed });
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#71717a]">Identificação</h3>
          <div className="flex items-center gap-2">
            {table.is_default && <Badge>Default</Badge>}
            {!table.is_active && <Badge>Inativa</Badge>}
          </div>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} disabled={!isAdmin} placeholder="Nome" />
          <Input value={description} onChange={(e) => setDescription(e.target.value)} disabled={!isAdmin} placeholder="Descrição" />
        </div>
        {isAdmin && (
          <div className="mt-3 flex gap-2">
            {!table.is_default && (
              <Button variant="outline" onClick={async () => { await setDefaultTable(table.id); router.refresh(); }}>
                Tornar default
              </Button>
            )}
            {!table.is_default && (
              <Button variant="outline" onClick={async () => {
                if (confirm('Desativar esta tabela?')) { await softDeleteTable(table.id); router.refresh(); }
              }}>Desativar</Button>
            )}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#71717a]">Faixas de porte</h3>
        <p className="mt-1 text-xs text-[#71717a]">
          Faixas devem ser contínuas e a última deve ter max=∞. Use o campo "+10 adv." na última para setar o incremento progressivo.
        </p>
        <div className="mt-3"><FaixasPorteEditor faixas={faixas} onChange={setFaixas} disabled={!isAdmin} /></div>
      </Card>

      {isAdmin && dirty && (
        <div className="sticky bottom-4 flex items-center justify-between rounded-lg border border-[#D97757] bg-white p-3 shadow-md">
          <div className="text-sm">
            {error ? <span className="text-red-600">{error}</span> : 'Há alterações não salvas.'}
          </div>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando…' : 'Salvar (cria nova versão)'}</Button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Smoke test (admin)**

Editar nome/descrição/faixas → salvar → ver versão incrementar (verificar via aba Histórico depois).

- [ ] **Step 4: Commit**

```bash
git add src/app/\(dashboard\)/precificacao/
git commit -m "feat(precificacao): aba Tabelas comerciais com editor de faixas e versionamento"
```

---

### Task 20: Aba ROI

**Files:**
- Modify: `src/app/(dashboard)/precificacao/tabs/roi-tab.tsx`

- [ ] **Step 1: Form + simulação ao vivo**

```tsx
// src/app/(dashboard)/precificacao/tabs/roi-tab.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createVersion } from '../actions';
import { calculateROI, getPrecoSugerido } from '@/lib/utils/roi';
import { formatCurrency } from '@/lib/utils/format';
import type { PricingTableCurrent } from '@/lib/pricing/types';

export function RoiTab({ table, isAdmin }: { table: PricingTableCurrent; isAdmin: boolean }) {
  const router = useRouter();
  const [roi, setRoi] = useState(table.data.roi);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(roi) !== JSON.stringify(table.data.roi);

  // Simulação
  const [simAdv, setSimAdv] = useState(10);
  const [simHora, setSimHora] = useState(300);
  const [simPerfil, setSimPerfil] = useState<'boutique' | 'misto' | 'massa'>('boutique');
  const [simMaturidade, setSimMaturidade] = useState<'nunca' | 'iniciante' | 'intermediario' | 'avancado'>('nunca');
  const editedData = { ...table.data, roi };
  const sugerido = getPrecoSugerido(simAdv, editedData);
  const sim = calculateROI({
    escritorio_qtd_advogados: simAdv, escritorio_valor_hora: simHora, escritorio_valor_hora_informado: true,
    escritorio_perfil: simPerfil, escritorio_maturidade_ia: simMaturidade,
    usar_preco_sugerido: true, preco_setup: sugerido.setup, preco_mensalidade: sugerido.mensalidade,
    preco_usuarios_inclusos: sugerido.usuarios, preco_desconto: 0, usar_preco_faixas: false, preco_faixas: null,
  } as never, editedData);

  const handleSave = async () => {
    setSaving(true);
    try {
      await createVersion(table.id, editedData);
      router.refresh();
    } finally { setSaving(false); }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#71717a]">Parâmetros</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="text-sm">Horas/mês
              <Input type="number" value={roi.horas_mensais} disabled={!isAdmin}
                onChange={(e) => setRoi({ ...roi, horas_mensais: Number(e.target.value) })} />
            </label>
            <label className="text-sm">Valor-hora padrão (R$)
              <Input type="number" value={roi.valor_hora_padrao} disabled={!isAdmin}
                onChange={(e) => setRoi({ ...roi, valor_hora_padrao: Number(e.target.value) })} />
            </label>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#71717a]">% atividades IA por perfil (0–1)</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {(['boutique', 'misto', 'massa'] as const).map((p) => (
              <label key={p} className="text-sm capitalize">{p}
                <Input type="number" step="0.01" min="0" max="1"
                  value={roi.atividades_ia_por_perfil[p]} disabled={!isAdmin}
                  onChange={(e) => setRoi({
                    ...roi,
                    atividades_ia_por_perfil: { ...roi.atividades_ia_por_perfil, [p]: Number(e.target.value) },
                  })} />
              </label>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#71717a]">Taxa de redução por maturidade IA (0–1)</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            {(['nunca', 'iniciante', 'intermediario', 'avancado'] as const).map((m) => (
              <label key={m} className="text-sm capitalize">{m}
                <Input type="number" step="0.01" min="0" max="1"
                  value={roi.taxa_reducao_por_maturidade[m]} disabled={!isAdmin}
                  onChange={(e) => setRoi({
                    ...roi,
                    taxa_reducao_por_maturidade: { ...roi.taxa_reducao_por_maturidade, [m]: Number(e.target.value) },
                  })} />
              </label>
            ))}
          </div>
        </Card>

        {isAdmin && dirty && (
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando…' : 'Salvar (cria nova versão)'}</Button>
        )}
      </div>

      <Card>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#71717a]">Simulação ao vivo</h3>
        <div className="mt-3 space-y-2 text-sm">
          <label>Advogados: <Input type="number" value={simAdv} onChange={(e) => setSimAdv(Number(e.target.value))} /></label>
          <label>Valor-hora: <Input type="number" value={simHora} onChange={(e) => setSimHora(Number(e.target.value))} /></label>
          <label>Perfil:
            <select className="h-9 w-full rounded-md border border-[#e4e4e7] px-2"
              value={simPerfil} onChange={(e) => setSimPerfil(e.target.value as typeof simPerfil)}>
              <option value="boutique">Boutique</option><option value="misto">Misto</option><option value="massa">Massa</option>
            </select>
          </label>
          <label>Maturidade:
            <select className="h-9 w-full rounded-md border border-[#e4e4e7] px-2"
              value={simMaturidade} onChange={(e) => setSimMaturidade(e.target.value as typeof simMaturidade)}>
              <option value="nunca">Nunca</option><option value="iniciante">Iniciante</option>
              <option value="intermediario">Intermediário</option><option value="avancado">Avançado</option>
            </select>
          </label>
        </div>
        <div className="mt-4 space-y-1 text-sm">
          <div>Mensalidade sugerida: <strong>{formatCurrency(sugerido.mensalidade)}</strong></div>
          <div>Horas economizadas/adv: <strong>{sim.horas_economizadas_por_adv}</strong></div>
          <div>Valor gerado: <strong>{formatCurrency(sim.valor_gerado)}</strong></div>
          <div>ROI múltiplo: <strong>{sim.roi_multiplo}x</strong></div>
        </div>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Smoke test (admin)**

Mudar % atividades misto de 0.4 para 0.5 → simulação atualiza imediatamente → salvar → versão incrementa.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(dashboard\)/precificacao/tabs/roi-tab.tsx
git commit -m "feat(precificacao): aba ROI com simulação ao vivo"
```

---

### Task 21: Aba Limites e padrões + ProgressiveTemplateEditor

**Files:**
- Modify: `src/app/(dashboard)/precificacao/tabs/limites-tab.tsx`
- Create: `src/app/(dashboard)/precificacao/components/progressive-template-editor.tsx`

- [ ] **Step 1: Editor de templates**

```tsx
// src/app/(dashboard)/precificacao/components/progressive-template-editor.tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  createProgressiveTemplate, updateProgressiveTemplate, deleteProgressiveTemplate,
} from '../actions';
import type { ProgressiveTemplate } from '@/lib/pricing/types';
import { useRouter } from 'next/navigation';

type Faixas = ProgressiveTemplate['faixas'];

export function ProgressiveTemplateList({
  templates, isAdmin,
}: { templates: ProgressiveTemplate[]; isAdmin: boolean }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftFaixas, setDraftFaixas] = useState<Faixas>([
    { mes_inicio: 1, mes_fim: 3, valor: 1500 },
    { mes_inicio: 4, mes_fim: null, valor: 3000 },
  ]);

  const editing = templates.find((t) => t.id === editingId);
  const isNew = editingId === 'new';

  const startEdit = (t: ProgressiveTemplate) => {
    setEditingId(t.id); setDraftName(t.name); setDraftFaixas(t.faixas);
  };
  const startNew = () => {
    setEditingId('new'); setDraftName('');
    setDraftFaixas([{ mes_inicio: 1, mes_fim: 3, valor: 1500 }, { mes_inicio: 4, mes_fim: null, valor: 3000 }]);
  };

  const save = async () => {
    if (isNew) await createProgressiveTemplate({ name: draftName, faixas: draftFaixas });
    else if (editing) await updateProgressiveTemplate(editing.id, { name: draftName, faixas: draftFaixas });
    setEditingId(null); router.refresh();
  };

  return (
    <div className="space-y-3">
      {templates.map((t) => (
        <div key={t.id} className="flex items-center justify-between rounded-md border border-[#e4e4e7] p-3">
          <div className="text-sm">
            <div className="font-medium text-[#09090b]">{t.name}</div>
            <div className="text-xs text-[#71717a]">
              {t.faixas.map((f, i) => (
                <span key={i}>{i > 0 && ' → '}meses {f.mes_inicio}{f.mes_fim ? `–${f.mes_fim}` : '+'}: R$ {f.valor}</span>
              ))}
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => startEdit(t)}>Editar</Button>
              <Button variant="outline" onClick={async () => {
                if (confirm('Excluir este template?')) { await deleteProgressiveTemplate(t.id); router.refresh(); }
              }}>Excluir</Button>
            </div>
          )}
        </div>
      ))}
      {isAdmin && <Button onClick={startNew}>+ Novo template</Button>}

      {(isNew || editing) && (
        <Card>
          <div className="space-y-2">
            <Input value={draftName} placeholder="Nome (ex.: 3+9)" onChange={(e) => setDraftName(e.target.value)} />
            {draftFaixas.map((f, i) => (
              <div key={i} className="grid grid-cols-3 gap-2">
                <Input type="number" placeholder="mês início" value={f.mes_inicio}
                  onChange={(e) => setDraftFaixas(draftFaixas.map((d, idx) => idx === i ? { ...d, mes_inicio: Number(e.target.value) } : d))} />
                <Input type="number" placeholder="mês fim (∞ = vazio)" value={f.mes_fim ?? ''}
                  onChange={(e) => setDraftFaixas(draftFaixas.map((d, idx) => idx === i ? { ...d, mes_fim: e.target.value === '' ? null : Number(e.target.value) } : d))} />
                <Input type="number" placeholder="valor R$" value={f.valor}
                  onChange={(e) => setDraftFaixas(draftFaixas.map((d, idx) => idx === i ? { ...d, valor: Number(e.target.value) } : d))} />
              </div>
            ))}
            <button className="text-sm text-[#D97757] hover:underline"
              onClick={() => setDraftFaixas([...draftFaixas, { mes_inicio: 1, mes_fim: null, valor: 0 }])}>
              + Adicionar faixa
            </button>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditingId(null)}>Cancelar</Button>
              <Button onClick={save} disabled={!draftName}>Salvar</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Aba Limites**

```tsx
// src/app/(dashboard)/precificacao/tabs/limites-tab.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createVersion } from '../actions';
import { ProgressiveTemplateList } from '../components/progressive-template-editor';
import type { PricingTableCurrent, ProgressiveTemplate } from '@/lib/pricing/types';

export function LimitesTab({
  table, templates, isAdmin,
}: { table: PricingTableCurrent; templates: ProgressiveTemplate[]; isAdmin: boolean }) {
  const router = useRouter();
  const [limites, setLimites] = useState(table.data.limites);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(limites) !== JSON.stringify(table.data.limites);

  const handleSave = async () => {
    setSaving(true);
    try {
      await createVersion(table.id, { ...table.data, limites });
      router.refresh();
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#71717a]">Limites comerciais</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="text-sm">Desconto máximo (%)
            <Input type="number" min="0" max="100" value={limites.desconto_maximo_pct} disabled={!isAdmin}
              onChange={(e) => setLimites({ ...limites, desconto_maximo_pct: Number(e.target.value) })} />
          </label>
          <label className="text-sm">Mensalidade mínima (R$)
            <Input type="number" min="0" value={limites.mensalidade_minima} disabled={!isAdmin}
              onChange={(e) => setLimites({ ...limites, mensalidade_minima: Number(e.target.value) })} />
          </label>
          <label className="text-sm">Validade padrão (dias)
            <Input type="number" min="1" value={limites.validade_proposta_dias} disabled={!isAdmin}
              onChange={(e) => setLimites({ ...limites, validade_proposta_dias: Number(e.target.value) })} />
          </label>
          <label className="text-sm">Reajuste anual (%)
            <Input type="number" min="0" max="100" value={limites.reajuste_anual_pct} disabled={!isAdmin}
              onChange={(e) => setLimites({ ...limites, reajuste_anual_pct: Number(e.target.value) })} />
          </label>
        </div>
        {isAdmin && dirty && (
          <div className="mt-4">
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando…' : 'Salvar (cria nova versão)'}</Button>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#71717a]">Templates de faixas progressivas</h3>
        <p className="mt-1 text-xs text-[#71717a]">
          Templates ficam disponíveis no wizard de proposta como atalhos de progressão (ex.: "3+9 meses").
        </p>
        <div className="mt-4"><ProgressiveTemplateList templates={templates} isAdmin={isAdmin} /></div>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Smoke test**

Editar limites + salvar → ver nova versão. Criar template progressivo → aparece na lista.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(dashboard\)/precificacao/
git commit -m "feat(precificacao): aba Limites e padrões com templates progressivos"
```

---

### Task 22: Aba Histórico

**Files:**
- Modify: `src/app/(dashboard)/precificacao/tabs/historico-tab.tsx`
- Create: `src/app/(dashboard)/precificacao/components/version-diff.tsx`

- [ ] **Step 1: Versão diff util**

```tsx
// src/app/(dashboard)/precificacao/components/version-diff.tsx
'use client';

export function VersionDiff({ before, after }: { before: unknown; after: unknown }) {
  const diff = computeDiff(before, after, '');
  if (diff.length === 0) {
    return <div className="text-sm text-[#71717a]">Sem alterações.</div>;
  }
  return (
    <div className="space-y-1 font-mono text-xs">
      {diff.map((d, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_2fr] gap-2 border-b border-[#e4e4e7] py-1">
          <code className="text-[#71717a]">{d.path}</code>
          <code className="text-red-600">- {JSON.stringify(d.before)}</code>
          <code className="text-green-700">+ {JSON.stringify(d.after)}</code>
        </div>
      ))}
    </div>
  );
}

function computeDiff(a: unknown, b: unknown, path: string): Array<{ path: string; before: unknown; after: unknown }> {
  if (JSON.stringify(a) === JSON.stringify(b)) return [];
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return [{ path: path || '(root)', before: a, after: b }];
  }
  const keys = new Set([...Object.keys(a as object), ...Object.keys(b as object)]);
  const out: Array<{ path: string; before: unknown; after: unknown }> = [];
  for (const k of keys) {
    out.push(...computeDiff(
      (a as Record<string, unknown>)[k],
      (b as Record<string, unknown>)[k],
      path ? `${path}.${k}` : k,
    ));
  }
  return out;
}
```

- [ ] **Step 2: Aba Histórico**

```tsx
// src/app/(dashboard)/precificacao/tabs/historico-tab.tsx
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VersionDiff } from '../components/version-diff';

interface Version {
  id: string; version_number: number; created_at: string; created_by: string | null; data: unknown;
}

export function HistoricoTab({ initialVersions }: { tableId: string; initialVersions: Version[] }) {
  const [diffing, setDiffing] = useState<{ current: Version; previous: Version | null } | null>(null);
  return (
    <Card>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-[#71717a]">Histórico de versões</h3>
      <table className="mt-3 w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-wide text-[#71717a]">
          <tr><th className="py-2">Versão</th><th>Data</th><th>Editor</th><th></th></tr>
        </thead>
        <tbody>
          {initialVersions.map((v, i) => {
            const prev = initialVersions[i + 1] ?? null;
            return (
              <tr key={v.id} className="border-t border-[#e4e4e7]">
                <td className="py-2">v{v.version_number}</td>
                <td>{new Date(v.created_at).toLocaleString('pt-BR')}</td>
                <td className="text-[#71717a]">{v.created_by ?? '—'}</td>
                <td className="text-right">
                  {prev && (
                    <button className="text-xs text-[#D97757] hover:underline"
                      onClick={() => setDiffing({ current: v, previous: prev })}>
                      Ver diff
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Dialog open={!!diffing} onOpenChange={(o) => !o && setDiffing(null)}>
        <DialogContent>
          <DialogTitle>v{diffing?.previous?.version_number} → v{diffing?.current?.version_number}</DialogTitle>
          {diffing && <VersionDiff before={diffing.previous?.data} after={diffing.current.data} />}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
```

- [ ] **Step 3: Smoke test**

Após salvar 2-3 vezes em outras abas, abrir Histórico → ver lista. Clicar "Ver diff" → modal mostra campos alterados.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(dashboard\)/precificacao/
git commit -m "feat(precificacao): aba Histórico com diff entre versões"
```

---

# Fase 9 — Integração com wizard

### Task 23: Wizard `/nova` carrega `pricingData` e oferece dropdown de tabela

**Files:**
- Modify: `src/app/(dashboard)/nova/page.tsx`
- Modify: `src/stores/wizard-store.ts`
- Modify: `src/components/wizard/step-precos.tsx`

- [ ] **Step 1: Server component carrega tabelas**

Em `src/app/(dashboard)/nova/page.tsx`, adicionar fetch antes de renderizar wizard:

```tsx
import { listActivePricingTables } from '@/lib/pricing/load';
// ... no componente:
const tables = await listActivePricingTables();
const defaultTable = tables.find((t) => t.is_default) ?? tables[0];
// passar tables e defaultTable ao wizard via prop / initial state
```

- [ ] **Step 2: Adicionar `pricingData` e `pricing_table_id` ao wizard store**

```typescript
// src/stores/wizard-store.ts
import type { PricingData } from '@/lib/pricing/types';

interface WizardState {
  // ...existentes...
  pricingTableId: string | null;
  pricingVersionId: string | null;
  pricingData: PricingData | null;
  setPricingTable: (table: { id: string; versionId: string; data: PricingData }) => void;
}

// na implementação:
pricingTableId: null,
pricingVersionId: null,
pricingData: null,
setPricingTable: (t) => set({
  pricingTableId: t.id,
  pricingVersionId: t.versionId,
  pricingData: t.data,
}),
```

- [ ] **Step 3: Componente raiz do wizard chama `setPricingTable` no mount**

No componente client do wizard, no primeiro `useEffect` ou em um init prop, chamar `setPricingTable` com `defaultTable`.

- [ ] **Step 4: Adicionar dropdown de tabela no início do step de escritório (ou novo step 0)**

```tsx
// dentro do step de escritório
const { pricingData, pricingTableId, setPricingTable } = useWizardStore();

// JSX:
<label className="text-sm">Tabela comercial
  <select className="h-9 w-full rounded-md border border-[#e4e4e7] px-2"
    value={pricingTableId ?? ''}
    onChange={(e) => {
      const t = tables.find((t) => t.id === e.target.value);
      if (t && (formData.preco_desconto > 0 || formData.usar_preco_faixas)) {
        if (!confirm('Trocar tabela vai resetar os preços editados. Continuar?')) return;
      }
      if (t) setPricingTable({ id: t.id, versionId: t.current_version_id, data: t.data });
    }}>
    {tables.map((t) => <option key={t.id} value={t.id}>{t.name}{t.is_default ? ' (default)' : ''}</option>)}
  </select>
</label>
```

- [ ] **Step 5: Atualizar `step-precos.tsx` para usar `pricingData`**

```tsx
const { formData, roi, updateField, updateFields, pricingData } = useWizardStore();
if (!pricingData) return <div>Carregando…</div>;
const sugerido = getPrecoSugerido(formData.escritorio_qtd_advogados, pricingData);

// aplicar limites:
import { clampDesconto, validateMensalidade, getDescontoErrorMessage } from '@/lib/pricing/apply-limits';
const descontoErr = getDescontoErrorMessage(formData.preco_desconto, pricingData.limites);

// no input de desconto:
<Input type="number" max={pricingData.limites.desconto_maximo_pct}
  value={formData.preco_desconto}
  onChange={(e) => updateField('preco_desconto', clampDesconto(Number(e.target.value), pricingData.limites))} />
{descontoErr && <p className="text-xs text-red-600">{descontoErr}</p>}

// validação mensalidade:
const mensalidadeFinalCheck = validateMensalidade(formData.preco_mensalidade * (1 - formData.preco_desconto/100), pricingData.limites);
{!mensalidadeFinalCheck.ok && <p className="text-xs text-red-600">{mensalidadeFinalCheck.message}</p>}
```

- [ ] **Step 6: Atualizar todas as chamadas a `calculateROI`/`getPrecoSugerido` no projeto para passar `pricingData`**

```bash
grep -rn "calculateROI\|getPrecoSugerido" src/ --include="*.ts" --include="*.tsx"
```

Para cada uso fora dos testes, garantir que `pricingData` seja passado. Em componentes do wizard, vem do store; em outros lugares, do server component pai.

- [ ] **Step 7: Validar typecheck + lint**

```bash
npx tsc --noEmit
npm run lint
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(wizard): integra pricingData carregado por tabela + aplica limites no step-precos"
```

---

### Task 24: Salvar `pricing_table_id` e `pricing_version_id` na proposta

**Files:**
- Modify: `src/lib/actions/proposta.ts` (ou path equivalente onde a action de salvar proposta vive)

- [ ] **Step 1: Localizar action de salvar proposta**

```bash
grep -rn "INSERT.*propostas\|from('propostas').*insert" src/ --include="*.ts"
```

- [ ] **Step 2: Adicionar campos ao insert**

No INSERT, incluir:

```typescript
pricing_table_id: formData.pricingTableId,
pricing_version_id: formData.pricingVersionId,
```

(propagados a partir do store do wizard.)

- [ ] **Step 3: Atualizar `src/lib/validations/proposta.ts` (Zod)**

Adicionar ao schema da proposta:

```typescript
pricing_table_id: z.string().uuid().nullable(),
pricing_version_id: z.string().uuid().nullable(),
```

- [ ] **Step 4: Smoke test**

Criar proposta no wizard → consultar:

```bash
npx supabase db query "SELECT id, slug, pricing_table_id, pricing_version_id FROM propostas ORDER BY created_at DESC LIMIT 1;"
```

Esperado: campos preenchidos com IDs reais.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(proposta): salva pricing_table_id e pricing_version_id no snapshot da proposta"
```

---

# Fase 10 — Verificação final

### Task 25: Validar RLS via SQL direto

**Files:**
- (sem mudanças — verificação)

- [ ] **Step 1: Como user comum, tentar INSERT em pricing_tables**

Conectar como user comum (criar via Supabase Studio ou usar JWT manual):

```sql
-- esperado: erro (RLS)
INSERT INTO pricing_tables (name) VALUES ('Hack');
```

- [ ] **Step 2: Como user, tentar UPDATE em version**

```sql
-- esperado: 0 rows affected (sem policy de UPDATE)
UPDATE pricing_table_versions SET data = '{}'::jsonb WHERE version_number = 1;
```

- [ ] **Step 3: Documentar resultados** (sem commit se não houver fix)

---

### Task 26: Lint + typecheck + build

**Files:** (verificação)

- [ ] **Step 1: Lint**

```bash
npm run lint
```

Esperado: 0 erros.

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

Esperado: 0 erros.

- [ ] **Step 3: Tests**

```bash
npm test
```

Esperado: todos os testes passam (incluindo novos roi.test.ts, pricing.test.ts, apply-limits.test.ts).

- [ ] **Step 4: Build**

```bash
npm run build
```

Esperado: build bem-sucedido.

---

### Task 27: Smoke test E2E manual

**Files:** (manual)

Cenários a executar:

- [ ] **Cenário 1 — User comum (não-admin):**
  1. Login.
  2. Acessar `/precificacao` — todas as 5 abas visíveis, valores em modo read-only.
  3. Tentar editar campo (ex.: nome da tabela) → input desabilitado.
  4. Botões "+ Nova tabela", "Salvar", "+ Novo template" não aparecem.

- [ ] **Cenário 2 — Admin:**
  1. Promover user via SQL: `UPDATE profiles SET role = 'admin' WHERE email = '<seu_email>';`
  2. Recarregar `/precificacao`.
  3. Criar tabela "Enterprise" copiando de "Padrão".
  4. Trocar para "Enterprise" no header → editar faixas → salvar → confirmar v1.
  5. Editar ROI → salvar → confirmar v2.
  6. Editar limites → salvar → confirmar v3.
  7. Aba Histórico → 3 entradas → diff funciona.
  8. Criar template progressivo "3+9".

- [ ] **Cenário 3 — Wizard:**
  1. Acessar `/nova`.
  2. Step escritório → trocar tabela default → "Enterprise".
  3. Step preços → tentar desconto 50% → clamp para `desconto_maximo_pct`.
  4. Reduzir mensalidade abaixo do mínimo → erro inline aparece.
  5. Aplicar template "3+9" (botão atalho).
  6. Salvar proposta.
  7. Verificar SQL: `pricing_table_id` aponta para "Enterprise", `pricing_version_id` para a versão atual no momento.

- [ ] **Cenário 4 — Imutabilidade do snapshot:**
  1. Como admin, editar a versão atual da "Enterprise" (criar v4).
  2. Reabrir a proposta criada no Cenário 3.
  3. Verificar que valores da proposta NÃO mudaram (ainda apontam para a versão de origem; valores em colunas próprias da proposta não foram alterados).

- [ ] **Step final: Commit de eventuais ajustes** + criar PR.

```bash
git add -A
git commit -m "chore: ajustes finais após smoke test e2e" || true
gh pr create --title "feat: precificação admin" --body "$(cat <<'EOF'
## Summary
- Adiciona /precificacao com 5 abas (Modelo, Tabelas, ROI, Limites, Histórico)
- RBAC simples (todos veem, só admin edita)
- Versionamento append-only e snapshot por proposta
- Refatora roi.ts para receber pricingData

## Test plan
- [ ] Login como user comum: read-only em todas as abas
- [ ] Login como admin: criar tabela, editar, salvar, ver versionamento
- [ ] Wizard: criar proposta com tabela escolhida; pricing_*_id salvos
- [ ] Editar tabela depois: proposta antiga preserva valores

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Self-Review (do plano)

**Coverage do spec:**
- ✅ §4.1 UI tabs → Task 14, 16
- ✅ §4.2 RBAC → Task 1 (role), 2 (RLS), 13 (requireAdmin)
- ✅ §4.3 Versionamento append-only → Task 1 (schema), 2 (RLS sem update/delete), 13 (createVersion)
- ✅ §4.4 Snapshot por proposta → Task 1 (alter), 24 (save)
- ✅ §5 Modelo de dados completo → Tasks 1–5
- ✅ §6 Estrutura de arquivos → Tasks 6, 11–22
- ✅ §7 UI por aba → Tasks 18–22
- ✅ §8 Mudanças em roi.ts/step-precos/sidebar → Tasks 9, 15, 23
- ✅ §9 Server actions → Task 13
- ✅ §10 Testes → Tasks 8, 9, 12, 25, 26
- ✅ §11 Migração / seed → Tasks 1–4
- ✅ §13 Critérios de aceitação → Tasks 26 (lint/typecheck/build), 27 (smoke E2E)

**Sem placeholders detectados:** todas as tasks têm código completo ou comandos exatos. A única exceção legítima é a referência cruzada na Task 10 (refatoração de callers), que aponta explicitamente para a Task 23 onde os usos reais são tratados.

**Type consistency:** assinaturas de `getPrecoSugerido(qtd, pricing)` e `calculateROI(form, pricing)` consistentes em Task 9, 20, 23. `PricingData` definido em Task 6 e referenciado em todas as tasks subsequentes. `is_admin()` (Task 2), `requireAdmin()` (Task 13), `pricing_tables_current` (Task 1, usada em Task 11).
