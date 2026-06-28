-- =========================================================
-- Semilla R32 Mundial 2026 — Dieciseisavos de Final
-- Ejecutar en Supabase SQL Editor
-- Fechas en UTC (Lima = UTC-5, entonces hora Lima + 5h = UTC)
-- =========================================================

-- Asegurarse de que la columna venue existe
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS venue text;

-- ─────────────────────────────────────────────────────────
-- Paso 1: Crear slots R32 si no existen
-- ─────────────────────────────────────────────────────────
INSERT INTO public.matches (match_number, stage, match_date, status, predictions_locked)
SELECT v.match_number::int, v.stage, v.match_date::timestamptz, 'scheduled', false
FROM (VALUES
  (73,  'round_of_32', '2026-06-28T19:00:00+00:00'),
  (74,  'round_of_32', '2026-06-29T17:00:00+00:00'),
  (75,  'round_of_32', '2026-06-29T20:30:00+00:00'),
  (76,  'round_of_32', '2026-06-30T01:00:00+00:00'),
  (77,  'round_of_32', '2026-06-30T17:00:00+00:00'),
  (78,  'round_of_32', '2026-06-30T21:00:00+00:00'),
  (79,  'round_of_32', '2026-07-01T01:00:00+00:00'),
  (80,  'round_of_32', '2026-07-01T16:00:00+00:00'),
  (81,  'round_of_32', '2026-07-01T20:00:00+00:00'),
  (82,  'round_of_32', '2026-07-02T00:00:00+00:00'),
  (83,  'round_of_32', '2026-07-02T19:00:00+00:00'),
  (84,  'round_of_32', '2026-07-02T23:00:00+00:00'),
  (85,  'round_of_32', '2026-07-03T03:00:00+00:00'),
  (86,  'round_of_32', '2026-07-03T18:00:00+00:00'),
  (87,  'round_of_32', '2026-07-03T22:00:00+00:00'),
  (88,  'round_of_32', '2026-07-04T01:30:00+00:00'),
  (89,  'round_of_16', '2026-07-11T18:00:00+00:00'),
  (90,  'round_of_16', '2026-07-11T22:00:00+00:00'),
  (91,  'round_of_16', '2026-07-12T18:00:00+00:00'),
  (92,  'round_of_16', '2026-07-12T22:00:00+00:00'),
  (93,  'round_of_16', '2026-07-13T18:00:00+00:00'),
  (94,  'round_of_16', '2026-07-13T22:00:00+00:00'),
  (95,  'round_of_16', '2026-07-14T18:00:00+00:00'),
  (96,  'round_of_16', '2026-07-14T22:00:00+00:00'),
  (97,  'quarterfinal', '2026-07-18T18:00:00+00:00'),
  (98,  'quarterfinal', '2026-07-18T22:00:00+00:00'),
  (99,  'quarterfinal', '2026-07-19T18:00:00+00:00'),
  (100, 'quarterfinal', '2026-07-19T22:00:00+00:00'),
  (101, 'semifinal',    '2026-07-23T00:00:00+00:00'),
  (102, 'semifinal',    '2026-07-24T00:00:00+00:00'),
  (103, 'third_place',  '2026-07-25T18:00:00+00:00'),
  (104, 'final',        '2026-07-26T19:00:00+00:00')
) AS v(match_number, stage, match_date)
WHERE NOT EXISTS (
  SELECT 1 FROM public.matches m WHERE m.match_number = v.match_number::int
);

-- ─────────────────────────────────────────────────────────
-- Paso 2: Actualizar R32 con equipos, fechas y estadios reales
-- Los team codes usan LIKE para tolerar variaciones menores
-- ─────────────────────────────────────────────────────────

-- 73: Sudáfrica vs. Canadá — Dom 28 Jun, 2:00 PM Lima
UPDATE public.matches SET
  home_team_id = (SELECT id FROM public.teams WHERE code = 'RSA' LIMIT 1),
  away_team_id = (SELECT id FROM public.teams WHERE code = 'CAN' LIMIT 1),
  match_date   = '2026-06-28T19:00:00+00:00',
  venue        = 'SoFi Stadium',
  city         = 'Los Angeles'
