-- supabase/migrations/003_pricing_admin.sql
-- Precificação Admin: tabelas comerciais versionadas + role + snapshot em propostas

-- 1. Adicionar role em profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));

-- 2. Tabelas comerciais
CREATE TABLE IF NOT EXISTS public.pricing_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Garantir uma única tabela default
CREATE UNIQUE INDEX IF NOT EXISTS pricing_tables_one_default
  ON public.pricing_tables ((1)) WHERE is_default = true;

-- Trigger updated_at
CREATE TRIGGER pricing_tables_updated_at
  BEFORE UPDATE ON public.pricing_tables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3. Versões imutáveis (append-only)
CREATE TABLE IF NOT EXISTS public.pricing_table_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id uuid NOT NULL REFERENCES public.pricing_tables(id) ON DELETE CASCADE,
  version_number int NOT NULL,
  data jsonb NOT NULL,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(table_id, version_number)
);

-- 4. Templates de faixas progressivas (entidade global)
CREATE TABLE IF NOT EXISTS public.progressive_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  faixas jsonb NOT NULL,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. View: versão atual de cada tabela
CREATE OR REPLACE VIEW public.pricing_tables_current AS
SELECT pt.id, pt.name, pt.description, pt.is_default, pt.is_active,
       pt.created_at, pt.updated_at,
       ptv.id           AS current_version_id,
       ptv.version_number,
       ptv.data,
       ptv.created_at   AS version_created_at,
       ptv.created_by   AS version_created_by
FROM public.pricing_tables pt
JOIN LATERAL (
  SELECT * FROM public.pricing_table_versions
  WHERE table_id = pt.id
  ORDER BY version_number DESC
  LIMIT 1
) ptv ON true;

-- 6. Snapshot de auditoria em propostas
ALTER TABLE public.propostas
  ADD COLUMN IF NOT EXISTS pricing_table_id   uuid REFERENCES public.pricing_tables(id),
  ADD COLUMN IF NOT EXISTS pricing_version_id uuid REFERENCES public.pricing_table_versions(id);

-- 7. Helper: checar admin (SECURITY DEFINER + search_path bloqueado)
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 8. RLS
ALTER TABLE public.pricing_tables          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_table_versions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progressive_templates   ENABLE ROW LEVEL SECURITY;

-- pricing_tables: SELECT authenticated, mutações apenas admin
CREATE POLICY pricing_tables_select ON public.pricing_tables
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY pricing_tables_insert ON public.pricing_tables
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY pricing_tables_update ON public.pricing_tables
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY pricing_tables_delete ON public.pricing_tables
  FOR DELETE USING (public.is_admin());

-- pricing_table_versions: SELECT authenticated, INSERT admin, UPDATE/DELETE bloqueados
CREATE POLICY pricing_versions_select ON public.pricing_table_versions
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY pricing_versions_insert ON public.pricing_table_versions
  FOR INSERT WITH CHECK (public.is_admin());
-- (sem policies UPDATE/DELETE: append-only)

-- progressive_templates
CREATE POLICY progressive_select ON public.progressive_templates
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY progressive_insert ON public.progressive_templates
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY progressive_update ON public.progressive_templates
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY progressive_delete ON public.progressive_templates
  FOR DELETE USING (public.is_admin());

-- 9. Seed: tabela 'Padrão' v1 (reproduz byte-a-byte os hardcoded em roi.ts)
INSERT INTO public.pricing_tables (name, description, is_default, is_active)
VALUES ('Padrão', 'Tabela comercial padrão Juspilot', true, true);

INSERT INTO public.pricing_table_versions (table_id, version_number, data, created_by)
SELECT id, 1, $${
  "faixas_porte": [
    { "min": 1,  "max": 3,    "setup": 2000, "mensalidade": 1500, "usuarios": 5 },
    { "min": 4,  "max": 10,   "setup": 3500, "mensalidade": 3000, "usuarios": 10 },
    { "min": 11, "max": 20,   "setup": 5000, "mensalidade": 5000, "usuarios": 20 },
    { "min": 21, "max": null, "setup": 8000, "mensalidade": 8000, "usuarios": null,
      "incremento_por_dezena_advogados": 2000 }
  ],
  "roi": {
    "horas_mensais": 176,
    "valor_hora_padrao": 250,
    "atividades_ia_por_perfil": { "boutique": 0.30, "misto": 0.40, "massa": 0.50 },
    "taxa_reducao_por_maturidade": { "nunca": 0.60, "iniciante": 0.50, "intermediario": 0.45, "avancado": 0.40 }
  },
  "limites": {
    "desconto_maximo_pct": 30,
    "mensalidade_minima": 1000,
    "validade_proposta_dias": 30,
    "reajuste_anual_pct": 8
  }
}$$::jsonb, NULL
FROM public.pricing_tables WHERE name = 'Padrão';
