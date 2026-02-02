// Reportes feature - Types

export interface ResumenImpacto {
  despacho_id: number;
  codigo: string;
  motivo: string;
  beneficiario: string;
  provincia: string;
  fecha_despacho: string;
  lineas_productos: number;
  total_unidades: number;
  valor_estimado: number;
}

export interface DashboardStats {
  total_donantes: number;
  total_productos: number;
  total_beneficiarios: number;
  total_despachos: number;
  valor_total_donado: number;
  personas_beneficiadas: number;
}

export interface ReportePorCategoria {
  categoria: string;
  cantidad_total: number;
  valor_estimado: number;
}

export interface ReportePorMotivo {
  motivo: string;
  cantidad_despachos: number;
  total_unidades: number;
  valor_estimado: number;
}
