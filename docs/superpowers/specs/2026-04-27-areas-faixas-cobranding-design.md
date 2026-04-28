# Spec: Areas Expandidas + Faixas de Preco + Co-branding

**Data:** 2026-04-27
**Projeto:** propostas-juspilot

---

## 1. Areas de Atuacao Expandidas

### Problema
O sistema tem 12 areas de atuacao. Faltam ramos importantes como Direito Publico, Regulatorio, Aeronautico, Eleitoral, Maritimo, entre outros.

### Solucao
Expandir para ~30 areas organizadas em 8 grupos.

### Grupos e Areas

| Grupo | Areas |
|-------|-------|
| Contencioso | Civel, Trabalhista, Criminal, Consumidor, Familia e Sucessoes |
| Empresarial | Empresarial/Societario, Bancario, Tributario, Recuperacao Judicial e Falencias, Startups e Venture Capital, Compliance e Governanca |
| Publico e Regulatorio | Direito Publico, Administrativo, Regulatorio, Licitacoes e Contratos Administrativos, Eleitoral, Constitucional |
| Especializado | Aeronautico, Maritimo, Desportivo, Minerario, Agronegocio |
| Propriedade e Patrimonio | Imobiliario, Propriedade Intelectual, Ambiental |
| Social e Previdenciario | Previdenciario, Saude e Planos de Saude |
| Digital e Tecnologia | Protecao de Dados (LGPD), Direito Digital, Contencioso Estrategico e Arbitragem |
| Internacional | Direito Internacional, Comercio Exterior |

### Mudancas necessarias

**`src/types/database.ts`** — Expandir o type `AreaAtuacao` com todos os novos valores.

**`src/lib/constants/areas.ts`** — Reestruturar para incluir grupos:
```ts
interface AreaGroup {
  group: string;
  areas: { value: AreaAtuacao; label: string }[];
}
export const AREAS_ATUACAO_GROUPED: AreaGroup[] = [...]
// Manter export flat para compatibilidade
export const AREAS_ATUACAO = AREAS_ATUACAO_GROUPED.flatMap(g => g.areas)
```

**`src/components/wizard/step-perfil.tsx`** — Renderizar checkboxes agrupadas por categoria, com headers colapsaveis (accordion).

**Banco de dados:** Nenhuma migration necessaria. `escritorio_areas TEXT[]` aceita qualquer string.

---

## 2. Precificacao com Faixas Flexiveis

### Problema
Hoje so existe um valor unico de mensalidade. O comercial precisa oferecer propostas com valor promocional nos primeiros meses (ex: 3 meses a R$1.500, depois R$3.000).

### Solucao
Permitir multiplas faixas de preco temporais, com timeline visual na proposta publica.

### Modelo de Dados

**Nova coluna na tabela `propostas`:**
```sql
ALTER TABLE propostas ADD COLUMN preco_faixas JSONB DEFAULT NULL;
```

**Formato JSONB:**
```json
[
  { "de_mes": 1, "ate_mes": 3, "valor": 1500 },
  { "de_mes": 4, "ate_mes": 6, "valor": 2500 },
  { "de_mes": 7, "ate_mes": null, "valor": 3000 }
]
```

- `ate_mes: null` = permanente (obrigatorio na ultima faixa)
- Maximo 5 faixas
- Quando `preco_faixas` e `null`, comportamento atual (valor unico)

### Wizard (step-precos)

- Toggle "Precificacao por faixas" (desligado por padrão)
- Quando ligado: lista editavel de faixas com campos (mes inicio, mes fim ou "em diante", valor)
- Botao "+ Adicionar faixa" (max 5)
- Ultima faixa sempre tem ate_mes = null
- `preco_mensalidade` recebe o valor da ultima faixa (compatibilidade com ROI e listagens)
- ROI calcula com media ponderada dos primeiros 12 meses

### Proposta Publica (pricing-section)

**Com faixas:** Timeline visual integrada na secao de investimento:
- Steps mostrando cada faixa com valor e periodo
- Valor menor destacado como "Comece pagando X/mes"
- Badge "Economia de R$X nos primeiros Y meses"

**Sem faixas:** Layout atual inalterado.

### Mudancas necessarias

**`supabase/migrations/002_preco_faixas.sql`** — ALTER TABLE add column.

**`src/types/database.ts`:**
- Adicionar interface `PrecoFaixa { de_mes: number; ate_mes: number | null; valor: number }`
- Adicionar `preco_faixas?: PrecoFaixa[] | null` em `Proposta` e `PropostaFormData`

**`src/stores/wizard-store.ts`** — Adicionar `preco_faixas: null` ao initial state.

**`src/components/wizard/step-precos.tsx`** — Toggle + editor de faixas.

**`src/components/proposta-publica/pricing-section.tsx`** — Timeline visual condicional.

**`src/lib/utils/roi.ts`** — Ajustar calculo para media ponderada quando tem faixas.

