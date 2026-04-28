import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { PropostaHeader } from '@/components/proposta-publica/header';
import { HeroSection } from '@/components/proposta-publica/hero-section';
import { DoresSection } from '@/components/proposta-publica/dores-section';
import { FeaturesSection } from '@/components/proposta-publica/features-section';
import { ROISection } from '@/components/proposta-publica/roi-section';
import { PricingSection } from '@/components/proposta-publica/pricing-section';
import { TimelineSection } from '@/components/proposta-publica/timeline-section';
import { PropostaFooter } from '@/components/proposta-publica/footer';
import { NavChrome } from '@/components/proposta-publica/nav-chrome';
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
      <div className="vitrine flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-6 h-px w-16 bg-[var(--vt-paper)]/20" />
          <h1 className="text-2xl font-bold tracking-tight text-[var(--vt-paper)]">Proposta expirada</h1>
          <p className="mt-3 text-sm tracking-wide text-[var(--vt-mute)]">Esta proposta não está mais disponível.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TrackView propostaId={proposta.id} />
      <div className="vitrine min-h-screen">
        <div className="vitrine-grain" />
        <NavChrome />

        <PropostaHeader proposta={proposta} />

        <HeroSection proposta={proposta} />

        <div className="mx-auto max-w-[1100px] px-6 sm:px-12"><hr className="vitrine-divider" /></div>

        <DoresSection proposta={proposta} />

        <div className="mx-auto max-w-[1100px] px-6 sm:px-12"><hr className="vitrine-divider" /></div>

        <ROISection proposta={proposta} />
        <FeaturesSection />

        <div className="mx-auto max-w-[1100px] px-6 sm:px-12"><hr className="vitrine-divider" /></div>

        <PricingSection proposta={proposta} />

        <div className="mx-auto max-w-[1100px] px-6 sm:px-12"><hr className="vitrine-divider" /></div>

        <TimelineSection />

        <PropostaFooter proposta={proposta} />
      </div>
    </>
  );
}
