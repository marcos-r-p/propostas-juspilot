import type { PricingData } from './types';

/**
 * Default pricing data — used as a fallback when the server-loaded
 * pricing table isn't available (e.g., client-side stores during
 * initialization). Reproduces the seed of the 'Padrão' table v1.
 */
export const DEFAULT_PRICING_DATA: PricingData = {
  faixas_porte: [
    { min: 1, max: 3, setup: 2000, mensalidade: 1500, usuarios: 5 },
    { min: 4, max: 10, setup: 3500, mensalidade: 3000, usuarios: 10 },
    { min: 11, max: 20, setup: 5000, mensalidade: 5000, usuarios: 20 },
    { min: 21, max: null, setup: 8000, mensalidade: 8000, usuarios: null, incremento_por_dezena_advogados: 2000 },
  ],
  roi: {
    horas_mensais: 176,
    valor_hora_padrao: 250,
    atividades_ia_por_perfil: { boutique: 0.30, misto: 0.40, massa: 0.50 },
    taxa_reducao_por_maturidade: { nunca: 0.60, iniciante: 0.50, intermediario: 0.45, avancado: 0.40 },
  },
  limites: {
    desconto_maximo_pct: 30,
    mensalidade_minima: 1000,
    validade_proposta_dias: 30,
    reajuste_anual_pct: 8,
  },
};
