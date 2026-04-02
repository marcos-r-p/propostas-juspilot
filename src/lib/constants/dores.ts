export const DORES = [
  {
    id: 'tempo_pecas',
    label: 'Muito tempo elaborando peças',
    highlight: 'IA Jurídica',
    description:
      'Redução significativa de horas na produção de petições, contestações e recursos.',
    icon: '⚡',
  },
  {
    id: 'pesquisa_jurisprudencia',
    label: 'Dificuldade em pesquisa de jurisprudência',
    highlight: 'Base Curada',
    description:
      'Acesso rápido a 30.969+ jurisprudências do STF, STJ e tribunais regionais.',
    icon: '🔍',
  },
  {
    id: 'gestao_prazos',
    label: 'Gestão de prazos caótica',
    highlight: 'Casos Kanban',
    description:
      'Controle inteligente com alertas de SLA, visão Kanban e atribuição de responsáveis.',
    icon: '📋',
  },
  {
    id: 'padronizacao',
    label: 'Falta de padronização nas peças',
    highlight: 'Base de Conhecimento',
    description:
      'A IA aprende o estilo e formatação do escritório. Suas peças viram referência.',
    icon: '📝',
  },
  {
    id: 'comunicacao_cliente',
    label: 'Comunicação com cliente desorganizada',
    highlight: 'CRM Jurídico',
    description:
      'Gestão completa de clientes com timeline de interações e insights por IA.',
    icon: '👥',
  },
  {
    id: 'contratos',
    label: 'Processo manual de contratos',
    highlight: 'Assinatura Digital',
    description:
      'Geração automática de contratos com assinatura digital e hash criptográfico.',
    icon: '✍️',
  },
  {
    id: 'automacao',
    label: 'Tarefas repetitivas manuais',
    highlight: 'Workflows',
    description:
      'Automações no-code para alertas, follow-ups e comunicações automáticas.',
    icon: '🤖',
  },
] as const;

export type DorId = (typeof DORES)[number]['id'];

export function getDorById(id: DorId) {
  return DORES.find((dor) => dor.id === id);
}

export function getDoresByIds(ids: DorId[]) {
  return DORES.filter((dor) => ids.includes(dor.id));
}
