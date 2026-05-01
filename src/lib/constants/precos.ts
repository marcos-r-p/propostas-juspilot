import type { PropostaProfileId } from '@/lib/utils/proposta-profile';

export const FAIXAS_PRECO = [
  { min: 1, max: 3, setup: 2000, mensalidade: 1500, usuarios: 5 },
  { min: 4, max: 10, setup: 3500, mensalidade: 3000, usuarios: 10 },
  { min: 11, max: 20, setup: 5000, mensalidade: 5000, usuarios: 20 },
  { min: 21, max: Infinity, setup: 8000, mensalidade: 8000, usuarios: null },
] as const;

export const DESCONTO_MAX = 30;

export interface FeatureItem {
  name: string;
  description: string;
  highlight?: PropostaProfileId[];
}

export const FEATURES_INCLUIDAS: FeatureItem[] = [
  {
    name: 'Acesso ilimitado a todos os módulos',
    description: 'Sem limitação de uso por advogado ou função.',
  },
  {
    name: 'IA multimodelo sem restrição',
    description: 'GPT-4, Claude, Gemini — escolha o modelo por tarefa.',
    highlight: ['contencioso_massa'],
  },
  {
    name: 'Base de jurisprudência curada',
    description: 'STF, STJ, TJs e TST com alertas de mudança de entendimento.',
  },
  {
    name: 'Base de conhecimento personalizada',
    description: 'Indexe documentos do escritório com busca semântica.',
  },
  {
    name: 'Workflows ilimitados',
    description: 'Automatize rotinas com agentes inteligentes configuráveis.',
    highlight: ['contencioso_massa'],
  },
  {
    name: 'Integrações Gmail e Google Drive',
    description: 'Email, anexos e documentos sincronizados automaticamente.',
  },
  {
    name: 'API REST',
    description: 'Conecte com ERP, CRM, sistemas internos e integrações custom.',
    highlight: ['contencioso_massa'],
  },
  {
    name: 'Suporte prioritário',
    description: 'Resposta em até 4 horas em horário comercial.',
  },
];
