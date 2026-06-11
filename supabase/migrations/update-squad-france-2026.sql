-- =============================================
-- COMPLETAR PLANTEL DE FRANCIA - MUNDIAL 2026
-- Solo agrega jugadores faltantes. No toca nada existente.
-- team_id Francia: cf8da80b-ab16-4971-a7b5-ce4875e61ffd
-- =============================================

DO $$
DECLARE
  fra_id UUID := 'cf8da80b-ab16-4971-a7b5-ce4875e61ffd';
BEGIN

  -- ── PORTEROS ────────────────────────────────────────────
  -- Mike Maignan ya existe
  INSERT INTO public.players (team_id, name, position, active)
  VALUES
    (fra_id, 'Brice Samba',        'GK', true),
    (fra_id, 'Illan Meslier',      'GK', true)
  ON CONFLICT DO NOTHING;

  -- ── DEFENSAS ────────────────────────────────────────────
  -- Saliba, Upamecano, Koundé, T.Hernández, F.Mendy, Clauss ya existen
  INSERT INTO public.players (team_id, name, position, active)
  VALUES
    (fra_id, 'Ibrahima Konaté',    'DEF', true),
    (fra_id, 'Benjamin Pavard',    'DEF', true),
    (fra_id, 'Lucas Digne',        'DEF', true),
    (fra_id, 'Axel Disasi',        'DEF', true)
  ON CONFLICT DO NOTHING;

  -- ── MEDIOCAMPISTAS ──────────────────────────────────────
  -- Tchouaméni, Camavinga, Kanté, Zaïre-Emery, Rabiot ya existen
  INSERT INTO public.players (team_id, name, position, active)
  VALUES
    (fra_id, 'Youssouf Fofana',    'MID', true),
    (fra_id, 'Matteo Guendouzi',   'MID', true),
    (fra_id, 'Khephren Thuram',    'MID', true)
  ON CONFLICT DO NOTHING;

  -- ── DELANTEROS ──────────────────────────────────────────
  -- Mbappé, Griezmann, Dembélé, M.Thuram, Barcola, Kolo Muani ya existen
  INSERT INTO public.players (team_id, name, position, active)
  VALUES
    (fra_id, 'Christopher Nkunku', 'DEL', true),
    (fra_id, 'Michael Olise',      'DEL', true),
    (fra_id, 'Mathys Tel',         'DEL', true)
  ON CONFLICT DO NOTHING;

END $$;

-- Verificar resultado final
SELECT position, name, active
FROM public.players
WHERE team_id = 'cf8da80b-ab16-4971-a7b5-ce4875e61ffd'
ORDER BY position, name;
