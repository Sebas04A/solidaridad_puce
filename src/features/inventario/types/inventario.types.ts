// Inventario feature - Types

export type EstadoLote = 'disponible' | 'triaje_pendiente' | 'agotado' | 'descartado';

export interface Lote {
  id: number;
  codigo: string;
  producto_id: number;
  donante_id?: number;
  fecha_ingreso: string;
  fecha_caducidad?: string;
  cantidad_inicial: number;
  cantidad_actual: number;
  estado: EstadoLote;
  notas?: string;
  created_at: string;
  created_by?: string;
  // Joined fields
  producto?: {
    nombre: string;
    categoria: string;
    unidad_medida: string;
  };
  donante?: {
    nombre: string;
    tipo: string;
  };
}

export interface LoteInsert {
  producto_id: number;
  donante_id?: number;
  fecha_caducidad?: string;
  cantidad_inicial: number;
  cantidad_actual: number;
  estado?: EstadoLote;
  notas?: string;
}

export type LoteUpdate = Partial<LoteInsert>;

export interface StockResumen {
  producto_id: number;
  producto: string;
  categoria: string;
  clima: string;
  unidad_medida: string;
  stock_total: number;
  proxima_caducidad?: string;
  num_lotes: number;
}
