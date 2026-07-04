-- =========================================================
-- Horarios y estadios oficiales WC 2026: Octavos → Final
-- Fuente: calendario oficial FIFA (horas en UTC; Lima = UTC-5)
-- Ejecutar en Supabase SQL Editor (o ya aplicado vía script)
-- =========================================================

-- Octavos de Final (4-7 julio) — horarios asignados por CRUCE real, no por numeración FIFA
UPDATE public.matches SET match_date = '2026-07-04T17:00:00+00:00', venue = 'NRG Stadium',             city = 'Houston'                 WHERE match_number = 89;  -- CAN vs MAR
UPDATE public.matches SET match_date = '2026-07-04T21:00:00+00:00', venue = 'Lincoln Financial Field', city = 'Filadelfia'              WHERE match_number = 90;  -- FRA vs PAR
UPDATE public.matches SET match_date = '2026-07-06T21:00:00+00:00', venue = 'Lumen Field',             city = 'Seattle'                 WHERE match_number = 91;  -- USA vs BEL
UPDATE public.matches SET match_date = '2026-07-06T19:00:00+00:00', venue = 'AT&T Stadium',            city = 'Dallas'                  WHERE match_number = 92;  -- ESP vs POR
UPDATE public.matches SET match_date = '2026-07-05T20:00:00+00:00', venue = 'MetLife Stadium',         city = 'Nueva York / Nueva Jersey' WHERE match_number = 93; -- BRA vs NOR
UPDATE public.matches SET match_date = '2026-07-06T00:00:00+00:00', venue = 'Estadio Azteca',          city = 'Ciudad de México'        WHERE match_number = 94;  -- MEX vs ENG
UPDATE public.matches SET match_date = '2026-07-07T20:00:00+00:00', venue = 'BC Place',                city = 'Vancouver'               WHERE match_number = 95;  -- SUI vs COL
UPDATE public.matches SET match_date = '2026-07-07T16:00:00+00:00', venue = 'Mercedes-Benz Stadium',   city = 'Atlanta'                 WHERE match_number = 96;  -- ARG vs EGY

-- Cuartos de Final (9-11 julio)
UPDATE public.matches SET match_date = '2026-07-09T20:00:00+00:00', venue = 'Gillette Stadium',        city = 'Boston'                  WHERE match_number = 97;
UPDATE public.matches SET match_date = '2026-07-10T19:00:00+00:00', venue = 'SoFi Stadium',            city = 'Los Ángeles'             WHERE match_number = 98;
UPDATE public.matches SET match_date = '2026-07-11T21:00:00+00:00', venue = 'Hard Rock Stadium',       city = 'Miami'                   WHERE match_number = 99;
UPDATE public.matches SET match_date = '2026-07-12T01:00:00+00:00', venue = 'Arrowhead Stadium',       city = 'Kansas City'             WHERE match_number = 100;

-- Semifinales (14-15 julio)
UPDATE public.matches SET match_date = '2026-07-14T19:00:00+00:00', venue = 'AT&T Stadium',            city = 'Dallas'                  WHERE match_number = 101;
UPDATE public.matches SET match_date = '2026-07-15T19:00:00+00:00', venue = 'Mercedes-Benz Stadium',   city = 'Atlanta'                 WHERE match_number = 102;

-- Tercer Puesto (18 julio) y Gran Final (19 julio)
UPDATE public.matches SET match_date = '2026-07-18T21:00:00+00:00', venue = 'Hard Rock Stadium',       city = 'Miami'                   WHERE match_number = 103;
UPDATE public.matches SET match_date = '2026-07-19T19:00:00+00:00', venue = 'MetLife Stadium',         city = 'Nueva York / Nueva Jersey' WHERE match_number = 104;

-- Verificación
SELECT match_number, stage, (match_date AT TIME ZONE 'America/Lima')::text AS hora_lima, venue, city
FROM public.matches WHERE match_number BETWEEN 89 AND 104 ORDER BY match_number;
