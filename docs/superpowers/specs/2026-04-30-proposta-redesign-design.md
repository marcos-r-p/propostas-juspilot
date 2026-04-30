# Redesign do Gerador de Propostas JusPilot

**Data:** 2026-04-30
**Abordagem:** C — Component Redesign + Adaptive Template Engine
**Status:** Aprovado pelo usuário

---

## 1. Adaptive Profile System

### PropostaProfile

Derivado automaticamente dos dados do wizard. Nenhum campo extra no banco — é computado no runtime.

```ts
type PropostaProfileId =
  | 'boutique_publico'
  | 'boutique_empresarial'
  | 'boutique_criminal'
  | 'contencioso_massa'
  | 'misto';

interface PropostaProfile {
  id: PropostaProfileId;
  font: { heading: string; body: string };
  tone: 'consultivo' | 'tecnico' | 'executivo';
  heroHeadline: string;
  diagnosticoTitle: string;
  roiTitle: string;
  featuresTitle: string;
  pricingTitle: string;
  timelineTitle: string;
  ctaLabel: string;
  sectionOrder: string[];
}
```

### Regras de derivação

| Condição | Perfil |
|----------|--------|
| `qtd_advogados <= 15` AND areas inclui direito_publico/administrativo/licitacoes | `boutique_publico` |
| `qtd_advogados <= 15` AND areas inclui empresarial/societario/tributario/contratos | `boutique_empresarial` |
| `qtd_advogados <= 15` AND areas inclui penal/criminal | `boutique_criminal` |
| `qtd_advogados > 30` OR perfil === 'contencioso_massa' | `contencioso_massa` |
| Demais casos | `misto` |

### Tipografia por perfil

| Perfil | Heading | Body |
|--------|---------|------|
| boutique_* | Geist + serif (Playfair Display) para títulos de seção | Geist |
| contencioso_massa | Geist bold | Geist |
| misto | Geist bold | Geist |

Serif aparece **apenas nos títulos de seção** (h2), não no hero headline nem em body text.

### Localização

Função: `src/lib/utils/proposta-profile.ts`
- `deriveProfile(proposta: Proposta): PropostaProfile`
- `getProfileCopy(profileId: PropostaProfileId): ProfileCopy` (retorna todos os textos adaptativos)

---

## 2. Header — Brand Bar + Co-branding

### Estrutura

Duas camadas:

