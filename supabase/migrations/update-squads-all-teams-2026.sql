-- =============================================
-- COMPLETAR PLANTELES - TODOS LOS EQUIPOS
-- MUNDIAL 2026
-- Solo agrega jugadores faltantes (NOT EXISTS)
-- No toca ni modifica jugadores existentes
-- Ejecutar en: Supabase → SQL Editor
-- =============================================

-- ══════════════════════════════════════════════
-- ALEMANIA (GER) — 18 activos → 26
-- ══════════════════════════════════════════════
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='GER' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Schlotterbeck%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Nico Schlotterbeck','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Henrichs%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Benjamin Henrichs','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Thiaw%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Malick Thiaw','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Pavlovic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Aleksandar Pavlovic','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Stiller%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Angelo Stiller','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Adeyemi%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Karim Adeyemi','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Beier%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Maximilian Beier','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Krauß%' OR name ILIKE '%Krauss%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Tom Krauß','MID',true); END IF;
END $$;

-- ══════════════════════════════════════════════
-- ARGENTINA (ARG) — 18 activos → 26
-- ══════════════════════════════════════════════
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='ARG' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Benítez%' AND position='GK') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Walter Benítez','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Musso%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Juan Musso','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Otamendi%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Nicolás Otamendi','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Acuña%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Marcos Acuña','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Lo Celso%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Giovani Lo Celso','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Palacios%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Exequiel Palacios','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Guido Rod%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Guido Rodríguez','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Nicolás González%' OR name ILIKE '%Nicolas Gonzalez%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Nicolás González','DEL',true); END IF;
END $$;

-- ══════════════════════════════════════════════
-- AUSTRALIA (AUS) — 14 activos → 26
-- ══════════════════════════════════════════════
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='AUS' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Vukovic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Danny Vukovic','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Redmayne%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Andrew Redmayne','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Joel King%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Joel King','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Atkinson%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Nathaniel Atkinson','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Rowles%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Kye Rowles','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Bailey Wright%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Bailey Wright','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Thomas Deng%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Thomas Deng','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Irvine%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jackson Irvine','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Genreau%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Denis Genreau','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Jeggo%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'James Jeggo','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Goodwin%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Craig Goodwin','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%D%Agostino%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Nick D''Agostino','DEL',true); END IF;
END $$;

-- ══════════════════════════════════════════════
-- BÉLGICA (BEL) — 15 activos → 26
-- ══════════════════════════════════════════════
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='BEL' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Matz Sels%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Matz Sels','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Castagne%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Timothy Castagne','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%De Cuyper%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Maxim De Cuyper','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Mechele%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Brandon Mechele','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Vertonghen%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jan Vertonghen','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Mangala%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Orel Mangala','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Tielemans%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Youri Tielemans','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Vanaken%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Hans Vanaken','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Lukébakio%' OR name ILIKE '%Lukebakio%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Dodi Lukébakio','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Duranville%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Julián Duranville','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Ngonge%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Cyril Ngonge','DEL',true); END IF;
END $$;

-- ══════════════════════════════════════════════
-- CANADÁ (CAN) — 14 activos → 26
-- ══════════════════════════════════════════════
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='CAN' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%St. Clair%' OR name ILIKE '%StClair%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Dayne St. Clair','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Pantemis%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'James Pantemis','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Alistair Johnston%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Alistair Johnston','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Adekugbe%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Sam Adekugbe','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Cornelius%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Derek Cornelius','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Doneil Henry%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Doneil Henry','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Piette%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Samuel Piette','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Liam Fraser%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Liam Fraser','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Choinière%' OR name ILIKE '%Choiniere%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Mathieu Choinière','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Shaffelburg%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jacob Shaffelburg','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Theo Bair%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Theo Bair','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Bassong%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Zorhan Bassong','MID',true); END IF;
END $$;

