-- ============================================================
-- Completar plantillas oficiales - Junio 2026
-- Squads oficiales confirmados al 27/05/2026
-- Solo inserta jugadores que NO existen aún (NOT EXISTS)
-- ============================================================

-- Helper: inserta jugador si no existe ya en ese equipo con ese nombre
-- Uso: INSERT ... SELECT ... WHERE NOT EXISTS (SELECT 1 FROM players WHERE team_id=... AND name ILIKE ...)

-- ─────────────────────────────────────────────────────────────
-- HAITÍ (HAI) — confirmado 15/05
-- ─────────────────────────────────────────────────────────────
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='HAI' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Johny Placide%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Johny Placide','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Alexandre Pierre%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Alexandre Pierre','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Josue Duverger%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Josue Duverger','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Ricardo Ade%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ricardo Ade','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Carlens Arcus%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Carlens Arcus','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Martin Experience%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Martin Experience','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Jean-Kevin Duverne%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jean-Kevin Duverne','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Duke Lacroix%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Duke Lacroix','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Wilguens Paugain%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Wilguens Paugain','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Hannes Delcroix%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Hannes Delcroix','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Keeto Thermoncy%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Keeto Thermoncy','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Leverton Pierre%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Leverton Pierre','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Danley%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Danley Jean Jacques','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Sainte%' OR name ILIKE '%Sainthe%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Carl Sainte','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Bellegarde%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jean-Ricner Bellegarde','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Woodensky Pierre%') THEN UPDATE players SET active=true WHERE team_id=t_id AND name ILIKE '%Pierre%' AND position='MID'; END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Dominique Simon%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Dominique Simon','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Louicius Deedson%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Louicius Deedson','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Ruben Providence%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ruben Providence','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Josue Casimir%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Josue Casimir','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Etienne%') THEN UPDATE players SET name='Derrick Etienne Jr', active=true WHERE team_id=t_id AND name ILIKE '%Etienne%'; END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Wilson Isidor%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Wilson Isidor','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Yassin Fortune%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Yassin Fortune','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Lenny Joseph%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Lenny Joseph','DEL',true); END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- COREA DEL SUR (KOR) — confirmado 16/05
-- ─────────────────────────────────────────────────────────────
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='KOR' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Jo Hyeon-woo%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jo Hyeon-woo','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Song Bum-keun%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Song Bum-keun','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Kim Moon-hwan%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Kim Moon-hwan','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Seol Young-woo%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Seol Young-woo','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Cho Yu-min%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Cho Yu-min','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Lee Tae-seok%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Lee Tae-seok','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Park Jin-seob%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Park Jin-seob','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Kim Tae-hyeon%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Kim Tae-hyeon','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Lee Han-beom%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Lee Han-beom','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Jens Castrop%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jens Castrop','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Lee Ki-hyuk%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Lee Ki-hyuk','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Hwang Hee-chan%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Hwang Hee-chan','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Paik Seung-ho%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Paik Seung-ho','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Kim Jin-gyu%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Kim Jin-gyu','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Lee Dong-gyeong%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Lee Dong-gyeong','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Bae Jun-ho%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Bae Jun-ho','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Eom Ji-sung%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Eom Ji-sung','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Yang Hyun-jun%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Yang Hyun-jun','MID',true); END IF;
  -- Desactivar jugadores no convocados del seed
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Hwang Ui-jo%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Kim Young-gwon%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Kwon Chang-hoon%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Kim Jin-su%';
END $$;

