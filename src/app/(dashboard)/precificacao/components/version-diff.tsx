'use client';

export function VersionDiff({ before, after }: { before: unknown; after: unknown }) {
  const diff = computeDiff(before, after, '');
  if (diff.length === 0) {
    return <div className="text-sm text-[#71717a]">Sem alterações.</div>;
  }
  return (
    <div className="space-y-1 font-mono text-xs">
      {diff.map((d, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_2fr] gap-2 border-b border-[#e4e4e7] py-1">
          <code className="text-[#71717a]">{d.path}</code>
          <code className="text-red-600">- {JSON.stringify(d.before)}</code>
          <code className="text-green-700">+ {JSON.stringify(d.after)}</code>
        </div>
      ))}
    </div>
  );
}

function computeDiff(a: unknown, b: unknown, path: string): Array<{ path: string; before: unknown; after: unknown }> {
  if (JSON.stringify(a) === JSON.stringify(b)) return [];
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return [{ path: path || '(root)', before: a, after: b }];
  }
  const keys = new Set([...Object.keys(a as object), ...Object.keys(b as object)]);
  const out: Array<{ path: string; before: unknown; after: unknown }> = [];
  for (const k of keys) {
    out.push(...computeDiff(
      (a as Record<string, unknown>)[k],
      (b as Record<string, unknown>)[k],
      path ? `${path}.${k}` : k,
    ));
  }
  return out;
}
