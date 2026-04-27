'use client';

import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'hero', label: 'Início' },
  { id: 'diagnostico', label: 'Diagnóstico' },
  { id: 'numeros', label: 'Números' },
  { id: 'investimento', label: 'Investimento' },
  { id: 'implantacao', label: 'Implantação' },
];

export function NavChrome() {
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    function onScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
      setShowBackToTop(scrollTop > 600);

      // Find active section
      const scrollPos = scrollTop + window.innerHeight / 3;
      let active = 0;
      SECTIONS.forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (el && scrollPos >= el.offsetTop) active = i;
      });
      setActiveSection(active);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      {/* Scroll progress bar */}
      <div
        className="vitrine-progress"
        style={{ width: `${progress}%` }}
      />

      {/* Nav dots */}
      <nav className="fixed right-8 top-1/2 z-[60] hidden -translate-y-1/2 flex-col gap-3 lg:flex">
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            className={`group relative h-2 w-2 rounded-full border transition-all duration-300 ${
              i === activeSection
                ? 'border-[var(--vt-brand)] bg-[var(--vt-brand)]'
                : 'border-[var(--vt-graphite)] bg-transparent hover:border-[var(--vt-mute)]'
            }`}
            aria-label={s.label}
          >
            <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] uppercase tracking-[0.08em] text-[var(--vt-mute)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {s.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Back to top */}
      <button
        onClick={() => scrollTo('hero')}
        className={`fixed bottom-8 right-8 z-[60] flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--vt-graphite)] bg-[var(--vt-ink-soft)] text-[var(--vt-paper)] transition-all duration-300 hover:border-[var(--vt-brand)] hover:bg-[var(--vt-brand)] ${
          showBackToTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
        }`}
        aria-label="Voltar ao topo"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>
    </>
  );
}
