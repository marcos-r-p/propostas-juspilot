import type { EscritorioPerfil } from '@/types';

export const PERFIS_ESCRITORIO: {
  value: EscritorioPerfil;
  label: string;
  description: string;
}[] = [
  {
    value: 'massa',
    label: 'Contencioso de Massa',
    description: 'Alto volume de processos similares, foco em escala e eficiência.',
  },
  {
    value: 'boutique',
    label: 'Boutique / Estratégico',
    description: 'Casos complexos e personalizados, foco em qualidade e profundidade.',
  },
  {
    value: 'misto',
    label: 'Misto',
    description: 'Combina operações de massa com casos estratégicos.',
  },
];
