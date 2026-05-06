'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase/server';
import {
  pricingDataSchema,
  pricingTableMetadataSchema,
  progressiveTemplateSchema,
} from '@/lib/validations/pricing';

async function requireAdmin() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Acesso negado: apenas admin');
  return { supabase, userId: user.id };
}

export async function createTable(input: {
  name: string;
  description?: string | null;
  data: unknown;
}) {
  const { supabase, userId } = await requireAdmin();
  const meta = pricingTableMetadataSchema.parse({ name: input.name, description: input.description });
  const data = pricingDataSchema.parse(input.data);

  const { data: table, error: e1 } = await supabase
    .from('pricing_tables')
    .insert({ name: meta.name, description: meta.description ?? null, is_default: false, is_active: true })
    .select()
    .single();
  if (e1) throw e1;

  const { error: e2 } = await supabase
    .from('pricing_table_versions')
    .insert({ table_id: table.id, version_number: 1, data, created_by: userId });
  if (e2) throw e2;

  revalidatePath('/precificacao');
  return { id: table.id };
}

export async function updateTableMetadata(id: string, input: {
  name?: string;
  description?: string | null;
  is_active?: boolean;
}) {
  const { supabase } = await requireAdmin();
  const meta = pricingTableMetadataSchema.partial().parse(input);
  const { error } = await supabase.from('pricing_tables').update(meta).eq('id', id);
  if (error) throw error;
  revalidatePath('/precificacao');
}

export async function setDefaultTable(id: string) {
  const { supabase } = await requireAdmin();
  const { error: e1 } = await supabase.from('pricing_tables').update({ is_default: false }).eq('is_default', true);
  if (e1) throw e1;
  const { error: e2 } = await supabase.from('pricing_tables').update({ is_default: true }).eq('id', id);
  if (e2) throw e2;
  revalidatePath('/precificacao');
}

export async function createVersion(tableId: string, data: unknown) {
  const { supabase, userId } = await requireAdmin();
  const parsed = pricingDataSchema.parse(data);

  const { data: latest, error: eLatest } = await supabase
    .from('pricing_table_versions')
    .select('version_number')
    .eq('table_id', tableId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (eLatest) throw eLatest;
  const next = (latest?.version_number ?? 0) + 1;

  const { error } = await supabase
    .from('pricing_table_versions')
    .insert({ table_id: tableId, version_number: next, data: parsed, created_by: userId });
  if (error) throw error;

  revalidatePath('/precificacao');
  return { version_number: next };
}

export async function softDeleteTable(id: string) {
  const { supabase } = await requireAdmin();
  const { data: table } = await supabase
    .from('pricing_tables').select('is_default').eq('id', id).single();
  if (table?.is_default) throw new Error('Não é possível desativar a tabela default');
  const { error } = await supabase.from('pricing_tables').update({ is_active: false }).eq('id', id);
  if (error) throw error;
  revalidatePath('/precificacao');
}

export async function createProgressiveTemplate(input: {
  name: string;
  description?: string | null;
  faixas: unknown;
}) {
  const { supabase, userId } = await requireAdmin();
  const parsed = progressiveTemplateSchema.parse({
    name: input.name,
    description: input.description,
    faixas: input.faixas,
  });
  const { data, error } = await supabase
    .from('progressive_templates')
    .insert({
      name: parsed.name,
      description: parsed.description ?? null,
      faixas: parsed.faixas,
      created_by: userId,
    })
    .select()
    .single();
  if (error) throw error;
  revalidatePath('/precificacao');
  return { id: data.id };
}

export async function updateProgressiveTemplate(id: string, input: {
  name?: string;
  description?: string | null;
  faixas?: unknown;
}) {
  const { supabase } = await requireAdmin();
  const update: Record<string, unknown> = {};
  if (input.name !== undefined) update.name = input.name;
  if (input.description !== undefined) update.description = input.description;
  if (input.faixas !== undefined) {
    update.faixas = progressiveTemplateSchema.shape.faixas.parse(input.faixas);
  }
  const { error } = await supabase.from('progressive_templates').update(update).eq('id', id);
  if (error) throw error;
  revalidatePath('/precificacao');
}

export async function deleteProgressiveTemplate(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('progressive_templates').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/precificacao');
}
