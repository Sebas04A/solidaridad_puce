
import { Database } from '@/types/database.types';

export type TriajeItem = Database['public']['Views']['v_triaje_pendiente']['Row'];

export interface TriajeProcessItem {
  producto_id: number;
  // If we want to allow new products on the fly, we might need more fields or a separate flow.
  // For now, assume selection from existing products.
  cantidad: number;
  fecha_vencimiento?: string;
  notas?: string;
}

export interface TriajeDiscardItem {
  descripcion: string;
  motivo_descarte: string;
  cantidad: number;
  // 'producto_id' might be null if it's just "Ropa Rota" generic
  producto_id?: number | null; 
}

export interface TriajeProcessPayload {
  ingreso_id: number; // The crisis ingreso being processed
  lote_id: number; // The generic lote associated with the ingreso
  items: TriajeProcessItem[];
  descartes: TriajeDiscardItem[];
  // If items + descartes consume the whole bulto, we close it.
  // If not, we update the quantity remaining? 
  // For v1, we assume one session processes the whole bulto or we just subtract quantities?
  // Let's assume we subtract.
}
