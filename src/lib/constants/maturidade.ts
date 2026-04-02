import type { MaturidadeProcessos, MaturidadeIA } from '@/types';

export const MATURIDADE_PROCESSOS: {
  value: MaturidadeProcessos;
  label: string;
  description: string;
}[] = [
  {
    value: 'inicial',
    label: 'Inicial',
    description: 'Processos pouco definidos, muita dependência de pessoas específicas.',
  },
  {
    value: 'desenvolvimento',
    label: 'Em Desenvolvimento',
    description: 'Alguns processos documentados, mas ainda com gaps e inconsistências.',
  },
  {
    value: 'maduro',
    label: 'Maduro',
    description: 'Processos bem definidos, documentados e seguidos pela equipe.',
  },
];

export const MATURIDADE_IA: {
  value: MaturidadeIA;
  label: string;
  description: string;
}[] = [
  {
    value: 'nunca',
    label: 'Nunca usou IA',
    description: 'Sem experiência com ferramentas de inteligência artificial.',
  },
  {
    value: 'iniciante',
    label: 'Iniciante',
    description: 'Usa ChatGPT ou similares de forma básica e esporádica.',
  },
  {
    value: 'intermediario',
    label: 'Intermediário',
    description: 'Usa IA regularmente para algumas tarefas jurídicas.',
  },
  {
    value: 'avancado',
    label: 'Avançado',
    description: 'Já usa ferramentas de IA jurídica integradas ao fluxo de trabalho.',
  },
];
