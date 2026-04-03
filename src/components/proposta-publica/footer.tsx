export function PropostaFooter() {
  return (
    <footer className="border-t border-[#1e293b] px-4 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[#c9a96e] to-[#a08450]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-sm font-medium tracking-wide text-[#4a5568]">
            JusPilot — Copiloto Jurídico com IA
          </span>
        </div>
        <div className="text-xs tracking-wide text-[#1e293b]">
          Powered by Octolab
        </div>
      </div>
    </footer>
  );
}
