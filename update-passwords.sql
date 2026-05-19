-- =============================================
-- ACTUALIZAR CONTRASEÑAS DE USUARIOS EXISTENTES
-- (Los usuarios ya fueron creados antes)
-- =============================================

-- Actualizar contraseña del admin
update auth.users
set encrypted_password = '$2b$10$2jtYR6mm5AU3B4w.4Xy9yOt3pTK88A2zWDHaN0bpqbEBJ.sQUcqRe'
where email = 'admin@prode.com';

-- Asegurar que el admin tenga rol admin
update public.profiles
set role = 'admin'
where username = 'admin';

-- Actualizar contraseña del jugador
update auth.users
set encrypted_password = '$2b$10$RVV4p9dP3zPQooyO5uDN3.ZDk3QBOTfBMPIoOqdRShoi4MrlS7fr.'
where email = 'jugador@prode.com';

-- =============================================
-- VERIFICAR
-- =============================================
select 
  u.email,
  p.username,
  p.role,
  p.total_points,
  p.favorite_team
from auth.users u
join public.profiles p on p.id = u.id
where u.email in ('admin@prode.com', 'jugador@prode.com');