-- ─────────────────────────────────────────────────────────────
-- BOSNIA Y HERZEGOVINA (BIH) — confirmado 11/05
-- ─────────────────────────────────────────────────────────────
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='BIH' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Nikola Vasilj%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Nikola Vasilj','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Martin Zlomislic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Martin Zlomislić','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Osman Hadzikic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Osman Hadžikić','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Dennis Hadzikadunic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Dennis Hadžikadunić','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Nikola Katic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Nikola Katić','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Tarik Muharemovic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Tarik Muharemović','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Nihad Mujakic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Nihad Mujakić','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Stjepan Radeljic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Stjepan Radeljić','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Nidal Celik%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Nidal Čelik','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Amir Hadziahmetovic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Amir Hadžiahmetović','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Benjamin Tahirovic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Benjamin Tahirović','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Armin Gigovic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Armin Gigović','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Dzenis Burnic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Dženis Burnić','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Ivan Basic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ivan Bašić','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Esmir Bajraktarevic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Esmir Bajraktarević','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Amar Memic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Amar Memić','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Ivan Sunjic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ivan Šunjić','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Kerim Alajbegovic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Kerim Alajbegović','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Ermin Mahmic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ermin Mahmić','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Samed Bazdar%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Samed Baždar','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Haris Tabakovic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Haris Tabaković','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Jovo Lukic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jovo Lukić','DEL',true); END IF;
  -- Desactivar no convocados del seed
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE '%Bešić%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE '%Bajrami%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE '%Menalo%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Nermin Zolotic%';
END $$;

-- ─────────────────────────────────────────────────────────────
-- CURAZAO (CUW) — confirmado 18/05
-- ─────────────────────────────────────────────────────────────
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='CUW' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Trevor Doornbusch%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Trevor Doornbusch','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Tyrick Bodak%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Tyrick Bodak','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Jurien Gaari%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jurien Gaari','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Roshon Van Eijma%' OR name ILIKE 'Roshon van der Berg%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Roshon van Eijma','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Sherel Floranus%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Sherel Floranus','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Joshua Brenet%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Joshua Brenet','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Shurandy Sambo%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Shurandy Sambo','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Armando Obispo%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Armando Obispo','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Riechedly Bazoer%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Riechedly Bazoer','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Deveron Fonville%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Deveron Fonville','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Juninho Bacuna%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Juninho Bacuna','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Godfried Roemeratoe%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Godfried Roemeratoe','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Kevin Felida%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Kevin Felida','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Livano Comenencia%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Livano Comenencia','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Martha%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ar''jany Martha','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Tyrese Noslin%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Tyrese Noslin','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Kenji Gorre%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Kenji Gorré','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Brandley Kuwas%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Brandley Kuwas','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Gervane Kastaneer%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Gervane Kastaneer','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Jeremy Antonisse%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jeremy Antonisse','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Jearl Margaritha%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jearl Margaritha','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Jurgen Locadia%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jurgen Locadia','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Sontje Hansen%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Sontje Hansen','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Tahith Chong%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Tahith Chong','DEL',true); END IF;
  -- Desactivar no convocados del seed
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Cuco Martina%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Rubio Rubin%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Quentin Overman%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Corydon Ruiter%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Ruwayne Bacuna%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Rangelo Janga%';
END $$;

-- ─────────────────────────────────────────────────────────────
-- NUEVA ZELANDA (NZL) — confirmado 14/05
-- ─────────────────────────────────────────────────────────────
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='NZL' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Max Crocombe%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Max Crocombe','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Alex Paulsen%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Alex Paulsen','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Francis de Vries%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Francis de Vries','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Tyler Bindon%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Tyler Bindon','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Michael Boxall%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Michael Boxall','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Nando Pijnaker%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Nando Pijnaker','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Finn Surman%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Finn Surman','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Marko Stamenic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Marko Stamenić','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Alex Rufer%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Alex Rufer','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Ryan Thomas%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ryan Thomas','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Lachlan Bayliss%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Lachlan Bayliss','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Elijah Just%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Elijah Just','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Sarpreet Singh%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Sarpreet Singh','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Kosta Barbarouses%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Kosta Barbarouses','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Ben Waine%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ben Waine','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Callum McCowatt%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Callum McCowatt','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Jesse Randall%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jesse Randall','DEL',true); END IF;
  -- Desactivar no convocados
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Marco Rojas%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE '%Garbett%'; -- fue incluido pero en diferente posición; reactivar
  UPDATE players SET active=true WHERE team_id=t_id AND name ILIKE '%Garbett%';
END $$;

