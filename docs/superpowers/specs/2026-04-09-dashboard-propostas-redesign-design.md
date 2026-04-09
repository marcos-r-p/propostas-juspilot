# Dashboard de Propostas - Redesign

## Objetivo

Redesenhar a pagina de dashboard de propostas (`/dashboard`) para um layout inspirado no painel Almeria, adaptado ao contexto juridico do JusPilot. O novo design segue a estetica editorial do design system (cantos retos, bordas finas, sem sombras, tokens semanticos) e adiciona funcionalidades de acompanhamento: KPIs com subtextos, tabs de status, filtros combinados e acoes por linha.

## Escopo

**Dentro do escopo:**
- Refatorar `PropostaStats` com 4 KPIs adaptados ao JusPilot (Total, Visualizadas, Taxa conversao, Valor aceito) com subtextos explicativos
- Substituir `PropostaFilters` por tabs de status com contagem + busca + dropdowns (tipo, data)
- Refatorar `PropostaTable` com colunas estilo Almeria: REF, Escritorio+Lead (agrupados), Tipo, Data, Valor, Status, Acoes
- 7 acoes por linha: Visualizar, Editar, Copiar link, Download PDF, Duplicar, Enviar, Deletar
- Refatorar a page `dashboard/page.tsx` para fornecer os dados necessarios
- Layout mobile responsivo (cards em vez de tabela)

**Fora do escopo:**
- Sidebar (ja existe, sera refatorada em sub-projeto separado)
- Download PDF real (apenas botao placeholder por enquanto)
- Envio por email/WhatsApp real (apenas botao placeholder)
- Duplicar proposta no backend (apenas UI, action futura)
- Paginacao (manter o .range(0, 19) atual, iterar depois)

## Decisoes de design

### KPI Cards (PropostaStats)

4 cards em grid responsivo (2 cols mobile, 4 cols desktop):

| Card | Label | Valor | Subtexto |
|------|-------|-------|----------|
| 1 | Total propostas | contagem total do mes | "este mes" |
| 2 | Visualizadas | contagem de visualizadas | "{pct}% das enviadas" |
| 3 | Taxa de conversao | aceitas / (publicadas + visualizadas + aceitas + recusadas) | "aceitas / enviadas" |
| 4 | Valor aceito | soma de `preco_mensalidade_final` das aceitas do mes | "acumulado do mes" |

Props:
```typescript
interface PropostaStatsProps {
  total: number;
  visualizadas: number;
  enviadas: number;       // publicadas + visualizadas + aceitas + recusadas
  aceitas: number;
  valorAceito: number;
}
```

Estilo: `border border-rule`, padding 20px, sem border-radius, sem sombra. Label em `text-caption` uppercase. Valor em `text-heading-2` (28px). Subtexto em `text-xs text-whisper`.

### Tabs de Status

Tabs horizontais que substituem o dropdown atual. Cada tab mostra a contagem e filtra a tabela via URL searchParams (server-side).

Tabs: `Todas`, `Publicadas`, `Visualizadas`, `Aceitas`, `Recusadas`

- Tab ativa: `font-weight:600`, `border-bottom:2px solid ink`, contagem com `bg-ink text-paper`
- Tab inativa: `color:mute`, contagem com `bg-rule-soft`
- Mapeamento para query: tab "Todas" remove param status; outras setam `?status={valor}`

### Filtros combinados

Abaixo das tabs, uma row com 3 filtros:

1. **Busca** -- input underline, placeholder "Buscar por escritorio ou lead...", debounce 400ms, atualiza `?search=`
2. **Tipo** -- select underline, options baseadas nos tipos existentes no banco (por enquanto hardcoded: "Todos os tipos", "Implantacao IA", "Consultoria", "Diagnostico"). Atualiza `?tipo=`
3. **Data** -- select underline, options: "Qualquer data", "Ultimo mes", "Ultimos 3 meses", "Ultimos 6 meses". Atualiza `?periodo=`

