-- ============================================
-- SCHEMA: Sistema de Gestión de Ayuda Humanitaria
-- Proyecto: Solidaridad PUCE
-- ============================================

-- ============================================
-- ENUMS
-- ============================================

-- Roles del sistema
CREATE TYPE rol_usuario AS ENUM (
  'admin',        -- Administrador/Profesor: control total
  'operador',     -- Estudiante de vinculación: operaciones diarias
  'voluntario',   -- Staff de emergencia: acceso temporal (48h)
  'auditor'       -- Solo lectura para reportes
);

-- Tipo de donante
CREATE TYPE tipo_donante AS ENUM ('persona', 'empresa', 'anonimo');

-- Clasificación climática para productos
CREATE TYPE clima_producto AS ENUM ('costa', 'sierra', 'ambos');

-- Categorías de productos
CREATE TYPE categoria_producto AS ENUM (
  'alimentos',
  'ropa',
  'higiene',
  'medicamentos',
  'juguetes',
  'enseres',
  'otros'
);

-- Estado de un lote
CREATE TYPE estado_lote AS ENUM (
  'disponible',      -- Listo para despachar
  'triaje_pendiente', -- Ingresado en crisis, requiere clasificación
  'agotado',         -- Sin stock
  'descartado'       -- Rechazado en punto giro
);

-- Tipo de ingreso
CREATE TYPE tipo_ingreso AS ENUM ('normal', 'crisis');

-- Estado de despacho
CREATE TYPE estado_despacho AS ENUM (
  'preparando',
  'validado',
  'despachado',
  'rectificado'
);

-- Motivos de egreso (causas humanitarias)
CREATE TYPE motivo_egreso AS ENUM (
  'terremoto',
  'inundacion',
  'incendio',
  'deslizamiento',
  'sequia',
  'pandemia',
  'pobreza_extrema',
  'otro'
);

-- ============================================
-- TABLAS PRINCIPALES
-- ============================================

-- Perfiles de usuario (extiende auth.users de Supabase)
CREATE TABLE perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  rol rol_usuario NOT NULL DEFAULT 'voluntario',
  activo BOOLEAN DEFAULT true,
  activo_hasta TIMESTAMPTZ, -- Para voluntarios temporales (48h)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Donantes (reemplaza a proveedores)
CREATE TABLE donantes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  tipo tipo_donante NOT NULL DEFAULT 'persona',
  es_anonimo BOOLEAN DEFAULT false, -- Para reportes públicos
  telefono VARCHAR(20),
  email VARCHAR(255),
  direccion TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES perfiles(id)
);

-- Catálogo de productos
CREATE TABLE productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  categoria categoria_producto NOT NULL,
  clima clima_producto NOT NULL DEFAULT 'ambos',
  unidad_medida VARCHAR(50) NOT NULL DEFAULT 'unidad', -- unidad, kg, litro, caja
  precio_referencial DECIMAL(10,2) DEFAULT 0, -- Para reportes de ahorro
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lotes de productos (con FEFO)
CREATE TABLE lotes (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL, -- Autogenerado: L + FECHA + SERIAL
  producto_id INT NOT NULL REFERENCES productos(id),
  donante_id INT REFERENCES donantes(id),
  fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_caducidad DATE, -- NULL si no aplica
  cantidad_inicial DECIMAL(10,2) NOT NULL,
  cantidad_actual DECIMAL(10,2) NOT NULL,
  estado estado_lote DEFAULT 'disponible',
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES perfiles(id)
);

-- Ingresos de inventario
CREATE TABLE ingresos (
  id SERIAL PRIMARY KEY,
  lote_id INT NOT NULL REFERENCES lotes(id),
  tipo tipo_ingreso NOT NULL DEFAULT 'normal',
  cantidad DECIMAL(10,2) NOT NULL,
  descripcion_bulto TEXT, -- Para ingresos tipo crisis
  peso_estimado DECIMAL(10,2), -- kg, para bultos
  triaje_pendiente BOOLEAN DEFAULT false,
  fecha_ingreso TIMESTAMPTZ DEFAULT NOW(),
  registrado_por UUID NOT NULL REFERENCES perfiles(id)
);

-- Beneficiarios (comunidades/sectores)
CREATE TABLE beneficiarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL, -- Nombre de la comunidad/sector
  sector VARCHAR(150),
  provincia VARCHAR(100),
  canton VARCHAR(100),
  parroquia VARCHAR(100),
  contacto_nombre VARCHAR(150),
  contacto_telefono VARCHAR(20),
  poblacion_estimada INT,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Despachos (agrupador de egresos)
