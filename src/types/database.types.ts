// Database types - Generated from Supabase
// Run `npx supabase gen types typescript` to regenerate

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      perfiles: {
        Row: {
          id: string
          nombre: string
          email: string
          rol: 'admin' | 'operador' | 'voluntario' | 'auditor' | 'estudiante'
          activo: boolean
          activo_hasta: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          nombre: string
          email: string
          rol?: 'admin' | 'operador' | 'voluntario' | 'auditor' | 'estudiante'
          activo?: boolean
          activo_hasta?: string | null
        }
        Update: {
          nombre?: string
          email?: string
          rol?: 'admin' | 'operador' | 'voluntario' | 'auditor' | 'estudiante'
          activo?: boolean
          activo_hasta?: string | null
        }
      }
      donantes: {
        Row: {
          id: number
          nombre: string
          tipo: 'persona' | 'empresa' | 'anonimo'
          es_anonimo: boolean
          telefono: string | null
          email: string | null
          direccion: string | null
          notas: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          nombre: string
          tipo?: 'persona' | 'empresa' | 'anonimo'
          es_anonimo?: boolean
          telefono?: string | null
          email?: string | null
          direccion?: string | null
          notas?: string | null
          created_by?: string | null
        }
        Update: {
          nombre?: string
          tipo?: 'persona' | 'empresa' | 'anonimo'
          es_anonimo?: boolean
          telefono?: string | null
          email?: string | null
          direccion?: string | null
          notas?: string | null
        }
      }
      productos: {
        Row: {
          id: number
          nombre: string
          categoria: 'alimentos' | 'ropa' | 'higiene' | 'medicamentos' | 'juguetes' | 'enseres' | 'otros'
          clima: 'costa' | 'sierra' | 'ambos'
          unidad_medida: string
          precio_referencial: number
          descripcion: string | null
          activo: boolean
          created_at: string
        }
        Insert: {
          nombre: string
          categoria: 'alimentos' | 'ropa' | 'higiene' | 'medicamentos' | 'juguetes' | 'enseres' | 'otros'
          clima?: 'costa' | 'sierra' | 'ambos'
          unidad_medida?: string
          precio_referencial?: number
          descripcion?: string | null
          activo?: boolean
        }
        Update: {
          nombre?: string
          categoria?: 'alimentos' | 'ropa' | 'higiene' | 'medicamentos' | 'juguetes' | 'enseres' | 'otros'
          clima?: 'costa' | 'sierra' | 'ambos'
          unidad_medida?: string
          precio_referencial?: number
          descripcion?: string | null
          activo?: boolean
        }
      }
      lotes: {
        Row: {
          id: number
          codigo: string
          producto_id: number
          donante_id: number | null
          fecha_ingreso: string
          fecha_caducidad: string | null
          cantidad_inicial: number
          cantidad_actual: number
          estado: 'disponible' | 'triaje_pendiente' | 'agotado' | 'descartado'
          notas: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          codigo?: string
          producto_id: number
          donante_id?: number | null
          fecha_ingreso?: string
          fecha_caducidad?: string | null
          cantidad_inicial: number
          cantidad_actual: number
          estado?: 'disponible' | 'triaje_pendiente' | 'agotado' | 'descartado'
          notas?: string | null
          created_by?: string | null
        }
        Update: {
          producto_id?: number
          donante_id?: number | null
          fecha_caducidad?: string | null
          cantidad_inicial?: number
          cantidad_actual?: number
          estado?: 'disponible' | 'triaje_pendiente' | 'agotado' | 'descartado'
          notas?: string | null
        }
      }
      beneficiarios: {
        Row: {
          id: number
          nombre: string
          sector: string | null
          provincia: string | null
          canton: string | null
          parroquia: string | null
          contacto_nombre: string | null
          contacto_telefono: string | null
          poblacion_estimada: number | null
          notas: string | null
          created_at: string
        }
        Insert: {
          nombre: string
          sector?: string | null
          provincia?: string | null
          canton?: string | null
          parroquia?: string | null
          contacto_nombre?: string | null
          contacto_telefono?: string | null
          poblacion_estimada?: number | null
          notas?: string | null
        }
        Update: {
          nombre?: string
          sector?: string | null
          provincia?: string | null
          canton?: string | null
          parroquia?: string | null
          contacto_nombre?: string | null
          contacto_telefono?: string | null
          poblacion_estimada?: number | null
          notas?: string | null
        }
      }
      despachos: {
        Row: {
          id: number
          codigo: string
          beneficiario_id: number
          motivo: 'terremoto' | 'inundacion' | 'incendio' | 'deslizamiento' | 'sequia' | 'pandemia' | 'pobreza_extrema' | 'otro'
          motivo_detalle: string | null
          fecha_despacho: string
          estado: 'preparando' | 'validado' | 'despachado' | 'rectificado'
          fue_rectificado: boolean
          rectificacion_notas: string | null
          preparado_por: string
          validado_por: string | null
          fecha_validacion: string | null
        }
        Insert: {
          codigo?: string
          beneficiario_id: number
          motivo: 'terremoto' | 'inundacion' | 'incendio' | 'deslizamiento' | 'sequia' | 'pandemia' | 'pobreza_extrema' | 'otro'
          motivo_detalle?: string | null
          estado?: 'preparando' | 'validado' | 'despachado' | 'rectificado'
          fue_rectificado?: boolean
          rectificacion_notas?: string | null
          preparado_por: string
          validado_por?: string | null
        }
        Update: {
          beneficiario_id?: number
          motivo?: 'terremoto' | 'inundacion' | 'incendio' | 'deslizamiento' | 'sequia' | 'pandemia' | 'pobreza_extrema' | 'otro'
          motivo_detalle?: string | null
          estado?: 'preparando' | 'validado' | 'despachado' | 'rectificado'
          fue_rectificado?: boolean
          rectificacion_notas?: string | null
          validado_por?: string | null
          fecha_validacion?: string | null
        }
      }
      egresos: {
        Row: {
          id: number
          despacho_id: number
          lote_id: number
          cantidad_solicitada: number
          cantidad_despachada: number | null
          created_at: string
        }
        Insert: {
          despacho_id: number
          lote_id: number
          cantidad_solicitada: number
          cantidad_despachada?: number | null
        }
        Update: {
          cantidad_solicitada?: number
          cantidad_despachada?: number | null
        }
      }
      ingresos: {
        Row: {
          id: number
          lote_id: number
          tipo: 'normal' | 'crisis'
          cantidad: number
          descripcion_bulto: string | null
          peso_estimado: number | null
          triaje_pendiente: boolean
          fecha_ingreso: string
          registrado_por: string
        }
        Insert: {
          lote_id: number
          tipo?: 'normal' | 'crisis'
          cantidad: number
          descripcion_bulto?: string | null
          peso_estimado?: number | null
          triaje_pendiente?: boolean
          registrado_por: string
        }
        Update: {
          tipo?: 'normal' | 'crisis'
          cantidad?: number
          descripcion_bulto?: string | null
          peso_estimado?: number | null
          triaje_pendiente?: boolean
        }
      }
      descartes: {
        Row: {
          id: number
          producto_id: number | null
          descripcion: string
          cantidad: number
          motivo_descarte: string
          fecha_descarte: string
          registrado_por: string
        }
        Insert: {
          producto_id?: number | null
          descripcion: string
          cantidad?: number
          motivo_descarte: string
          registrado_por: string
        }
        Update: {
          producto_id?: number | null
          descripcion?: string
          cantidad?: number
          motivo_descarte?: string
        }
      }
      mermas: {
        Row: {
          id: number
          despacho_id: number
          lote_id: number
          cantidad_faltante: number
          motivo: string | null
          fecha_registro: string
          registrado_por: string
        }
        Insert: {
          despacho_id: number
          lote_id: number
          cantidad_faltante: number
          motivo?: string | null
          registrado_por: string
        }
        Update: {
          cantidad_faltante?: number
          motivo?: string | null
        }
      }
      kits: {
        Row: {
          id: number
          nombre: string
          descripcion: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          nombre: string
          descripcion?: string | null
          created_by?: string | null
        }
        Update: {
          nombre?: string
          descripcion?: string | null
          created_by?: string | null
        }
      }
      items_kit: {
        Row: {
          id: number
          kit_id: number
          producto_id: number
          cantidad: number
        }
        Insert: {
          kit_id: number
          producto_id: number
          cantidad: number
        }
        Update: {
          kit_id?: number
          producto_id?: number
          cantidad?: number
        }
      }
    }
    Views: {
      v_stock_actual: {
        Row: {
          producto_id: number
          producto: string
          categoria: string
          clima: string
          unidad_medida: string
          stock_total: number
          proxima_caducidad: string | null
          num_lotes: number
        }
      }
      v_lotes_fefo: {
        Row: {
          id: number
          codigo: string
          producto: string
          cantidad_actual: number
          fecha_caducidad: string
          dias_para_vencer: number
        }
      }
      v_impacto_resumen: {
        Row: {
          despacho_id: number
          codigo: string
          motivo: string
          beneficiario: string
          provincia: string
          fecha_despacho: string
          lineas_productos: number
          total_unidades: number
          valor_estimado: number
        }
      }
      v_triaje_pendiente: {
        Row: {
          ingreso_id: number
          lote_codigo: string
          descripcion_bulto: string
          peso_estimado: number
          fecha_ingreso: string
          registrado_por: string
        }
      }
    }
    Enums: {
      rol_usuario: 'admin' | 'operador' | 'voluntario' | 'auditor' | 'estudiante'
      tipo_donante: 'persona' | 'empresa' | 'anonimo'
      clima_producto: 'costa' | 'sierra' | 'ambos'
      categoria_producto: 'alimentos' | 'ropa' | 'higiene' | 'medicamentos' | 'juguetes' | 'enseres' | 'otros'
      estado_lote: 'disponible' | 'triaje_pendiente' | 'agotado' | 'descartado'
      tipo_ingreso: 'normal' | 'crisis'
      estado_despacho: 'preparando' | 'validado' | 'despachado' | 'rectificado'
      motivo_egreso: 'terremoto' | 'inundacion' | 'incendio' | 'deslizamiento' | 'sequia' | 'pandemia' | 'pobreza_extrema' | 'otro'
    }
    Functions: {
      registrar_ingreso_producto: {
        Args: {
          p_producto_id: number
          p_cantidad: number
          p_fecha_ingreso: string
          p_fecha_caducidad: string | null
          p_donante_id: number
          p_usuario_id: string
          p_precio_unitario?: number
        }
        Returns: Json
      }
    }
  }
}