**`src/app/api/propostas/route.ts`** — Incluir `preco_faixas` no insert.

**`src/app/api/propostas/[id]/route.ts`** — Incluir `preco_faixas` no update.

---

## 3. Scraping de Logo e Co-branding

### Problema
As propostas sao genericas visualmente. Incluir a logo do escritorio cria uma experiencia personalizada e aumenta a percepcao de valor.

### Solucao
Campo de URL do site no wizard. O sistema extrai a logo automaticamente. A proposta publica exibe a logo do escritorio no header (co-branding), com JusPilot discreto no footer.

### Modelo de Dados

**Novas colunas na tabela `propostas`:**
```sql
ALTER TABLE propostas ADD COLUMN escritorio_site_url TEXT DEFAULT NULL;
ALTER TABLE propostas ADD COLUMN escritorio_logo_url TEXT DEFAULT NULL;
```

**Supabase Storage:** Bucket `escritorio-logos` (publico, max 2MB, tipos: png/jpg/svg/webp/ico).

### API Route: POST /api/scrape-logo

**Input:** `{ url: string }`

**Processo:**
1. Fetch do HTML da URL (server-side, timeout 10s)
2. Extrai logo por prioridade:
   - `<link rel="icon" type="image/png">` ou `<link rel="icon" type="image/svg+xml">`
   - `<meta property="og:image">`
   - Primeira `<img>` dentro de `<header>` ou `<nav>`
3. Faz download da imagem
4. Upload para Supabase Storage (`escritorio-logos/{proposta_slug}.{ext}`)
5. Retorna `{ logo_url: string }`

**Erros:** Retorna `{ error: string }` com mensagem amigavel. Frontend oferece upload manual como fallback.

### Wizard (step-escritorio)

- Novo campo "Site do escritorio" (URL, opcional)
- OnBlur: chama `/api/scrape-logo`, mostra loading spinner
- Sucesso: preview da logo com botao "Remover"
- Falha: mensagem + botao "Fazer upload manual" (input file)
- Upload manual: envia direto para Supabase Storage via client
- Preview da logo sempre visivel quando `escritorio_logo_url` estiver preenchido

### Proposta Publica (co-branding)

**Com logo (`escritorio_logo_url` preenchido):**
- **Header:** Logo do escritorio (img, max-h 40px) + nome do escritorio. Sem logo JusPilot.
- **Footer:** "Powered by Juspilot" com icone "J" laranja pequeno (24x24) + texto discreto em cinza.

**Sem logo:**
- Layout atual mantido (logo JusPilot no header).

### Mudancas necessarias

**`supabase/migrations/002_preco_faixas.sql`** — Incluir os ALTER TABLE de site_url e logo_url na mesma migration.

**`src/types/database.ts`** — Adicionar `escritorio_site_url?: string` e `escritorio_logo_url?: string` em Proposta e PropostaFormData.

**`src/stores/wizard-store.ts`** — Adicionar campos ao initial state.

**`src/components/wizard/step-escritorio.tsx`** — Campo URL + preview logo + upload manual.

**`src/app/api/scrape-logo/route.ts`** — Nova API route.

**`src/components/proposta-publica/header.tsx`** — Logica condicional co-branding.

**`src/components/proposta-publica/footer.tsx`** — "Powered by Juspilot" quando co-branding ativo.

**`src/app/api/propostas/route.ts`** — Incluir novos campos no insert.

**`src/app/api/propostas/[id]/route.ts`** — Incluir novos campos no update.

---

## Resumo de Arquivos Impactados

| Arquivo | Motivo |
|---------|--------|
| `supabase/migrations/002_preco_faixas.sql` | Nova migration (faixas + logo) |
| `src/types/database.ts` | Novos types e campos |
| `src/lib/constants/areas.ts` | Areas expandidas + agrupadas |
| `src/stores/wizard-store.ts` | Novos campos no form |
| `src/components/wizard/step-escritorio.tsx` | Campo URL + logo preview |
| `src/components/wizard/step-perfil.tsx` | Checkboxes agrupadas |
| `src/components/wizard/step-precos.tsx` | Toggle faixas + editor |
| `src/lib/utils/roi.ts` | ROI com media ponderada |
| `src/app/api/scrape-logo/route.ts` | Nova route (scraping) |
| `src/app/api/propostas/route.ts` | Novos campos no insert |
| `src/app/api/propostas/[id]/route.ts` | Novos campos no update |
| `src/components/proposta-publica/header.tsx` | Co-branding condicional |
| `src/components/proposta-publica/footer.tsx` | Powered by Juspilot |
| `src/components/proposta-publica/pricing-section.tsx` | Timeline faixas |

## Fora de Escopo
- Editar proposta ja criada (apenas novas propostas)
- Extrair cores do site do escritorio
- Extrair informacoes textuais do site
- Alteracoes no dashboard/listagem de propostas