-- ─────────────────────────────────────────────────────────────
-- ESCOCIA (SCO) — confirmado 19/05
-- ─────────────────────────────────────────────────────────────
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='SCO' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Craig Gordon%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Craig Gordon','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Liam Kelly%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Liam Kelly','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Grant Hanley%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Grant Hanley','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Aaron Hickey%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Aaron Hickey','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Dominic Hyam%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Dominic Hyam','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Scott McKenna%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Scott McKenna','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Nathan Patterson%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Nathan Patterson','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Anthony Ralston%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Anthony Ralston','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'John Souttar%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'John Souttar','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Billy Gilmour%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Billy Gilmour','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Kenny McLean%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Kenny McLean','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Lewis Ferguson%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Lewis Ferguson','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Findlay Curtis%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Findlay Curtis','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Ben Gannon-Doak%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ben Gannon-Doak','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'George Hirst%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'George Hirst','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Ross Stewart%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ross Stewart','DEL',true); END IF;
  -- Desactivar no convocados del seed
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Stuart Armstrong%';
END $$;

-- ─────────────────────────────────────────────────────────────
-- SUECIA (SWE) — confirmado 12/05
-- ─────────────────────────────────────────────────────────────
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='SWE' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Kristoffer Nordfeldt%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Kristoffer Nordfeldt','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Viktor Johansson%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Viktor Johansson','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Jacob Widell%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jacob Widell Zetterstrom','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Gabriel Gudmundsson%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Gabriel Gudmundsson','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Carl Starfelt%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Carl Starfelt','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Emil Holm%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Emil Holm','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Hjalmar Ekdal%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Hjalmar Ekdal','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Daniel Svensson%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Daniel Svensson','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Gustaf Lagerbielke%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Gustaf Lagerbielke','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Eric Smith%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Eric Smith','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Elliot Stroud%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Elliot Stroud','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Jesper Karlstrom%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jesper Karlström','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Yasin Ayari%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Yasin Ayari','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Lucas Bergvall%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Lucas Bergvall','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Besfort Zeneli%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Besfort Zeneli','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Ken Sema%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ken Sema','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Benjamin Nygren%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Benjamin Nygren','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Alexander Bernhardsson%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Alexander Bernhardsson','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Gustaf Nilsson%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Gustaf Nilsson','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Taha Ali%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Taha Ali','DEL',true); END IF;
  -- Desactivar no convocados del seed
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Robin Olsen%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Ludwig Augustinsson%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Marcus Danielson%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Emil Forsberg%';
END $$;

-- ─────────────────────────────────────────────────────────────
-- TÚNEZ (TUN) — confirmado 15/05
-- ─────────────────────────────────────────────────────────────
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='TUN' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Sabri Ben Hessen%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Sabri Ben Hessen','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Mouhib Chamakh%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Mouhib Chamakh','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Ali Abdi%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ali Abdi','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Yan Valery%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Yan Valery','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Mohamed Amine Ben Hamida%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Mohamed Amine Ben Hamida','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Moutaz Neffati%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Moutaz Neffati','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Omar Rekik%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Omar Rekik','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Adem Arous%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Adem Arous','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Raed Chikhaoui%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Raed Chikhaoui','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Shkiri%' OR name ILIKE '%Skhiri%') THEN UPDATE players SET name='Ellyes Skhiri', active=true WHERE team_id=t_id AND (name ILIKE '%Skhiri%' OR name ILIKE '%Shkiri%'); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Mortadha Ben Ouanes%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Mortadha Ben Ouanes','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Ismael Gharbi%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ismael Gharbi','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Hadj Mahmoud%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Hadj Mahmoud','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Rani Khedira%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Rani Khedira','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Elias Achouri%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Elias Achouri','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Firas Chaouat%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Firas Chaouat','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Hazem Mastouri%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Hazem Mastouri','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Elias Saad%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Elias Saad','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Sebastian Tounekti%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Sébastien Tounekti','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Khalil Ayari%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Khalil Ayari','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Rayan Elloumi%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Rayan Elloumi','DEL',true); END IF;
  -- Desactivar no convocados del seed
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Wahbi Khazri%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Seifeddine Jaziri%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Youssef Msakni%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Naim Sliti%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Ali Maaloul%';
END $$;

