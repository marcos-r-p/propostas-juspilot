export function PropostaFooter() {
  return (
    <footer className="mx-auto max-w-[1100px] px-6 py-14 sm:px-12">
      <div className="flex items-center justify-between border-t border-[var(--vt-paper)]/6 pt-14">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--vt-brand)]">
            <span className="text-sm font-bold text-white">J</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-[var(--vt-graphite)]">
            Juspilot
          </span>
        </div>

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