-- ══════════════════════════════════════════════
-- COLOMBIA (COL) — 15 activos → 26
-- ══════════════════════════════════════════════
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='COL' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Montero%' AND position='GK') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Álvaro Montero','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Mosquera%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Andrés Mosquera Marmolejo','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Carlos Cuesta%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Carlos Cuesta','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Lucumí%' OR name ILIKE '%Lucumi%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jhon Lucumí','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Yerry Mina%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Yerry Mina','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Deiver Machado%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Deiver Machado','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Quintero%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Juan Fernando Quintero','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Sinisterra%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Luis Sinisterra','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Jhon Durán%' OR name ILIKE '%Jhon Duran%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jhon Durán','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Roger Martínez%' OR name ILIKE '%Roger Martinez%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Roger Martínez','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Cuadrado%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Juan Guillermo Cuadrado','DEL',true); END IF;
END $$;

-- ══════════════════════════════════════════════
-- REPÚBLICA CHECA (CZE) — 11 activos → 26
-- ══════════════════════════════════════════════
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='CZE' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Mandous%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Aleš Mandous','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Staněk%' OR name ILIKE '%Stanek%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jindřich Staněk','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Kadeřábek%' OR name ILIKE '%Kaderabek%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Pavel Kadeřábek','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Ladislav Krejčí%' OR name ILIKE '%Ladislav Krejci%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ladislav Krejčí','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Jurásek%' OR name ILIKE '%Jurasek%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'David Jurásek','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Kalas%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Tomáš Kalas','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Hranáč%' OR name ILIKE '%Hranac%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Robin Hranáč','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Provod%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Lukáš Provod','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Sýkora%' OR name ILIKE '%Sykora%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jan Sýkora','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Karabec%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Adam Karabec','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Černý%' OR name ILIKE '%Cerny%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Václav Černý','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Lingr%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ondřej Lingr','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Chytil%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Mojmír Chytil','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Juliš%' OR name ILIKE '%Julis%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Lukáš Juliš','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Douděra%' OR name ILIKE '%Doudera%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'David Douděra','DEF',true); END IF;
END $$;

-- ══════════════════════════════════════════════
-- ECUADOR (ECU) — 13 activos → 26
-- ══════════════════════════════════════════════
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='ECU' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Galíndez%' OR name ILIKE '%Galindez%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Hernán Galíndez','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Cevallos%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'José Cevallos Jr.','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Estupiñán%' OR name ILIKE '%Estupinán%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Pervis Estupiñán','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Porozo%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jackson Porozo','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Diego Palacios%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Diego Palacios','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Félix Torres%' OR name ILIKE '%Felix Torres%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Félix Torres','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Alan Franco%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Alan Franco','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Ángel Mena%' OR name ILIKE '%Angel Mena%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ángel Mena','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Joao Ortiz%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Joao Ortiz','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Jordy Caicedo%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jordy Caicedo','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Ayrton Preciado%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ayrton Preciado','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Michael Estrada%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Michael Estrada','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Leonardo Campana%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Leonardo Campana','DEL',true); END IF;
END $$;

-- ══════════════════════════════════════════════
-- EGIPTO (EGY) — 12 activos → 26
-- ══════════════════════════════════════════════
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='EGY' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Gabaski%' OR name ILIKE '%Abou-Gabal%' OR name ILIKE '%Abou Gabal%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Mohamed Abou-Gabal (Gabaski)','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Al-Sulaya%' OR name ILIKE '%Solia%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Amr Al-Sulaya','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Karim Hafez%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Karim Hafez','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%El-Mohamady%' OR name ILIKE '%Mohamady%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Baher El-Mohamady','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Abdelmonem%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Mohamed Abdelmonem','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Omar Kamal%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Omar Kamal','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Karim Fouad%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Karim Fouad','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Zizou%' OR name ILIKE '%Ahmed Sayed%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ahmed Sayed (Zizou)','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Ashour%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Emam Ashour','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Afsha%' OR name ILIKE '%Mohamed Hamdy%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Mohamed Hamdy (Afsha)','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Marmoush%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Omar Marmoush','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Ioahim%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ziad Ioahim','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Mustafa Amr%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Mustafa Amr','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Allam%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Mahmoud Allam','DEF',true); END IF;
END $$;

