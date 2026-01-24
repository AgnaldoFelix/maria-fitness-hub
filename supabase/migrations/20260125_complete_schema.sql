-- Complete Schema Migration for Maria Fitness Hub
-- Inclui: Receitas, Produtos, Configurações, Descontos, Admin Password
-- Data: 2026-01-25

-- ============================================================================
-- 1. CREATE TABLES
-- ============================================================================

-- Create receitas (recipes) table
CREATE TABLE IF NOT EXISTS public.receitas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  ingredientes TEXT NOT NULL,
  modo_preparo TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'Lanche',
  tempo TEXT NOT NULL DEFAULT '30 min',
  foto_url TEXT,
  publicada BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create produtos (products) table
CREATE TABLE IF NOT EXISTS public.produtos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  preco NUMERIC(10,2) NOT NULL,
  foto_url TEXT,
  disponivel BOOLEAN NOT NULL DEFAULT true,
  mensagem_whatsapp TEXT,
  desconto_percentual NUMERIC(5,2) DEFAULT 0,
  desconto_ativo BOOLEAN DEFAULT false,
  preco_original NUMERIC(10,2),
  data_desconto_inicio TIMESTAMP WITH TIME ZONE,
  data_desconto_fim TIMESTAMP WITH TIME ZONE,
  desconto_historico JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create configuracoes (settings) table for admin settings
CREATE TABLE IF NOT EXISTS public.configuracoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chave TEXT NOT NULL UNIQUE,
  valor TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_password table for simple password protection
CREATE TABLE IF NOT EXISTS public.admin_password (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_password ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. CREATE POLICIES - RECEITAS
-- ============================================================================

-- Public can read published recipes
CREATE POLICY "Anyone can view published recipes"
ON public.receitas FOR SELECT
USING (publicada = true);

-- Admin can manage all recipes
CREATE POLICY "Admin can manage all recipes"
ON public.receitas FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================================================
-- 4. CREATE POLICIES - PRODUTOS
-- ============================================================================

-- Public can read available products
CREATE POLICY "Anyone can view available products"
ON public.produtos FOR SELECT
USING (disponivel = true);

-- Admin can manage all products
CREATE POLICY "Admin can manage all products"
ON public.produtos FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================================================
-- 5. CREATE POLICIES - CONFIGURAÇÕES
-- ============================================================================

-- Public can read settings
CREATE POLICY "Anyone can view settings"
ON public.configuracoes FOR SELECT
USING (true);

-- Admin can manage settings
CREATE POLICY "Admin can manage settings"
ON public.configuracoes FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================================================
-- 6. CREATE POLICIES - ADMIN PASSWORD
-- ============================================================================

-- No public access to admin password
CREATE POLICY "No public access to admin password"
ON public.admin_password FOR SELECT
USING (false);

-- ============================================================================
-- 7. CREATE FUNCTION - UPDATE TIMESTAMPS
-- ============================================================================

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- ============================================================================
-- 8. CREATE TRIGGERS
-- ============================================================================

-- Trigger for receitas
DO $$ BEGIN
  CREATE TRIGGER update_receitas_updated_at
  BEFORE UPDATE ON public.receitas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Trigger for produtos
DO $$ BEGIN
  CREATE TRIGGER update_produtos_updated_at
  BEFORE UPDATE ON public.produtos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Trigger for configuracoes
DO $$ BEGIN
  CREATE TRIGGER update_configuracoes_updated_at
  BEFORE UPDATE ON public.configuracoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 9. INSERT DEFAULT DATA
-- ============================================================================

-- Insert default WhatsApp number
INSERT INTO public.configuracoes (chave, valor) 
VALUES ('whatsapp_numero', '5579996848609')
ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor;

-- Insert default admin password (maria2024)
INSERT INTO public.admin_password (password_hash) 
VALUES ('maria2024')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
