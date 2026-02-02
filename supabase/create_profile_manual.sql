-- ============================================
-- SCRIPT PARA CREAR PERFIL MANUALMENTE
-- ============================================
-- Ejecuta esto en Supabase SQL Editor para crear el perfil
-- del usuario que ya existe en auth.users

-- 1. Primero, verifica qué usuarios tienes
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Copia el ID del usuario que acabas de crear
-- y reemplázalo en la siguiente línea junto con sus datos:

INSERT INTO perfiles (id, nombre, email, rol, activo)
VALUES (
  '1107f9b3-6e50-4eec-8e47-9dad4438c5ef',  -- ⬅️ REEMPLAZA con el ID del paso 1
  'Admin',                                    -- ⬅️ REEMPLAZA con el nombre
  'admin@test.com',                          -- ⬅️ REEMPLAZA con el email
  'admin',                                    -- ⬅️ Puede ser: admin, operador, voluntario, auditor
  true                                        -- Usuario activo
);

-- 3. Verifica que se creó correctamente
SELECT * FROM perfiles;
