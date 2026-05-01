# Precificação Admin — Design Spec

**Data:** 2026-05-01
**Status:** Draft (aguardando review do usuário)
**Autor:** Marcos Roberto Pereira (com Claude Code)
**Projeto:** propostas-juspilot

---

## 1. Contexto e motivação

Hoje a precificação das propostas Juspilot está **hardcoded** em [`src/lib/utils/roi.ts`](../../../src/lib/utils/roi.ts) e replicada na função PL/pgSQL `calculate_roi()` em [`supabase/migrations/001_initial_schema.sql:151`](../../../supabase/migrations/001_initial_schema.sql).

Qualquer ajuste de valores hoje exige edição de código + deploy + migration manual. Não há:

- Visibilidade do modelo para usuários internos (vendedores não sabem por que o sistema sugere um preço).
- Flexibilidade comercial (não dá para criar tabela "Enterprise" diferente da "Padrão").
- Auditoria (não se sabe quem mudou o quê e quando).
- Controle de risco (vendedor pode aplicar desconto de 90% — nada impede).

Esta spec define a feature **Precificação Admin**: uma área dentro do sistema onde administradores podem visualizar, documentar e configurar o modelo de precificação, mantendo histórico de alterações.

## 2. Objetivos

1. **Documentar o modelo de precificação** dentro do próprio sistema (aba "Modelo") para que vendedores entendam como o preço sugerido é calculado.
2. **Tornar parâmetros configuráveis sem deploy** — tabela de preços por porte, parâmetros de ROI, limites comerciais, templates de faixas progressivas.
3. **Permitir múltiplas tabelas comerciais** (ex.: Padrão, Enterprise, Parceiro) com uma marcada como default.
4. **Versionar mudanças** automaticamente (cada edição cria nova versão imutável; histórico fica auditável).
5. **Aplicar limites comerciais** (cap de desconto, piso de mensalidade) para proteger margem.
6. **Não quebrar nada** — propostas existentes continuam funcionando idênticas; comportamento default reproduz a tabela atual byte-a-byte.

## 3. Não-objetivos (fora do escopo desta spec)

- Mostrar "como o preço foi calculado" para o cliente final na página pública da proposta. *(Pode ser evolução posterior.)*
- Aprovar mudanças com workflow (ex.: PR-style review). *(Admin edita direto.)*
- Restaurar uma versão antiga com 1 clique. *(Admin pode reaplicar valores manualmente; histórico é só leitura no v1.)*
- Vigência agendada (ex.: "esta tabela entra em vigor dia X"). *(Foi descartado durante o brainstorm — modelo b escolhido.)*
- Multi-tenancy (cada escritório com sua tabela). *(Sistema é mono-tenant.)*

## 4. Decisões de design

### 4.1 UI — abas em página única

Rota nova `/precificacao` no menu lateral. Página com 5 abas:

1. **Modelo** — descrição educativa do funcionamento (texto conceitual fixo, números exemplificados puxados da tabela selecionada).
2. **Tabelas comerciais** — CRUD das tabelas (Padrão, Enterprise…).
3. **ROI** — parâmetros de cálculo de ROI.
4. **Limites e padrões** — cap de desconto, piso de mensalidade, validade, reajuste, templates progressivos.
5. **Histórico** — versões e auditoria.

**Por quê:** equilibra foco (cada bloco isolado) com fluidez (sem recarga de rota a cada mudança); a aba "Modelo" cobre o requisito da sessão descritiva sem precisar de página separada.

### 4.2 Permissões — RBAC simples

Todos os usuários autenticados **veem** a página em modo read-only. Apenas usuários com `profiles.role = 'admin'` **editam**. Validação dupla: front esconde controles + server actions e RLS rejeitam no servidor.

### 4.3 Versionamento implícito

Cada edição de uma tabela gera uma nova linha em `pricing_table_versions` (append-only). Versões são imutáveis (não há UPDATE/DELETE). Propostas referenciam a versão usada para auditoria, mas mantêm um snapshot dos valores em colunas próprias — mudanças em tabelas **nunca afetam propostas existentes**.

