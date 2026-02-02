-- ===========================================================
-- DIAGNÓSTICO Y CORRECCIÓN: Políticas RLS bloqueando lectura
-- ===========================================================
-- Este script diagnostica y corrige el problema de políticas RLS
-- que están bloqueando la lectura de perfiles recién creados

-- ============================================
-- PASO 1: Verificar políticas actuales
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'perfiles'
ORDER BY cmd, policyname;

-- Si ves políticas muy restrictivas, continúa con los siguientes pasos

-- ============================================
-- PASO 2: Eliminar política restrictiva (si existe)
-- ============================================
-- Esta política puede estar bloqueando la lectura
DROP POLICY IF EXISTS "Sistema puede crear perfiles via trigger" ON perfiles;

-- ============================================
-- PASO 3: Crear política permisiva para INSERT
-- ============================================
-- Permite insertar solo si el ID coincide con el usuario autenticado
CREATE POLICY "Usuarios pueden crear su propio perfil"
  ON perfiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- PASO 4: Verificar que existe política de SELECT
-- ============================================
-- Esta política DEBE existir para que los usuarios puedan leer su perfil
-- Si no existe, créala:

DROP POLICY IF EXISTS "Usuarios pueden ver su perfil" ON perfiles;

CREATE POLICY "Usuarios pueden ver su perfil"
  ON perfiles
  FOR SELECT
  USING (auth.uid() = id);

-- ============================================
-- PASO 5: Verificar que RLS está habilitado
-- ============================================
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'perfiles';

-- rowsecurity debe ser true

-- ============================================
-- PASO 6 (TEMPORAL): Deshabilitar RLS para probar
-- ============================================
-- SOLO PARA DESARROLLO/DEBUGGING
-- NO USAR EN PRODUCCIÓN
-- Descomenta la siguiente línea SOLO para probar:

-- ALTER TABLE perfiles DISABLE ROW LEVEL SECURITY;

-- Si esto funciona, el problema ES las políticas RLS
-- Vuelve a habilitar RLS:
-- ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 7: Verificar trigger y función
-- ============================================
-- Asegurarse que el trigger tiene permisos correctos
SELECT 
  p.proname as function_name,
  p.prosecdef as security_definer,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
WHERE p.proname = 'handle_new_user';

-- SECURITY_DEFINER debe ser true para que el trigger pueda insertar

-- ============================================
-- SOLUCIÓN RECOMENDADA
-- ============================================
-- Si el problema persiste, usa esta configuración:

-- 1. Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Sistema puede crear perfiles via trigger" ON perfiles;
DROP POLICY IF EXISTS "Permitir inserción de perfiles durante registro" ON perfiles;
DROP POLICY IF EXISTS "Usuarios pueden crear su propio perfil" ON perfiles;
DROP POLICY IF EXISTS "Usuarios pueden ver su perfil" ON perfiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su perfil" ON perfiles;

-- 2. Crear políticas simples y funcionales
CREATE POLICY "allow_select_own_profile"
  ON perfiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "allow_insert_own_profile"
  ON perfiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "allow_update_own_profile"
  ON perfiles
  FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================
-- Ejecuta esto para ver el estado final:
SELECT 'Políticas RLS' as tipo, policyname as nombre, cmd as operacion
FROM pg_policies 
WHERE tablename = 'perfiles'
UNION ALL
SELECT 'Trigger' as tipo, tgname as nombre, 'TRIGGER' as operacion
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created'
UNION ALL
SELECT 'Función' as tipo, proname as nombre, 'FUNCTION' as operacion
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- Deberías ver:
-- - 3 políticas (SELECT, INSERT, UPDATE)
-- - 1 trigger (on_auth_user_created)
-- - 1 función (handle_new_user)
