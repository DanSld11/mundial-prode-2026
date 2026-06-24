-- =============================================
-- Notificaciones de usuario (banners en dashboard)
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL DEFAULT 'point_adjustment',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  points_change INTEGER DEFAULT 0,
  dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_notif_select" ON public.user_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_notif_service" ON public.user_notifications FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- Ruleta: configuración global (singleton id=1)
-- =============================================
CREATE TABLE IF NOT EXISTS public.ruleta_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  is_active BOOLEAN DEFAULT false,
  price_coins INTEGER DEFAULT 50,
  slots JSONB DEFAULT '[
    {"id":1,"type":"points","value":1,"color":"#22c55e"},
    {"id":2,"type":"points","value":2,"color":"#16a34a"},
    {"id":3,"type":"points","value":3,"color":"#166534"},
    {"id":4,"type":"points","value":-1,"color":"#ef4444"},
    {"id":5,"type":"points","value":-2,"color":"#dc2626"},
    {"id":6,"type":"points","value":-3,"color":"#991b1b"},
    {"id":7,"type":"retry","value":0,"color":"#3b82f6"},
    {"id":8,"type":"retry","value":0,"color":"#60a5fa"},
    {"id":9,"type":"nothing","value":0,"color":"#f59e0b"},
    {"id":10,"type":"nothing","value":0,"color":"#f97316"}
  ]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.ruleta_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.ruleta_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ruleta_config_read" ON public.ruleta_config FOR SELECT USING (true);
CREATE POLICY "ruleta_config_service" ON public.ruleta_config FOR ALL USING (true);

-- =============================================
-- Ruleta: whitelist de acceso por usuario
-- =============================================
CREATE TABLE IF NOT EXISTS public.ruleta_access (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  enabled BOOLEAN DEFAULT true,
  granted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ruleta_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ruleta_access_read" ON public.ruleta_access FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ruleta_access_service" ON public.ruleta_access FOR ALL USING (true);

-- =============================================
-- Ruleta: historial de giros
-- =============================================
CREATE TABLE IF NOT EXISTS public.ruleta_spins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  result_label TEXT NOT NULL,
  result_type TEXT NOT NULL,
  points_change INTEGER DEFAULT 0,
  coins_spent INTEGER NOT NULL DEFAULT 0,
  is_free_retry BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ruleta_spins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ruleta_spins_select" ON public.ruleta_spins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ruleta_spins_service" ON public.ruleta_spins FOR ALL USING (true);
