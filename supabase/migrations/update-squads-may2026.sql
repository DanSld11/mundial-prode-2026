-- ============================================================
-- Actualización de plantillas - Mayo 2026
-- Basado en convocatorias oficiales confirmadas al 27/05/2026
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. DESACTIVAR jugadores confirmados FUERA del Mundial
-- ─────────────────────────────────────────────────────────────

-- BRASIL: Rodrygo (rotura LCA + menisco confirmada)
UPDATE players SET active = false
WHERE name ILIKE 'Rodrygo%'
  AND team_id = (SELECT id FROM teams WHERE code = 'BRA' LIMIT 1);

-- BRASIL: Éder Militão (no convocado)
UPDATE players SET active = false
WHERE (name ILIKE '%Militão%' OR name ILIKE '%Militao%')
  AND team_id = (SELECT id FROM teams WHERE code = 'BRA' LIMIT 1);

-- BRASIL: Guilherme Arana (no convocado)
UPDATE players SET active = false
WHERE name ILIKE 'Guilherme Arana%'
  AND team_id = (SELECT id FROM teams WHERE code = 'BRA' LIMIT 1);

-- BRASIL: Gabriel Jesus (no convocado)
UPDATE players SET active = false
WHERE name ILIKE 'Gabriel Jesus%'
  AND team_id = (SELECT id FROM teams WHERE code = 'BRA' LIMIT 1);

-- BRASIL: Richarlison (no convocado)
UPDATE players SET active = false
WHERE name ILIKE 'Richarlison%'
  AND team_id = (SELECT id FROM teams WHERE code = 'BRA' LIMIT 1);

-- ALEMANIA: Serge Gnabry (lesión de aductor, baja confirmada)
UPDATE players SET active = false
WHERE name ILIKE 'Serge Gnabry%'
  AND team_id = (SELECT id FROM teams WHERE code = 'GER' LIMIT 1);

-- PAÍSES BAJOS: Matthijs de Ligt (cirugía de espalda, baja confirmada)
UPDATE players SET active = false
WHERE name ILIKE '%de Ligt%'
  AND team_id = (SELECT id FROM teams WHERE code = 'NED' LIMIT 1);

-- PAÍSES BAJOS: Xavi Simons (rotura LCA en abril, baja confirmada)
UPDATE players SET active = false
WHERE name ILIKE 'Xavi Simons%'
  AND team_id = (SELECT id FROM teams WHERE code = 'NED' LIMIT 1);

-- PAÍSES BAJOS: Jasper Cillessen (no convocado)
UPDATE players SET active = false
WHERE name ILIKE '%Cillessen%'
  AND team_id = (SELECT id FROM teams WHERE code = 'NED' LIMIT 1);

-- PAÍSES BAJOS: Steven Bergwijn (no convocado)
UPDATE players SET active = false
WHERE name ILIKE 'Steven Bergwijn%'
  AND team_id = (SELECT id FROM teams WHERE code = 'NED' LIMIT 1);

-- PAÍSES BAJOS: Memphis Depay (en el seed pero fue incluido - asegurarse activo)
UPDATE players SET active = true
WHERE name ILIKE 'Memphis Depay%'
  AND team_id = (SELECT id FROM teams WHERE code = 'NED' LIMIT 1);

-- ARGENTINA: Ángel Di María (retirado en 2024, no convocado)
UPDATE players SET active = false
WHERE name ILIKE '%Di Mar%'
  AND team_id = (SELECT id FROM teams WHERE code = 'ARG' LIMIT 1);

-- BRASIL: Asegurar Neymar activo (regresó tras lesión)
UPDATE players SET active = true
WHERE name ILIKE 'Neymar%'
  AND team_id = (SELECT id FROM teams WHERE code = 'BRA' LIMIT 1);


-- ─────────────────────────────────────────────────────────────
-- 2. AGREGAR jugadores nuevos en plantillas oficiales
-- ─────────────────────────────────────────────────────────────

-- ── BRASIL (plantilla oficial Carlo Ancelotti) ──────────────
INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Ederson', 12, 'GK', true FROM teams t WHERE t.code = 'BRA'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Ederson%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Weverton', 23, 'GK', true FROM teams t WHERE t.code = 'BRA'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Weverton%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Bremer', 3, 'DEF', true FROM teams t WHERE t.code = 'BRA'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Bremer%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Ibañez', 14, 'DEF', true FROM teams t WHERE t.code = 'BRA'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Iba%ez%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Leo Pereira', 5, 'DEF', true FROM teams t WHERE t.code = 'BRA'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Leo Pereira%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Wesley', 22, 'DEF', true FROM teams t WHERE t.code = 'BRA'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Wesley%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Alex Sandro', 8, 'DEF', true FROM teams t WHERE t.code = 'BRA'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Alex Sandro%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Douglas Santos', 13, 'DEF', true FROM teams t WHERE t.code = 'BRA'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Douglas Santos%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Fabinho', 15, 'MID', true FROM teams t WHERE t.code = 'BRA'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Fabinho%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Matheus Cunha', 18, 'DEL', true FROM teams t WHERE t.code = 'BRA'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Matheus Cunha%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Luiz Henrique', 17, 'DEL', true FROM teams t WHERE t.code = 'BRA'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Luiz Henrique%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Igor Thiago', 16, 'DEL', true FROM teams t WHERE t.code = 'BRA'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Igor Thiago%');

-- ── PAÍSES BAJOS (plantilla oficial Ronald Koeman) ──────────
INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Mark Flekken', 1, 'GK', true FROM teams t WHERE t.code = 'NED'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Mark Flekken%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Bart Verbruggen', 23, 'GK', true FROM teams t WHERE t.code = 'NED'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Bart Verbruggen%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Jurriën Timber', 5, 'DEF', true FROM teams t WHERE t.code = 'NED'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE '%Timber%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Micky van de Ven', 6, 'DEF', true FROM teams t WHERE t.code = 'NED'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE '%van de Ven%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Teun Koopmeiners', 8, 'MID', true FROM teams t WHERE t.code = 'NED'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE '%Koopmeiners%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Crysencio Summerville', 11, 'DEL', true FROM teams t WHERE t.code = 'NED'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE '%Summerville%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Justin Kluivert', 17, 'DEL', true FROM teams t WHERE t.code = 'NED'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE '%Kluivert%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Noa Lang', 20, 'DEL', true FROM teams t WHERE t.code = 'NED'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Noa Lang%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Marten de Roon', 16, 'MID', true FROM teams t WHERE t.code = 'NED'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE '%de Roon%');

-- ── ALEMANIA: asegurar Neuer activo (volvió del retiro) ─────
UPDATE players SET active = true
WHERE name ILIKE 'Manuel Neuer%'
  AND team_id = (SELECT id FROM teams WHERE code = 'GER' LIMIT 1);
