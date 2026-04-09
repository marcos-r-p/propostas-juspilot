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
            'w-80 rounded-none border border-rule bg-paper-pure p-4 transition-all border-l-[3px]',
            t.variant === 'destructive'
              ? 'border-l-danger'
              : 'border-l-ink'
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-body font-medium text-ink">{t.title}</p>
              {t.description && (
                <p className="mt-1 text-body-sm text-mute">{t.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-whisper hover:text-ink transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
