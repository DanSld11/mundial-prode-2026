-- =========================================================
-- Ruleta: resetear giro semanal SIN borrar historial de puntos
-- Ejecutar en Supabase SQL Editor
-- =========================================================
-- Antes, "resetear giro semanal" hacía DELETE de ruleta_spins,
-- destruyendo los points_change y descuadrando los totales.
-- Ahora se marca weekly_reset = true: el usuario recupera su giro
-- gratis pero el historial de puntos queda intacto.

ALTER TABLE public.ruleta_spins
  ADD COLUMN IF NOT EXISTS weekly_reset BOOLEAN NOT NULL DEFAULT false;
