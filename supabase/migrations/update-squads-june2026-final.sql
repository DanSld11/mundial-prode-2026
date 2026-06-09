-- ============================================================
-- Plantillas finales - Junio 2026
-- Jugadores clave no incluidos en migraciones previas
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- ALEMANIA (GER) — actualización 2026
-- ─────────────────────────────────────────────────────────────
-- Thomas Müller se retiró del equipo nacional en 2024
UPDATE players SET active = false
WHERE name ILIKE 'Thomas M%ller%'
  AND team_id = (SELECT id FROM teams WHERE code = 'GER' LIMIT 1);

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Jonathan Tah', 4, 'DEF', true FROM teams t WHERE t.code = 'GER'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Jonathan Tah%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'David Raum', 3, 'DEF', true FROM teams t WHERE t.code = 'GER'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'David Raum%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Deniz Undav', 16, 'DEL', true FROM teams t WHERE t.code = 'GER'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Deniz Undav%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Pascal Groß', 18, 'MID', true FROM teams t WHERE t.code = 'GER'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Pascal Gr%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Alexander Nübel', 12, 'GK', true FROM teams t WHERE t.code = 'GER'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE '%N%bel%');

-- ─────────────────────────────────────────────────────────────
-- ESPAÑA (ESP) — actualización 2026
-- ─────────────────────────────────────────────────────────────
INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Martín Zubimendi', 5, 'MID', true FROM teams t WHERE t.code = 'ESP'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE '%Zubimendi%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Aymeric Laporte', 24, 'DEF', true FROM teams t WHERE t.code = 'ESP'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Aymeric Laporte%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Ayoze Pérez', 20, 'DEL', true FROM teams t WHERE t.code = 'ESP'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Ayoze P%rez%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Samu Omorodion', 25, 'DEL', true FROM teams t WHERE t.code = 'ESP'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Samu Omor%');

-- ─────────────────────────────────────────────────────────────
-- ARGENTINA (ARG) — refuerzos 2026
-- ─────────────────────────────────────────────────────────────
INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Valentín Castellanos', 19, 'DEL', true FROM teams t WHERE t.code = 'ARG'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE '%Castellanos%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Franco Mastantuono', 25, 'MID', true FROM teams t WHERE t.code = 'ARG'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE '%Mastantuono%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Germán Pezzella', 15, 'DEF', true FROM teams t WHERE t.code = 'ARG'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE '%Pezzella%');

-- ─────────────────────────────────────────────────────────────
-- MÉXICO (MEX) — actualización 2026
-- ─────────────────────────────────────────────────────────────
UPDATE players SET active = false
WHERE name ILIKE 'Guillermo Ochoa%'
  AND team_id = (SELECT id FROM teams WHERE code = 'MEX' LIMIT 1);

UPDATE players SET active = false
WHERE name ILIKE 'H%ctor Herrera%'
  AND team_id = (SELECT id FROM teams WHERE code = 'MEX' LIMIT 1);

UPDATE players SET active = false
WHERE name ILIKE 'Rogelio Funes Mori%'
  AND team_id = (SELECT id FROM teams WHERE code = 'MEX' LIMIT 1);

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Gerónimo Rulli', 1, 'GK', true FROM teams t WHERE t.code = 'MEX'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE '%Rulli%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Carlos Antuna', 19, 'DEL', true FROM teams t WHERE t.code = 'MEX'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE '%Antuna%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Alexis Vega', 20, 'MID', true FROM teams t WHERE t.code = 'MEX'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Alexis Vega%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Charly Rodríguez', 18, 'MID', true FROM teams t WHERE t.code = 'MEX'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Charly Rodr%');

-- ─────────────────────────────────────────────────────────────
-- INGLATERRA (ENG) — actualización 2026
-- ─────────────────────────────────────────────────────────────
INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Ben Chilwell', 3, 'DEF', true FROM teams t WHERE t.code = 'ENG'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Ben Chilwell%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Morgan Gibbs-White', 15, 'MID', true FROM teams t WHERE t.code = 'ENG'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE '%Gibbs-White%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Levi Colwill', 18, 'DEF', true FROM teams t WHERE t.code = 'ENG'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Levi Colwill%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Noni Madueke', 21, 'DEL', true FROM teams t WHERE t.code = 'ENG'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE '%Madueke%');

