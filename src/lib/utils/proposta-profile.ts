import type { Proposta, AreaAtuacao } from '@/types';

export type PropostaProfileId =
  | 'boutique_publico'
  | 'boutique_empresarial'
  | 'boutique_criminal'
  | 'contencioso_massa'
  | 'misto';

export interface PropostaProfileCopy {
  heroHeadline: string;
  diagnosticoTitle: string;
  roiTitle: string;
  featuresTitle: string;
  pricingTitle: string;
  timelineTitle: string;
  ctaLabel: string;
}

export interface PropostaProfile extends PropostaProfileCopy {
  id: PropostaProfileId;
  tone: 'consultivo' | 'tecnico' | 'executivo';
}

const PUBLIC_AREAS: AreaAtuacao[] = [
  'Direito Público',
  'Administrativo',
  'Regulatório',
  'Licitações e Contratos Administrativos',
  'Constitucional',
];

const CORPORATE_AREAS: AreaAtuacao[] = [
  'Empresarial/Societário',
  'Tributário',
  'Bancário',
  'Recuperação Judicial e Falências',
  'Compliance e Governança',
  'Startups e Venture Capital',
];

const CRIMINAL_AREAS: AreaAtuacao[] = ['Criminal'];

function hasAnyArea(areas: AreaAtuacao[] | undefined, candidates: AreaAtuacao[]): boolean {
  if (!areas) return false;
  return areas.some((a) => candidates.includes(a));
}

function deriveProfileId(proposta: Proposta): PropostaProfileId {
  const qtd = proposta.escritorio_qtd_advogados ?? 0;
  const areas = proposta.escritorio_areas ?? [];
  const perfil = proposta.escritorio_perfil;

  if (qtd > 30 || perfil === 'massa') return 'contencioso_massa';

  if (qtd <= 15) {
    if (hasAnyArea(areas, PUBLIC_AREAS)) return 'boutique_publico';
    if (hasAnyArea(areas, CORPORATE_AREAS)) return 'boutique_empresarial';
    if (hasAnyArea(areas, CRIMINAL_AREAS)) return 'boutique_criminal';
  }

  return 'misto';
}

const PROFILE_COPY: Record<PropostaProfileId, PropostaProfileCopy> = {
  boutique_publico: {
    heroHeadline: 'Inteligência artificial a serviço do Direito Público',
    diagnosticoTitle: 'Os desafios que identificamos no seu escritório',
    roiTitle: 'O impacto financeiro no seu escritório',
    featuresTitle: 'Tudo que seu escritório precisa em um só lugar',
    pricingTitle: 'Seu plano sob medida',
    timelineTitle: 'Implantação cuidadosa em 90 dias',
    ctaLabel: 'Agendar conversa',
  },
  boutique_empresarial: {
    heroHeadline: 'Potencialize sua advocacia empresarial com IA',
    diagnosticoTitle: 'Os desafios que identificamos no seu escritório',
    roiTitle: 'O impacto financeiro no seu escritório',
    featuresTitle: 'Tudo que seu escritório precisa em um só lugar',
    pricingTitle: 'Seu plano sob medida',
    timelineTitle: 'Implantação cuidadosa em 90 dias',
    ctaLabel: 'Agendar conversa',
  },
  boutique_criminal: {
    heroHeadline: 'Defesa criminal potencializada por inteligência artificial',
    diagnosticoTitle: 'Os desafios que identificamos no seu escritório',
    roiTitle: 'O impacto financeiro no seu escritório',
    featuresTitle: 'Tudo que seu escritório precisa em um só lugar',
    pricingTitle: 'Seu plano sob medida',
    timelineTitle: 'Implantação cuidadosa em 90 dias',
    ctaLabel: 'Agendar conversa',
  },
  contencioso_massa: {
    heroHeadline: 'Escale sua operação jurídica sem escalar custos',
    diagnosticoTitle: 'Gargalos que travam sua operação',
    roiTitle: 'Quanto sua operação ganha em escala',
    featuresTitle: 'Ferramentas para operação em escala',
    pricingTitle: 'Investimento proporcional à sua operação',
    timelineTitle: 'Implantação estruturada em 90 dias',
    ctaLabel: 'Agendar conversa',
  },
  misto: {
    heroHeadline: 'Seu escritório, amplificado por inteligência artificial',
    diagnosticoTitle: 'O que está limitando seu crescimento',
    roiTitle: 'Números que justificam a decisão',
    featuresTitle: 'O que está incluso no seu plano',
    pricingTitle: 'Condições exclusivas para seu escritório',
    timelineTitle: 'Seu roadmap de implantação',
    ctaLabel: 'Agendar conversa',
  },
};

export function getProfileCopy(id: PropostaProfileId): PropostaProfileCopy {
  return PROFILE_COPY[id];
}

export function deriveProfile(proposta: Proposta): PropostaProfile {
  const id = deriveProfileId(proposta);
  const copy = getProfileCopy(id);
  const tone: PropostaProfile['tone'] = id === 'contencioso_massa' ? 'executivo' : 'consultivo';
  return { id, tone, ...copy };
}
