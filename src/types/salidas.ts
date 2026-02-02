import { Database } from './database.types';

export type Product = Database['public']['Tables']['productos']['Row'];
export type Beneficiary = Database['public']['Tables']['beneficiarios']['Row'];
export type Dispatch = Database['public']['Tables']['despachos']['Row'];
export type DispatchItem = Database['public']['Tables']['egresos']['Row'];

// Manually defined since they are new in the migration
export interface Kit {
  id: number;
  nombre: string;
  descripcion: string | null;
  created_at: string;
  created_by: string | null;
  items?: KitItemWithProduct[];
}

export interface KitItem {
  id: number;
  kit_id: number;
  producto_id: number;
  cantidad: number;
}

export interface KitItemWithProduct extends KitItem {
  producto: Product;
}

// Wizard State
export interface DespachoState {
  step: number; // 0 to 4
  beneficiaryId: number | null;
  motivo: Database['public']['Enums']['motivo_egreso'] | '';
  motivoDetalle: string;
  items: CartItem[];
  transportType: 'institucional' | 'externo' | null;
  transportCost: number;
  evidenceFile: File | null;
  evidenceUrl: string | null;
}

export interface CartItem {
  tempId: string; // unique id for list
  producto: Product;
  cantidad: number;
  loteCodigos?: string[]; // If we selected specific lots (advanced)
  kitId?: number; // if it came from a kit
  isKitItem?: boolean;
}