-- ─────────────────────────────────────────────────────────────
-- FRANCIA (FRA) — actualización 2026
-- ─────────────────────────────────────────────────────────────
INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Dayot Upamecano', 5, 'DEF', true FROM teams t WHERE t.code = 'FRA'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Dayot Upamecano%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Eduardo Camavinga', 6, 'MID', true FROM teams t WHERE t.code = 'FRA'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Eduardo Camavinga%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Jonathan Clauss', 2, 'DEF', true FROM teams t WHERE t.code = 'FRA'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Jonathan Clauss%');

-- ─────────────────────────────────────────────────────────────
-- BRASIL (BRA) — completar plantilla 2026
-- ─────────────────────────────────────────────────────────────
INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Savinho', 21, 'DEL', true FROM teams t WHERE t.code = 'BRA'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Savinho%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Pedro', 9, 'DEL', true FROM teams t WHERE t.code = 'BRA'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Pedro' AND p.position = 'DEL');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Gerson', 20, 'MID', true FROM teams t WHERE t.code = 'BRA'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Gerson%');

-- ─────────────────────────────────────────────────────────────
-- PORTUGAL (POR) — completar plantilla 2026
-- ─────────────────────────────────────────────────────────────
INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'José Sá', 12, 'GK', true FROM teams t WHERE t.code = 'POR'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Jos% S%' AND p.position = 'GK');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Nélson Semedo', 23, 'DEF', true FROM teams t WHERE t.code = 'POR'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE '%Semedo%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Renato Veiga', 6, 'DEF', true FROM teams t WHERE t.code = 'POR'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Renato Veiga%');

-- ─────────────────────────────────────────────────────────────
-- COLOMBIA (COL) — actualización 2026
-- ─────────────────────────────────────────────────────────────
INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Richard Ríos', 6, 'MID', true FROM teams t WHERE t.code = 'COL'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Richard R%os%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Jefferson Lerma', 16, 'MID', true FROM teams t WHERE t.code = 'COL'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE '%Lerma%');

-- ─────────────────────────────────────────────────────────────
-- ECUADOR (ECU) — actualización 2026
-- ─────────────────────────────────────────────────────────────
UPDATE players SET active = false
WHERE name ILIKE 'Enner Valencia%'
  AND team_id = (SELECT id FROM teams WHERE code = 'ECU' LIMIT 1);

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Alan Minda', 14, 'DEL', true FROM teams t WHERE t.code = 'ECU'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Alan Minda%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Justin Cuero', 18, 'DEL', true FROM teams t WHERE t.code = 'ECU'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Justin Cuero%');

-- ─────────────────────────────────────────────────────────────
-- MARRUECOS (MAR) — completar plantilla 2026
-- ─────────────────────────────────────────────────────────────
INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Munir El Haddadi', 15, 'DEL', true FROM teams t WHERE t.code = 'MAR'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE '%Munir%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Selim Amallah', 16, 'MID', true FROM teams t WHERE t.code = 'MAR'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE '%Amallah%');

-- ─────────────────────────────────────────────────────────────
-- TURQUÍA (TUR) — actualización 2026
-- ─────────────────────────────────────────────────────────────
INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Abdülkerim Bardakcı', 4, 'DEF', true FROM teams t WHERE t.code = 'TUR'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE '%Bardak%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Salih Özcan', 17, 'MID', true FROM teams t WHERE t.code = 'TUR'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Salih %zcan%');

-- ─────────────────────────────────────────────────────────────
-- AUSTRALIA (AUS) — actualización 2026
-- ─────────────────────────────────────────────────────────────
INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Joe Gauci', 12, 'GK', true FROM teams t WHERE t.code = 'AUS'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE 'Joe Gauci%');

INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Nestory Irankunda', 22, 'DEL', true FROM teams t WHERE t.code = 'AUS'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE '%Irankunda%');

-- ─────────────────────────────────────────────────────────────
-- BÉLGICA (BEL) — actualización 2026
-- ─────────────────────────────────────────────────────────────
INSERT INTO players (team_id, name, shirt_number, position, active)
SELECT t.id, 'Rasmus Casteels', 23, 'GK', true FROM teams t WHERE t.code = 'BEL'
  AND NOT EXISTS (SELECT 1 FROM players p WHERE p.team_id = t.id AND p.name ILIKE '%Casteels%');

-- ─────────────────────────────────────────────────────────────
-- SEGURIDAD: re-activar jugadores del seed en equipos sin migraciones
-- ─────────────────────────────────────────────────────────────
UPDATE players SET active = true
WHERE team_id IN (
  SELECT id FROM teams WHERE code IN ('RSA','CZE','QAT','SUI','USA','PAR','EGY','IRN','KSA','IRQ','ALG','UZB','GHA')
)
AND active = false;