WHERE match_number = 73;

-- 74: Brasil vs. Japón — Lun 29 Jun, 12:00 PM Lima
UPDATE public.matches SET
  home_team_id = (SELECT id FROM public.teams WHERE code = 'BRA' LIMIT 1),
  away_team_id = (SELECT id FROM public.teams WHERE code = 'JPN' LIMIT 1),
  match_date   = '2026-06-29T17:00:00+00:00',
  venue        = 'NRG Stadium',
  city         = 'Houston'
WHERE match_number = 74;

-- 75: Alemania vs. Paraguay — Lun 29 Jun, 3:30 PM Lima
UPDATE public.matches SET
  home_team_id = (SELECT id FROM public.teams WHERE code = 'GER' LIMIT 1),
  away_team_id = (SELECT id FROM public.teams WHERE code IN ('PAR','PRY') LIMIT 1),
  match_date   = '2026-06-29T20:30:00+00:00',
  venue        = 'Gillette Stadium',
  city         = 'Boston'
WHERE match_number = 75;

-- 76: Países Bajos vs. Marruecos — Lun 29 Jun, 8:00 PM Lima
UPDATE public.matches SET
  home_team_id = (SELECT id FROM public.teams WHERE code IN ('NED','HOL') LIMIT 1),
  away_team_id = (SELECT id FROM public.teams WHERE code = 'MAR' LIMIT 1),
  match_date   = '2026-06-30T01:00:00+00:00',
  venue        = 'Estadio BBVA',
  city         = 'Monterrey'
WHERE match_number = 76;

-- 77: Costa de Marfil vs. Noruega — Mar 30 Jun, 12:00 PM Lima
UPDATE public.matches SET
  home_team_id = (SELECT id FROM public.teams WHERE code IN ('CIV','CIN') LIMIT 1),
  away_team_id = (SELECT id FROM public.teams WHERE code = 'NOR' LIMIT 1),
  match_date   = '2026-06-30T17:00:00+00:00',
  venue        = 'AT&T Stadium',
  city         = 'Dallas'
WHERE match_number = 77;

-- 78: Francia vs. Suecia — Mar 30 Jun, 4:00 PM Lima
UPDATE public.matches SET
  home_team_id = (SELECT id FROM public.teams WHERE code = 'FRA' LIMIT 1),
  away_team_id = (SELECT id FROM public.teams WHERE code = 'SWE' LIMIT 1),
  match_date   = '2026-06-30T21:00:00+00:00',
  venue        = 'MetLife Stadium',
  city         = 'Nueva York / Nueva Jersey'
WHERE match_number = 78;

-- 79: México vs. Ecuador — Mar 30 Jun, 8:00 PM Lima
UPDATE public.matches SET
  home_team_id = (SELECT id FROM public.teams WHERE code = 'MEX' LIMIT 1),
  away_team_id = (SELECT id FROM public.teams WHERE code = 'ECU' LIMIT 1),
  match_date   = '2026-07-01T01:00:00+00:00',
  venue        = 'Estadio Azteca',
  city         = 'Ciudad de México'
WHERE match_number = 79;

-- 80: Inglaterra vs. RD Congo — Mié 1 Jul, 11:00 AM Lima
UPDATE public.matches SET
  home_team_id = (SELECT id FROM public.teams WHERE code = 'ENG' LIMIT 1),
  away_team_id = (SELECT id FROM public.teams WHERE code IN ('COD','DRC','RDC','CGO') LIMIT 1),
  match_date   = '2026-07-01T16:00:00+00:00',
  venue        = 'Mercedes-Benz Stadium',
  city         = 'Atlanta'
WHERE match_number = 80;

-- 81: Bélgica vs. Senegal — Mié 1 Jul, 3:00 PM Lima
UPDATE public.matches SET
  home_team_id = (SELECT id FROM public.teams WHERE code = 'BEL' LIMIT 1),
  away_team_id = (SELECT id FROM public.teams WHERE code = 'SEN' LIMIT 1),
  match_date   = '2026-07-01T20:00:00+00:00',
  venue        = 'Lumen Field',
  city         = 'Seattle'
WHERE match_number = 81;

