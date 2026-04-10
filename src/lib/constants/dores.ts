export const DORES = [
  {
    id: 'tempo_pecas',
    label: 'Muito tempo elaborando peças',
    highlight: 'IA Jurídica',
    description:
      'Redução significativa de horas na produção de petições, contestações e recursos.',
    solution: 'A IA Jurídica gera minutas, petições e contratos em minutos, com base no contexto do caso e modelos do escritório.',
    iconPath: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M16 13H8 M16 17H8',
  },
  {
    id: 'pesquisa_jurisprudencia',
    label: 'Dificuldade em pesquisa de jurisprudência',
    highlight: 'Base Curada',
    description:
      'Acesso rápido a 30.969+ jurisprudências do STF, STJ e tribunais regionais.',
    solution: 'Base curada do STF, STJ, TJs e TST com alertas automáticos quando o entendimento muda.',
    iconPath: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20 M8 7h6 M8 11h4',
  },
  {
    id: 'gestao_prazos',
    label: 'Gestão de prazos caótica',
    highlight: 'Casos Kanban',
    description:
      'Controle inteligente com alertas de SLA, visão Kanban e atribuição de responsáveis.',
    solution: 'Prazos monitorados automaticamente com alertas inteligentes e integração direta ao tribunal.',
    iconPath: 'M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0-20 0 M12 6v6l4 2',
  },
  {
    id: 'padronizacao',
    label: 'Falta de padronização nas peças',
    highlight: 'Base de Conhecimento',
    description:
      'A IA aprende o estilo e formatação do escritório. Suas peças viram referência.',
    solution: 'Documentos indexados e pesquisáveis com IA. O escritório constrói sua própria base de referência.',
    iconPath: 'M12 2L2 7l10 5 10-5-10-5Z M2 17l10 5 10-5 M2 12l10 5 10-5',
  },
  {
    id: 'comunicacao_cliente',
    label: 'Comunicação com cliente desorganizada',
    highlight: 'CRM Jurídico',
    description:
      'Gestão completa de clientes com timeline de interações e insights por IA.',
    solution: 'Portal do cliente com acompanhamento em tempo real. Zero ligações desnecessárias.',
    iconPath: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  },
  {
    id: 'contratos',
    label: 'Processo manual de contratos',
    highlight: 'Assinatura Digital',
    description:
      'Geração automática de contratos com assinatura digital e hash criptográfico.',
    solution: 'Contratos gerados automaticamente com assinatura digital e rastreabilidade criptográfica.',
    iconPath: 'M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z',
  },
  {
    id: 'automacao',
    label: 'Tarefas repetitivas manuais',
    highlight: 'Workflows',
    description:
      'Automações no-code para alertas, follow-ups e comunicações automáticas.',
    solution: 'Automações no-code com agentes inteligentes configurados para o seu fluxo.',
    iconPath: 'M16 3l5 0 0 5 M4 20l17-17 M21 16l0 5-5 0 M15 15l6 6 M4 4l5 5',
  },
] as const;

export type DorId = (typeof DORES)[number]['id'];

export function getDorById(id: DorId) {
  return DORES.find((dor) => dor.id === id);
}

export function getDoresByIds(ids: DorId[]) {
  return DORES.filter((dor) => ids.includes(dor.id));
}
