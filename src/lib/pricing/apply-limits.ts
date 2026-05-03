import type { PricingLimites } from './types';
import { formatCurrency } from '@/lib/utils/format';

export function clampDesconto(value: number, limites: PricingLimites): number {
  if (value < 0) return 0;
  if (value > limites.desconto_maximo_pct) return limites.desconto_maximo_pct;
  return value;
}

export function validateMensalidade(
  value: number,
  limites: PricingLimites,
): { ok: true } | { ok: false; message: string } {
  if (value < limites.mensalidade_minima) {
    return {
      ok: false,
      message: `Mensalidade não pode ficar abaixo de ${formatCurrency(limites.mensalidade_minima)}`,
    };
  }
  return { ok: true };
}

export function getDescontoErrorMessage(
  value: number,
  limites: PricingLimites,
): string | null {
  if (value > limites.desconto_maximo_pct) {
    return `Desconto máximo permitido: ${limites.desconto_maximo_pct}%`;
  }
  if (value < 0) {
    return 'Desconto não pode ser negativo';
  }
  return null;
}
