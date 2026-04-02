export const FAIXAS_PRECO = [
  { min: 1, max: 3, setup: 2000, mensalidade: 1500, usuarios: 5 },
  { min: 4, max: 10, setup: 3500, mensalidade: 3000, usuarios: 10 },
  { min: 11, max: 20, setup: 5000, mensalidade: 5000, usuarios: 20 },
  { min: 21, max: Infinity, setup: 8000, mensalidade: 8000, usuarios: null },
] as const;

export const DESCONTO_MAX = 30;

export const FEATURES_INCLUIDAS = [
  'Acesso ilimitado a todos os módulos',
  'IA multimodelo sem restrição',
  'Base de jurisprudência curada',
  'Base de conhecimento personalizada',
  'Workflows ilimitados',
  'Integrações Gmail e Google Drive',
  'API REST',
  'Suporte prioritário',
];