### 4.4 Snapshot na proposta

Os campos `preco_setup`, `preco_mensalidade`, `desconto`, `preco_faixas` da tabela `propostas` continuam sendo **a fonte da verdade** para cada proposta. Adicionamos `pricing_table_id` e `pricing_version_id` apenas como rastros de auditoria.

## 5. Modelo de dados

### 5.1 Migration `003_pricing_admin.sql`

```sql
-- 5.1.1 Adicionar role em profiles
ALTER TABLE profiles
  ADD COLUMN role text NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));

-- 5.1.2 Tabelas comerciais (Padrão, Enterprise, Parceiro…)
CREATE TABLE pricing_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Garantir que apenas uma tabela é default
CREATE UNIQUE INDEX pricing_tables_one_default
  ON pricing_tables ((1)) WHERE is_default = true;

-- 5.1.3 Versões imutáveis (append-only)
CREATE TABLE pricing_table_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id uuid NOT NULL REFERENCES pricing_tables(id) ON DELETE CASCADE,
  version_number int NOT NULL,
  data jsonb NOT NULL,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(table_id, version_number)
);

-- 5.1.4 Templates de faixas progressivas (entidade global)
CREATE TABLE progressive_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  faixas jsonb NOT NULL,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5.1.5 View: versão atual de cada tabela
CREATE VIEW pricing_tables_current AS
SELECT pt.*,
       ptv.id AS current_version_id,
       ptv.version_number,
       ptv.data,
       ptv.created_at AS version_created_at,
       ptv.created_by AS version_created_by
FROM pricing_tables pt
JOIN LATERAL (
  SELECT * FROM pricing_table_versions
  WHERE table_id = pt.id
  ORDER BY version_number DESC
  LIMIT 1
) ptv ON true;

-- 5.1.6 Snapshot de auditoria em propostas
ALTER TABLE propostas
  ADD COLUMN pricing_table_id uuid REFERENCES pricing_tables(id),
  ADD COLUMN pricing_version_id uuid REFERENCES pricing_table_versions(id);
```

### 5.2 Schema do JSONB `pricing_table_versions.data`

```jsonc
{
  "faixas_porte": [
    { "min": 1,  "max": 3,    "setup": 2000, "mensalidade": 1500 },
    { "min": 4,  "max": 10,   "setup": 3500, "mensalidade": 3000 },
    { "min": 11, "max": 20,   "setup": 5000, "mensalidade": 5000 },
    { "min": 21, "max": null, "setup": 8000, "mensalidade": 8000,
      "incremento_por_dezena_advogados": 1000 }
  ],
  "roi": {
    "horas_mensais": 176,
    "atividades_ia_por_perfil": {
      "boutique": 0.30,
      "misto":    0.40,
      "massa":    0.50
    },
    "taxa_reducao_por_maturidade": {
      "nunca":         0.60,
      "iniciante":     0.50,
      "intermediario": 0.45,
      "avancado":      0.40
    }
  },
  "limites": {
    "desconto_maximo_pct":       30,
    "mensalidade_minima":      1000,
    "validade_proposta_dias":    30,
    "reajuste_anual_pct":         8
  }
}
```

### 5.3 Schema do JSONB `progressive_templates.faixas`

```jsonc
[
  { "mes_inicio": 1, "mes_fim": 3,    "valor": 1500 },
  { "mes_inicio": 4, "mes_fim": null, "valor": 3000 }
]
```

### 5.4 RLS

| Tabela | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| `pricing_tables` | authenticated | admin | admin | admin |
| `pricing_table_versions` | authenticated | admin | nunca | nunca |
| `progressive_templates` | authenticated | admin | admin | admin |
| `propostas` | (existente) | (existente) | (existente) | (existente) |

Helper SQL para checar admin (já que `auth.role()` do Supabase é diferente de `profiles.role`):

```sql
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;
```

`SET search_path = public` evita injeção de função maliciosa via search_path em `SECURITY DEFINER`.

### 5.5 Seed

