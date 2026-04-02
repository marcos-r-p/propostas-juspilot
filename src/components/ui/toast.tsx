'use client';

import { useToastStore } from '@/hooks/use-toast';
import { cn } from '@/lib/utils/cn';

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'w-80 rounded-lg border p-4 shadow-lg transition-all',
            t.variant === 'destructive'
              ? 'border-red-200 bg-red-50 text-red-900'
              : 'border-[#e4e4e7] bg-white text-[#09090b]'
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium">{t.title}</p>
              {t.description && (
                <p className="mt-1 text-xs text-[#71717a]">{t.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-[#a1a1aa] hover:text-[#09090b]"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
