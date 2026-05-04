import type { DorId } from '@/types/database';

export interface Dor {
  id: DorId;
  label: string;
  highlight: string;
  description: string;
  solution: string;
  icon: string;
  iconPath: string;
  /** Segments where this dor is most relevant */
  segments: DorSegment[];
}

export type DorSegment =
  | 'generico'
  | 'boutique_publico'
  | 'boutique_empresarial'
  | 'contencioso_massa'
  | 'boutique_criminal'
  | 'tributario'
  | 'trabalhista';

export const DORES: readonly Dor[] = [
  // === GENERIC (work for any profile) ===
  {
    id: 'tempo_pecas',
    label: 'Muito tempo elaborando peças',
    highlight: 'IA Jurídica',
    description:
      'Redução significativa de horas na produção de petições, contestações e recursos.',
    solution: 'A IA Jurídica gera minutas, petições e contratos em minutos, com base no contexto do caso e modelos do escritório.',
    icon: '',
    iconPath: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M16 13H8 M16 17H8',
    segments: ['generico', 'contencioso_massa'],
  },
  {
    id: 'pesquisa_jurisprudencia',
    label: 'Dificuldade em pesquisa de jurisprudência',
    highlight: 'Base Curada',
    description:
      'Acesso rápido a 30.969+ jurisprudências do STF, STJ e tribunais regionais.',
    solution: 'Base curada do STF, STJ, TJs e TST com alertas automáticos quando o entendimento muda.',
    icon: '',
    iconPath: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20 M8 7h6 M8 11h4',
    segments: ['generico', 'contencioso_massa'],
  },
  {
    id: 'gestao_prazos',
    label: 'Gestão de prazos caótica',
    highlight: 'Casos Kanban',
    description:
      'Controle inteligente com alertas de SLA, visão Kanban e atribuição de responsáveis.',
    solution: 'Prazos monitorados automaticamente com alertas inteligentes e integração direta ao tribunal.',
    icon: '',
    iconPath: 'M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0-20 0 M12 6v6l4 2',
    segments: ['generico', 'contencioso_massa'],
  },
  {
    id: 'padronizacao',
    label: 'Falta de padronização nas peças',
    highlight: 'Base de Conhecimento',
    description:
      'A IA aprende o estilo e formatação do escritório. Suas peças viram referência.',
    solution: 'Documentos indexados e pesquisáveis com IA. O escritório constrói sua própria base de referência.',
    icon: '',
    iconPath: 'M12 2L2 7l10 5 10-5-10-5Z M2 17l10 5 10-5 M2 12l10 5 10-5',
    segments: ['generico', 'contencioso_massa'],
  },
  {
    id: 'comunicacao_cliente',
    label: 'Documentos do cliente espalhados em múltiplos canais',
    highlight: 'Data Room',
    description:
      'E-mails, anexos, contratos e procurações dispersos entre pastas, drives e mensagens.',
    solution: 'Data Room centralizado: todos os documentos do caso em um só lugar, com busca semântica e controle de acesso por workspace.',
    icon: '',
    iconPath: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
    segments: ['generico'],
  },
  {
    id: 'contratos',
    label: 'Processo manual de contratos',
    highlight: 'Assinatura Digital',
    description:
      'Geração automática de contratos com assinatura digital e hash criptográfico.',
    solution: 'Contratos gerados automaticamente com assinatura digital e rastreabilidade criptográfica.',
    icon: '',
    iconPath: 'M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z',
    segments: ['generico'],
  },
  {
    id: 'automacao',
    label: 'Tarefas repetitivas manuais',
    highlight: 'Workflows',
    description:
      'Automações no-code para alertas, follow-ups e comunicações automáticas.',
    solution: 'Automações no-code com agentes inteligentes configurados para o seu fluxo.',
    icon: '',
    iconPath: 'M16 3l5 0 0 5 M4 20l17-17 M21 16l0 5-5 0 M15 15l6 6 M4 4l5 5',
    segments: ['generico'],
  },

  // === BOUTIQUE PÚBLICO / REGULATÓRIO ===
  {
    id: 'inteligencia_dispersa',
    label: 'Inteligência acumulada dispersa',
    highlight: 'Base de Conhecimento',
    description:
      'Anos de expertise em Direito Público vivem em minutas, memoriais e pareceres distribuídos entre sócios e equipe.',
    solution: 'O JusPilot transforma esse acervo em base de conhecimento ativa — acessível à equipe júnior em tempo real, preservando a nuance argumentativa dos sócios sêniores.',
    icon: '',
    iconPath: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20 M9 10h6 M9 14h4 M9 6h6',
    segments: ['boutique_publico', 'boutique_empresarial'],
  },
  {
    id: 'pesquisa_tribunais_superiores',
    label: 'Pesquisa estratégica em tribunais superiores',
    highlight: 'Jurisprudência Curada',
    description:
      'Não basta encontrar precedentes — é preciso identificar padrões por relator, câmara e órgão fracionário.',
    solution: 'Base curada com decisões do STF, STJ e TCU, com filtros estratégicos e alertas de jurisprudência relevante para suas teses.',
    icon: '',
    iconPath: 'M12 3v17.25 M18.75 11.25l-6.75 9-6.75-9 M3 6l9-3 9 3 M3 6v5.25l9 6.75 9-6.75V6',
    segments: ['boutique_publico'],
  },
  {
    id: 'atendimento_corporate',
    label: 'Documentos sensíveis de clientes corporate',
    highlight: 'Data Room + ICP-Brasil',
    description:
      'Clientes regulados exigem segregação rigorosa de documentos, validade jurídica plena e trilha auditável.',
    solution: 'Data Room com workspace isolado por cliente, assinatura eletrônica ICP-Brasil e audit trail imutável via hash chain.',
    icon: '',
    iconPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4',
    segments: ['boutique_publico', 'boutique_empresarial'],
  },
  {
    id: 'seguranca_conformidade',
    label: 'Segurança e conformidade nativas',
    highlight: 'Enterprise Security',
    description:
      'Dados de clientes em setores regulados exigem AES-256, segregação por workspace, conformidade LGPD e trilha de auditoria completa.',
    solution: 'Tudo embutido na infraestrutura — sem custo adicional. Criptografia, LGPD, audit trail e segregação por workspace nativos.',
    icon: '',
    iconPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4',
    segments: ['boutique_publico', 'boutique_empresarial'],
  },

  // === BOUTIQUE EMPRESARIAL / SOCIETÁRIO ===
  {
    id: 'due_diligence',
    label: 'Due diligence manual e demorada',
    highlight: 'Análise Automatizada',
    description:
      'Processos de M&A e due diligence exigem revisão de centenas de documentos em prazos curtos.',
    solution: 'IA analisa contratos, identifica riscos e gera relatórios de due diligence em fração do tempo manual.',
    icon: '',
    iconPath: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M9 15l2 2 4-4',
    segments: ['boutique_empresarial'],
  },
  {
    id: 'compliance_monitoramento',
    label: 'Monitoramento regulatório fragmentado',
    highlight: 'Alertas Regulatórios',
    description:
      'Acompanhar mudanças normativas em múltiplas agências reguladoras consome tempo e gera risco de não-conformidade.',
    solution: 'Alertas automáticos de mudanças regulatórias relevantes para os setores dos seus clientes, com análise de impacto por IA.',
    icon: '',
    iconPath: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0',
    segments: ['boutique_empresarial', 'boutique_publico'],
  },

  // === DIFERENCIAIS DE PRODUTO ===
  {
    id: 'confianca_ia',
    label: 'Receio de a IA inventar precedentes',
    highlight: 'Citações Verificáveis',
    description:
      'Casos públicos de IA gerando jurisprudência inexistente trouxeram desconfiança ao uso da tecnologia.',
    solution: 'Toda resposta da IA traz fonte rastreável — número do processo, tribunal, relator. Sem alucinação. Auditável.',
    icon: '',
    iconPath: 'M9 12l2 2 4-4 M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3 M3 12c1 0 3-1 3-3S4 6 3 6 0 7 0 9s2 3 3 3 M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3 M12 21c0-1-1-3-3-3s-3 2-3 3 1 3 3 3 3-2 3-3',
    segments: ['generico', 'boutique_publico', 'boutique_empresarial', 'boutique_criminal'],
  },
  {
    id: 'andamento_processual',
    label: 'Movimentações dispersas em vários tribunais',
    highlight: 'Integrações Jurídicas',
    description:
      'Cada tribunal com seu sistema. Atualizar manualmente andamentos consome horas e gera risco de perda de prazo.',
    solution: 'Integrações nativas com CNJ, DataJud, OAB e tribunais estaduais. Movimentações sincronizadas automaticamente.',
    icon: '',
    iconPath: 'M3 12c0-4.97 4.03-9 9-9 4.97 0 9 4.03 9 9 0 4.97-4.03 9-9 9 M12 7v5l3 3 M3 12h6 M15 12h6',
    segments: ['generico', 'contencioso_massa', 'trabalhista'],
  },

  // === CONTENCIOSO TRABALHISTA ===
  {
    id: 'volume_reclamatorias',
    label: 'Alto volume de reclamatórias similares',
    highlight: 'Templates Inteligentes',
    description:
      'Dezenas de reclamatórias com pedidos similares exigem respostas consistentes sem perder qualidade.',
    solution: 'Templates inteligentes que se adaptam ao caso, mantendo argumentação consistente e atualizada com a jurisprudência vigente.',
    icon: '',
    iconPath: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M8 13h8 M8 17h8 M8 9h2',
    segments: ['trabalhista', 'contencioso_massa'],
  },
] as const;

