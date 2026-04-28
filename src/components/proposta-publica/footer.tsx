import type { Proposta } from '@/types';
import { JuspilotSymbol } from '@/components/brand/juspilot-symbol';

interface FooterProps {
  proposta: Proposta;
}

export function PropostaFooter({ proposta }: FooterProps) {
  const hasLogo = !!proposta.escritorio_logo_url;

  return (
    <footer className="mx-auto max-w-[1100px] px-6 py-14 sm:px-12">
      <div className="flex items-center justify-between border-t border-[var(--vt-paper)]/6 pt-14">
        {hasLogo ? (
          <div className="flex items-center gap-2 text-sm text-[var(--vt-graphite)]">
            <span className="opacity-60">Powered by</span>
            <JuspilotSymbol size={24} />
            <span className="font-medium opacity-60">Juspilot</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <JuspilotSymbol size={36} />
            <span className="text-lg font-bold tracking-tight text-[var(--vt-graphite)]">
              Juspilot
            </span>
          </div>
        )}

        <div className="flex gap-5 text-[11px] uppercase tracking-[0.06em] text-[var(--vt-graphite)]">
          {['AES-256', 'LGPD', 'AWS', 'Audit Trail'].map((item) => (
            <span key={item} className="opacity-60 transition-opacity duration-300 hover:opacity-100">
              {item}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
