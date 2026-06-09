-- ============================================================
-- Corrección horarios sedes México — Junio 2026
-- ============================================================
-- México abolió el horario de verano en 2023 (Ley publicada el 27/10/2022).
-- Desde entonces usa CST = UTC-6 todo el año.
-- El seed original asignó UTC-5 (CDT) a ciudades mexicanas por error,
-- lo que hace aparecer todos los partidos en México 1 hora antes.
--
-- Fix: sumar 1 hora a todos los partidos en sedes mexicanas.
-- (equivale a pasar de UTC-5 incorrecto → UTC-6 correcto)
-- ============================================================

UPDATE matches
SET match_date = match_date + INTERVAL '1 hour'
WHERE city IN ('Mexico City', 'Zapopan', 'Guadalupe', 'Guadalajara');
