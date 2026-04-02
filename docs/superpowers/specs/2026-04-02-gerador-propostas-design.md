# Design Spec — Gerador de Propostas JusPilot (Fase 1 MVP)

## Visão Geral

Aplicação web interna para o time comercial do JusPilot criar, gerenciar e compartilhar propostas comerciais personalizadas para escritórios de advocacia. Duas experiências visuais distintas: app interno (light, clean) e proposta pública (dark, premium).

## Decisões de Design

| Decisão | Escolha | Razão |
|---------|---------|-------|
| Proposta pública | Dark mode, réplica fiel da referência (proposta-max-acunha.vercel.app) | Impacto visual premium para leads |
| App interno | Light mode, clean minimal (estilo Linear/Notion) | Produtividade para uso diário |
| Wizard | Sidebar lateral com 7 steps | Contexto visível, navegação não-linear entre steps completados |
| Autenticação | Email/senha + Google OAuth | Flexibilidade — Google para contas corporativas, email/senha como fallback |

## Paleta de Cores

### App interno (light)

- Fundo: `#fafafa`
- Cards/superfícies: `#ffffff`
- Bordas: `#e4e4e7`
- Texto primário: `#09090b`
- Texto secundário: `#71717a`
- Texto terciário: `#a1a1aa`
- Botão primário: `#09090b` (preto)
- Botão secundário: borda `#e4e4e7`, texto `#71717a`
- Badges de status:
  - Rascunho: bg `#f4f4f5`, texto `#71717a`
  - Publicada: bg `#fef3c7`, texto `#92400e`
  - Visualizada: bg `#e0e7ff`, texto `#3730a3`
  - Aceita: bg `#dcfce7`, texto `#166534`
  - Recusada: bg `#fee2e2`, texto `#991b1b`
  - Expirada: bg `#f4f4f5`, texto `#a1a1aa`

### Proposta pública (dark)

- Fundo: `#09090b`
- Superfícies: `#18181b`, `#27272a`
- Bordas: `#27272a`
- Texto primário: `#fafafa`
- Texto secundário: `#a1a1aa`
- Efeitos: grain texture overlay (fractal noise SVG, opacity 0.025), radial white gradients (opacity 0.04)
- Animações: reveal on scroll (opacity + translateY 28px, cubic-bezier), contadores animados, stagger 0.12s

### Tipografia

- Font: Geist Sans (já configurada no projeto)
- Font mono: Geist Mono (para números/código)
- Escala: sistema padrão do Tailwind (text-xs a text-2xl)

## Páginas e Layouts

### Layout Auth (`/login`, `/forgot-password`)

- Sem sidebar
- Card centralizado verticalmente em fundo `#fafafa`
- Logo JusPilot acima do card
- Footer: "Uso exclusivo do time JusPilot · Powered by Octolab"

### Layout Dashboard (`/dashboard`, `/nova`, `/proposta/[id]`, `/configuracoes`)

- Sidebar fixa 240px à esquerda:
  - Logo JusPilot + subtítulo "Propostas Comerciais"
  - Navegação: Dashboard, Nova Proposta, Configurações
  - Item ativo: fundo `#f4f4f5`, texto preto
  - User menu no rodapé: avatar (iniciais), nome, cargo
- Área de conteúdo: padding 24px 32px
- Sidebar colapsa para 48px (ícones only) quando no wizard

### Página: Login

- Card com:
  1. Botão "Continuar com Google" (com ícone SVG do Google) — primário
  2. Divisor "ou"
  3. Input email
  4. Input senha
  5. Link "Esqueci minha senha"
  6. Botão "Entrar" (preto)
- Sem opção de registro (usuários cadastrados manualmente)

### Página: Forgot Password

- Card com:
  1. Input email
  2. Botão "Enviar link de recuperação"
  3. Link "Voltar para login"
- Supabase envia email de reset

### Página: Dashboard

- Header: título "Propostas" + contagem + botão "Nova Proposta"
- Stats cards (4 colunas): Total, Publicadas, Visualizadas, Aceitas
- Barra de busca + filtro de status (dropdown)
- Tabela de propostas:
  - Colunas: Escritório, Lead, Status (badge), Valor (mensalidade), Views, Criada em
  - Ordenação padrão: criada_at DESC
  - Hover sutil nas linhas
  - Click na linha → `/proposta/[id]`

### Página: Nova Proposta (Wizard)

- Sidebar do app colapsa para ícones (48px)
- Wizard sidebar (220px):
  - Header "Etapas"
  - 7 steps com estados visuais:
    - Completado: circle preta com checkmark + resumo do preenchido
    - Ativo: fundo `#f4f4f5` + borda direita 2px preta + número em circle preta
    - Desbloqueado: circle com borda `#d4d4d8`, texto cinza, clicável
    - Bloqueado: opacity 0.4, não clicável
  - Steps desbloqueiam progressivamente (pode voltar, não pode pular)
- Área do formulário (max-width 520px):
  - Título do step + descrição
  - Campos do formulário
  - Navegação: "Voltar" (outlined) | "Próximo" (preto)
  - Step 7: "Publicar Proposta" como botão de submit

