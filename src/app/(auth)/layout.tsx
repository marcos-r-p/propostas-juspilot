export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-2xl font-bold text-[#09090b]">⚖️ JusPilot</div>
          <p className="mt-1 text-sm text-[#a1a1aa]">Gerador de Propostas Comerciais</p>
        </div>
        {children}
        <p className="mt-6 text-center text-xs text-[#a1a1aa]">
          Uso exclusivo do time JusPilot · Powered by Octolab
        </p>
      </div>
    </div>
  );
}
