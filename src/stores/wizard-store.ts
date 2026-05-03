import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PropostaFormData, ROICalculation } from '@/types';
import { calculateROI } from '@/lib/utils/roi';
import { DEFAULT_PRICING_DATA } from '@/lib/pricing/default-data';

interface WizardState {
  formData: PropostaFormData;
  roi: ROICalculation;
  updateField: <K extends keyof PropostaFormData>(field: K, value: PropostaFormData[K]) => void;
  updateFields: (fields: Partial<PropostaFormData>) => void;
  toggleArrayField: <K extends keyof PropostaFormData>(field: K, value: string) => void;
  resetForm: () => void;
}

const initialFormData: PropostaFormData = {
  lead_nome: '',
  lead_email: '',
  lead_telefone: '',
  lead_cargo: '',
  escritorio_nome: '',
  escritorio_cidade: '',
  escritorio_uf: 'DF',
  escritorio_qtd_advogados: 5,
  escritorio_valor_hora: 200,
  escritorio_valor_hora_informado: true,
  escritorio_site_url: '',
  escritorio_logo_url: '',
  escritorio_areas: [],
  escritorio_perfil: 'misto',
  escritorio_maturidade_processos: 'desenvolvimento',
  escritorio_maturidade_ia: 'iniciante',
  escritorio_dores: [],
  escritorio_contexto: '',
  consultor_nome: '',
  consultor_cargo: 'Consultor Comercial',
  consultor_whatsapp: '',
  consultor_email: '',
  usar_preco_sugerido: true,
  preco_setup: 3500,
  preco_mensalidade: 3000,
  preco_usuarios_inclusos: 10,
  preco_desconto: 0,
  usar_preco_faixas: false,
  preco_faixas: null,
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      formData: initialFormData,
      roi: calculateROI(initialFormData, DEFAULT_PRICING_DATA),

      updateField: (field, value) => {
        set((state) => {
          const newFormData = { ...state.formData, [field]: value };
          return { formData: newFormData, roi: calculateROI(newFormData, DEFAULT_PRICING_DATA) };
        });
      },

      updateFields: (fields) => {
        set((state) => {
          const newFormData = { ...state.formData, ...fields };
          return { formData: newFormData, roi: calculateROI(newFormData, DEFAULT_PRICING_DATA) };
        });
      },

      toggleArrayField: (field, value) => {
        set((state) => {
          const currentArray = state.formData[field] as string[];
          const newArray = currentArray.includes(value)
            ? currentArray.filter((item) => item !== value)
            : [...currentArray, value];
          const newFormData = { ...state.formData, [field]: newArray };
          return { formData: newFormData, roi: calculateROI(newFormData, DEFAULT_PRICING_DATA) };
        });
      },

      resetForm: () => {
        set({ formData: initialFormData, roi: calculateROI(initialFormData, DEFAULT_PRICING_DATA) });
      },
    }),
    {
      name: 'wizard-storage',
      partialize: (state) => ({ formData: state.formData }),
    }
  )
);