-- ─────────────────────────────────────────────────────────────
-- NORUEGA (NOR) — confirmado 21/05
-- ─────────────────────────────────────────────────────────────
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='NOR' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Egil Selvik%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Egil Selvik','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Sander Tangvik%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Sander Tangvik','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Kristoffer Ajer%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Kristoffer Ajer','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Julian Ryerson%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Julian Ryerson','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'David Moller Wolfe%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'David Møller Wolfe','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Fredrik%Bjorkan%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Fredrik André Bjørkan','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Torbjorn Heggem%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Torbjørn Heggem','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Sondre Langas%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Sondre Langas','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Henrik Falchener%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Henrik Falchener','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Sander Berge%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Sander Berge','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Patrick Berg%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Patrick Berg','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Kristian Thorstvedt%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Kristian Thorstvedt','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Antonio Nusa%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Antonio Nusa','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Oscar Bobb%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Oscar Bobb','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Jens Petter Hauge%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jens Petter Hauge','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Andreas Schjelderup%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Andreas Schjelderup','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Thelo Aasgaard%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Thelo Aasgaard','MID',true); END IF;
  -- Desactivar no convocados del seed
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Stefan Strandberg%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Mathias Normann%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Mohamed Elyounoussi%';
END $$;

-- ─────────────────────────────────────────────────────────────
-- CABO VERDE (CPV) — confirmado 18/05
-- ─────────────────────────────────────────────────────────────
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='CPV' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Marcio%Rosa%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Márcio Rosa','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'CJ dos Santos%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'CJ dos Santos','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Stopira%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Stopira','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Joao Paulo%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'João Paulo Fernandes','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Diney%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Diney','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Logan Costa%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Logan Costa','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Steven Moreira%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Steven Moreira','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Wagner Pina%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Wagner Pina','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Sidny Lopes%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Sidny Lopes Cabral','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Kelvin Pires%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Kelvin Pires','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Jamiro Monteiro%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jamiro Monteiro','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Kevin Pina%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Kevin Pina','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Deroy Duarte%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Deroy Duarte','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Telmo Arcanjo%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Telmo Arcanjo','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Laros Duarte%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Laros Duarte','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Yannick Semedo%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Yannick Semedo','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Willy Semedo%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Willy Semedo','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Gilson Benchimol%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Gilson Benchimol','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Dailon Livramento%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Dailon Livramento','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Helio Varela%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Hélio Varela','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Nuno da Costa%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Nuno Da Costa','DEL',true); END IF;
  -- Desactivar no convocados del seed
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Vozinha%';
  -- Reactivar Vozinha (es el GK titular - nombre real: Josimar Dias pero apodado Vozinha)
  UPDATE players SET active=true WHERE team_id=t_id AND name ILIKE 'Vozinha%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Bryan Tavares%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Marco Soares%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Patrick Andrade%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Kenny Rocha%';
END $$;

-- ─────────────────────────────────────────────────────────────
-- COSTA DE MARFIL (CIV) — confirmado 15/05
-- ─────────────────────────────────────────────────────────────
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='CIV' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Alban Lafont%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Alban Lafont','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Mohamed Kone%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Mohamed Koné','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Ghislain Konan%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ghislain Konan','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Odilon Kossounou%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Odilon Kossounou','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Wilfried Singo%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Wilfried Singo','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Evan Ndicka%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Evan Ndicka','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Emmanuel Agbadou%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Emmanuel Agbadou','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Guela Doue%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Guela Doué','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Ousmane Diomande%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ousmane Diomandé','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Clement Akpa%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Clément Akpa Akpro','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Jean Michael Seri%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jean Michaël Seri','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Seko Fofana%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Seko Fofana','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Christ Inao Oulai%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Christ Inao Oulai','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Parfait Guiagon%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Parfait Guiagon','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Simon Adingra%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Simon Adingra','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Evann Guessand%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Evann Guessand','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Amad Diallo%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Amad Diallo','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Yan Diomande%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Yan Diomandé','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Bazoumana Toure%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Bazoumana Touré','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Elye Wahi%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Elye Wahi','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Ange Yoan-Bonny%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ange Yoan-Bonny','DEL',true); END IF;
  -- Desactivar no convocados del seed
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Serge Aurier%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Simon Deli%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Wilfried Zaha%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE '%Haller%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Maxwell Cornet%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Jean-Philippe Krasso%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Karim Konat%';
END $$;