Todos os filtros sao client-side components que atualizam searchParams. O server component da page le esses params e filtra a query Supabase.

### Tabela (PropostaTable)

**Colunas desktop:**

| Coluna | Campo | Largura | Notas |
|--------|-------|---------|-------|
| REF | `slug` formatado como JP-YYYY-NNNN | 140px | `font-weight:600`, `font-size:12px` |
| Escritorio | `escritorio_nome` + `lead_nome` abaixo | 2fr | Nome em font-weight:500, lead em text-mute font-size:12px |
| Tipo | derivado das areas/perfil (por enquanto placeholder) | 1fr | Texto simples |
| Data | `created_at` formatado DD/MM/YYYY | 100px | `text-mute` |
| Valor | `preco_mensalidade_final` formatado | 110px | `font-weight:500` |
| Status | badge monocromatico | 110px | Usa componente Badge existente |
| Acoes | 7 icon buttons | 220px | Flex row, gap:4px |

**Grid template:** `grid-cols-[140px_2fr_1fr_100px_110px_110px_220px]`

**Coluna REF -- formato:**
O slug ja existe no banco (ex: `abc123`). Para exibir como referencia, usamos um helper:
```typescript
function formatRef(slug: string, createdAt: string): string {
  // Formato: JP-YYYY-SLUG (primeiros 4 chars do slug uppercase)
  const year = new Date(createdAt).getFullYear();
  return `JP-${year}-${slug.slice(0, 4).toUpperCase()}`;
}
```
Nota: se no futuro quisermos um numero sequencial, precisamos de um campo `ref_number` no banco. Por enquanto, usamos o slug.

**Coluna Tipo:**
Nao existe um campo "tipo de proposta" no banco atualmente. Opcoes:
- **MVP (escolhido):** Derivar do campo `escritorio_perfil` ("massa" -> "Volume", "boutique" -> "Boutique", "misto" -> "Misto") como placeholder ate criar um campo dedicado
- Futuro: adicionar campo `tipo_proposta` ao schema

**Mobile:** Cards empilhados com informacoes condensadas (REF + Escritorio + Lead + Valor + Status + botao de acoes em menu dropdown).

### Acoes por linha

7 acoes, cada uma como icon button (30x30px, transparent bg, hover bg-rule-soft):

| Acao | Icone | Comportamento |
|------|-------|---------------|
| Visualizar | Eye | `router.push(/proposta/{id}/preview)` |
| Editar | Pencil | `router.push(/proposta/{id})` ou `/nova?edit={id}` |
| Copiar link | Link | Copiar `{origin}/p/{slug}` para clipboard, toast de confirmacao |
| Download PDF | Download | Placeholder: toast "Em breve" |
| Duplicar | Copy | Placeholder: toast "Em breve" |
| Enviar | Send | Placeholder: toast "Em breve" |
| Deletar | Trash | Dialog de confirmacao -> DELETE via server action |

Icones: SVG inline, 15x15px, stroke-based. Deletar tem hover vermelho (`text-danger`).

### Badges de status

Usa o componente `Badge` existente com o mapeamento monocromatico do design system:

| Status | Estilo |
|--------|--------|
| rascunho | `bg-rule-soft text-graphite` |
| publicada | `bg-rule text-ink` |
| visualizada | `bg-ink text-paper` |
| aceita | `bg-ink text-paper` + `border-left:3px solid green-600` |
| recusada | `bg-rule-soft text-mute` + `line-through` |
| expirada | `bg-rule-soft text-whisper` |

## Arquitetura de componentes

```
src/app/(dashboard)/dashboard/page.tsx          -- Server component, queries
src/components/propostas/proposta-stats.tsx      -- KPI cards (server)
src/components/propostas/proposta-tabs.tsx       -- NEW: Status tabs (client)
src/components/propostas/proposta-filters.tsx    -- Refactor: busca + tipo + data (client)
src/components/propostas/proposta-table.tsx      -- Refactor: nova estrutura de colunas (server)
src/components/propostas/proposta-actions.tsx    -- NEW: Row actions (client)
src/lib/utils/format.ts                         -- formatRef helper adicionado
```

