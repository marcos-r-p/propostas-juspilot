const COMPLIANCE_ITEMS = [
  {
    title: 'Criptografia AES-256',
    description: 'Todos os dados armazenados com criptografia de nível militar.',
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  },
  {
    title: 'LGPD Compliant',
    description: 'Conformidade total com a Lei Geral de Proteção de Dados.',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
  {
    title: 'Infraestrutura AWS',
    description: 'Servidores no Brasil com 99.9% de uptime garantido.',
    icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z',
  },
  {
    title: 'Audit Trail',
    description: 'Registro completo de todas as ações para compliance.',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  },
];

export function ComplianceSection() {
  return (
    <section className="px-4 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="reveal mb-16">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c9a96e]">Segurança</span>
          <h2 className="font-display mt-3 text-3xl font-medium tracking-tight text-[#f1f5f9] md:text-4xl">
            Compliance e proteção
          </h2>
          <p className="mt-4 max-w-xl text-[#8b95a5]">
            Construído para atender os mais altos padrões de segurança da advocacia.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {COMPLIANCE_ITEMS.map((item, i) => (
            <div
              key={item.title}
              className={`reveal reveal-delay-${Math.min(i + 1, 4)} flex items-start gap-5 rounded-xl border border-[#1e293b] bg-[#141c2e]/40 p-6`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#1e293b] bg-[#0a0f1c]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#f1f5f9]">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#8b95a5]">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-divider mx-auto mt-20 max-w-6xl" />
    </section>
  );
}