-- ══════════════════════════════════════════════
-- INGLATERRA (ENG) — 20 activos → 26
-- ══════════════════════════════════════════════
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='ENG' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Ramsdale%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Aaron Ramsdale','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Nick Pope%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Nick Pope','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Alexander-Arnold%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Trent Alexander-Arnold','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Gallagher%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Conor Gallagher','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Mainoo%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Kobbie Mainoo','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Eberechi Eze%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Eberechi Eze','MID',true); END IF;
END $$;

-- ══════════════════════════════════════════════
-- ESPAÑA (ESP) — 21 activos → 26
-- ══════════════════════════════════════════════
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='ESP' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Arnau Tenas%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Arnau Tenas','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Cucurella%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Marc Cucurella','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Iñigo Martínez%' OR name ILIKE '%Inigo Martinez%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Iñigo Martínez','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Mikel Merino%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Mikel Merino','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Álex Baena%' OR name ILIKE '%Alex Baena%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Álex Baena','MID',true); END IF;
END $$;

-- ══════════════════════════════════════════════
-- GHANA (GHA) — 13 activos → 26
-- ══════════════════════════════════════════════
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='GHA' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Wollacott%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Joseph Wollacott','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Danlad%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ibrahim Danlad','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Yiadom%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Andy Yiadom','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Gideon Mensah%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Gideon Mensah','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Joseph Aidoo%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Joseph Aidoo','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Alidu Seidu%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Alidu Seidu','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%André Ayew%' OR name ILIKE '%Andre Ayew%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'André Ayew','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Kyereh%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Daniel-Kofi Kyereh','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Elisha Owusu%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Elisha Owusu','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Emmanuel Gyasi%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Emmanuel Gyasi','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Afena-Gyan%' OR name ILIKE '%Afena Gyan%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Felix Afena-Gyan','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Bukari%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Osman Bukari','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Ransford Yeboah%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ransford Yeboah Königsdörffer','DEL',true); END IF;
END $$;

-- ══════════════════════════════════════════════
-- IRÁN (IRN) — 12 activos → 26
-- ══════════════════════════════════════════════
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='IRN' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Niazmand%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Payam Niazmand','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Hossein Hosseini%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Hossein Hosseini','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Majid Hosseini%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Majid Hosseini','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Mohammad Mohammadi%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Mohammad Mohammadi','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Sarlak%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Milad Sarlak','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Khalilzadeh%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Shoja Khalilzadeh','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Mohebi%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Mohammad Mohebi','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Vahid Amiri%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Vahid Amiri','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Saeid Sadeghi%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Saeid Sadeghi','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Omid Alishah%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Omid Alishah','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Ansarifard%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Karim Ansarifard','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Ghayedi%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Mehdi Ghayedi','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Sayyadmanesh%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Allahyar Sayyadmanesh','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Ghodous%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Mohammad Ghodous','DEL',true); END IF;
END $$;

-- ══════════════════════════════════════════════
-- IRAK (IRQ) — 11 activos → 26
-- ══════════════════════════════════════════════
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='IRQ' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Dhurgham%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Dhurgham Ismael','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Rashid Shaker%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Rashid Shaker','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Alsamal%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Hussein Alsamal','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Amjad Hashem%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Amjad Hashem','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Ahmed Ibrahim%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ahmed Ibrahim','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Alaa Abbas%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Alaa Abbas','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Noor Sabri%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Noor Sabri','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Safaa Hadi%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Safaa Hadi','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Dujana Younis%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Dujana Younis','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Yaser Kasim%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Yaser Kasim','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Alaa Saleh%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Alaa Saleh','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Shahin Suleiman%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Shahin Suleiman','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Hammadi Ahmed%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Hammadi Ahmed','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Emad Mohammed%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Emad Mohammed','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Husam Jassim%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Husam Jassim','DEL',true); END IF;
END $$;

