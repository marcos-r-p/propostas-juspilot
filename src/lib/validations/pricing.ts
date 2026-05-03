import { z } from 'zod';

const pct = z.number().min(0).max(1);
const pctInteiro = z.number().min(0).max(100);

export const faixaPorteSchema = z.object({
  min: z.number().int().positive(),
  max: z.number().int().positive().nullable(),
  setup: z.number().nonnegative(),
  mensalidade: z.number().nonnegative(),
  usuarios: z.number().int().positive().nullable(),
  incremento_por_dezena_advogados: z.number().nonnegative().optional(),
});

export const faixasPorteSchema = z.array(faixaPorteSchema).min(1).superRefine((faixas, ctx) => {
  const sorted = [...faixas].sort((a, b) => a.min - b.min);
  for (let i = 0; i < sorted.length; i++) {
    const cur = sorted[i];
    if (cur.max !== null && cur.max < cur.min) {
      ctx.addIssue({ code: 'custom', message: `Faixa ${i}: max < min`, path: [i] });
    }
    if (i > 0) {
      const prev = sorted[i - 1];
      if (prev.max === null) {
        ctx.addIssue({ code: 'custom', message: `Faixa ${i}: anterior tem max=null (deve ser última)`, path: [i] });
      } else if (cur.min !== prev.max + 1) {
        ctx.addIssue({
          code: 'custom',
          message: `Faixa ${i}: descontínua (esperava min=${prev.max + 1}, recebeu min=${cur.min})`,
          path: [i],
        });
      }
    }
  }
  if (sorted.length > 0 && sorted[sorted.length - 1].max !== null) {
    ctx.addIssue({ code: 'custom', message: 'Última faixa deve ter max=null (aberta)', path: [sorted.length - 1] });
  }
});

export const pricingROISchema = z.object({
  horas_mensais: z.number().int().positive(),
  valor_hora_padrao: z.number().nonnegative(),
  atividades_ia_por_perfil: z.object({
    boutique: pct, misto: pct, massa: pct,
  }),
  taxa_reducao_por_maturidade: z.object({
    nunca: pct, iniciante: pct, intermediario: pct, avancado: pct,
  }),
});

export const pricingLimitesSchema = z.object({
  desconto_maximo_pct: pctInteiro,
  mensalidade_minima: z.number().nonnegative(),
  validade_proposta_dias: z.number().int().positive(),
  reajuste_anual_pct: pctInteiro,
});

export const pricingDataSchema = z.object({
  faixas_porte: faixasPorteSchema,
  roi: pricingROISchema,
  limites: pricingLimitesSchema,
});

export const progressiveTemplateFaixasSchema = z
  .array(z.object({
    mes_inicio: z.number().int().positive(),
    mes_fim: z.number().int().positive().nullable(),
    valor: z.number().nonnegative(),
  }))
  .min(1)
  .superRefine((faixas, ctx) => {
    const sorted = [...faixas].sort((a, b) => a.mes_inicio - b.mes_inicio);
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const cur = sorted[i];
      if (prev.mes_fim === null) {
        ctx.addIssue({ code: 'custom', message: `Faixa ${i}: anterior é aberta`, path: [i] });
      } else if (cur.mes_inicio !== prev.mes_fim + 1) {
        ctx.addIssue({
          code: 'custom',
          message: `Faixa ${i}: descontínua (esperava mes_inicio=${prev.mes_fim + 1})`,
          path: [i],
        });
      }
    }
  });

export const progressiveTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().nullable().optional(),
  faixas: progressiveTemplateFaixasSchema,
});

export const pricingTableMetadataSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(500).nullable().optional(),
  is_default: z.boolean().optional(),
  is_active: z.boolean().optional(),
});