-- ─────────────────────────────────────────────────────────────
-- JAPÓN (JPN) — confirmado 15/05
-- ─────────────────────────────────────────────────────────────
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='JPN' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Zion Suzuki%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Zion Suzuki','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Keisuke Osako%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Keisuke Osako','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Tomoki Hayakawa%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Tomoki Hayakawa','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Yuto Nagatomo%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Yuto Nagatomo','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Shogo Taniguchi%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Shogo Taniguchi','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Hiroki Ito%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Hiroki Ito','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Yukinari Sugawara%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Yukinari Sugawara','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Ayumu Seko%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ayumu Seko','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Tsuyoshi Watanabe%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Tsuyoshi Watanabe','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Junnosuke Suzuki%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Junnosuke Suzuki','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Ao Tanaka%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ao Tanaka','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Keito Nakamura%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Keito Nakamura','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Kaishu Sano%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Kaishu Sano','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Daizen Maeda%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Daizen Maeda','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Koki Ogawa%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Koki Ogawa','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Yuito Suzuki%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Yuito Suzuki','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Keisuke Goto%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Keisuke Goto','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Kento Shiogai%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Kento Shiogai','DEL',true); END IF;
  -- Desactivar no convocados del seed
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Maya Yoshida%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Hidemasa Morita%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Daichi Kamada%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Shuichi Gonda%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Junya Ito%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Takumi Minamino%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Kyogo Furuhashi%';
END $$;

-- ─────────────────────────────────────────────────────────────
-- SENEGAL (SEN) — provisional 28 jugadores (21/05)
-- ─────────────────────────────────────────────────────────────
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='SEN' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Mory Diaw%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Mory Diaw','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Yehvann Diouf%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Yehvann Diouf','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Moussa Niakhate%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Moussa Niakhate','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Abdoulaye Seck%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Abdoulaye Seck','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'El Hadj Malick Diouf%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'El Hadj Malick Diouf','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Antoine Mendy%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Antoine Mendy','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Mamadou Sarr%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Mamadou Sarr','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Ilay Camara%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ilay Camara','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Moustapha Mbow%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Moustapha Mbow','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Pape Matar Sarr%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Pape Matar Sarr','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Pathe Siss%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Pathé Siss','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Habib Diarra%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Habib Diarra','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Bara Sapoko%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Bara Sapoko Ndiaye','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Bamba Dieng%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Bamba Dieng','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Cherif Ndiaye%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Chérif Ndiaye','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Ibrahim Mbaye%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ibrahim Mbaye','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Assane Diao%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Assane Diao','DEL',true); END IF;
  -- Desactivar no convocados del seed
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Abdou Diallo%';
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Pape Gueye%';
END $$;

-- ─────────────────────────────────────────────────────────────
-- AUSTRIA (AUT) — confirmado 18/05
-- ─────────────────────────────────────────────────────────────
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='AUT' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Alexander Schlager%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Alexander Schlager','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Florian Wiegele%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Florian Wiegele','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'David Affengruber%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'David Affengruber','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Kevin Danso%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Kevin Danso','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Phillipp Mwene%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Phillipp Mwene','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Alexander Prass%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Alexander Prass','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Marco Friedl%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Marco Friedl','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Michael Svoboda%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Michael Svoboda','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Nicolas Seiwald%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Nicolas Seiwald','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Marcel Sabitzer%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Marcel Sabitzer','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Florian Grillitsch%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Florian Grillitsch','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Carney Chukwuemeka%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Carney Chukwuemeka','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Romano Schmid%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Romano Schmid','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Christoph Baumgartner%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Christoph Baumgartner','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Konrad Laimer%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Konrad Laimer','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Patrick Wimmer%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Patrick Wimmer','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Paul Wanner%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Paul Wanner','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Alessandro Schopf%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Alessandro Schöpf','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Marko Arnautovic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Marko Arnautović','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Michael Gregoritsch%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Michael Gregoritsch','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Sasa Kalajdzic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Saša Kalajdžić','DEL',true); END IF;
  -- Desactivar no convocados del seed
  UPDATE players SET active=false WHERE team_id=t_id AND name ILIKE 'Maximilian Wöber%';
END $$;

