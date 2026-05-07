'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { VersionDiff } from '../components/version-diff';

interface Version {
  id: string;
  version_number: number;
  created_at: string;
  created_by: string | null;
  data: unknown;
}

export function HistoricoTab({ initialVersions }: { tableId: string; initialVersions: Version[] }) {
  const [diffing, setDiffing] = useState<{ current: Version; previous: Version | null } | null>(null);
  return (
    <Card>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-[#7A7370]">Histórico de versões</h3>
      <table className="mt-3 w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-wide text-[#7A7370]">
          <tr><th className="py-2">Versão</th><th>Data</th><th>Editor</th><th></th></tr>
        </thead>
        <tbody>
          {initialVersions.map((v, i) => {
            const prev = initialVersions[i + 1] ?? null;
            return (
              <tr key={v.id} className="border-t border-[#E3E0DD]">
                <td className="py-2">v{v.version_number}</td>
                <td>{new Date(v.created_at).toLocaleString('pt-BR')}</td>
                <td className="text-[#7A7370]">{v.created_by ?? '—'}</td>
                <td className="text-right">
                  {prev && (
                    <button className="text-xs text-[#D97757] hover:underline"
                      onClick={() => setDiffing({ current: v, previous: prev })}>
                      Ver diff
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Dialog
        open={!!diffing}
        onClose={() => setDiffing(null)}
        title={`v${diffing?.previous?.version_number ?? '?'} → v${diffing?.current?.version_number ?? '?'}`}
      >
        {diffing && <VersionDiff before={diffing.previous?.data} after={diffing.current.data} />}
      </Dialog>
    </Card>
  );
}
