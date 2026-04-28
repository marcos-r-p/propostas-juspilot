import { z } from 'zod';

export const propostaSchema = z.object({
  // Step 1: Lead
  lead_nome: z.string().min(2, 'Nome do lead é obrigatório'),
  lead_email: z.string().email('Email inválido'),
  lead_telefone: z.string().min(10, 'Telefone inválido'),
  lead_cargo: z.string().optional(),

  // Step 2: Escritório
  escritorio_nome: z.string().min(2, 'Nome do escritório é obrigatório'),
  escritorio_cidade: z.string().min(2, 'Cidade é obrigatória'),
  escritorio_uf: z.string().length(2, 'UF inválida'),
  escritorio_qtd_advogados: z.number().min(1).max(500),
  escritorio_valor_hora: z.number().min(50).max(2000),
  escritorio_valor_hora_informado: z.boolean(),
  escritorio_site_url: z.string().optional().default(''),
  escritorio_logo_url: z.string().optional().default(''),

  // Step 3: Perfil
  escritorio_areas: z.array(z.string()).min(1, 'Selecione ao menos uma área'),
  escritorio_perfil: z.enum(['massa', 'boutique', 'misto']),

  // Step 4: Maturidade
  escritorio_maturidade_processos: z.enum([
    'inicial',
    'desenvolvimento',
    'maduro',
  ]),
  escritorio_maturidade_ia: z.enum([
    'nunca',
    'iniciante',
    'intermediario',
    'avancado',
  ]),

  // Step 5: Dores
  escritorio_dores: z.array(z.string()),
  escritorio_contexto: z.string().optional(),

  // Step 6: Preços
  usar_preco_sugerido: z.boolean(),
  preco_setup: z.number().min(0),
  preco_mensalidade: z.number().min(0),
  preco_usuarios_inclusos: z.number().min(1),
  preco_desconto: z.number().min(0).max(30),
  usar_preco_faixas: z.boolean().optional().default(false),
  preco_faixas: z.array(z.object({
    de_mes: z.number().min(1),
    ate_mes: z.number().nullable(),
    valor: z.number().min(0),
  })).max(5).nullable().optional().default(null),
});

export type PropostaSchemaType = z.infer<typeof propostaSchema>;
