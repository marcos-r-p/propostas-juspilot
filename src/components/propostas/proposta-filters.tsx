'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function PropostaFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get('search') || '';
  const currentTipo = searchParams.get('tipo') || '';
  const currentPeriodo = searchParams.get('periodo') || '';

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <input
        type="text"
        placeholder="Buscar por escritorio ou lead..."
        defaultValue={currentSearch}
        onChange={(e) => {
          clearTimeout((window as any).__searchTimeout);
          (window as any).__searchTimeout = setTimeout(() => {
            updateParams('search', e.target.value);
          }, 400);
        }}
        className="w-full border-b border-rule bg-transparent pb-2 text-body-sm text-ink placeholder:text-whisper focus:border-ink focus:outline-none sm:w-64"
      />
      <select
        value={currentTipo}
        onChange={(e) => updateParams('tipo', e.target.value)}
        className="border-b border-rule bg-transparent pb-2 text-body-sm text-mute focus:border-ink focus:outline-none"
      >
        <option value="">Todos os tipos</option>
        <option value="massa">Volume</option>
        <option value="boutique">Boutique</option>
        <option value="misto">Misto</option>
      </select>
      <select
        value={currentPeriodo}
        onChange={(e) => updateParams('periodo', e.target.value)}
        className="border-b border-rule bg-transparent pb-2 text-body-sm text-mute focus:border-ink focus:outline-none"
      >
        <option value="">Qualquer data</option>
        <option value="1m">Ultimo mes</option>
        <option value="3m">Ultimos 3 meses</option>
        <option value="6m">Ultimos 6 meses</option>
      </select>
    </div>
  );
}
