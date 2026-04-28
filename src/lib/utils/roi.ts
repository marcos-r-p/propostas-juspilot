import type { PropostaFormData, ROICalculation, PrecoFaixa } from '@/types';

const MATURIDADE_IA_REDUCAO: Record<string, number> = {
  nunca: 0.6,
  iniciante: 0.5,
  intermediario: 0.45,
  avancado: 0.4,
};

const PERFIL_PERCENTUAL: Record<string, number> = {
  massa: 0.5,
  boutique: 0.3,
  misto: 0.4,
};

function calcularMensalidadeMediaPonderada(faixas: PrecoFaixa[], meses: number = 12): number {
  let totalValor = 0;
  let totalMeses = 0;

  for (const faixa of faixas) {
    const inicio = faixa.de_mes;
    const fim = faixa.ate_mes !== null ? Math.min(faixa.ate_mes, meses) : meses;
    if (inicio > meses) break;
    const mesesFaixa = fim - inicio + 1;
    totalValor += mesesFaixa * faixa.valor;
    totalMeses += mesesFaixa;
  }

  return totalMeses > 0 ? Math.round(totalValor / totalMeses) : 0;
}

export function calculateROI(formData: PropostaFormData): ROICalculation {
  const {
    escritorio_qtd_advogados,
    escritorio_valor_hora,
    escritorio_valor_hora_informado,
    escritorio_perfil,
    escritorio_maturidade_ia,
    usar_preco_sugerido,
    preco_setup,
    preco_mensalidade,
    preco_usuarios_inclusos,
    preco_desconto,
    usar_preco_faixas,
    preco_faixas,
  } = formData;

  const HORAS_MES = 176;
  const VALOR_HORA_PADRAO = 250;

  // Valor hora efetivo
  const valorHoraEfetivo = escritorio_valor_hora_informado
    ? escritorio_valor_hora
    : VALOR_HORA_PADRAO;

  // Percentual de atividades que IA pode ajudar
  const percentualAtividades = PERFIL_PERCENTUAL[escritorio_perfil] || 0.4;

  // Redução esperada baseada na maturidade
  const reducao = MATURIDADE_IA_REDUCAO[escritorio_maturidade_ia] || 0.5;

  // Cálculos de economia
  const horasAtividadesIA = HORAS_MES * percentualAtividades;
  const horas_economizadas_por_adv = Math.round(horasAtividadesIA * reducao);
  const horas_economizadas_total =
    horas_economizadas_por_adv * escritorio_qtd_advogados;
  const valor_gerado = horas_economizadas_total * valorHoraEfetivo;

  // Preços
  const precoSugerido = getPrecoSugerido(escritorio_qtd_advogados);
  let mensalidadeBase: number;

  if (usar_preco_faixas && preco_faixas && preco_faixas.length > 0) {
    mensalidadeBase = calcularMensalidadeMediaPonderada(preco_faixas);
  } else if (usar_preco_sugerido) {
    mensalidadeBase = precoSugerido.mensalidade;
  } else {
    mensalidadeBase = preco_mensalidade;
  }

  const mensalidade_final = Math.round(
    mensalidadeBase * (1 - preco_desconto / 100)
  );

  // ROI
  const roi_percentual = Math.round(
    ((valor_gerado - mensalidade_final) / mensalidade_final) * 100
  );
  const roi_multiplo = parseFloat(
    (valor_gerado / mensalidade_final).toFixed(1)
  );
  const custo_por_advogado = parseFloat(
    (mensalidade_final / escritorio_qtd_advogados).toFixed(2)
  );

  return {
    horas_economizadas_por_adv,
    horas_economizadas_total,
    valor_gerado,
    roi_percentual,
    roi_multiplo,
    custo_por_advogado,
    mensalidade_final,
  };
}

export function getPrecoSugerido(qtdAdvogados: number) {
  if (qtdAdvogados <= 3) {
    return { setup: 2000, mensalidade: 1500, usuarios: 5 };
  }
  if (qtdAdvogados <= 10) {
    return { setup: 3500, mensalidade: 3000, usuarios: 10 };
  }
  if (qtdAdvogados <= 20) {
    return { setup: 5000, mensalidade: 5000, usuarios: 20 };
  }
  const mensalidadeExtra = Math.floor((qtdAdvogados - 20) / 10) * 2000;
  return {
    setup: 8000,
    mensalidade: 8000 + mensalidadeExtra,
    usuarios: qtdAdvogados,
  };
}
