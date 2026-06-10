-- =============================================
-- CORREGIR TRIGGER handle_new_user
-- Incluir coins en el INSERT para evitar fallos silenciosos
-- cuando la columna no tiene DEFAULT a nivel de base de datos.
--
-- Ejecutar en: Supabase → SQL Editor
-- =============================================

-- Recrear la función con coins y favorite_team con valores por defecto
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, favorite_team, coins)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'favorite_team', 'Ninguno'),
    500
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Registrar el error sin romper la creación del usuario en auth.users
  RAISE NOTICE 'handle_new_user ERROR para %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Confirmar que el trigger existe (no hace falta recrearlo si no fue borrado)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    RAISE NOTICE 'Trigger on_auth_user_created creado.';
  ELSE
    RAISE NOTICE 'Trigger on_auth_user_created ya existe. Solo se actualizó la función.';
  END IF;
END
$$;

-- Verificar resultado
SELECT
  tgname   AS trigger_name,
  proname  AS function_name,
  prosrc   LIKE '%coins%' AS includes_coins
FROM pg_trigger t
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE tgname = 'on_auth_user_created';
