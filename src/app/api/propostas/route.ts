import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { propostaSchema } from '@/lib/validations/proposta';
import { generateSlug } from '@/lib/utils/slug';
import { calculateROI, getPrecoSugerido } from '@/lib/utils/roi';
import type { PropostaFormData } from '@/types';

export async function GET(request: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  let query = supabase
    .from('propostas')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status && status !== 'all') query = query.eq('status', status);
  if (search) query = query.or(`escritorio_nome.ilike.%${search}%,lead_nome.ilike.%${search}%`);

  const { data, error, count } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data, pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) } });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = propostaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 });
  }

  const formData = parsed.data as PropostaFormData;
  const slug = generateSlug(formData.escritorio_nome);
  const roi = calculateROI(formData);
  const sugerido = getPrecoSugerido(formData.escritorio_qtd_advogados);

  const dataExpiracao = new Date();
  dataExpiracao.setDate(dataExpiracao.getDate() + 30);

  const propostaData = {
    slug,
    created_by: user.id,
    status: 'rascunho',
    lead_nome: formData.lead_nome,
    lead_email: formData.lead_email,
    lead_telefone: formData.lead_telefone,
    lead_cargo: formData.lead_cargo,
    escritorio_nome: formData.escritorio_nome,
    escritorio_cidade: formData.escritorio_cidade,
    escritorio_uf: formData.escritorio_uf,
    escritorio_qtd_advogados: formData.escritorio_qtd_advogados,
    escritorio_areas: formData.escritorio_areas,
    escritorio_perfil: formData.escritorio_perfil,
    escritorio_maturidade_processos: formData.escritorio_maturidade_processos,
    escritorio_maturidade_ia: formData.escritorio_maturidade_ia,
    escritorio_valor_hora: formData.escritorio_valor_hora,
    escritorio_valor_hora_informado: formData.escritorio_valor_hora_informado,
    escritorio_contexto: formData.escritorio_contexto,
    escritorio_dores: formData.escritorio_dores,
    escritorio_site_url: formData.escritorio_site_url || null,
    escritorio_logo_url: formData.escritorio_logo_url || null,
    preco_setup: formData.usar_preco_sugerido ? sugerido.setup : formData.preco_setup,
    preco_mensalidade: formData.usar_preco_sugerido ? sugerido.mensalidade : formData.preco_mensalidade,
    preco_usuarios_inclusos: formData.usar_preco_sugerido ? sugerido.usuarios : formData.preco_usuarios_inclusos,
    preco_desconto: formData.preco_desconto,
    preco_mensalidade_final: roi.mensalidade_final,
    preco_faixas: formData.usar_preco_faixas ? formData.preco_faixas : null,
    roi_horas_economizadas_total: roi.horas_economizadas_total,
    roi_horas_economizadas_por_adv: roi.horas_economizadas_por_adv,
    roi_valor_gerado: roi.valor_gerado,
    roi_percentual: roi.roi_percentual,
    roi_multiplo: roi.roi_multiplo,
    roi_custo_por_advogado: roi.custo_por_advogado,
    validade_dias: 30,
    data_expiracao: dataExpiracao.toISOString().split('T')[0],
  };

  const { data, error } = await supabase.from('propostas').insert(propostaData).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from('proposta_activities').insert({ proposta_id: data.id, user_id: user.id, action: 'created' });

  return NextResponse.json(data, { status: 201 });
}
