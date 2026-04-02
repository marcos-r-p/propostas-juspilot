export type PropostaStatus =
  | 'rascunho'
  | 'publicada'
  | 'visualizada'
  | 'aceita'
  | 'recusada'
  | 'expirada';

export type EscritorioPerfil = 'massa' | 'boutique' | 'misto';

export type MaturidadeProcessos = 'inicial' | 'desenvolvimento' | 'maduro';

export type MaturidadeIA = 'nunca' | 'iniciante' | 'intermediario' | 'avancado';

export type AreaAtuacao =
  | 'Trabalhista'
  | 'Bancário'
  | 'Consumidor'
  | 'Cível'
  | 'Família'
  | 'Empresarial'
  | 'Tributário'
  | 'Criminal'
  | 'Ambiental'
  | 'Imobiliário'
  | 'Previdenciário'
  | 'Administrativo';

export type DorId =
  | 'tempo_pecas'
  | 'pesquisa_jurisprudencia'
  | 'gestao_prazos'
  | 'padronizacao'
  | 'comunicacao_cliente'
  | 'contratos'
  | 'automacao';

export interface Profile {
  id: string;
  email: string;
  nome: string;
  cargo?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Proposta {
  id: string;
  slug: string;
  created_by: string;
  status: PropostaStatus;

  // Lead
  lead_nome?: string;
  lead_email?: string;
  lead_telefone?: string;
  lead_cargo?: string;

  // Escritório
  escritorio_nome: string;
  escritorio_cidade: string;
  escritorio_uf: string;
  escritorio_qtd_advogados: number;
  escritorio_areas: AreaAtuacao[];
  escritorio_perfil: EscritorioPerfil;
  escritorio_maturidade_processos: MaturidadeProcessos;
  escritorio_maturidade_ia: MaturidadeIA;
  escritorio_valor_hora: number;
  escritorio_valor_hora_informado: boolean;
  escritorio_contexto?: string;
  escritorio_dores: DorId[];

  // Preços
  preco_setup: number;
  preco_mensalidade: number;
  preco_usuarios_inclusos: number;
  preco_desconto: number;
  preco_mensalidade_final: number;

  // ROI
  roi_horas_economizadas_total?: number;
  roi_horas_economizadas_por_adv?: number;
  roi_valor_gerado?: number;
  roi_percentual?: number;
  roi_multiplo?: number;
  roi_custo_por_advogado?: number;

  // Meta
  validade_dias: number;
  data_expiracao?: string;
  visualizacoes: number;
  primeira_visualizacao?: string;
  ultima_visualizacao?: string;

  created_at: string;
  updated_at: string;

  // Relations
  profile?: Profile;
}

export interface PropostaView {
  id: string;
  proposta_id: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  created_at: string;
}

export interface PropostaActivity {
  id: string;
  proposta_id: string;
  user_id?: string;
  action: string;
  details?: Record<string, unknown>;
  created_at: string;
  profile?: Profile;
}

// Form types
export interface PropostaFormData {
  // Step 1: Lead
  lead_nome: string;
  lead_email: string;
  lead_telefone: string;
  lead_cargo?: string;

  // Step 2: Escritório básico
  escritorio_nome: string;
  escritorio_cidade: string;
  escritorio_uf: string;
  escritorio_qtd_advogados: number;
  escritorio_valor_hora: number;
  escritorio_valor_hora_informado: boolean;

  // Step 3: Perfil
  escritorio_areas: AreaAtuacao[];
  escritorio_perfil: EscritorioPerfil;

  // Step 4: Maturidade
  escritorio_maturidade_processos: MaturidadeProcessos;
  escritorio_maturidade_ia: MaturidadeIA;

  // Step 5: Dores
  escritorio_dores: DorId[];
  escritorio_contexto?: string;

  // Step 6: Preços
  usar_preco_sugerido: boolean;
  preco_setup: number;
  preco_mensalidade: number;
  preco_usuarios_inclusos: number;
  preco_desconto: number;
}

// Calculated values
export interface ROICalculation {
  horas_economizadas_por_adv: number;
  horas_economizadas_total: number;
  valor_gerado: number;
  roi_percentual: number;
  roi_multiplo: number;
  custo_por_advogado: number;
  mensalidade_final: number;
}
