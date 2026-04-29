'use client';

import { useReveal } from '@/hooks/use-reveal';

const SELOS = [
  {
    title: 'AES-256',
    description: 'Criptografia de dados em repouso e em trânsito',
    iconPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  },
  {
    title: 'LGPD',
    description: 'Conformidade integral com a Lei Geral de Proteção de Dados',
    iconPath: 'M9 12l2 2 4-4 M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  },
  {
    title: 'AWS São Paulo',
    description: 'Infraestrutura em nuvem com SLA de 99,9%',
    iconPath: 'M22 12h-4l-3 9L9 3l-3 9H2',
  },
  {
    title: 'Audit Trail',
    description: 'Trilha de auditoria completa de todas as ações',
    iconPath: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  },
];

export function SecuritySection() {
  const label = useReveal();
  const title = useReveal();

  return (
    <section id="seguranca" className="mx-auto max-w-[1100px] px-6 py-24 sm:px-12">
      <div
        ref={label.ref}
        className={`vt-reveal ${label.isVisible ? 'visible' : ''} mb-3.5 flex items-center gap-4 text-[11px] uppercase tracking-[0.14em] text-[var(--vt-mute)]`}
      >
        <span className="h-px w-6 bg-[var(--vt-brand)]" />
        Segurança
      </div>
      <div
        ref={title.ref}
        className={`vt-reveal ${title.isVisible ? 'visible' : ''} mb-14 text-4xl font-extrabold leading-[1.12] text-[var(--vt-paper)]`}
        style={{ transitionDelay: '0.1s' }}
      >
        Segurança e conformidade
      </div>

      <div className="mosaic-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {SELOS.map((selo, i) => {
          const SeloCard = () => {
            const { ref, isVisible } = useReveal();
            return (
              <div
                ref={ref}
                className={`vt-reveal ${isVisible ? 'visible' : ''} group bg-[var(--vt-ink)] p-9 text-center transition-[background] duration-300 hover:bg-[var(--vt-ink-soft)]`}
                style={{ transitionDelay: `${i * 0.08}s` }}
              >
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--vt-graphite)] text-[var(--vt-mute)] transition-colors duration-300 group-hover:border-[var(--vt-brand)] group-hover:text-[var(--vt-brand)]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={selo.iconPath} />
                  </svg>
                </div>
                <div className="text-base font-bold tracking-tight text-[var(--vt-paper)]">
                  {selo.title}
                </div>
                <div className="mt-2 text-[13px] leading-[1.5] text-[var(--vt-whisper)]">
                  {selo.description}
                </div>
              </div>
            );
          };
          return <SeloCard key={selo.title} />;
        })}
      </div>

      <div className="mt-8 text-center text-[12px] leading-[1.6] text-[var(--vt-mute)]">
        Cláusulas específicas de tratamento de dados, DPA e segregação de workspaces disponíveis sob demanda.
      </div>
    </section>
  );
}