#### Steps do Wizard

1. **Lead**: nome, email, telefone, cargo (opcional)
2. **Escritório**: nome, cidade, UF (select), qtd advogados (slider), valor hora (input + checkbox "informado pelo lead")
3. **Perfil**: áreas de atuação (multi-select checkboxes), perfil (radio: massa/boutique/misto)
4. **Maturidade**: maturidade processos (radio), maturidade IA (radio)
5. **Dores**: checkboxes das 7 dores, textarea contexto (opcional)
6. **Preços**: toggle "usar preço sugerido" (auto-calculado) ou manual; inputs setup, mensalidade, usuários, desconto (slider 0-30%); card de ROI calculado em tempo real
7. **Preview**: renderização inline dos componentes da proposta pública (dark mode via container class) dentro do wizard; botões "Voltar" e "Publicar Proposta"

### Página: Proposta (`/proposta/[id]`)

- Header com nome do escritório + badge de status
- Tabs ou seções: Detalhes, Atividades
- Detalhes: resumo dos dados (lead, escritório, preços, ROI) em formato read-only
- Ações: Editar, Duplicar, Publicar/Despublicar, Copiar Link, Excluir
- Timeline de atividades (criada, publicada, visualizada, etc.)

### Página: Preview (`/proposta/[id]/preview`)

- Renderização full da proposta pública (dark mode) no contexto do app
- Barra fixa no topo: "Preview" + botões "Voltar" e "Publicar"

### Página Pública (`/p/[slug]`)

- Dark mode premium, réplica fiel da referência
- 8 seções em ordem:
  1. **Header**: logo JusPilot, nome do escritório, cidade-UF, data
  2. **Quote/Dores**: seção de valor baseada nas dores selecionadas
  3. **Features**: grid de funcionalidades da plataforma (3 colunas)
  4. **ROI**: contadores animados (horas economizadas, valor gerado, ROI múltiplo)
  5. **Plataforma**: screenshots/descrição dos módulos
  6. **Compliance**: segurança, LGPD, criptografia
  7. **Pricing**: card com setup + mensalidade + features incluídas
  8. **Timeline**: 5 steps de implementação
- Footer: branding Octolab
- Efeitos: grain texture, reveal animations, contadores animados
- Track view automático (client component dispara POST `/api/track-view`)
- Página expirada: mensagem centralizada "Proposta expirada"
- SEO: Open Graph metadata dinâmica

### Página: Configurações

- Formulário do perfil: nome, email (read-only), cargo
- Botão de logout

## Componentes Compartilhados

- **Button**: variantes primary (preto), secondary (outlined), destructive (vermelho)
- **Input**: label + input com borda, estados focus/error
- **Select**: dropdown estilizado
- **Slider**: range input customizado (track cinza, thumb preto)
- **Checkbox**: quadrado preto com checkmark branco
- **Badge**: variantes por status (cores definidas acima)
- **Card**: bg branco, borda `#e4e4e7`, border-radius 8px
- **Dialog**: modal centralizado com overlay
- **Toast**: notificações no canto inferior direito
- **Loading**: spinner ou skeleton
- **Empty State**: ícone + título + descrição + CTA
- **Confirm Dialog**: modal de confirmação para ações destrutivas

## Fluxo de Dados

### Autenticação

- Supabase Auth (email/senha + Google OAuth)
- Middleware Next.js intercepta requests e redireciona para `/login` se não autenticado
- Rotas públicas: `/login`, `/forgot-password`, `/p/*`, `/api/track-view`
- Após login, cria/atualiza profile na tabela `profiles`

### Estado do Wizard

- Zustand store com middleware `persist` (localStorage, key: `wizard-storage`)
- ROI recalculado automaticamente a cada mudança de campo
- `resetForm()` limpa store após submit bem-sucedido

### API Routes

- `POST /api/propostas` — cria proposta (validação Zod, gera slug, calcula ROI, salva)
- `GET /api/propostas` — lista com paginação, filtro de status, busca
- `GET /api/propostas/[id]` — detalhes
- `PUT /api/propostas/[id]` — atualiza
- `DELETE /api/propostas/[id]` — exclui
- `POST /api/track-view` — registra visualização (público, sem auth)
- `POST /api/calculate-roi` — calcula ROI (auxiliar)

### Banco de Dados

- Conforme PRD: tabelas `profiles`, `propostas`, `proposta_views`, `proposta_activities`
- RLS: time interno vê todas as propostas, edita/exclui apenas as próprias
- Triggers: auto-increment views, auto-update `updated_at`
- Migration já criada em `supabase/migrations/001_initial_schema.sql`

## Escopo da Fase 1 (MVP)

### Incluído

- Login (email/senha + Google)
- Dashboard com listagem, stats, busca e filtros
- Wizard completo (7 steps)
- Página pública da proposta (dark, réplica da referência)
- Preview antes de publicar
- Copiar link da proposta
- Tracking básico de visualizações

### Excluído (fases futuras)

- Edição de proposta existente (Fase 2)
- Duplicar proposta (Fase 2)
- Notificações por email (Fase 3)
- Export PDF (Fase 4)
- Templates por segmento (Fase 4)