**Barra superior (Brand Bar):**
- Background: `--vt-brand` (#D97757)
- Esquerda: logo symbol PNG (`/brand/symbol-light.png`, 24x24) + "Juspilot" em branco, 13px, font-weight 600
- Direita: "Proposta Comercial" em branco/70% opacity, 10px uppercase tracking wide

**Área principal:**
- Background: `--vt-ink` (#141414)
- Esquerda: ícone do escritório (iniciais em quadrado terracota, 40x40, border-radius 10px) + nome do escritório (16px, 600) + "Advogados — {cidade}, {UF}" (11px, mute)
- Direita: mês/ano da proposta (11px, mute, uppercase)

### Componente

`src/components/proposta-publica/header-section.tsx`

### Logo assets

- `/public/brand/symbol-brand.png` — símbolo terracota (fundo escuro)
- `/public/brand/symbol-light.png` — símbolo creme (fundo terracota)
- `/public/brand/wordmark-light.png` — wordmark para fundo escuro

---

## 3. Hero Section

### Estrutura

- **Headline adaptativa** — texto muda por perfil:
  - `boutique_publico`: "Inteligencia artificial a servico do Direito Publico"
  - `boutique_empresarial`: "Potencialize sua advocacia empresarial com IA"
  - `boutique_criminal`: "Defesa criminal potencializada por inteligencia artificial"
  - `contencioso_massa`: "Escale sua operacao juridica sem escalar custos"
  - `misto`: "Seu escritorio, amplificado por inteligencia artificial"
- **Subtitulo contextual**: "Proposta exclusiva para {escritorio} — {cidade}, {UF}"
- **Badges**: lead + consultor com avatar de iniciais em circulo terracota
- **Indicador de scroll**: seta animada sutil (CSS `@keyframes bounce`)

### Tipografia

- Headline: `text-5xl` (48px), Geist bold, `tracking-tight`
- Subtitulo: `text-base`, cor `--vt-whisper`
- Sem serif no hero

### Componente

`src/components/proposta-publica/hero-section.tsx` (editar existente)

---

## 4. Diagnostico Section

### Estrutura

- **Label**: "Diagnostico" (linha terracota + texto uppercase)
- **Titulo adaptativo** por perfil:
  - Boutique: "Os desafios que identificamos no seu escritorio"
  - Contencioso massa: "Gargalos que travam sua operacao"
  - Misto: "O que esta limitando seu crescimento"
- **Cards em mosaic grid**: 2 colunas desktop, 1 mobile
  - Icone SVG em circulo com borda `--vt-brand`
  - Titulo da dor em bold
  - Descricao em `--vt-whisper`
  - Ultimo card impar: `col-span-2`
- **Ordenacao**: dores sugeridas por `getSuggestedDores()` primeiro, com borda lateral terracota como indicador

### Tom

Linguagem de diagnostico, nao de venda. Ex: "Pesquisa jurisprudencial manual consome 3-5h por caso".

### Componente

`src/components/proposta-publica/dores-section.tsx` (editar existente)

---

## 5. ROI Section

### Estrutura

- **Label**: "Retorno sobre investimento"
- **Titulo adaptativo**:
  - Boutique: "O impacto financeiro no seu escritorio"
  - Contencioso massa: "Quanto sua operacao ganha em escala"
  - Misto: "Numeros que justificam a decisao"
- **3 metricas** em layout horizontal (desktop) / empilhado (mobile):
  1. Horas economizadas: `roi_horas_economizadas_total` h/mes + subtexto por advogado
  2. Valor gerado: `roi_valor_gerado` em R$ + "em produtividade recuperada/mes"
  3. ROI multiplo: `roi_multiplo`x + "retorno sobre a mensalidade"
- **Animacao**: `useCounter` em cada metrica ao entrar no viewport
- **Barra comparativa**: mensalidade (`--vt-graphite`) vs valor gerado (`--vt-brand`), proporcao visual
- **Frase ancora**: "Para cada R$ 1 investido, seu escritorio recupera R$ {multiplo} em produtividade"

### Calculo

Usa mensalidade recorrente (ultima faixa) para o multiplo — corrigido em `roi.ts`.

### Componente

`src/components/proposta-publica/roi-section.tsx` (editar existente)

---

## 6. Features Section (NOVA)

### Estrutura

- **Label**: "Plataforma"
- **Titulo adaptativo**:
  - Boutique: "Tudo que seu escritorio precisa em um so lugar"
  - Contencioso massa: "Ferramentas para operacao em escala"
  - Misto: "O que esta incluso no seu plano"
- **Grid 2x4** (desktop) / lista empilhada (mobile)
- **Cada card**:
  - Check icon com borda terracota (existente)
  - Nome da feature em `--vt-paper`
  - Uma linha de descricao em `--vt-whisper` (NOVO)
  - Hover: texto sobe para `--vt-paper`
- **Destaque condicional**: perfil `contencioso_massa` ganha dot terracota nas features de automacao/escala

### Dados

Expandir `FEATURES_INCLUIDAS` em `src/lib/constants/precos.ts` de array de strings para array de objetos: `{ name: string; description: string; highlight?: PropostaProfileId[] }`.

### Componente

`src/components/proposta-publica/features-section.tsx` (NOVO)

Remover checklist do `pricing-section.tsx`.

---

## 7. Pricing Section

### Estrutura

- **Label**: "Investimento"
- **Titulo adaptativo**:
  - Boutique: "Seu plano sob medida"
  - Contencioso massa: "Investimento proporcional a sua operacao"
  - Misto: "Condicoes exclusivas para {escritorio}"
- **Card principal**: borda `--vt-graphite`, linha gradient no topo
- **Faixas timeline** (condicional se `preco_faixas` existe):
  - Label: "Condicao especial de adocao"
  - Dots numerados em timeline horizontal
  - Economia total destacada
- **Dois blocos lado a lado**:
  - Setup unico: valor grande + "Cobrado na assinatura"
  - Mensalidade: valor grande + "/mes" + custo por advogado
  - Badge desconto se > 0%
- **CTA**:
  - Botao primario: "Agendar conversa ->" (WhatsApp)
  - Link secundario: "Baixar proposta em PDF"
  - Badge validade com dot pulsante

### Removido

Checklist de features (agora e secao propria — Features Section).

### Componente

`src/components/proposta-publica/pricing-section.tsx` (editar existente)

---

## 8. Blocos de Fechamento

### 8a) Security Section

Sem mudancas estruturais. Apenas unificar cor para `#D97757`.

Componente: `src/components/proposta-publica/security-section.tsx`

### 8b) Timeline Section

- Titulo adaptativo:
  - Boutique: "Implantacao cuidadosa em 90 dias"
  - Contencioso massa: "Implantacao estruturada em 90 dias"
  - Misto: "Seu roadmap de implantacao"

Componente: `src/components/proposta-publica/timeline-section.tsx`

### 8c) FAQ Section

- Adicionar 2-3 perguntas condicionais por perfil:
  - Boutique: "Como a IA mantem o padrao de qualidade do meu escritorio?"
  - Contencioso massa: "Qual o limite de processos simultaneos?"

Componente: `src/components/proposta-publica/faq-section.tsx`

### 8d) Footer

- Logo wordmark PNG (`/brand/wordmark-light.png`)
- Texto: "Proposta gerada por JusPilot — Copiloto Juridico com IA"
- Links: site, termos, privacidade
- Background: `#0a0a0a` (mais escuro que body)

Componente: `src/components/proposta-publica/footer-section.tsx` (NOVO ou editar existente)

---

## 9. Unificacao de Cor da Marca

Trocar `#D4663C` por `#D97757` em:
- `src/app/globals.css` — `--color-brand` e `--vt-brand`
- Qualquer outro lugar que use o valor hardcoded

---

## 10. Ordem das Secoes na Pagina

```
Header (Brand Bar + Co-branding)
Hero (headline adaptativa)
Diagnostico (dores segmentadas)
ROI (metricas animadas + barra comparativa)
Features (grid independente)
Pricing (card limpo, sem features)
Security (selos de confianca)
Timeline (90 dias)
FAQ (accordion + perguntas condicionais)
Footer (wordmark + links)
```

---

## 11. Arquivos Impactados

### Novos
- `src/lib/utils/proposta-profile.ts` — derivacao de perfil + textos adaptativos
- `src/components/proposta-publica/features-section.tsx` — grid de features independente
- `src/components/proposta-publica/footer-section.tsx` — footer com wordmark (se nao existir)

### Editados
- `src/app/globals.css` — cor brand #D97757
- `src/app/p/[slug]/page.tsx` — ordem das secoes, Features entre ROI e Pricing
- `src/components/proposta-publica/header-section.tsx` — Brand Bar + Co-branding (se existir, senao criar)
- `src/components/proposta-publica/hero-section.tsx` — headline adaptativa, badges, scroll indicator
- `src/components/proposta-publica/dores-section.tsx` — titulo adaptativo, ordenacao por relevancia
- `src/components/proposta-publica/roi-section.tsx` — titulo adaptativo, barra comparativa, frase ancora
- `src/components/proposta-publica/pricing-section.tsx` — remover features, titulo adaptativo
- `src/components/proposta-publica/security-section.tsx` — cor unificada
- `src/components/proposta-publica/timeline-section.tsx` — titulo adaptativo
- `src/components/proposta-publica/faq-section.tsx` — perguntas condicionais por perfil
- `src/components/proposta-publica/nav-chrome.tsx` — atualizar dots para incluir features
- `src/lib/constants/precos.ts` — expandir FEATURES_INCLUIDAS para objetos com descricao

### Sem alteracao no banco

Nenhuma migration necessaria. O `PropostaProfile` e computado no frontend a partir de dados existentes.
