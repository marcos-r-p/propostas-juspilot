'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase/server';

export async function deleteProposta(id: string) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Nao autorizado');

  const { error } = await supabase
    .from('propostas')
    .delete()
    .eq('id', id)
    .eq('created_by', user.id);

  if (error) throw new Error('Erro ao deletar proposta');

  revalidatePath('/dashboard');
}
