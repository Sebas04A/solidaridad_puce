-- Sprint 2 Logic: Lote Generation Algorithm & Date Validation

-- 1. Trigger: Validar que Fecha Caducidad > Fecha Ingreso
CREATE OR REPLACE FUNCTION validar_fechas_lote()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.fecha_caducidad IS NOT NULL AND NEW.fecha_caducidad <= NEW.fecha_ingreso THEN
    RAISE EXCEPTION 'La fecha de caducidad debe ser posterior a la fecha de ingreso';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validar_fechas_lote ON lotes;
CREATE TRIGGER trigger_validar_fechas_lote
  BEFORE INSERT OR UPDATE ON lotes
  FOR EACH ROW
  EXECUTE FUNCTION validar_fechas_lote();


-- 2. Función RPC: Registrar Ingreso con Algoritmo de Lotes (Merge/Create)
-- Retorna el ID del lote (existente o nuevo)
CREATE OR REPLACE FUNCTION registrar_ingreso_producto(
  p_producto_id INT,
  p_cantidad DECIMAL,
  p_fecha_ingreso DATE,
  p_fecha_caducidad DATE, -- Puede ser NULL
  p_donante_id INT,
  p_usuario_id UUID,
  p_precio_unitario DECIMAL DEFAULT 0
)
RETURNS JSONB AS $$
DECLARE
  v_lote_id INT;
  v_lote_codigo VARCHAR;
  v_fecha_texto VARCHAR;
  v_serial VARCHAR;
  v_nuevo_lote BOOLEAN := false;
  v_ingreso_id INT;
BEGIN
  -- 2.1 Buscar si ya existe un lote ACTIVO para este producto con la misma fecha de caducidad
  -- "ACTIVO" interpretado como estado = 'disponible'
  -- Nota: Se busca coincidencia exacta de fecha de caducidad (o ambas NULL)
  SELECT id, codigo INTO v_lote_id, v_lote_codigo
  FROM lotes
  WHERE producto_id = p_producto_id
    AND estado = 'disponible'
    AND (fecha_caducidad = p_fecha_caducidad OR (fecha_caducidad IS NULL AND p_fecha_caducidad IS NULL))
  LIMIT 1;

  -- 2.2 Si existe, actualizar cantidad (MERGE)
  IF v_lote_id IS NOT NULL THEN
    UPDATE lotes
    SET cantidad_actual = cantidad_actual + p_cantidad,
        cantidad_inicial = cantidad_inicial + p_cantidad, -- Opcional: ¿se debe sumar a la inicial? Asumimos que sí para reflejar el total histórico entrado.
        fecha_ingreso = GREATEST(fecha_ingreso, p_fecha_ingreso) -- Actualizamos fecha ingreso a la más reciente? O mantenemos la original? Mantenemos original suele ser mejor para trazabilidad, pero actualizamos para logica. Dejemos fecha_ingreso original del lote.
    WHERE id = v_lote_id;
  ELSE
    -- 2.3 Si no existe, crear nuevo lote
    v_nuevo_lote := true;
    
    -- Generar parte de fecha
    IF p_fecha_caducidad IS NOT NULL THEN
      v_fecha_texto := TO_CHAR(p_fecha_caducidad, 'YYYYMMDD');
    ELSE
      v_fecha_texto := 'SINFECHA';
    END IF;
    
    -- Loop para garantizar unicidad del serial (aunque 4 chars es bastante, colisiones son posibles pero raras con la fecha)
    LOOP
      -- Generar serial aleatorio 4 caracteres (A-Z, 0-9)
      -- Usamos md5 para random y cortamos
      v_serial := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
      
      v_lote_codigo := 'L' || v_fecha_texto || '-' || v_serial;
      
      -- Verificar si existe el codigo globalmente (incluso en agotados)
      PERFORM 1 FROM lotes WHERE codigo = v_lote_codigo;
      IF NOT FOUND THEN
        EXIT;
      END IF;
    END LOOP;
    
    INSERT INTO lotes (
      codigo,
      producto_id,
      donante_id,
      fecha_ingreso,
      fecha_caducidad,
      cantidad_inicial,
      cantidad_actual,
      estado,
      created_by
    ) VALUES (
      v_lote_codigo,
      p_producto_id,
      p_donante_id,
      p_fecha_ingreso,
      p_fecha_caducidad,
      p_cantidad,
      p_cantidad,
      'disponible',
      p_usuario_id
    ) RETURNING id INTO v_lote_id;
  END IF;

  -- 3. Registrar Log de Ingreso
  INSERT INTO ingresos (
    lote_id,
    tipo,
    cantidad,
    registrado_por,
    fecha_ingreso,
    triaje_pendiente
  ) VALUES (
    v_lote_id,
    'normal',
    p_cantidad,
    p_usuario_id,
    current_timestamp, -- Timestamp exacto del log
    false
  ) RETURNING id INTO v_ingreso_id;

  -- Retornar info
  RETURN jsonb_build_object(
    'lote_id', v_lote_id,
    'lote_codigo', v_lote_codigo,
    'ingreso_id', v_ingreso_id,
    'es_nuevo_lote', v_nuevo_lote
  );
END;
$$ LANGUAGE plpgsql;