CREATE TABLE despachos (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL, -- Autogenerado: D + FECHA + SERIAL
  beneficiario_id INT NOT NULL REFERENCES beneficiarios(id),
  motivo motivo_egreso NOT NULL,
  motivo_detalle TEXT, -- Descripción adicional
  fecha_despacho TIMESTAMPTZ DEFAULT NOW(),
  estado estado_despacho DEFAULT 'preparando',
  fue_rectificado BOOLEAN DEFAULT false,
  rectificacion_notas TEXT,
  preparado_por UUID NOT NULL REFERENCES perfiles(id),
  validado_por UUID REFERENCES perfiles(id), -- Solo admin puede validar
  fecha_validacion TIMESTAMPTZ,
  tipo_transporte VARCHAR(50) CHECK (tipo_transporte IN ('institucional', 'externo')),
  costo_transporte DECIMAL(10,2) DEFAULT 0,
  evidencia_url TEXT
);


-- Egresos (líneas de despacho)
CREATE TABLE egresos (
  id SERIAL PRIMARY KEY,
  despacho_id INT NOT NULL REFERENCES despachos(id) ON DELETE CASCADE,
  lote_id INT NOT NULL REFERENCES lotes(id),
  cantidad_solicitada DECIMAL(10,2) NOT NULL,
  cantidad_despachada DECIMAL(10,2), -- Puede diferir si hay rectificación
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log de descartes (punto giro - rechazos)
CREATE TABLE descartes (
  id SERIAL PRIMARY KEY,
  producto_id INT REFERENCES productos(id),
  descripcion TEXT NOT NULL, -- Descripción del artículo rechazado
  cantidad DECIMAL(10,2) NOT NULL DEFAULT 1,
  motivo_descarte VARCHAR(200) NOT NULL, -- "roto", "vencido", "contaminado"
  fecha_descarte TIMESTAMPTZ DEFAULT NOW(),
  registrado_por UUID NOT NULL REFERENCES perfiles(id)
);

-- Log de mermas (diferencias en despacho)
CREATE TABLE mermas (
  id SERIAL PRIMARY KEY,
  despacho_id INT NOT NULL REFERENCES despachos(id),
  lote_id INT NOT NULL REFERENCES lotes(id),
  cantidad_faltante DECIMAL(10,2) NOT NULL,
  motivo TEXT,
  fecha_registro TIMESTAMPTZ DEFAULT NOW(),
  registrado_por UUID NOT NULL REFERENCES perfiles(id)
);

-- Kits (Plantillas de salida)
CREATE TABLE kits (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES perfiles(id) ON DELETE SET NULL
);

-- Items dentro de un Kit
CREATE TABLE items_kit (
  id SERIAL PRIMARY KEY,
  kit_id INT NOT NULL REFERENCES kits(id) ON DELETE CASCADE,
  producto_id INT NOT NULL REFERENCES productos(id),
  cantidad DECIMAL(10,2) NOT NULL DEFAULT 1
);


-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX idx_lotes_producto ON lotes(producto_id);
CREATE INDEX idx_lotes_estado ON lotes(estado);
CREATE INDEX idx_lotes_caducidad ON lotes(fecha_caducidad);
CREATE INDEX idx_ingresos_fecha ON ingresos(fecha_ingreso);
CREATE INDEX idx_despachos_fecha ON despachos(fecha_despacho);
CREATE INDEX idx_despachos_beneficiario ON despachos(beneficiario_id);
CREATE INDEX idx_egresos_despacho ON egresos(despacho_id);
CREATE INDEX idx_items_kit_kit_id ON items_kit(kit_id);


-- ============================================
-- FUNCIONES AUXILIARES
-- ============================================

-- Función para generar código de lote automático
CREATE OR REPLACE FUNCTION generar_codigo_lote()
RETURNS TRIGGER AS $$
BEGIN
  NEW.codigo := 'L' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEW.id::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_codigo_lote
  BEFORE INSERT ON lotes
  FOR EACH ROW
  WHEN (NEW.codigo IS NULL)
  EXECUTE FUNCTION generar_codigo_lote();

-- Función para generar código de despacho automático
CREATE OR REPLACE FUNCTION generar_codigo_despacho()
RETURNS TRIGGER AS $$
BEGIN
  NEW.codigo := 'D' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEW.id::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_codigo_despacho
  BEFORE INSERT ON despachos
  FOR EACH ROW
  WHEN (NEW.codigo IS NULL)
  EXECUTE FUNCTION generar_codigo_despacho();

-- Función para actualizar stock al registrar egreso
CREATE OR REPLACE FUNCTION actualizar_stock_egreso()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE lotes 
  SET cantidad_actual = cantidad_actual - NEW.cantidad_despachada,
      estado = CASE 
        WHEN cantidad_actual - NEW.cantidad_despachada <= 0 THEN 'agotado'::estado_lote
        ELSE estado
      END
  WHERE id = NEW.lote_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_stock_egreso
  AFTER INSERT OR UPDATE ON egresos
  FOR EACH ROW
  WHEN (NEW.cantidad_despachada IS NOT NULL)
  EXECUTE FUNCTION actualizar_stock_egreso();

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista: Stock actual por producto (FEFO ordenado)
CREATE VIEW v_stock_actual AS
SELECT 
  p.id AS producto_id,
  p.nombre AS producto,
  p.categoria,
  p.clima,
  p.unidad_medida,
  SUM(l.cantidad_actual) AS stock_total,
  MIN(l.fecha_caducidad) AS proxima_caducidad,
  COUNT(l.id) AS num_lotes
FROM productos p
LEFT JOIN lotes l ON p.id = l.producto_id AND l.estado = 'disponible'
GROUP BY p.id, p.nombre, p.categoria, p.clima, p.unidad_medida;

-- Vista: Lotes próximos a vencer (FEFO)
CREATE VIEW v_lotes_fefo AS
SELECT 
  l.id,
  l.codigo,
  p.nombre AS producto,
  l.cantidad_actual,
  l.fecha_caducidad,
  l.fecha_caducidad - CURRENT_DATE AS dias_para_vencer
FROM lotes l
JOIN productos p ON l.producto_id = p.id
WHERE l.estado = 'disponible' 
  AND l.fecha_caducidad IS NOT NULL
ORDER BY l.fecha_caducidad ASC;

-- Vista: Resumen de impacto (para reportes)
CREATE VIEW v_impacto_resumen AS
SELECT 
  d.id AS despacho_id,
  d.codigo,
  d.motivo,
  b.nombre AS beneficiario,
  b.provincia,
  d.fecha_despacho,
  COUNT(e.id) AS lineas_productos,
  SUM(e.cantidad_despachada) AS total_unidades,
  SUM(e.cantidad_despachada * p.precio_referencial) AS valor_estimado
FROM despachos d
JOIN beneficiarios b ON d.beneficiario_id = b.id
JOIN egresos e ON d.id = e.despacho_id
JOIN lotes l ON e.lote_id = l.id
JOIN productos p ON l.producto_id = p.id
WHERE d.estado IN ('validado', 'despachado')
GROUP BY d.id, d.codigo, d.motivo, b.nombre, b.provincia, d.fecha_despacho;

-- Vista: Triaje pendiente (bultos sin clasificar)
CREATE VIEW v_triaje_pendiente AS
SELECT 
  i.id AS ingreso_id,
  l.codigo AS lote_codigo,
  i.descripcion_bulto,
  i.peso_estimado,
  i.fecha_ingreso,
  per.nombre AS registrado_por
FROM ingresos i
JOIN lotes l ON i.lote_id = l.id
JOIN perfiles per ON i.registrado_por = per.id
WHERE i.triaje_pendiente = true
ORDER BY i.fecha_ingreso ASC;

-- ============================================
-- DATOS INICIALES (SEEDS)
-- ============================================

-- Productos de ejemplo
INSERT INTO productos (nombre, categoria, clima, unidad_medida, precio_referencial) VALUES
('Arroz 1kg', 'alimentos', 'ambos', 'unidad', 1.50),
('Fideo 500g', 'alimentos', 'ambos', 'unidad', 0.80),
('Aceite 1L', 'alimentos', 'ambos', 'unidad', 2.50),
('Atún en lata', 'alimentos', 'ambos', 'unidad', 1.80),
('Agua embotellada 1L', 'alimentos', 'ambos', 'unidad', 0.50),
('Chompa térmica', 'ropa', 'sierra', 'unidad', 15.00),
('Camiseta algodón', 'ropa', 'costa', 'unidad', 5.00),
('Pantalón jean', 'ropa', 'ambos', 'unidad', 12.00),
('Cobija polar', 'enseres', 'sierra', 'unidad', 10.00),
('Jabón de baño', 'higiene', 'ambos', 'unidad', 0.75),
('Pasta dental', 'higiene', 'ambos', 'unidad', 1.50),
('Papel higiénico 4pack', 'higiene', 'ambos', 'unidad', 2.00),
('Pañales talla M', 'higiene', 'ambos', 'unidad', 8.00),
('Paracetamol 500mg', 'medicamentos', 'ambos', 'caja', 3.00),
('Alcohol antiséptico', 'medicamentos', 'ambos', 'unidad', 2.50),
('Peluche pequeño', 'juguetes', 'ambos', 'unidad', 5.00),
('Colchoneta', 'enseres', 'ambos', 'unidad', 20.00),
('Kit de cocina básico', 'enseres', 'ambos', 'unidad', 25.00);

-- Beneficiarios de ejemplo
INSERT INTO beneficiarios (nombre, sector, provincia, canton, poblacion_estimada) VALUES
('Comunidad San Pedro', 'Zona Rural Norte', 'Pichincha', 'Quito', 150),
('Barrio La Esperanza', 'Zona Urbana Sur', 'Guayas', 'Guayaquil', 300),
('Parroquia El Carmen', 'Zona Costera', 'Manabí', 'Pedernales', 200);

-- ============================================
-- FIN DEL SCHEMA
-- ============================================
