import { describe, it, expect } from 'vitest';
import { pricingDataSchema, faixasPorteSchema, progressiveTemplateSchema } from './pricing';

describe('pricingDataSchema', () => {
  const valid = {
    faixas_porte: [
      { min: 1, max: 3, setup: 2000, mensalidade: 1500, usuarios: 5 },
      { min: 4, max: null, setup: 3500, mensalidade: 3000, usuarios: 10 },
    ],
    roi: {
      horas_mensais: 176, valor_hora_padrao: 250,
      atividades_ia_por_perfil: { boutique: 0.3, misto: 0.4, massa: 0.5 },
      taxa_reducao_por_maturidade: { nunca: 0.6, iniciante: 0.5, intermediario: 0.45, avancado: 0.4 },
    },
    limites: { desconto_maximo_pct: 30, mensalidade_minima: 1000, validade_proposta_dias: 30, reajuste_anual_pct: 8 },
  };

  it('aceita payload válido', () => {
    expect(() => pricingDataSchema.parse(valid)).not.toThrow();
  });

  it('rejeita percentual > 100', () => {
    const invalid = { ...valid, limites: { ...valid.limites, desconto_maximo_pct: 150 } };
    expect(() => pricingDataSchema.parse(invalid)).toThrow();
  });

  it('rejeita valor negativo', () => {
    const invalid = { ...valid, limites: { ...valid.limites, mensalidade_minima: -1 } };
    expect(() => pricingDataSchema.parse(invalid)).toThrow();
  });
});

describe('faixasPorteSchema', () => {
  it('rejeita faixas sobrepostas', () => {
    const overlap = [
      { min: 1, max: 5, setup: 100, mensalidade: 100, usuarios: 1 },
      { min: 4, max: 10, setup: 200, mensalidade: 200, usuarios: 2 },
    ];
    expect(() => faixasPorteSchema.parse(overlap)).toThrow();
  });

  it('rejeita faixa com gap', () => {
    const gap = [
      { min: 1, max: 5,  setup: 100, mensalidade: 100, usuarios: 1 },
      { min: 8, max: null, setup: 200, mensalidade: 200, usuarios: 2 },
    ];
    expect(() => faixasPorteSchema.parse(gap)).toThrow();
  });

  it('aceita faixas contínuas com última aberta', () => {
    const valid = [
      { min: 1, max: 5,    setup: 100, mensalidade: 100, usuarios: 1 },
      { min: 6, max: null, setup: 200, mensalidade: 200, usuarios: null },
    ];
    expect(() => faixasPorteSchema.parse(valid)).not.toThrow();
  });
});

describe('progressiveTemplateSchema', () => {
  it('aceita template válido', () => {
    expect(() =>
      progressiveTemplateSchema.parse({
        name: '3+9',
        faixas: [
          { mes_inicio: 1, mes_fim: 3, valor: 1500 },
          { mes_inicio: 4, mes_fim: null, valor: 3000 },
        ],
      }),
    ).not.toThrow();
  });

  it('rejeita faixas sem cobertura contínua', () => {
    expect(() =>
      progressiveTemplateSchema.parse({
        name: 'X',
        faixas: [
          { mes_inicio: 1, mes_fim: 3, valor: 1500 },
          { mes_inicio: 6, mes_fim: null, valor: 3000 },
        ],
      }),
    ).toThrow();
  });
});