### Data flow

1. `page.tsx` (server) le searchParams: `status`, `search`, `tipo`, `periodo`
2. Faz queries Supabase para stats (contagens por status, soma valor aceitas) e lista filtrada
3. Passa dados para componentes filhos
4. `proposta-tabs.tsx` e `proposta-filters.tsx` (client) atualizam searchParams via `router.push`
5. `proposta-table.tsx` (server) renderiza a tabela com dados recebidos via props
6. `proposta-actions.tsx` (client) renderiza icon buttons com handlers (clipboard, navigation, server actions)

### Query changes em page.tsx

```typescript
// Stats queries
const now = new Date();
const mesInicio = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

const { count: total } = await supabase.from('propostas').select('*', { count: 'exact', head: true }).gte('created_at', mesInicio);
const { count: publicadas } = await supabase.from('propostas').select('*', { count: 'exact', head: true }).eq('status', 'publicada');
const { count: visualizadas } = await supabase.from('propostas').select('*', { count: 'exact', head: true }).eq('status', 'visualizada');
const { count: aceitas } = await supabase.from('propostas').select('*', { count: 'exact', head: true }).eq('status', 'aceita');
const { count: recusadas } = await supabase.from('propostas').select('*', { count: 'exact', head: true }).eq('status', 'recusada');

// Valor aceito (soma)
const { data: aceitasData } = await supabase.from('propostas').select('preco_mensalidade_final').eq('status', 'aceita').gte('created_at', mesInicio);
const valorAceito = (aceitasData || []).reduce((sum, p) => sum + (p.preco_mensalidade_final || 0), 0);

// Enviadas = publicadas + visualizadas + aceitas + recusadas
const enviadas = (publicadas || 0) + (visualizadas || 0) + (aceitas || 0) + (recusadas || 0);

// Lista com filtros adicionais
let query = supabase.from('propostas').select('*').order('created_at', { ascending: false }).range(0, 19);
if (params.status && params.status !== 'all') query = query.eq('status', params.status);
if (params.search) query = query.or(`escritorio_nome.ilike.%${params.search}%,lead_nome.ilike.%${params.search}%`);
if (params.tipo) query = query.eq('escritorio_perfil', params.tipo);
if (params.periodo) {
  const periodoMap: Record<string, number> = { '1m': 1, '3m': 3, '6m': 6 };
  const meses = periodoMap[params.periodo];
  if (meses) {
    const desde = new Date();
    desde.setMonth(desde.getMonth() - meses);
    query = query.gte('created_at', desde.toISOString());
  }
}
```

### Server action para deletar

```typescript
// src/lib/actions/propostas.ts (adicionar)
'use server';

export async function deleteProposta(id: string) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Nao autorizado');

  const { error } = await supabase.from('propostas').delete().eq('id', id).eq('created_by', user.id);
  if (error) throw new Error('Erro ao deletar proposta');

  revalidatePath('/dashboard');
}
```

## Estilo visual

Toda a pagina segue os tokens do design system:
- Cores: `ink`, `graphite`, `mute`, `whisper`, `rule`, `rule-soft`, `paper`, `danger`
- Tipografia: classes `text-caption`, `text-heading-2`, `text-body-sm`
- Bordas: `border-rule` (1px solid), sem border-radius
- Sem sombras, sem gradientes
- Hover states sutis: `bg-rule-soft`
- Icones: SVG stroke-based, 15-16px

## Responsividade

- **Desktop (md+):** Layout completo com tabela, todas as colunas visiveis
- **Tablet (sm-md):** Tabela com scroll horizontal ou colunas priorizadas
- **Mobile (<sm):** Cards empilhados com info condensada. Acoes via menu "..." que abre dropdown. Stats em 2 colunas. Tabs com scroll horizontal.
