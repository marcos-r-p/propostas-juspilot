import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: { label: string; href: string };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#e4e4e7] py-16">
      <h3 className="text-base font-medium text-[#09090b]">{title}</h3>
      <p className="mt-1 text-sm text-[#a1a1aa]">{description}</p>
      {action && (
        <Link href={action.href} className="mt-4">
          <Button>{action.label}</Button>
        </Link>
      )}
    </div>
  );
}
