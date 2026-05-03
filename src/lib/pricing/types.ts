import type { EscritorioPerfil, MaturidadeIA } from '@/types/database';

export interface FaixaPorte {
  min: number;
  max: number | null;
  setup: number;
  mensalidade: number;
  usuarios: number | null;
  incremento_por_dezena_advogados?: number;
}

export interface PricingROI {
  horas_mensais: number;
  valor_hora_padrao: number;
  atividades_ia_por_perfil: Record<EscritorioPerfil, number>;
  taxa_reducao_por_maturidade: Record<MaturidadeIA, number>;
}

export interface PricingLimites {
  desconto_maximo_pct: number;
  mensalidade_minima: number;
  validade_proposta_dias: number;
  reajuste_anual_pct: number;
}

export interface PricingData {
  faixas_porte: FaixaPorte[];
  roi: PricingROI;
  limites: PricingLimites;
}

export interface PricingTable {
  id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PricingTableCurrent extends PricingTable {
  current_version_id: string;
  version_number: number;
  data: PricingData;
  version_created_at: string;
  version_created_by: string | null;
}

export interface PricingTableVersion {
  id: string;
  table_id: string;
  version_number: number;
  data: PricingData;
  created_by: string | null;
  created_at: string;
}

export interface ProgressiveTemplate {
  id: string;
  name: string;
  description: string | null;
  faixas: Array<{ mes_inicio: number; mes_fim: number | null; valor: number }>;
  created_by: string | null;
  created_at: string;
}
