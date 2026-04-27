'use client';

import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          'relative z-10 w-full max-w-md rounded-xl border border-rule bg-paper-pure p-8 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18)]',
          className
        )}
      >
        <h3 className="text-heading-lg text-ink">{title}</h3>
        {description && <p className="mt-1 text-body text-mute">{description}</p>}
        <div className="mt-4 border-t border-rule pt-4">{children}</div>
      </div>
    </div>
  );
}
