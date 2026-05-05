'use client';

import { useState } from 'react';
import type { Proposta } from '@/types';
import { useReveal } from '@/hooks/use-reveal';
import { deriveProfile, type PropostaProfileId } from '@/lib/utils/proposta-profile';

interface FAQSectionProps {
  proposta: Proposta;
}

interface FAQItemData {
  question: string;
  answer: string;
}

const FAQ_ITEMS = [
  {
    question: 'E se a IA cometer um erro técnico em uma peça?',
    answer:
      'Toda resposta da IA traz fonte rastreável — número do processo, tribunal, relator. Você verifica antes de assinar. A IA é assistiva: acelera a produção, mas a responsabilidade técnica permanece com o profissional habilitado.',
  },
  {
    question: 'Onde nossos dados ficam armazenados?',
    answer:
      'Soberania nacional: infraestrutura AWS na região São Paulo, criptografia AES-256 em repouso e em trânsito, conformidade LGPD nativa. Cada escritório tem workspace isolado, e seus documentos não treinam modelos globais.',
  },
  {
    question: 'Conseguimos integrar com nossos sistemas atuais?',
    answer:
      'Integrações jurídicas nativas com CNJ, DataJud, OAB, Receita Federal e Tribunais Estaduais. Para sistemas internos do escritório (ERP, CRM), oferecemos API REST. Integrações específicas avaliadas no diagnóstico inicial.',
  },
  {
    question: 'Qual é o período mínimo de contrato?',
    answer:
      '12 meses. Após esse período, cancelamento a qualquer momento mediante aviso prévio de 30 dias.',
  },
  {
    question: 'Como funciona o onboarding e treinamento da equipe?',
    answer:
      'Onboarding estruturado com Customer Success dedicado, treinamentos ao vivo e materiais de capacitação contínua. Cronograma detalhado na seção de Implantação.',
  },
  {
    question: 'As ações da IA podem ser auditadas?',
    answer:
      'Sim. Audit trail imutável via hash chain registra todas as interações, prompts e outputs. Para documentos formais, oferecemos assinatura eletrônica ICP-Brasil com validade jurídica plena. Acesso completo para administradores do escritório.',
  },
  {
    question: 'Como é cobrado o uso de IA? Existe limite?',
    answer:
      'O plano inclui uso ilimitado de IA. Não há cobrança adicional por créditos ou tokens — apenas a mensalidade da faixa do seu porte, dentro de políticas razoáveis de fair use.',
  },
  {
    question: 'E se quisermos cancelar?',
    answer:
      'Cancelamento sem multa após o período mínimo. Exportação completa dos dados garantida em formato aberto.',
  },
];

const PROFILE_FAQ_ITEMS: Record<PropostaProfileId, FAQItemData[]> = {
  boutique_publico: [
    {
      question: 'Como a IA mantém o padrão de qualidade do meu escritório?',
      answer:
        'Treinamos a base de conhecimento com peças, jurisprudência e padrões redacionais do próprio escritório, garantindo aderência ao seu estilo e tese.',
    },
  ],
  boutique_empresarial: [
    {
      question: 'Como a IA mantém o padrão de qualidade do meu escritório?',
      answer:
        'Treinamos a base de conhecimento com peças, contratos e modelos do próprio escritório, garantindo aderência ao seu padrão.',
    },
  ],
  boutique_criminal: [
    {
      question: 'Como garantem o sigilo profissional e o segredo de justiça?',
      answer:
        'Workspace dedicado, criptografia AES-256, logs auditáveis e DPA assinado garantem proteção integral. Conformidade com LGPD e OAB.',
    },
  ],
  contencioso_massa: [
    {
      question: 'Qual o limite de processos simultâneos?',
      answer:
        'Não há limite de processos. A plataforma escala horizontalmente — todos os usuários incluídos podem operar em paralelo sem degradação.',
    },
    {
      question: 'Como funciona a integração com sistemas internos do escritório?',
      answer:
        'API REST permite integração bidirecional com ERPs, CRMs e sistemas de gestão. Webhooks notificam eventos em tempo real.',
    },
  ],
  misto: [],
};

function FAQItem({ item, index }: { item: FAQItemData; index: number }) {
  const [open, setOpen] = useState(false);
  const { ref, isVisible } = useReveal();

  return (
    <div
      ref={ref}
      className={`vt-reveal ${isVisible ? 'visible' : ''} border-b border-[var(--vt-paper)]/8`}
      style={{ transitionDelay: `${index * 0.05}s` }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="group flex w-full items-center justify-between py-6 text-left"
      >
        <span className="pr-8 text-[15px] font-medium text-[var(--vt-paper)] transition-colors duration-300 group-hover:text-[var(--vt-brand)]">
          {item.question}
        </span>
        <span
          className={`shrink-0 text-[var(--vt-mute)] transition-transform duration-300 ${open ? 'rotate-45' : ''}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </button>
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="pb-6 text-[14px] leading-[1.7] text-[var(--vt-whisper)]">
          {item.answer}
        </div>
      </div>
    </div>
  );
}

export function FAQSection({ proposta }: FAQSectionProps) {
  const profile = deriveProfile(proposta);
  const items: FAQItemData[] = [...FAQ_ITEMS, ...PROFILE_FAQ_ITEMS[profile.id]];
  const label = useReveal();
  const title = useReveal();

  return (
    <section id="faq" className="mx-auto max-w-[1100px] px-6 py-24 sm:px-12">
      <div
        ref={label.ref}
        className={`vt-reveal ${label.isVisible ? 'visible' : ''} mb-3.5 flex items-center gap-4 text-[11px] uppercase tracking-[0.14em] text-[var(--vt-mute)]`}
      >
        <span className="h-px w-6 bg-[var(--vt-brand)]" />
        Perguntas frequentes
      </div>
      <div
        ref={title.ref}
        className={`vt-reveal ${title.isVisible ? 'visible' : ''} mb-14 text-4xl font-extrabold leading-[1.12] text-[var(--vt-paper)]`}
        style={{ transitionDelay: '0.1s' }}
      >
        Dúvidas comuns
      </div>

      <div className="border-t border-[var(--vt-paper)]/8">
        {items.map((item, i) => (
          <FAQItem key={i} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}
