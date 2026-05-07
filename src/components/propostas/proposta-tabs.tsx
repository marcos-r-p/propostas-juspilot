'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

interface TabItem {
  label: string;
  value: string;
  count: number;
}

interface PropostaTabsProps {
  counts: {
    total: number;
    publicadas: number;
    visualizadas: number;
    aceitas: number;
    recusadas: number;
  };
}

export function PropostaTabs({ counts }: PropostaTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status') || 'all';

  const tabs: TabItem[] = [
    { label: 'Todas', value: 'all', count: counts.total },
    { label: 'Publicadas', value: 'publicada', count: counts.publicadas },
    { label: 'Visualizadas', value: 'visualizada', count: counts.visualizadas },
    { label: 'Aceitas', value: 'aceita', count: counts.aceitas },
    { label: 'Recusadas', value: 'recusada', count: counts.recusadas },
  ];

  function handleTabClick(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete('status');
    } else {
      params.set('status', value);
    }
    params.delete('page');
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <div className="flex gap-6 overflow-x-auto border-b border-rule">
      {tabs.map((tab) => {
        const isActive = currentStatus === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => handleTabClick(tab.value)}
            className={cn(
              'whitespace-nowrap border-b-2 pb-3 text-[14px] transition-colors',
              isActive
                ? 'border-brand font-semibold text-ink'
                : 'border-transparent text-mute hover:text-ink'
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={cn(
                  'ml-1.5 inline-flex items-center rounded-sm px-1.5 py-0.5 text-[11px] font-semibold',
                  isActive
                    ? 'bg-brand-soft text-brand'
                    : 'bg-rule-soft text-mute'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