-- 82: Estados Unidos vs. Bosnia y Herzegovina — Mié 1 Jul, 7:00 PM Lima
UPDATE public.matches SET
  home_team_id = (SELECT id FROM public.teams WHERE code = 'USA' LIMIT 1),
  away_team_id = (SELECT id FROM public.teams WHERE code IN ('BIH','BOS') LIMIT 1),
  match_date   = '2026-07-02T00:00:00+00:00',
  venue        = 'Levi''s Stadium',
  city         = 'San Francisco'
WHERE match_number = 82;

-- 83: España vs. Austria — Jue 2 Jul, 2:00 PM Lima
UPDATE public.matches SET
  home_team_id = (SELECT id FROM public.teams WHERE code = 'ESP' LIMIT 1),
  away_team_id = (SELECT id FROM public.teams WHERE code = 'AUT' LIMIT 1),
  match_date   = '2026-07-02T19:00:00+00:00',
  venue        = 'SoFi Stadium',
  city         = 'Los Angeles'
WHERE match_number = 83;

-- 84: Portugal vs. Croacia — Jue 2 Jul, 6:00 PM Lima
UPDATE public.matches SET
  home_team_id = (SELECT id FROM public.teams WHERE code = 'POR' LIMIT 1),
  away_team_id = (SELECT id FROM public.teams WHERE code = 'CRO' LIMIT 1),
  match_date   = '2026-07-02T23:00:00+00:00',
  venue        = 'BMO Field',
  city         = 'Toronto'
WHERE match_number = 84;

-- 85: Suiza vs. Argelia — Jue 2 Jul, 10:00 PM Lima
UPDATE public.matches SET
  home_team_id = (SELECT id FROM public.teams WHERE code IN ('SUI','CHE') LIMIT 1),
  away_team_id = (SELECT id FROM public.teams WHERE code IN ('ALG','DZA') LIMIT 1),
  match_date   = '2026-07-03T03:00:00+00:00',
  venue        = 'BC Place',
  city         = 'Vancouver'
WHERE match_number = 85;

-- 86: Australia vs. Egipto — Vie 3 Jul, 1:00 PM Lima
UPDATE public.matches SET
  home_team_id = (SELECT id FROM public.teams WHERE code = 'AUS' LIMIT 1),
  away_team_id = (SELECT id FROM public.teams WHERE code IN ('EGY','EGP') LIMIT 1),
  match_date   = '2026-07-03T18:00:00+00:00',
  venue        = 'AT&T Stadium',
  city         = 'Dallas'
WHERE match_number = 86;

-- 87: Argentina vs. Cabo Verde — Vie 3 Jul, 5:00 PM Lima
UPDATE public.matches SET
  home_team_id = (SELECT id FROM public.teams WHERE code = 'ARG' LIMIT 1),
  away_team_id = (SELECT id FROM public.teams WHERE code IN ('CPV','CVI','CVE') LIMIT 1),
  match_date   = '2026-07-03T22:00:00+00:00',
  venue        = 'Hard Rock Stadium',
  city         = 'Miami'
WHERE match_number = 87;

-- 88: Colombia vs. Ghana — Vie 3 Jul, 8:30 PM Lima
UPDATE public.matches SET
  home_team_id = (SELECT id FROM public.teams WHERE code = 'COL' LIMIT 1),
  away_team_id = (SELECT id FROM public.teams WHERE code = 'GHA' LIMIT 1),
  match_date   = '2026-07-04T01:30:00+00:00',
  venue        = 'Arrowhead Stadium',
  city         = 'Kansas City'
WHERE match_number = 88;

-- ─────────────────────────────────────────────────────────
-- Verificación: debería mostrar los 16 partidos con equipos
-- ─────────────────────────────────────────────────────────
SELECT
  m.match_number AS "#",
  (m.match_date AT TIME ZONE 'America/Lima')::text AS hora_lima,
  ht.name_es AS local,
  at2.name_es AS visitante,
  m.venue,
  m.city
FROM public.matches m
LEFT JOIN public.teams ht  ON ht.id  = m.home_team_id
LEFT JOIN public.teams at2 ON at2.id = m.away_team_id
WHERE m.stage = 'round_of_32'
ORDER BY m.match_number;
