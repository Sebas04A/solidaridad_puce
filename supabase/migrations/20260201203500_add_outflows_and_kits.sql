-- Add transport fields to despachos
ALTER TABLE despachos ADD COLUMN IF NOT EXISTS tipo_transporte VARCHAR(50) CHECK (tipo_transporte IN ('institucional', 'externo'));
ALTER TABLE despachos ADD COLUMN IF NOT EXISTS costo_transporte DECIMAL(10,2) DEFAULT 0;
ALTER TABLE despachos ADD COLUMN IF NOT EXISTS evidencia_url TEXT;

-- Create Kits tables
CREATE TABLE IF NOT EXISTS kits (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES perfiles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS items_kit (
  id SERIAL PRIMARY KEY,
  kit_id INT NOT NULL REFERENCES kits(id) ON DELETE CASCADE,
  producto_id INT NOT NULL REFERENCES productos(id),
  cantidad DECIMAL(10,2) NOT NULL DEFAULT 1
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_items_kit_kit_id ON items_kit(kit_id);
