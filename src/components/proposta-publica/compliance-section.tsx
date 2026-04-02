const COMPLIANCE_ITEMS = [
  { icon: '🔒', title: 'Criptografia AES-256', description: 'Todos os dados armazenados com criptografia de nível militar.' },
  { icon: '🛡️', title: 'LGPD Compliant', description: 'Conformidade total com a Lei Geral de Proteção de Dados.' },
  { icon: '☁️', title: 'Infraestrutura AWS', description: 'Servidores no Brasil com 99.9% de uptime garantido.' },
  { icon: '📋', title: 'Audit Trail', description: 'Registro completo de todas as ações para compliance.' },
];

export function ComplianceSection() {
  return (
    <section className="reveal px-8 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-2 text-2xl font-bold text-white">Segurança e Compliance</h2>
        <p className="mb-10 text-[#a1a1aa]">Construído para atender os mais altos padrões de segurança.</p>
        <div className="grid gap-4 md:grid-cols-2">
          {COMPLIANCE_ITEMS.map((item) => (
            <div key={item.title} className="flex gap-4 rounded-lg border border-[#27272a] bg-[#18181b] p-5">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="mt-1 text-sm text-[#a1a1aa]">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