-- ─────────────────────────────────────────────────────────────
-- CROACIA (CRO) — confirmado 18/05
-- ─────────────────────────────────────────────────────────────
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='CRO' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Dominik Livakovic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Dominik Livaković','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Dominik Kotarski%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Dominik Kotarski','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Ivor Pandur%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ivor Pandur','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Josko Gvardiol%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Joško Gvardiol','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Duje Caleta-Car%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Duje Caleta-Car','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Josip Stanisic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Josip Stanišić','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Marin Pongracic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Marin Pongračić','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Martin Erlic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Martin Erlić','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Luka Vuskovic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Luka Vušković','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Luka Modric%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Luka Modrić','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Mateo Kovacic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Mateo Kovačić','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Mario Pasalic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Mario Pašalić','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Nikola Vlasic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Nikola Vlašić','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Luka Sucic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Luka Sučić','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Martin Baturina%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Martin Baturina','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Kristijan Jakic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Kristijan Jakić','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Petar Sucic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Petar Sučić','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Nikola Moro%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Nikola Moro','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Toni Fruk%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Toni Fruk','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Ivan Perisic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ivan Perišić','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Andrej Kramaric%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Andrej Kramarić','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Ante Budimir%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ante Budimir','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Marco Pasalic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Marco Pašalić','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Petar Musa%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Petar Musa','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Igor Matanovic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Igor Matanović','DEL',true); END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- PANAMÁ (PAN) — confirmado 26/05
-- ─────────────────────────────────────────────────────────────
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='PAN' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Orlando Mosquera%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Orlando Mosquera','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Luis Mejia%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Luis Mejía','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Cesar Samudio%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'César Samudio','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Cesar Blackman%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'César Blackman','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Jorge Gutierrez%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jorge Gutierrez','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Amir Murillo%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Amir Murillo','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Fidel Escobar%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Fidel Escobar','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Andres Andrade%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Andrés Andrade','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Edgardo Farina%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Edgardo Farina','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Jose Cordoba%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'José Córdoba','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Eric Davis%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Eric Davis','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Jiovany Ramos%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jiovany Ramos','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Roderick Miller%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Roderick Miller','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Anibal Godoy%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Aníbal Godoy','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Carlos Harvey%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Carlos Harvey','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Cristian Martinez%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Cristian Martínez','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Jose Luis Rodriguez%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'José Luis Rodríguez','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Cesar Yanis%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'César Yanis','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Yoel Barcenas%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Yoel Bárcenas','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Azarias Londono%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Azarías Londoño','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Adalberto Carrasquilla%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Adalberto Carrasquilla','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Alberto Quintero%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Alberto Quintero','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Ismael Diaz%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ismael Díaz','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Cecilio Waterman%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Cecilio Waterman','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Jose Fajardo%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'José Fajardo','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Tomas Rodriguez%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Tomás Rodríguez','DEL',true); END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- RD CONGO (COD) — confirmado 18/05
-- ─────────────────────────────────────────────────────────────
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='COD' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Lionel Mpasi%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Lionel Mpasi','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Timothy Fayelu%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Timothy Fayelu','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Matthieu Epolo%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Matthieu Epolo','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Chancel Mbemba%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Chancel Mbemba','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Arthur Masuaku%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Arthur Masuaku','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Gedeon Kalulu%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Gédéon Kalulu','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Joris Kayembe%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Joris Kayembe','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Dylan Batubinsika%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Dylan Batubinsika','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Axel Tuanzebe%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Axel Tuanzebe','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Aaron Wan-Bissaka%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Aaron Wan-Bissaka','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Rocky Bushiri%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Rocky Bushiri','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Steve Kapuadi%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Steve Kapuadi','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Meschak Elia%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Meschak Elia','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Samuel Moutoussamy%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Samuel Moutoussamy','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Edo Kayembe%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Edo Kayembe','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Charles Pickel%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Charles Pickel','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Gael Kakuta%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Gaël Kakuta','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Noah Sadiki%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Noah Sadiki','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Nathanael Mbuku%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Nathanaël Mbuku','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Ngal%Mukau%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ngal''ayel Mukau','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Brian Cipenga%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Brian Cipenga','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Cedric Bakambu%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Cédric Bakambu','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Theo Bongonba%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Théo Bongonba','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Fiston Mayele%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Fiston Mayele','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Yoane Wissa%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Yoane Wissa','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE 'Simon Banza%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Simon Banza','DEL',true); END IF;
END $$;
