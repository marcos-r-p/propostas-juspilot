import { describe, it, expect } from 'vitest';
import { clampDesconto, validateMensalidade } from './apply-limits';

const limites = { desconto_maximo_pct: 30, mensalidade_minima: 1000, validade_proposta_dias: 30, reajuste_anual_pct: 8 };

describe('clampDesconto', () => {
  it('mantém desconto dentro do limite', () => expect(clampDesconto(20, limites)).toBe(20));
  it('limita ao máximo', () => expect(clampDesconto(50, limites)).toBe(30));
  it('rejeita negativo', () => expect(clampDesconto(-5, limites)).toBe(0));
});

describe('validateMensalidade', () => {
  it('aceita acima do mínimo', () => expect(validateMensalidade(1500, limites)).toEqual({ ok: true }));
  it('rejeita abaixo do mínimo', () => {
    const r = validateMensalidade(500, limites);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toContain('1.000');
  });
});