-- ══════════════════════════════════════════════
-- JAPÓN (JPN) — 25 activos → 26
-- ══════════════════════════════════════════════
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='JPN' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Hatate%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Reo Hatate','MID',true); END IF;
END $$;

-- ══════════════════════════════════════════════
-- JORDANIA (JOR) — 11 activos → 26
-- ══════════════════════════════════════════════
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='JOR' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Ali Barakah%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ali Barakah','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Abu Harthieh%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Shadi Abu Harthieh','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Baher Madani%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Baher Madani','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Ehsan Haddad%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ehsan Haddad','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Ibrahim Jarun%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ibrahim Jarun','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Al-Harasis%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jafar Al-Harasis','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Qusai Abu Yusuf%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Qusai Abu Yusuf','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Amir Yaseen%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Amir Yaseen','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Al-Mardi%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Mahmoud Al-Mardi','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Al-Naimat%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Yazan Al-Naimat','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Ahmad Salam%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ahmad Salam','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Al-Rashdan%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Osama Al-Rashdan','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Ahmad Al-Sarour%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ahmad Al-Sarour','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Mohamad Rashid%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Mohamad Rashid','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Baha Faisal%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Baha Faisal','DEL',true); END IF;
END $$;

-- ══════════════════════════════════════════════
-- ARABIA SAUDITA (KSA) — 11 activos → 26
-- ══════════════════════════════════════════════
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='KSA' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Al-Rubaie%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Mohammed Al-Rubaie','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Al-Mosailem%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Yasser Al-Mosailem','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Saud Abdulhamid%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Saud Abdulhamid','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Al-Tambakti%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Hassan Al-Tambakti','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Ali Al-Hassan%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ali Al-Hassan','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Abdulelah Al-Malki%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Abdulelah Al-Malki','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Sharahili%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Riyadh Sharahili','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Mohammed Kanno%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Mohammed Kanno','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Omar Al-Ghanim%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Omar Al-Ghanim','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Nasser Al-Dawsari%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Nasser Al-Dawsari','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Haitham Asiri%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Haitham Asiri','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Feras Brikan%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Feras Brikan','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Meshal Al-Shehri%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Meshal Al-Shehri','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Abdullah Al-Hamdan%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Abdullah Al-Hamdan','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Ghareeb%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Abdulrahman Ghareeb','DEL',true); END IF;
END $$;

-- ══════════════════════════════════════════════
-- MARRUECOS (MAR) — 15 activos → 26
-- ══════════════════════════════════════════════
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='MAR' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Tagnaouti%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ahmed Reda Tagnaouti','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Zniti%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Anas Zniti','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Attiat%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Yahia Attiat-Allah','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Achraf Dari%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Achraf Dari','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Adam Masina%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Adam Masina','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Ilias Chair%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ilias Chair','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Amine Harit%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Amine Harit','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Aboukhlal%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Zakaria Aboukhlal','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Akhomach%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ilias Akhomach','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Ayoub El Kaabi%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ayoub El Kaabi','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Cheddira%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Walid Cheddira','DEL',true); END IF;
END $$;

-- ══════════════════════════════════════════════
-- MÉXICO (MEX) — 18 activos → 26
-- ══════════════════════════════════════════════
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='MEX' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Rodolfo Cota%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Rodolfo Cota','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Talavera%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Alfredo Talavera','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Jesús Angulo%' OR name ILIKE '%Jesus Angulo%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jesús Angulo','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Kevin Álvarez%' OR name ILIKE '%Kevin Alvarez%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Kevin Álvarez','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Julián Araujo%' OR name ILIKE '%Julian Araujo%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Julián Araujo','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Israel Reyes%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Israel Reyes','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Erick Sánchez%' OR name ILIKE '%Erick Sanchez%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Erick Sánchez','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Fernando Beltrán%' OR name ILIKE '%Fernando Beltran%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Fernando Beltrán','MID',true); END IF;
END $$;

