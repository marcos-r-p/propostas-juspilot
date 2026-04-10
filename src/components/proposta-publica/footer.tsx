export function PropostaFooter() {
  return (
    <footer className="mx-auto max-w-[1100px] px-6 py-14 sm:px-12">
      <div className="flex items-center justify-between border-t border-[var(--vt-paper)]/6 pt-14">
        <div className="flex items-center gap-3">
          {/* Small monogram seal */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--vt-graphite)]">
            <span className="font-display text-[15px] font-semibold leading-none text-[var(--vt-graphite)]">
              J
            </span>
          </div>
          <span className="font-display text-xl font-semibold tracking-[0.06em] text-[var(--vt-graphite)]" style={{ fontVariantCaps: 'small-caps' }}>
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
