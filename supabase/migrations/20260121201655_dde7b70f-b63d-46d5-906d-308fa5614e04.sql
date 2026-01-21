-- Fix the function search path mutable warning
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Create admin_password table for simple password protection
CREATE TABLE public.admin_password (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_password ENABLE ROW LEVEL SECURITY;

-- No public access to admin password (only via edge function)
CREATE POLICY "No public access to admin password"
ON public.admin_password FOR SELECT
USING (false);

-- Insert default admin password (maria2024)
INSERT INTO public.admin_password (password_hash) VALUES ('maria2024');

-- Admin policies for full CRUD (will be accessed via edge function or authenticated admin)
-- For now, allow all operations for admin setup - this will be secured with authentication later
CREATE POLICY "Admin can manage all recipes"
ON public.receitas FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin can manage all products"
ON public.produtos FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin can manage settings"
ON public.configuracoes FOR ALL
USING (true)
WITH CHECK (true);