-- ══════════════════════════════════════════════
-- PAÍSES BAJOS (NED) — 19 activos → 26
-- ══════════════════════════════════════════════
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='NED' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Pasveer%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Remko Pasveer','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Stefan de Vrij%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Stefan de Vrij','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Devyne Rensch%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Devyne Rensch','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Struijk%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Pascal Struijk','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Frimpong%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jeremie Frimpong','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Quinten Timber%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Quinten Timber','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Brobbey%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Brian Brobbey','DEL',true); END IF;
END $$;

-- ══════════════════════════════════════════════
-- PARAGUAY (PAR) — 13 activos → 26
-- ══════════════════════════════════════════════
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='PAR' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Olveira%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Gastón Olveira','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Roberto Fernández%' AND position='GK') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Roberto Fernández','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Iván Piris%' OR name ILIKE '%Ivan Piris%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Iván Piris','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Junior Alonso%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Junior Alonso','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Arzamendia%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Santiago Arzamendia','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Blas Riveros%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Blas Riveros','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Robert Morales%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Robert Morales','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Óscar Romero%' OR name ILIKE '%Oscar Romero%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Óscar Romero','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Kaku%' OR name ILIKE '%Alejandro Romero%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Alejandro Romero (Kaku)','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Jorge Morel%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jorge Morel','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Nelson Villalba%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Nelson Villalba','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Espínola%' OR name ILIKE '%Espinola%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Alberto Espínola','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Gabriel Ávalos%' OR name ILIKE '%Gabriel Avalos%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Gabriel Ávalos','DEL',true); END IF;
END $$;

-- ══════════════════════════════════════════════
-- PORTUGAL (POR) — 18 activos → 26
-- ══════════════════════════════════════════════
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='POR' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Rui Patrício%' OR name ILIKE '%Rui Patricio%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Rui Patrício','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%António Silva%' OR name ILIKE '%Antonio Silva%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'António Silva','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Toti Gomes%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Toti Gomes','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Diogo Leite%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Diogo Leite','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Palhinha%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'João Palhinha','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Danilo Pereira%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Danilo Pereira','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Francisco Conceição%' OR name ILIKE '%Francisco Conceicao%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Francisco Conceição','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Trincão%' OR name ILIKE '%Trincao%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Francisco Trincão','DEL',true); END IF;
END $$;

-- ══════════════════════════════════════════════
-- QATAR (QAT) — 11 activos → 26
-- ══════════════════════════════════════════════
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='QAT' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Yousuf Hassan%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Yousuf Hassan','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Bassel Ghanam%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Bassel Ghanam','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Tarek Salman%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Tarek Salman','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Khoukhi%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Boualem Khoukhi','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Musab Kheder%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Musab Kheder','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Mohammed Waad%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Mohammed Waad','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Al-Shiberai%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Mohammed Al-Shiberai','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Assim Madibo%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Assim Madibo','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Salem Al-Hajri%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Salem Al-Hajri','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Abdurisag%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Yousuf Abdurisag','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Sultan Al-Brake%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Sultan Al-Brake','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Naif Al-Hadhrami%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Naif Al-Hadhrami','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Ahmed Alaaeldin%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ahmed Alaaeldin','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Alhassan Yusuf%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Alhassan Yusuf','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Khalid Al-Yahri%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Khalid Al-Yahri','DEL',true); END IF;
END $$;

