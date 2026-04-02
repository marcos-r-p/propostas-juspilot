-- Usuários internos (extensão do auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  nome TEXT NOT NULL,
  cargo TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Propostas
CREATE TABLE public.propostas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  status TEXT DEFAULT 'rascunho',

  -- Dados do Lead
  lead_nome TEXT,
  lead_email TEXT,
  lead_telefone TEXT,
  lead_cargo TEXT,

  -- Dados do Escritório
  escritorio_nome TEXT NOT NULL,
  escritorio_cidade TEXT NOT NULL,
  escritorio_uf TEXT NOT NULL DEFAULT 'DF',
  escritorio_qtd_advogados INTEGER NOT NULL DEFAULT 5,
  escritorio_areas TEXT[] DEFAULT '{}',
  escritorio_perfil TEXT DEFAULT 'misto',
  escritorio_maturidade_processos TEXT DEFAULT 'desenvolvimento',
  escritorio_maturidade_ia TEXT DEFAULT 'iniciante',
  escritorio_valor_hora INTEGER DEFAULT 200,
  escritorio_valor_hora_informado BOOLEAN DEFAULT true,
  escritorio_contexto TEXT,
  escritorio_dores TEXT[] DEFAULT '{}',

  -- Precificação
  preco_setup INTEGER NOT NULL DEFAULT 3500,
  preco_mensalidade INTEGER NOT NULL DEFAULT 3000,
  preco_usuarios_inclusos INTEGER NOT NULL DEFAULT 10,
  preco_desconto INTEGER DEFAULT 0,
  preco_mensalidade_final INTEGER NOT NULL DEFAULT 3000,

  -- Cálculos de ROI
  roi_horas_economizadas_total INTEGER,
  roi_horas_economizadas_por_adv INTEGER,
  roi_valor_gerado INTEGER,
  roi_percentual INTEGER,
  roi_multiplo DECIMAL(4,1),
  roi_custo_por_advogado DECIMAL(10,2),

  -- Metadados
  validade_dias INTEGER DEFAULT 30,
  data_expiracao DATE,
  visualizacoes INTEGER DEFAULT 0,
  primeira_visualizacao TIMESTAMP WITH TIME ZONE,
  ultima_visualizacao TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Histórico de visualizações
CREATE TABLE public.proposta_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposta_id UUID REFERENCES public.propostas(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Atividades/Log
CREATE TABLE public.proposta_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposta_id UUID REFERENCES public.propostas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_propostas_slug ON public.propostas(slug);
CREATE INDEX idx_propostas_created_by ON public.propostas(created_by);
CREATE INDEX idx_propostas_status ON public.propostas(status);
CREATE INDEX idx_propostas_created_at ON public.propostas(created_at DESC);
CREATE INDEX idx_proposta_views_proposta_id ON public.proposta_views(proposta_id);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.propostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposta_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposta_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view all propostas" ON public.propostas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert propostas" ON public.propostas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own propostas" ON public.propostas
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own propostas" ON public.propostas
  FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "Anyone can insert views" ON public.proposta_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view proposta_views" ON public.proposta_views
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view activities" ON public.proposta_activities
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert activities" ON public.proposta_activities
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Functions
CREATE OR REPLACE FUNCTION generate_unique_slug(base_name TEXT)
RETURNS TEXT AS $$
DECLARE
  new_slug TEXT;
  slug_exists BOOLEAN;
BEGIN
  new_slug := lower(regexp_replace(base_name, '[^a-zA-Z0-9]', '-', 'g'));
  new_slug := regexp_replace(new_slug, '-+', '-', 'g');
  new_slug := trim(both '-' from new_slug);
  new_slug := left(new_slug, 30) || '-' || substr(md5(random()::text), 1, 6);

  SELECT EXISTS(SELECT 1 FROM public.propostas WHERE slug = new_slug) INTO slug_exists;

  WHILE slug_exists LOOP
    new_slug := left(new_slug, 30) || '-' || substr(md5(random()::text), 1, 8);
    SELECT EXISTS(SELECT 1 FROM public.propostas WHERE slug = new_slug) INTO slug_exists;
  END LOOP;

  RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_roi(
  qtd_advogados INTEGER,
  valor_hora INTEGER,
  perfil TEXT,
  maturidade_ia TEXT,
  mensalidade INTEGER
)
RETURNS TABLE (
  horas_economizadas_total INTEGER,
  horas_economizadas_por_adv INTEGER,
  valor_gerado INTEGER,
  roi_percentual INTEGER,
  roi_multiplo DECIMAL(4,1),
  custo_por_advogado DECIMAL(10,2)
) AS $$
DECLARE
  horas_mes INTEGER := 176;
  percentual_atividades DECIMAL;
  reducao DECIMAL;
BEGIN
  percentual_atividades := CASE perfil
    WHEN 'massa' THEN 0.5
    WHEN 'boutique' THEN 0.3
    ELSE 0.4
  END;

  reducao := CASE maturidade_ia
    WHEN 'nunca' THEN 0.6
    WHEN 'iniciante' THEN 0.5
    WHEN 'intermediario' THEN 0.45
    WHEN 'avancado' THEN 0.4
    ELSE 0.5
  END;

  horas_economizadas_por_adv := ROUND(horas_mes * percentual_atividades * reducao);
  horas_economizadas_total := horas_economizadas_por_adv * qtd_advogados;
  valor_gerado := horas_economizadas_total * valor_hora;
  roi_percentual := ROUND(((valor_gerado - mensalidade)::DECIMAL / mensalidade) * 100);
  roi_multiplo := ROUND((valor_gerado::DECIMAL / mensalidade)::NUMERIC, 1);
  custo_por_advogado := ROUND((mensalidade::DECIMAL / qtd_advogados)::NUMERIC, 2);

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER propostas_updated_at
  BEFORE UPDATE ON public.propostas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION increment_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.propostas
  SET
    visualizacoes = visualizacoes + 1,
    primeira_visualizacao = COALESCE(primeira_visualizacao, NOW()),
    ultima_visualizacao = NOW(),
    status = CASE WHEN status = 'publicada' THEN 'visualizada' ELSE status END
  WHERE id = NEW.proposta_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER proposta_views_increment
  AFTER INSERT ON public.proposta_views
  FOR EACH ROW EXECUTE FUNCTION increment_view_count();
