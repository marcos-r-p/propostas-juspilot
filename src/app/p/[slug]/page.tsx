import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { PropostaHeader } from '@/components/proposta-publica/header';
import { DoresSection } from '@/components/proposta-publica/dores-section';
import { FeaturesSection } from '@/components/proposta-publica/features-section';
import { ROISection } from '@/components/proposta-publica/roi-section';
import { PlatformSection } from '@/components/proposta-publica/platform-section';
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
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Proposta expirada</h1>
          <p className="mt-2 text-[#a1a1aa]">Esta proposta não está mais disponível.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TrackView propostaId={proposta.id} />
      <div className="min-h-screen bg-[#09090b]">
        {/* Grain texture */}
        <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.025]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }} />

        <PropostaHeader proposta={proposta} />
        <DoresSection proposta={proposta} />
        <FeaturesSection />
        <ROISection proposta={proposta} />
        <PlatformSection />
        <ComplianceSection />
        <PricingSection proposta={proposta} />
        <TimelineSection />
        <PropostaFooter />
      </div>

      {/* Reveal animation styles */}
      <style>{`
        .reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      {/* Reveal observer script */}
      <script dangerouslySetInnerHTML={{ __html: `
        document.addEventListener('DOMContentLoaded', function() {
          var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add('visible');
              }
            });
          }, { threshold: 0.1 });
          document.querySelectorAll('.reveal').forEach(function(el) {
            observer.observe(el);
          });
        });
      `}} />
    </>
  );
}
