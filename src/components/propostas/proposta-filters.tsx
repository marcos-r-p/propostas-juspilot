'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'publicada', label: 'Publicada' },
  { value: 'visualizada', label: 'Visualizada' },
  { value: 'aceita', label: 'Aceita' },
  { value: 'recusada', label: 'Recusada' },
];

export function PropostaFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status') || 'all';
  const currentSearch = searchParams.get('search') || '';

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="🔍 Buscar por escritório ou lead..."
        defaultValue={currentSearch}
        onChange={(e) => {
          clearTimeout((window as any).__searchTimeout);
          (window as any).__searchTimeout = setTimeout(() => {
            updateParams('search', e.target.value);
          }, 400);
        }}
        className="flex-1 rounded-md border border-[#e4e4e7] bg-white px-3 py-2 text-sm text-[#09090b] placeholder:text-[#a1a1aa] focus:outline-none focus:ring-2 focus:ring-[#09090b] focus:ring-offset-1"
      />
      <select
        value={currentStatus}
        onChange={(e) => updateParams('status', e.target.value)}
        className="rounded-md border border-[#e4e4e7] bg-white px-3 py-2 text-sm text-[#71717a] focus:outline-none focus:ring-2 focus:ring-[#09090b] focus:ring-offset-1"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            Status: {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
