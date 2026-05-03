import 'server-only';
import { createServerClient } from '@/lib/supabase/server';
import { pricingDataSchema } from '@/lib/validations/pricing';
import type {
  PricingData,
  PricingTableCurrent,
  ProgressiveTemplate,
} from './types';
import { DEFAULT_PRICING_DATA } from './default-data';

/**
 * Load a specific pricing table version (or the default if no id given).
 * Throws if the data doesn't conform to the schema. Falls back to
 * DEFAULT_PRICING_DATA only when querying default and no row exists.
 */
export async function loadPricingData(tableId?: string): Promise<{
  data: PricingData;
  table: PricingTableCurrent | null;
}> {
  const supabase = await createServerClient();
  let query = supabase.from('pricing_tables_current').select('*');
  if (tableId) {
    query = query.eq('id', tableId);
  } else {
    query = query.eq('is_default', true).eq('is_active', true);
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(`pricing load error: ${error.message}`);
  if (!data) {
    return { data: DEFAULT_PRICING_DATA, table: null };
  }

  const parsed = pricingDataSchema.parse(data.data);
  return { data: parsed, table: data as PricingTableCurrent };
}

export async function loadDefaultPricingData() {
  return loadPricingData();
}

export async function loadAllPricingTables(): Promise<PricingTableCurrent[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('pricing_tables_current')
    .select('*')
    .eq('is_active', true)
    .order('is_default', { ascending: false })
    .order('name');
  if (error) throw new Error(error.message);
  return (data ?? []) as PricingTableCurrent[];
}

export async function loadProgressiveTemplates(): Promise<ProgressiveTemplate[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('progressive_templates')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ProgressiveTemplate[];
}

export async function loadVersionHistory(tableId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('pricing_table_versions')
    .select('id, version_number, data, created_at, created_by, profiles(nome)')
    .eq('table_id', tableId)
    .order('version_number', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