-- ══════════════════════════════════════════════
-- SUD ÁFRICA (RSA) — 12 activos → 26
-- ══════════════════════════════════════════════
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='RSA' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Veli Mothwa%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Veli Mothwa','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Darren Keet%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Darren Keet','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Siyanda Xulu%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Siyanda Xulu','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Reeve Frosler%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Reeve Frosler','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Sifiso Hlanti%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Sifiso Hlanti','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%De Reuck%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Rushine De Reuck','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Grant Kekana%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Grant Kekana','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Samkelo Mgwazela%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Samkelo Mgwazela','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Themba Zwane%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Themba Zwane','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Teboho Mokoena%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Teboho Mokoena','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Bongani Zungu%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Bongani Zungu','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Yusuf Maart%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Yusuf Maart','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Percy Tau%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Percy Tau','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Lyle Foster%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Lyle Foster','DEL',true); END IF;
END $$;

-- ══════════════════════════════════════════════
-- SUIZA (SUI) — 12 activos → 26
-- ══════════════════════════════════════════════
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='SUI' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Gregor Kobel%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Gregor Kobel','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Mvogo%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Yvon Mvogo','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Ricardo Rodríguez%' OR name ILIKE '%Ricardo Rodriguez%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ricardo Rodríguez','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Fabian Schär%' OR name ILIKE '%Fabian Schar%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Fabian Schär','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Stergiou%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Leonidas Stergiou','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Cömert%' OR name ILIKE '%Comert%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Eray Cömert','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Kevin Mbabu%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Kevin Mbabu','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Aebischer%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Michel Aebischer','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Ardon Jashari%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ardon Jashari','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Edimilson Fernandes%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Edimilson Fernandes','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Ruben Vargas%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Ruben Vargas','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Noah Okafor%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Noah Okafor','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Kwadwo Duah%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Kwadwo Duah','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Vincent Sierro%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Vincent Sierro','MID',true); END IF;
END $$;

-- ══════════════════════════════════════════════
-- TURQUÍA (TUR) — 15 activos → 26
-- ══════════════════════════════════════════════
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='TUR' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Altay Bayındır%' OR name ILIKE '%Altay Bayindir%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Altay Bayındır','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Mert Günok%' OR name ILIKE '%Mert Gunok%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Mert Günok','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Samet Akaydın%' OR name ILIKE '%Akaydin%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Samet Akaydın','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Drešević%' OR name ILIKE '%Dresevic%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'İbrahim Drešević','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Rıdvan Yılmaz%' OR name ILIKE '%Ridvan Yilmaz%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Rıdvan Yılmaz','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Yokuşlu%' OR name ILIKE '%Yokuslu%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Okay Yokuşlu','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Emre Mor%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Emre Mor','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Cengiz Ünder%' OR name ILIKE '%Cengiz Under%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Cengiz Ünder','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Irfan Can Kahveci%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Irfan Can Kahveci','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Cenk Tosun%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Cenk Tosun','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Aktürkoğlu%' OR name ILIKE '%Akturkoglu%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Kerem Aktürkoğlu','DEL',true); END IF;
END $$;

-- ══════════════════════════════════════════════
-- URUGUAY (URU) — 13 activos → 26
-- ══════════════════════════════════════════════
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='URU' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Sebastián Sosa%' OR name ILIKE '%Sebastian Sosa%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Sebastián Sosa','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Guruceaga%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Gastón Guruceaga','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Sebastián Coates%' OR name ILIKE '%Sebastian Coates%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Sebastián Coates','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Facundo González%' OR name ILIKE '%Facundo Gonzalez%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Facundo González','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Leandro Cabrera%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Leandro Cabrera','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Santiago Bueno%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Santiago Bueno','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Manuel Ugarte%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Manuel Ugarte','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Matías Vecino%' OR name ILIKE '%Matias Vecino%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Matías Vecino','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Nicolás Acevedo%' OR name ILIKE '%Nicolas Acevedo%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Nicolás Acevedo','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Brian Rodríguez%' OR name ILIKE '%Brian Rodriguez%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Brian Rodríguez','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Maximiliano Araújo%' OR name ILIKE '%Maximiliano Araujo%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Maximiliano Araújo','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Bagnasco%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Mathías Bagnasco','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Kevin Méndez%' OR name ILIKE '%Kevin Mendez%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Kevin Méndez','DEL',true); END IF;
END $$;

