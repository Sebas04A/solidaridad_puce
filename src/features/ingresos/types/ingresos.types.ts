
export type TipoIngreso = 'normal' | 'crisis';
export type EstadoLote = 'disponible' | 'triaje_pendiente' | 'agotado' | 'descartado';

export interface LoteInsert {
  producto_id: number;
  donante_id?: number | null;
  fecha_ingreso?: string; // default now
  fecha_caducidad?: string | null;
  cantidad_inicial: number;
  cantidad_actual: number;
  estado?: EstadoLote;
  notas?: string;
  created_by?: string; // uuid
}

export interface IngresoInsert {
  lote_id: number; // ID from the just created Lote
  tipo: TipoIngreso;
  cantidad: number;
  descripcion_bulto?: string;
  peso_estimado?: number;
  triaje_pendiente?: boolean;
  registrado_por: string; // uuid
}
