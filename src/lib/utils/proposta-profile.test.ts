import { describe, it, expect } from 'vitest';
import { deriveProfile, getProfileCopy } from './proposta-profile';
import type { Proposta } from '@/types';

const baseProposta = {
  id: 'p1',
  slug: 'p1',
  created_by: 'u1',
  status: 'publicada' as const,
  escritorio_nome: 'Teste Advogados',
  escritorio_cidade: 'São Paulo',
  escritorio_uf: 'SP',
  escritorio_qtd_advogados: 8,
  escritorio_areas: [],
  escritorio_perfil: 'boutique' as const,
  escritorio_maturidade_processos: 'inicial' as const,
  escritorio_maturidade_ia: 'nunca' as const,
  escritorio_valor_hora: 300,
  escritorio_valor_hora_informado: false,
  escritorio_dores: [],
  preco_setup: 2000,
  preco_mensalidade: 1500,
  preco_usuarios_inclusos: 5,
  preco_desconto: 0,
  preco_mensalidade_final: 1500,
  validade_dias: 30,
  visualizacoes: 0,
  created_at: '',
  updated_at: '',
  pricing_table_id: null,
  pricing_version_id: null,
} as Proposta;

describe('deriveProfile', () => {
  it('returns boutique_publico when small firm with public law areas', () => {
    const p = { ...baseProposta, escritorio_qtd_advogados: 8, escritorio_areas: ['Direito Público'] } as Proposta;
    expect(deriveProfile(p).id).toBe('boutique_publico');
  });

  it('returns boutique_empresarial when small firm with corporate areas', () => {
    const p = { ...baseProposta, escritorio_qtd_advogados: 10, escritorio_areas: ['Empresarial/Societário', 'Tributário'] } as Proposta;
    expect(deriveProfile(p).id).toBe('boutique_empresarial');
  });

  it('returns boutique_criminal when small firm with criminal areas', () => {
    const p = { ...baseProposta, escritorio_qtd_advogados: 5, escritorio_areas: ['Criminal'] } as Proposta;
    expect(deriveProfile(p).id).toBe('boutique_criminal');
  });

  it('returns contencioso_massa when firm has more than 30 lawyers', () => {
    const p = { ...baseProposta, escritorio_qtd_advogados: 50, escritorio_areas: ['Trabalhista'] } as Proposta;
    expect(deriveProfile(p).id).toBe('contencioso_massa');
  });

  it('returns contencioso_massa when escritorio_perfil is massa', () => {
    const p = { ...baseProposta, escritorio_qtd_advogados: 10, escritorio_perfil: 'massa', escritorio_areas: [] } as Proposta;
    expect(deriveProfile(p).id).toBe('contencioso_massa');
  });

  it('returns misto when no specific match', () => {
    const p = { ...baseProposta, escritorio_qtd_advogados: 20, escritorio_areas: [], escritorio_perfil: 'misto' } as Proposta;
    expect(deriveProfile(p).id).toBe('misto');
  });
});

describe('getProfileCopy', () => {
  it('provides hero headline for each profile', () => {
    expect(getProfileCopy('boutique_publico').heroHeadline).toContain('Direito Público');
    expect(getProfileCopy('contencioso_massa').heroHeadline).toContain('Escale');
    expect(getProfileCopy('misto').heroHeadline).toContain('amplificado');
  });

  it('provides diagnostico title for each profile', () => {
    expect(getProfileCopy('boutique_publico').diagnosticoTitle).toContain('desafios');
    expect(getProfileCopy('contencioso_massa').diagnosticoTitle).toContain('Gargalos');
  });
});
