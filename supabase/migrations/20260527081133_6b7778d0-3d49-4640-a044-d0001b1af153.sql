
CREATE TABLE public.zonas_espana (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_postal TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  barrio TEXT NOT NULL,
  precio_m2_medio NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_zonas_cp ON public.zonas_espana(codigo_postal);
CREATE INDEX idx_zonas_ciudad ON public.zonas_espana(ciudad);

GRANT SELECT ON public.zonas_espana TO anon, authenticated;
GRANT ALL ON public.zonas_espana TO service_role;
ALTER TABLE public.zonas_espana ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Zonas publicas" ON public.zonas_espana FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.valoraciones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  direccion TEXT NOT NULL,
  ciudad TEXT,
  barrio TEXT,
  codigo_postal TEXT,
  metros_cuadrados INTEGER NOT NULL,
  habitaciones INTEGER,
  banos INTEGER,
  planta INTEGER,
  ano_construccion INTEGER,
  estado TEXT,
  extras JSONB NOT NULL DEFAULT '{}'::jsonb,
  precio_m2_zona NUMERIC,
  valor_estimado_bajo NUMERIC NOT NULL,
  valor_estimado_medio NUMERIC NOT NULL,
  valor_estimado_alto NUMERIC NOT NULL,
  explicacion_ia TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.valoraciones TO anon, authenticated;
GRANT ALL ON public.valoraciones TO service_role;
ALTER TABLE public.valoraciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Valoraciones lectura publica" ON public.valoraciones FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Valoraciones insercion publica" ON public.valoraciones FOR INSERT TO anon, authenticated WITH CHECK (true);