-- ══════════════════════════════════════════════
-- ESTADOS UNIDOS (USA) — 14 activos → 26
-- ══════════════════════════════════════════════
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='USA' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Patrick Schulte%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Patrick Schulte','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Sean Johnson%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Sean Johnson','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Joe Scally%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Joe Scally','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Mark McKenzie%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Mark McKenzie','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Aaron Long%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Aaron Long','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Chris Richards%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Chris Richards','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Aaronson%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Brenden Aaronson','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Luca de la Torre%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Luca de la Torre','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Kellyn Acosta%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Kellyn Acosta','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Jesus Ferreira%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jesus Ferreira','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Jordan Morris%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jordan Morris','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Josh Sargent%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Josh Sargent','DEL',true); END IF;
END $$;

-- ══════════════════════════════════════════════
-- UZBEKISTÁN (UZB) — 11 activos → 26
-- ══════════════════════════════════════════════
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='UZB' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Utkir Yusupov%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Utkir Yusupov','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Husan Muxtarov%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Husan Muxtarov','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Murtazayev%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Umid Murtazayev','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Shamsiddin Latipov%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Shamsiddin Latipov','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Iskanderov%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jamshid Iskanderov','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Doniyor Omonov%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Doniyor Omonov','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Khurshid Makhmudov%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Khurshid Makhmudov','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Nodir Tursunov%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Nodir Tursunov','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Tukhtasinov%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Islom Tukhtasinov','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Fayzullaev%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Abbosbek Fayzullaev','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Sardor Rashidov%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Sardor Rashidov','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Yaxshiboyev%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Jasur Yaxshiboyev','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Hamroyev%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Oybek Hamroyev','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Otabek Fayzullayev%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Otabek Fayzullayev','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Alijonov%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Khojiakbar Alijonov','DEL',true); END IF;
END $$;

-- ══════════════════════════════════════════════
-- ARGELIA (ALG) — 12 activos → 26
-- ══════════════════════════════════════════════
DO $$ DECLARE t_id uuid := (SELECT id FROM teams WHERE code='ALG' LIMIT 1); BEGIN
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Oukidja%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Alexandre Oukidja','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Yehia Fofana%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Yehia Fofana','GK',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Benlamri%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Djamel Benlamri','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Zeffane%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Mehdi Zeffane','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Grine%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Lyès Grine','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Bedrane%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Abdelkader Bedrane','DEF',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Hicham Boudaoui%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Hicham Boudaoui','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Chaïbi%' OR name ILIKE '%Chaibi%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Farès Chaïbi','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Bentaleb%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Nabil Bentaleb','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Zerrouki%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Omar Zerrouki','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Bounedjah%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Baghdad Bounedjah','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Amir Sayoud%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Amir Sayoud','DEL',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Zinedine Ferhat%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Zinedine Ferhat','MID',true); END IF;
  IF NOT EXISTS (SELECT 1 FROM players WHERE team_id=t_id AND name ILIKE '%Léris%' OR name ILIKE '%Leris%') THEN INSERT INTO players(team_id,name,position,active) VALUES(t_id,'Mehdi Léris','DEL',true); END IF;
END $$;

-- ══════════════════════════════════════════════
-- VERIFICACIÓN FINAL — conteo por equipo
-- ══════════════════════════════════════════════
SELECT
  t.code,
  t.name_es,
  COUNT(p.id) AS jugadores_activos
FROM public.teams t
LEFT JOIN public.players p ON p.team_id = t.id AND p.active = true
GROUP BY t.id, t.code, t.name_es
ORDER BY jugadores_activos ASC, t.code;
