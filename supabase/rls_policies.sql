-- ============================================
-- PERMISOS RLS (Row Level Security) para el prototipo
-- ============================================
-- IMPORTANTE: Ejecutar esto en Supabase SQL Editor

-- 1. Habilitar RLS en todas las tablas
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE despachos ENABLE ROW LEVEL SECURITY;
ALTER TABLE egresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE descartes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mermas ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. PERMISOS PARA REGISTRO DE USUARIOS
-- ============================================

-- Permitir que cualquiera pueda insertar un perfil (para registro)
-- NOTA: En producción, esto se haría con una función de servidor
CREATE POLICY "Permitir inserción de perfiles durante registro"
  ON perfiles
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 3. PERMISOS PARA USUARIOS AUTENTICADOS
-- ============================================

-- Perfiles: Los usuarios pueden ver su propio perfil
CREATE POLICY "Usuarios pueden ver su perfil"
  ON perfiles
  FOR SELECT
  USING (auth.uid() = id);

-- Perfiles: Los usuarios pueden actualizar su perfil
CREATE POLICY "Usuarios pueden actualizar su perfil"
  ON perfiles
  FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- 4. PERMISOS PARA TODAS LAS DEMÁS TABLAS
-- (Para prototipo: acceso completo para usuarios autenticados)
-- ============================================

-- Donantes
CREATE POLICY "Usuarios autenticados pueden ver donantes"
  ON donantes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear donantes"
  ON donantes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar donantes"
  ON donantes FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar donantes"
  ON donantes FOR DELETE
  USING (auth.role() = 'authenticated');

-- Productos
CREATE POLICY "Usuarios autenticados pueden ver productos"
  ON productos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear productos"
  ON productos FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar productos"
  ON productos FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Lotes
CREATE POLICY "Usuarios autenticados pueden ver lotes"
  ON lotes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear lotes"
  ON lotes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar lotes"
  ON lotes FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Ingresos
CREATE POLICY "Usuarios autenticados pueden ver ingresos"
  ON ingresos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear ingresos"
  ON ingresos FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Beneficiarios
CREATE POLICY "Usuarios autenticados pueden ver beneficiarios"
  ON beneficiarios FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear beneficiarios"
  ON beneficiarios FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar beneficiarios"
  ON beneficiarios FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Despachos
CREATE POLICY "Usuarios autenticados pueden ver despachos"
  ON despachos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear despachos"
  ON despachos FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar despachos"
  ON despachos FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Egresos
CREATE POLICY "Usuarios autenticados pueden ver egresos"
  ON egresos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear egresos"
  ON egresos FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar egresos"
  ON egresos FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Descartes
CREATE POLICY "Usuarios autenticados pueden ver descartes"
  ON descartes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear descartes"
  ON descartes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Mermas
CREATE POLICY "Usuarios autenticados pueden ver mermas"
  ON mermas FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear mermas"
  ON mermas FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- FIN DE PERMISOS RLS
-- ============================================