export type { DorId } from '@/types/database';

export function getDorById(id: DorId) {
  return DORES.find((dor) => dor.id === id);
}

export function getDoresByIds(ids: DorId[]) {
  return DORES.filter((dor) => ids.includes(dor.id as DorId));
}

/** Map area labels to dor segments for auto-suggestion */
const AREA_TO_SEGMENT: Record<string, DorSegment> = {
  'Direito Público': 'boutique_publico',
  'Administrativo': 'boutique_publico',
  'Regulatório': 'boutique_publico',
  'Licitações e Contratos Administrativos': 'boutique_publico',
  'Eleitoral': 'boutique_publico',
  'Constitucional': 'boutique_publico',
  'Aeronáutico': 'boutique_publico',
  'Empresarial/Societário': 'boutique_empresarial',
  'Bancário': 'boutique_empresarial',
  'Recuperação Judicial e Falências': 'boutique_empresarial',
  'Startups e Venture Capital': 'boutique_empresarial',
  'Compliance e Governança': 'boutique_empresarial',
  'Trabalhista': 'trabalhista',
  'Tributário': 'tributario',
  'Criminal': 'boutique_criminal',
};

/** Get suggested dores based on areas and profile */
export function getSuggestedDores(areas: string[], perfil: string): Dor[] {
  const segments = new Set<DorSegment>();

  // Map areas to segments
  for (const area of areas) {
    const segment = AREA_TO_SEGMENT[area];
    if (segment) segments.add(segment);
  }

  // If boutique/misto with no specific segment, use generic
  if (segments.size === 0) {
    segments.add('generico');
  }

  // For massa profile, always include contencioso_massa
  if (perfil === 'massa') {
    segments.add('contencioso_massa');
  }

  // Filter dores that match any of the segments
  const matched = DORES.filter((dor) =>
    dor.segments.some((s) => segments.has(s))
  );

  return matched.length > 0 ? matched : DORES.filter((d) => d.segments.includes('generico'));
}
