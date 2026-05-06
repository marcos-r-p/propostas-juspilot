import { describe, it, expect } from 'vitest';
import { getPrecoSugerido, calculateROI } from './roi';
import type { PricingData } from '@/lib/pricing/types';
import type { PropostaFormData } from '@/types';

const PRICING_PADRAO: PricingData = {
  faixas_porte: [
    { min: 1, max: 3, setup: 2000, mensalidade: 1500, usuarios: 5 },
    { min: 4, max: 10, setup: 3500, mensalidade: 3000, usuarios: 10 },
    { min: 11, max: 20, setup: 5000, mensalidade: 5000, usuarios: 20 },
    { min: 21, max: null, setup: 8000, mensalidade: 8000, usuarios: null, incremento_por_dezena_advogados: 2000 },
  ],
  roi: {
    horas_mensais: 176, valor_hora_padrao: 250,
    atividades_ia_por_perfil: { boutique: 0.3, misto: 0.4, massa: 0.5 },
    taxa_reducao_por_maturidade: { nunca: 0.6, iniciante: 0.5, intermediario: 0.45, avancado: 0.4 },
  },
  limites: { desconto_maximo_pct: 30, mensalidade_minima: 1000, validade_proposta_dias: 30, reajuste_anual_pct: 8 },
};

describe('getPrecoSugerido', () => {
  it('faixa <=3 advogados', () => {
    expect(getPrecoSugerido(2, PRICING_PADRAO)).toEqual({ setup: 2000, mensalidade: 1500, usuarios: 5 });
  });
  it('faixa 4-10', () => {
    expect(getPrecoSugerido(7, PRICING_PADRAO)).toEqual({ setup: 3500, mensalidade: 3000, usuarios: 10 });
  });
  it('faixa 11-20', () => {
    expect(getPrecoSugerido(15, PRICING_PADRAO)).toEqual({ setup: 5000, mensalidade: 5000, usuarios: 20 });
  });
  it('faixa >20 com incremento por dezena', () => {
    expect(getPrecoSugerido(35, PRICING_PADRAO)).toEqual({ setup: 8000, mensalidade: 10000, usuarios: 35 });
  });
  it('exatamente no limite', () => {
    expect(getPrecoSugerido(3, PRICING_PADRAO).mensalidade).toBe(1500);
    expect(getPrecoSugerido(10, PRICING_PADRAO).mensalidade).toBe(3000);
    expect(getPrecoSugerido(20, PRICING_PADRAO).mensalidade).toBe(5000);
  });
});

describe('calculateROI', () => {
  it('boutique nunca, 8 adv, valor hora 300, mensalidade 1500', () => {
    const result = calculateROI({
      escritorio_qtd_advogados: 8,
      escritorio_valor_hora: 300,
      escritorio_valor_hora_informado: true,
      escritorio_perfil: 'boutique',
      escritorio_maturidade_ia: 'nunca',
      usar_preco_sugerido: true,
      preco_setup: 3500, preco_mensalidade: 3000, preco_usuarios_inclusos: 10,
      preco_desconto: 0, usar_preco_faixas: false, preco_faixas: null,
    } as PropostaFormData, PRICING_PADRAO);

    expect(result.horas_economizadas_por_adv).toBe(32);
    expect(result.horas_economizadas_total).toBe(32 * 8);
    expect(result.valor_gerado).toBe(32 * 8 * 300);
    expect(result.mensalidade_final).toBe(3000);
  });

  it('aplica desconto na mensalidade final', () => {
    const result = calculateROI({
      escritorio_qtd_advogados: 5,
      escritorio_valor_hora: 250,
      escritorio_valor_hora_informado: false,
      escritorio_perfil: 'misto',
      escritorio_maturidade_ia: 'iniciante',
      usar_preco_sugerido: false,
      preco_setup: 0, preco_mensalidade: 4000, preco_usuarios_inclusos: 10,
      preco_desconto: 25, usar_preco_faixas: false, preco_faixas: null,
    } as PropostaFormData, PRICING_PADRAO);
    expect(result.mensalidade_final).toBe(3000);
  });
});
