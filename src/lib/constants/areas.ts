import type { AreaAtuacao } from '@/types';

export interface AreaGroup {
  group: string;
  areas: { value: AreaAtuacao; label: string }[];
}

export const AREAS_ATUACAO_GROUPED: AreaGroup[] = [
  {
    group: 'Contencioso',
    areas: [
      { value: 'Cível', label: 'Cível' },
      { value: 'Trabalhista', label: 'Trabalhista' },
      { value: 'Criminal', label: 'Criminal' },
      { value: 'Consumidor', label: 'Consumidor' },
      { value: 'Família e Sucessões', label: 'Família e Sucessões' },
    ],
  },
  {
    group: 'Empresarial',
    areas: [
      { value: 'Empresarial/Societário', label: 'Empresarial/Societário' },
      { value: 'Bancário', label: 'Bancário' },
      { value: 'Tributário', label: 'Tributário' },
      { value: 'Recuperação Judicial e Falências', label: 'Recuperação Judicial e Falências' },
      { value: 'Startups e Venture Capital', label: 'Startups e Venture Capital' },
      { value: 'Compliance e Governança', label: 'Compliance e Governança' },
    ],
  },
  {
    group: 'Público e Regulatório',
    areas: [
      { value: 'Direito Público', label: 'Direito Público' },
      { value: 'Administrativo', label: 'Administrativo' },
      { value: 'Regulatório', label: 'Regulatório' },
      { value: 'Licitações e Contratos Administrativos', label: 'Licitações e Contratos Adm.' },
      { value: 'Eleitoral', label: 'Eleitoral' },
      { value: 'Constitucional', label: 'Constitucional' },
    ],
  },
  {
    group: 'Especializado',
    areas: [
      { value: 'Aeronáutico', label: 'Aeronáutico' },
      { value: 'Marítimo', label: 'Marítimo' },
      { value: 'Desportivo', label: 'Desportivo' },
      { value: 'Minerário', label: 'Minerário' },
      { value: 'Agronegócio', label: 'Agronegócio' },
    ],
  },
  {
    group: 'Propriedade e Patrimônio',
    areas: [
      { value: 'Imobiliário', label: 'Imobiliário' },
      { value: 'Propriedade Intelectual', label: 'Propriedade Intelectual' },
      { value: 'Ambiental', label: 'Ambiental' },
    ],
  },
  {
    group: 'Social e Previdenciário',
    areas: [
      { value: 'Previdenciário', label: 'Previdenciário' },
      { value: 'Saúde e Planos de Saúde', label: 'Saúde e Planos de Saúde' },
    ],
  },
  {
    group: 'Digital e Tecnologia',
    areas: [
      { value: 'Proteção de Dados (LGPD)', label: 'Proteção de Dados (LGPD)' },
      { value: 'Direito Digital', label: 'Direito Digital' },
      { value: 'Contencioso Estratégico e Arbitragem', label: 'Contencioso Estratégico e Arbitragem' },
    ],
  },
  {
    group: 'Internacional',
    areas: [
      { value: 'Direito Internacional', label: 'Direito Internacional' },
      { value: 'Comércio Exterior', label: 'Comércio Exterior' },
    ],
  },
];

export const AREAS_ATUACAO = AREAS_ATUACAO_GROUPED.flatMap((g) => g.areas);
