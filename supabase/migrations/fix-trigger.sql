-- =============================================
-- ARREGLAR TRIGGER Y RLS PARA CREAR USUARIOS
-- Ejecutar TODO en Supabase SQL Editor
-- =============================================

-- 1. Deshabilitar RLS temporalmente para diagnosticar
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Borrar trigger existente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Recrear la funcion con mejor manejo de errores
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, favorite_team)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'favorite_team'
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Si falla, al menos no rompe la creacion del usuario
  RAISE NOTICE 'Error en trigger handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recrear trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Verificar que el trigger existe
SELECT 
  tgname AS trigger_name,
  tgrelid::regclass AS table_name,
  proname AS function_name
FROM pg_trigger t
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE tgname = 'on_auth_user_created';

-- 6. Rehabilitar RLS con politica de INSERT para el trigger
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politica de SELECT (existente)
DROP POLICY IF EXISTS "Perfil visible para todos" ON public.profiles;
CREATE POLICY "Perfil visible para todos" ON public.profiles FOR SELECT USING (true);

-- Politica de UPDATE (existente)
DROP POLICY IF EXISTS "Usuario edita su propio perfil" ON public.profiles;
CREATE POLICY "Usuario edita su propio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Politica de INSERT (NUEVA - permite crear perfil al registrarse)
DROP POLICY IF EXISTS "Crear perfil al registrarse" ON public.profiles;
CREATE POLICY "Crear perfil al registrarse" ON public.profiles FOR INSERT WITH CHECK (true);

-- 7. Verificar politicas
SELECT polname, polcmd, polqual::text 
FROM pg_policy 
WHERE polrelid = 'public.profiles'::regclass;

-- 8. Verificar que no hay usuarios duplicados
SELECT email FROM auth.users WHERE email IN ('admin@prode.com', 'jugador@prode.com');

-- 9. Si hay usuarios duplicados, borrarlos
DELETE FROM auth.users WHERE email IN ('admin@prode.com', 'jugador@prode.com');
