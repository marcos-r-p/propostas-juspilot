// src/components/wizard/step-preview.tsx
'use client';

import { useWizardStore } from '@/stores/wizard-store';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/format';
import { getDoresByIds } from '@/lib/constants/dores';
import type { DorId } from '@/lib/constants/dores';

export function StepPreview() {
  const { formData, roi } = useWizardStore();
  const dores = getDoresByIds(formData.escritorio_dores as DorId[]);

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#09090b]">Revisar Proposta</h2>
      <p className="mb-6 text-sm text-[#a1a1aa]">Confira os dados antes de publicar.</p>

      <div className="space-y-4">
        <Card>
          <div className="text-xs font-semibold uppercase tracking-wide text-[#a1a1aa]">Lead</div>
          <div className="mt-2 text-sm">
            <div className="font-medium text-[#09090b]">{formData.lead_nome}</div>
            <div className="text-[#71717a]">{formData.lead_email} &middot; {formData.lead_telefone}</div>
          </div>
        </Card>

        <Card>
          <div className="text-xs font-semibold uppercase tracking-wide text-[#a1a1aa]">Escritorio</div>
          <div className="mt-2 text-sm">
            <div className="font-medium text-[#09090b]">{formData.escritorio_nome}</div>
            <div className="text-[#71717a]">
              {formData.escritorio_cidade}&mdash;{formData.escritorio_uf} &middot; {formData.escritorio_qtd_advogados} advogados
            </div>
            <div className="mt-1 text-[#71717a]">
              Perfil: {formData.escritorio_perfil} &middot; IA: {formData.escritorio_maturidade_ia}
            </div>
          </div>
        </Card>

        {dores.length > 0 && (
          <Card>
            <div className="text-xs font-semibold uppercase tracking-wide text-[#a1a1aa]">Dores selecionadas</div>
            <div className="mt-2 space-y-1">
              {dores.map((d) => (
                <div key={d.id} className="text-sm text-[#71717a]">
                  {d.icon} {d.label}
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="bg-[#f4f4f5]">
          <div className="text-xs font-semibold uppercase tracking-wide text-[#a1a1aa]">Valores</div>
          <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-[#a1a1aa]">Mensalidade:</span>{' '}
              <span className="font-semibold text-[#09090b]">{formatCurrency(roi.mensalidade_final)}</span>
            </div>
            <div>
              <span className="text-[#a1a1aa]">ROI:</span>{' '}
              <span className="font-semibold text-[#09090b]">{roi.roi_multiplo}x</span>
            </div>
            <div>
              <span className="text-[#a1a1aa]">Economia:</span>{' '}
              <span className="font-semibold text-[#09090b]">{roi.horas_economizadas_total}h/mes</span>
            </div>
            <div>
              <span className="text-[#a1a1aa]">Valor gerado:</span>{' '}
              <span className="font-semibold text-[#09090b]">{formatCurrency(roi.valor_gerado)}/mes</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
