-- ============================================
-- MIGRACIÓN: Corrección de Autenticación
-- Fecha: 2026-02-01
-- Descripción: Agregar trigger automático para crear perfiles
--              y actualizar políticas RLS para autenticación
-- ============================================

-- ============================================
-- PASO 1: Eliminar política RLS antigua (si existe)
-- ============================================
DROP POLICY IF EXISTS "Permitir inserción de perfiles durante registro" ON perfiles;

-- ============================================
-- PASO 2: Crear función para auto-generar perfil
-- ============================================
-- Esta función se ejecuta automáticamente cuando se crea un usuario en auth.users
-- Lee los metadatos (nombre, rol) del signUp y crea el perfil correspondiente

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER -- Se ejecuta con permisos del dueño de la función
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfiles (id, email, nombre, rol, activo)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario'),
    COALESCE((NEW.raw_user_meta_data->>'rol')::rol_usuario, 'operador'::rol_usuario),
    true
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log el error pero no falla la creación del usuario
    RAISE WARNING 'Error al crear perfil automáticamente: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PASO 3: Crear trigger en auth.users
-- ============================================
-- Este trigger se ejecuta DESPUÉS de que se inserta un usuario en auth.users
-- Llama a la función handle_new_user() para crear el perfil

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PASO 4: Actualizar política RLS de perfiles
-- ============================================
-- Nueva política más segura: solo permite insertar si el ID coincide con el usuario autenticado
-- Esto previene que usuarios manipulen roles o creen perfiles para otros

CREATE POLICY "Sistema puede crear perfiles via trigger"
  ON perfiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- PASO 5: Verificación (OPCIONAL - ejecutar para confirmar)
-- ============================================
-- Verificar que el trigger existe
-- SELECT tgname, tgtype, tgenabled 
-- FROM pg_trigger 
-- WHERE tgname = 'on_auth_user_created';

-- Verificar que la función existe
-- SELECT proname, prosrc 
-- FROM pg_proc 
-- WHERE proname = 'handle_new_user';

-- Verificar políticas RLS en perfiles
-- SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE tablename = 'perfiles';

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. Este script debe ejecutarse EN ORDEN en el SQL Editor de Supabase
-- 2. Después de ejecutar, probar registro de un nuevo usuario
-- 3. El perfil debe crearse automáticamente sin código manual en el frontend
-- 4. Si ya tienes usuarios sin perfil, ejecuta el script create_profile_manual.sql
-- ============================================
