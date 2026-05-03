'use client';

import type { FaixaPorte } from '@/lib/pricing/types';
import { Input } from '@/components/ui/input';

export function FaixasPorteEditor({
  faixas,
  onChange,
  disabled,
}: {
  faixas: FaixaPorte[];
  onChange: (next: FaixaPorte[]) => void;
  disabled?: boolean;
}) {
  const update = (i: number, patch: Partial<FaixaPorte>) => {
    const next = faixas.map((f, idx) => (idx === i ? { ...f, ...patch } : f));
    onChange(next);
  };
  const remove = (i: number) => onChange(faixas.filter((_, idx) => idx !== i));
  const add = () => {
    const last = faixas[faixas.length - 1];
    const newMin = last && last.max !== null ? last.max + 1 : 1;
    onChange([...faixas, { min: newMin, max: null, setup: 0, mensalidade: 0, usuarios: null }]);
  };

  return (
    <div className="space-y-2">
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-wide text-[#71717a]">
          <tr><th className="py-2">Min</th><th>Max</th><th>Setup</th><th>Mensalidade</th><th>Usuários</th><th>+10 adv.</th><th></th></tr>
        </thead>
        <tbody>
          {faixas.map((f, i) => (
            <tr key={i} className="border-t border-[#e4e4e7]">
              <td className="py-2 pr-2"><Input type="number" value={f.min} disabled={disabled}
                onChange={(e) => update(i, { min: Number(e.target.value) })} /></td>
              <td className="pr-2"><Input type="number" value={f.max ?? ''} placeholder="∞" disabled={disabled}
                onChange={(e) => update(i, { max: e.target.value === '' ? null : Number(e.target.value) })} /></td>
              <td className="pr-2"><Input type="number" value={f.setup} disabled={disabled}
                onChange={(e) => update(i, { setup: Number(e.target.value) })} /></td>
              <td className="pr-2"><Input type="number" value={f.mensalidade} disabled={disabled}
                onChange={(e) => update(i, { mensalidade: Number(e.target.value) })} /></td>
              <td className="pr-2"><Input type="number" value={f.usuarios ?? ''} placeholder="∞" disabled={disabled}
                onChange={(e) => update(i, { usuarios: e.target.value === '' ? null : Number(e.target.value) })} /></td>
              <td className="pr-2"><Input type="number" value={f.incremento_por_dezena_advogados ?? ''} placeholder="—" disabled={disabled}
                onChange={(e) => update(i, { incremento_por_dezena_advogados: e.target.value === '' ? undefined : Number(e.target.value) })} /></td>
              <td className="text-right">
                {!disabled && faixas.length > 1 && (
                  <button onClick={() => remove(i)} className="text-xs text-red-600 hover:underline">Remover</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!disabled && (
        <button onClick={add} className="text-sm text-[#D97757] hover:underline">+ Adicionar faixa</button>
      )}
    </div>
  );
}
