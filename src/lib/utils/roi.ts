import type { PropostaFormData, ROICalculation } from '@/types';
import type { PricingData } from '@/lib/pricing/types';

export function calculateROI(formData: PropostaFormData, pricing: PricingData): ROICalculation {
  const {
    escritorio_qtd_advogados, escritorio_valor_hora, escritorio_valor_hora_informado,
    escritorio_perfil, escritorio_maturidade_ia,
    usar_preco_sugerido, preco_mensalidade, preco_desconto,
    usar_preco_faixas, preco_faixas,
  } = formData;

  const HORAS_MES = pricing.roi.horas_mensais;
  const VALOR_HORA_PADRAO = pricing.roi.valor_hora_padrao;

  const valorHoraEfetivo = escritorio_valor_hora_informado ? escritorio_valor_hora : VALOR_HORA_PADRAO;
  const percentualAtividades = pricing.roi.atividades_ia_por_perfil[escritorio_perfil] ?? 0.4;
  const reducao = pricing.roi.taxa_reducao_por_maturidade[escritorio_maturidade_ia] ?? 0.5;

  const horasAtividadesIA = HORAS_MES * percentualAtividades;
  const horas_economizadas_por_adv = Math.round(horasAtividadesIA * reducao);
  const horas_economizadas_total = horas_economizadas_por_adv * escritorio_qtd_advogados;
  const valor_gerado = horas_economizadas_total * valorHoraEfetivo;

  const precoSugerido = getPrecoSugerido(escritorio_qtd_advogados, pricing);
  let mensalidadeRecorrente: number;
  if (usar_preco_faixas && preco_faixas && preco_faixas.length > 0) {
    mensalidadeRecorrente = preco_faixas[preco_faixas.length - 1].valor;
  } else if (usar_preco_sugerido) {
    mensalidadeRecorrente = precoSugerido.mensalidade;
  } else {
    mensalidadeRecorrente = preco_mensalidade;
  }

  const mensalidade_final = Math.round(mensalidadeRecorrente * (1 - preco_desconto / 100));
  const roi_percentual = Math.round(((valor_gerado - mensalidade_final) / mensalidade_final) * 100);
  const roi_multiplo = parseFloat((valor_gerado / mensalidade_final).toFixed(1));
  const custo_por_advogado = parseFloat((mensalidade_final / escritorio_qtd_advogados).toFixed(2));

  return {
    horas_economizadas_por_adv, horas_economizadas_total, valor_gerado,
    roi_percentual, roi_multiplo, custo_por_advogado, mensalidade_final,
  };
}

export function getPrecoSugerido(qtdAdvogados: number, pricing: PricingData): {
  setup: number; mensalidade: number; usuarios: number;
} {
  const faixa = pricing.faixas_porte.find(
    (f) => qtdAdvogados >= f.min && (f.max === null || qtdAdvogados <= f.max),
  );
  if (!faixa) {
    throw new Error(`Nenhuma faixa de porte cobre ${qtdAdvogados} advogados`);
  }
  let mensalidade = faixa.mensalidade;
  if (faixa.max === null && faixa.incremento_por_dezena_advogados) {
    const dezenasFromStart = Math.floor((qtdAdvogados - faixa.min) / 10);
    mensalidade = faixa.mensalidade + dezenasFromStart * faixa.incremento_por_dezena_advogados;
  }
  return {
    setup: faixa.setup,
    mensalidade,
    usuarios: faixa.usuarios ?? qtdAdvogados,
  };
}
