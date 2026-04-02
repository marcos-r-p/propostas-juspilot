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
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div
        className={cn(
          'relative z-10 w-full max-w-md rounded-lg border border-[#e4e4e7] bg-white p-6 shadow-lg',
          className
        )}
      >
        <h3 className="text-lg font-semibold text-[#09090b]">{title}</h3>
        {description && <p className="mt-1 text-sm text-[#71717a]">{description}</p>}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
