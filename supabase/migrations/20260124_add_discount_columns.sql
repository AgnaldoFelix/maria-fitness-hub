-- Migration: Add discount columns to produtos table
-- Created: 2026-01-24

-- Adicionar colunas de desconto à tabela produtos
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS desconto_percentual NUMERIC(5,2) DEFAULT 0;
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS desconto_ativo BOOLEAN DEFAULT false;
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS preco_original NUMERIC(10,2);
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS data_desconto_inicio TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS data_desconto_fim TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.produtos ADD COLUMN IF NOT EXISTS desconto_historico JSONB DEFAULT '[]'::jsonb;
