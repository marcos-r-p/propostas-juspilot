import { createServerClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';

export const metadata = { title: 'Configurações' };

export default async function ConfiguracoesPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-[#09090b]">Configurações</h1>

      <Card className="max-w-md">
        <div className="text-xs font-semibold uppercase tracking-wide text-[#a1a1aa]">Perfil</div>
        <div className="mt-3 space-y-3 text-sm">
          <div>
            <span className="text-[#a1a1aa]">Nome:</span>{' '}
            <span className="text-[#09090b]">{profile?.nome || '—'}</span>
          </div>
          <div>
            <span className="text-[#a1a1aa]">Email:</span>{' '}
            <span className="text-[#09090b]">{profile?.email || user?.email || '—'}</span>
          </div>
          <div>
            <span className="text-[#a1a1aa]">Cargo:</span>{' '}
            <span className="text-[#09090b]">{profile?.cargo || '—'}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
