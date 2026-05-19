-- =============================================
-- CREAR USUARIOS DE PRUEBA CON HASHES CORRECTOS
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- Extensión para UUIDs
-- (Si ya existen, no pasa nada)
create extension if not exists "uuid-ossp";

-- =============================================
-- USUARIO ADMINISTRADOR
-- Email: admin@prode.com
-- Contraseña: admin123
-- =============================================
do $$
declare
  v_admin_id uuid := uuid_generate_v4();
begin
  insert into auth.users (
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
  ) values (
    v_admin_id,
    'authenticated',
    'authenticated',
    'admin@prode.com',
    '$2b$10$2jtYR6mm5AU3B4w.4Xy9yOt3pTK88A2zWDHaN0bpqbEBJ.sQUcqRe',
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"admin","favorite_team":"Argentina"}'::jsonb
  );
  
  -- Forzar rol admin
  update public.profiles 
  set role = 'admin' 
  where id = v_admin_id;
  
end $$;

-- =============================================
-- USUARIO JUGADOR NORMAL
-- Email: jugador@prode.com
-- Contraseña: jugador123
-- =============================================
do $$
declare
  v_jugador_id uuid := uuid_generate_v4();
begin
  insert into auth.users (
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
  ) values (
    v_jugador_id,
    'authenticated',
    'authenticated',
    'jugador@prode.com',
    '$2b$10$RVV4p9dP3zPQooyO5uDN3.ZDk3QBOTfBMPIoOqdRShoi4MrlS7fr.',
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"username":"jugador","favorite_team":"Brasil"}'::jsonb
  );
  
end $$;

-- =============================================
-- VERIFICAR QUE SE CREARON
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
