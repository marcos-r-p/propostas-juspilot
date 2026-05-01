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
