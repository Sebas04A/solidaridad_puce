// Egresos feature - Types

export type EstadoDespacho = 'preparando' | 'validado' | 'despachado' | 'rectificado';

export type MotivoEgreso =
  | 'terremoto'
  | 'inundacion'
  | 'incendio'
  | 'deslizamiento'
  | 'sequia'
  | 'pandemia'
  | 'pobreza_extrema'
  | 'otro';

export interface Beneficiario {
  id: number;
  nombre: string;
  sector?: string;
  provincia?: string;
  canton?: string;
  parroquia?: string;
  contacto_nombre?: string;
  contacto_telefono?: string;
  poblacion_estimada?: number;
  notas?: string;
  created_at: string;
}

export interface BeneficiarioInsert {
  nombre: string;
  sector?: string;
  provincia?: string;
  canton?: string;
  parroquia?: string;
  contacto_nombre?: string;
  contacto_telefono?: string;
  poblacion_estimada?: number;
  notas?: string;
}

export interface Despacho {
  id: number;
  codigo: string;
  beneficiario_id: number;
  motivo: MotivoEgreso;
  motivo_detalle?: string;
  fecha_despacho: string;
  estado: EstadoDespacho;
  fue_rectificado: boolean;
  rectificacion_notas?: string;
  preparado_por: string;
  validado_por?: string;
  fecha_validacion?: string;
  // Joined
  beneficiario?: Beneficiario;
  egresos?: Egreso[];
}

export interface DespachoInsert {
  beneficiario_id: number;
  motivo: MotivoEgreso;
  motivo_detalle?: string;
}

export interface Egreso {
  id: number;
  despacho_id: number;
  lote_id: number;
  cantidad_solicitada: number;
  cantidad_despachada?: number;
  created_at: string;
  // Joined
  lote?: {
    codigo: string;
    producto: {
      nombre: string;
      unidad_medida: string;
    };
  };
}

export interface EgresoInsert {
  despacho_id: number;
  lote_id: number;
  cantidad_solicitada: number;
  cantidad_despachada?: number;
}
