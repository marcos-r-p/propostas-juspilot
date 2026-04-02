import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { PropostaHeader } from '@/components/proposta-publica/header';
import { HeroSection } from '@/components/proposta-publica/hero-section';
import { DoresSection } from '@/components/proposta-publica/dores-section';
import { FeaturesSection } from '@/components/proposta-publica/features-section';
import { ROISection } from '@/components/proposta-publica/roi-section';
import { ComplianceSection } from '@/components/proposta-publica/compliance-section';
import { PricingSection } from '@/components/proposta-publica/pricing-section';
import { TimelineSection } from '@/components/proposta-publica/timeline-section';
import { PropostaFooter } from '@/components/proposta-publica/footer';
import { TrackView } from './track-view';
import type { Proposta } from '@/types';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProposta(slug: string) {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('propostas')
    .select('*')
    .eq('slug', slug)
    .in('status', ['publicada', 'visualizada', 'aceita'])
    .single();
  return data as Proposta | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const proposta = await getProposta(slug);
  if (!proposta) return { title: 'Proposta não encontrada' };
  return {
    title: `JusPilot — Proposta para ${proposta.escritorio_nome}`,
    description: `Proposta comercial personalizada do JusPilot para ${proposta.escritorio_nome}`,
    openGraph: {
      title: `JusPilot — Proposta para ${proposta.escritorio_nome}`,
      description: 'Copiloto Jurídico com Inteligência Artificial',
    },
  };
}

export default async function PropostaPublicaPage({ params }: Props) {
  const { slug } = await params;
  const proposta = await getProposta(slug);
  if (!proposta) notFound();

  if (proposta.data_expiracao && new Date(proposta.data_expiracao) < new Date()) {
    return (
      <div className="proposta-page flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-6 h-px w-16 bg-[#c9a96e]" />
          <h1 className="font-display text-2xl font-light tracking-wide text-white">Proposta expirada</h1>
          <p className="mt-3 text-sm tracking-wide text-[#8b95a5]">Esta proposta não está mais disponível.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TrackView propostaId={proposta.id} />
      <div className="proposta-page min-h-screen">
        <div className="proposta-grain" />
        <PropostaHeader proposta={proposta} />
        <HeroSection proposta={proposta} />
        <DoresSection proposta={proposta} />
        <FeaturesSection />
        <ROISection proposta={proposta} />
        <ComplianceSection />
        <PricingSection proposta={proposta} />
        <TimelineSection />
        <PropostaFooter />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap');

        .proposta-page {
          --gold: #c9a96e;
          --gold-light: #e2c992;
          --gold-dim: #a08450;
          --navy: #0a0f1c;
          --navy-light: #111827;
          --navy-card: #141c2e;
          --navy-border: #1e293b;
          --text-primary: #f1f5f9;
          --text-secondary: #8b95a5;
          --text-muted: #4a5568;
          background: var(--navy);
          color: var(--text-primary);
        }

        .proposta-page .font-display {
          font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
        }

        .proposta-page .font-body {
          font-family: 'DM Sans', system-ui, sans-serif;
        }

        .proposta-page {
          font-family: 'DM Sans', system-ui, sans-serif;
        }

        .proposta-grain {
          pointer-events: none;
          position: fixed;
          inset: 0;
          z-index: 50;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        .reveal {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .reveal-delay-1 { transition-delay: 0.1s; }
        .reveal-delay-2 { transition-delay: 0.2s; }
        .reveal-delay-3 { transition-delay: 0.3s; }
        .reveal-delay-4 { transition-delay: 0.4s; }

        .gold-glow {
          box-shadow: 0 0 60px -12px rgba(201, 169, 110, 0.15);
        }

        .card-hover {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease, box-shadow 0.4s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          border-color: rgba(201, 169, 110, 0.3);
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.4), 0 0 60px -20px rgba(201, 169, 110, 0.1);
        }

        .proposta-page ::-webkit-scrollbar { width: 6px; }
        .proposta-page ::-webkit-scrollbar-track { background: var(--navy); }
        .proposta-page ::-webkit-scrollbar-thumb { background: var(--navy-border); border-radius: 3px; }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes pulse-gold {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }

        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-gold { animation: pulse-gold 3s ease-in-out infinite; }

        .gradient-text {
          background: linear-gradient(135deg, var(--gold-light), var(--gold), var(--gold-dim));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .section-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--navy-border) 20%, var(--gold-dim) 50%, var(--navy-border) 80%, transparent);
        }
      `}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        document.addEventListener('DOMContentLoaded', function() {
          var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add('visible');
              }
            });
          }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
          document.querySelectorAll('.reveal').forEach(function(el) {
            observer.observe(el);
          });
        });
      `}} />
    </>
  );
}
