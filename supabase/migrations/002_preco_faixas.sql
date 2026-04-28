-- Migration: Add preco_faixas, escritorio_site_url, escritorio_logo_url
-- Date: 2026-04-28

-- Faixas de preco flexiveis
ALTER TABLE propostas ADD COLUMN preco_faixas JSONB DEFAULT NULL;

-- Co-branding: site e logo do escritorio
ALTER TABLE propostas ADD COLUMN escritorio_site_url TEXT DEFAULT NULL;
ALTER TABLE propostas ADD COLUMN escritorio_logo_url TEXT DEFAULT NULL;
