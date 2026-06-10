-- =============================================
-- CORREGIR TRIGGER handle_new_user
-- 1. Incluir coins=500 en profiles
-- 2. Inicializar wallets con balance=500
--
-- Ejecutar en: Supabase → SQL Editor
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Crear perfil con coins iniciales
  INSERT INTO public.profiles (id, username, full_name, avatar_url, favorite_team, coins)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'favorite_team', 'Ninguno'),
    500
  );

  -- 2. Crear wallet con saldo inicial de 500 MundialCoins
  INSERT INTO public.wallets (user_id, balance, total_deposited, total_wagered, total_won)
  VALUES (NEW.id, 500, 500, 0, 0)
  ON CONFLICT (user_id) DO UPDATE
    SET balance         = GREATEST(wallets.balance, 500),
        total_deposited = GREATEST(wallets.total_deposited, 500);

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'handle_new_user ERROR para %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Asegurarse de que el trigger existe
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
    RAISE NOTICE 'Trigger on_auth_user_created ya existe. Función actualizada.';
  END IF;
END
$$;