A migration insere a tabela 'Padrão' com versão 1 contendo **exatamente o JSON da seção 5.2** (que reproduz os valores hardcoded em `roi.ts` byte-a-byte):

```sql
INSERT INTO pricing_tables (name, description, is_default, is_active)
VALUES ('Padrão', 'Tabela comercial padrão Juspilot', true, true);

INSERT INTO pricing_table_versions (table_id, version_number, data, created_by)
SELECT id, 1, $${...JSON da seção 5.2...}$$::jsonb, NULL
FROM pricing_tables WHERE name = 'Padrão';
```

(Plano de implementação detalhará o JSON literal completo a partir dos valores atuais de [`src/lib/utils/roi.ts:94`](../../../src/lib/utils/roi.ts#L94).)

## 6. Estrutura de arquivos (front)

```
src/app/(dashboard)/precificacao/
├── page.tsx                    # Server component — fetch + role check
├── precificacao-client.tsx     # Client component com Tabs
├── tabs/
│   ├── modelo-tab.tsx
│   ├── tabelas-tab.tsx
│   ├── roi-tab.tsx
│   ├── limites-tab.tsx
│   └── historico-tab.tsx
├── components/
│   ├── tabela-selector.tsx     # dropdown no header
│   ├── faixas-porte-editor.tsx
│   ├── progressive-template-editor.tsx
│   └── version-diff.tsx
└── actions.ts                  # server actions

src/lib/pricing/
├── types.ts                    # PricingData, PricingTable, etc.
├── load.ts                     # loadPricingData(tableId?), loadDefaultPricingData()
├── validate.ts                 # Zod schemas
└── apply-limits.ts             # validações de cap/piso

src/lib/validations/pricing.ts  # Zod schemas reutilizáveis
src/types/database.ts           # tipos TypeScript atualizados
```

## 7. UI por aba

### 7.1 Header da página

- Título "Precificação".
- Seletor de tabela ativa (dropdown com `pricing_tables` ativas).
- Badge "v3 · editado por Marcos · 12/04/2026".
- Botão "Nova tabela" (admin) abre modal.

### 7.2 Aba Modelo

Conteúdo conceitual (texto explicativo) é **fixo** — descreve o como-funciona independente de valores. Os **valores numéricos exibidos como exemplo** (faixas, percentuais, fórmulas concretas) puxam da tabela selecionada no header, refletindo a versão atual.

- Heading "Como o Juspilot precifica propostas".
- Diagrama em SVG/CSS: `Porte → Tabela base → Desconto/Faixas → Mensalidade final → ROI`.
- Caixas explicando cada etapa com fórmulas legíveis. Onde aparece um número, é injetado a partir da versão atual da tabela selecionada (ex.: "176 horas/mês" vem de `data.roi.horas_mensais`).
- Glossário (perfil massa/misto/boutique, maturidade IA, incremento por dezena).
- Link "Editar parâmetros" → muda para a aba correspondente.

### 7.3 Aba Tabelas comerciais

- Lista de tabelas com nome, descrição, status, badge "default", versão atual.
- Botão "+ Nova tabela" (admin) → modal: nome, descrição, copiar de tabela existente.
- Editor de faixas de porte: tabela `min adv. | max adv. | setup R$ | mensalidade R$ | incremento/10 adv.` com adicionar/remover/reordenar.
- Validação: faixas contínuas e sem sobreposição.
- Salvar → cria nova `pricing_table_versions`.

### 7.4 Aba ROI

- Inputs: horas/mês, % atividades IA por perfil (3), taxa de redução por maturidade (4).
- Painel "Simulação ao vivo": digite N adv. + valor/hora → ROI calculado com valores em edição.
- Salvar → cria nova versão.

### 7.5 Aba Limites e padrões

- Limites globais da tabela: desconto máx. (%), mensalidade mínima (R$), validade padrão (dias), reajuste anual (%).
- Lista de templates progressivos (entidade global, não por tabela): nome + preview + botões editar/excluir.
- Editor de template: linhas de faixa (mês_inicio, mês_fim, valor).

### 7.6 Aba Histórico

- Tabela cronológica das versões da tabela selecionada: versão | data | editor | resumo.
- Clicar abre modal com diff lado a lado (antes → depois) dos campos alterados.
- Sem botão "restaurar" no v1.

## 8. Mudanças em código existente

### 8.1 [`src/lib/utils/roi.ts`](../../../src/lib/utils/roi.ts)

Mudar assinatura de `getPrecoSugerido()` e `calculateROI()` para receber `pricingData: PricingData` como argumento. Funções viram puras, sem leitura de constantes globais.

### 8.2 [`src/components/wizard/step-precos.tsx`](../../../src/components/wizard/step-precos.tsx)

- Receber `pricingData` via props (vindo do server component pai).
- Aplicar limites no front: desconto com `max={limites.desconto_maximo_pct}`, mensalidade com validação inline ≥ `limites.mensalidade_minima`.
- Renderizar dropdown de tabela comercial no início (pré-selecionada com a `is_default=true`; trocar recarrega `pricingData` e **reseta** os valores sugeridos do step para os da nova tabela; valores manualmente editados pelo vendedor são descartados ao trocar — exibir confirmação se houve edição manual).
- Botões "Aplicar template progressivo" listando `progressive_templates`.

### 8.3 [`src/lib/validations/proposta.ts`](../../../src/lib/validations/proposta.ts)

Adicionar campos opcionais: `pricing_table_id`, `pricing_version_id`. Validações de limite movem para `apply-limits.ts` (precisam de contexto da tabela ativa).

### 8.4 [`src/components/layout/sidebar.tsx`](../../../src/components/layout/sidebar.tsx)

Adicionar item entre "Nova Proposta" e "Configurações":

```tsx
{ href: '/precificacao', label: 'Precificação', icon: '💰' }
```

### 8.5 PL/pgSQL `calculate_roi()`

Atualizar para aceitar `data jsonb` como argumento. Quando chamada a partir do contexto de uma proposta, deve receber **o JSONB da versão referenciada por `propostas.pricing_version_id`** (assim a função reflete o snapshot da proposta, nunca a tabela atual). Fallback (sem argumento): ler versão atual da tabela `is_default=true`.

## 9. Server actions

```
src/app/(dashboard)/precificacao/actions.ts

createTable(input)              → admin only, INSERT pricing_tables + version 1
updateTable(id, input)          → admin only, UPDATE metadados (nome, descrição, ativo, default)
createVersion(tableId, data)    → admin only, INSERT pricing_table_versions (incrementa version_number)
setDefaultTable(id)             → admin only, transação que zera is_default das outras e seta nesta
deleteTable(id)                 → admin only, soft delete via is_active=false (não DELETE)
createProgressiveTemplate(input)→ admin only
updateProgressiveTemplate(...)  → admin only
deleteProgressiveTemplate(id)   → admin only
```

Cada action valida `role === 'admin'` no servidor antes de qualquer mutação. Falha → erro retornado ao cliente.

## 10. Testes

### 10.1 Unit (vitest)

- `src/lib/utils/roi.test.ts` — atualizar para passar `pricingData` mocked. Casos: cada faixa de porte, cada perfil, cada maturidade, edge cases (0 adv, exatamente no limite de faixa, > 100 adv).
- `src/lib/validations/pricing.test.ts` — Zod schemas. Casos: faixas sobrepostas, faixas com gap, percentuais > 100, valores negativos, reajuste > 100%.
- `src/lib/pricing/apply-limits.test.ts` — funções `clampDesconto()` e `validateMensalidadeMinima()`. Casos boundary.

### 10.2 Server actions

- `actions.test.ts` — mock supabase: admin pode, user comum recebe erro. Versionamento incrementa corretamente. `setDefaultTable` atomicamente troca o flag.

### 10.3 RLS (integration)

- User comum tenta INSERT em `pricing_tables` → bloqueado.
- Admin INSERT → permitido.
- Qualquer um tenta UPDATE em `pricing_table_versions` → bloqueado (append-only).
- Qualquer um tenta DELETE em `pricing_table_versions` → bloqueado.

### 10.4 E2E (manual)

- Login como admin → criar tabela "Enterprise" → editar → ver v1 e v2 no histórico.
- Login como user comum → entrar em `/precificacao` → todas as abas visíveis, edições bloqueadas.
- Criar proposta → verificar `pricing_table_id` e `pricing_version_id` preenchidos.
- Editar tabela depois → verificar que proposta antiga continua com valores originais.

## 11. Estratégia de migração e deploy

### 11.1 Ordem da migration `003_pricing_admin.sql` (transacional)

1. `ALTER profiles ADD role` (default `'user'`).
2. CREATE de `pricing_tables`, `pricing_table_versions`, `progressive_templates`, view `pricing_tables_current`.
3. CREATE FUNCTION `is_admin()`.
4. RLS policies em todas as novas tabelas.
5. `ALTER propostas` adicionando `pricing_table_id` e `pricing_version_id` (nullable).
6. INSERT de seed: `pricing_tables` ('Padrão', default) + `pricing_table_versions` (v1) com valores atuais.
7. Atualizar função PL/pgSQL `calculate_roi()` para aceitar `data jsonb` opcional com fallback.

Pós-migration manual (documentado): promover usuário fundador a admin via SQL.

### 11.2 Rollback

Migration reversa documentada: drop tables, drop columns, revert role check. Como `pricing_table_id` é nullable e propostas existentes têm valor próprio em `preco_*`, rollback é seguro.

### 11.3 Deploy

Sem feature flag. Seed reproduz comportamento atual byte-a-byte; usuários não percebem diferença até admin editar.

## 12. Riscos e mitigações

| Risco | Mitigação |
|-------|-----------|
| `roi.ts` ainda chamado sem `pricingData` em algum lugar | Mudar assinatura para argumento obrigatório (TypeScript pega no compile-time) + fallback na PL/pgSQL |
| Admin remove tabela default acidentalmente | Constraint `pricing_tables_one_default` + `deleteTable` faz soft delete e bloqueia se for default |
| Vendedor cria proposta enquanto admin edita tabela | Snapshot na proposta isola; se mudou no meio do wizard, recarregar `pricingData` mantém última versão consistente |
| Drift entre TS e PL/pgSQL no cálculo | Versão única no JSONB; PL/pgSQL lê o mesmo `data`; testes E2E comparam resultado |

## 13. Critérios de aceitação

- [ ] Migration `003` aplicada com sucesso em ambiente novo + ambiente com propostas existentes.
- [ ] Tabela 'Padrão' criada com seed que reproduz `getPrecoSugerido()` e `calculateROI()` atuais byte-a-byte.
- [ ] Item 'Precificação' aparece no sidebar entre 'Nova Proposta' e 'Configurações'.
- [ ] As 5 abas funcionam: Modelo, Tabelas, ROI, Limites, Histórico.
- [ ] Usuário com `role = 'user'` vê todas as abas mas não consegue editar (UI esconde + servidor rejeita).
- [ ] Usuário com `role = 'admin'` cria nova tabela, edita, vê nova versão no histórico.
- [ ] Cap de desconto bloqueia ultrapassagem no wizard.
- [ ] Mensalidade mínima validada no wizard.
- [ ] Templates progressivos aparecem como atalho no `step-precos`.
- [ ] Proposta nova armazena `pricing_table_id` e `pricing_version_id`.
- [ ] Editar tabela depois de criada uma proposta não altera os valores da proposta.
- [ ] Todos os testes unit/integration passam.
- [ ] `npm run lint` e `npm run typecheck` (`tsc --noEmit`) sem erros.

## 14. Próximos passos

1. Usuário revisa este spec.
2. Após aprovação, criar plano de implementação detalhado em `docs/superpowers/plans/2026-05-01-precificacao-admin-plan.md` (via skill `writing-plans`).
3. Executar plano (separar em fases pequenas; cada fase termina com testes verdes).
