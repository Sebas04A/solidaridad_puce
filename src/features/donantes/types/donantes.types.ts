// Donantes feature - Types

export interface Donante {
  id: number;
  nombre: string;
  tipo: 'persona' | 'empresa' | 'anonimo';
  es_anonimo: boolean;
  telefono?: string;
  email?: string;
  direccion?: string;
  notas?: string;
  created_at: string;
  created_by?: string;
}

export interface DonanteInsert {
  nombre: string;
  tipo: 'persona' | 'empresa' | 'anonimo';
  es_anonimo?: boolean;
  telefono?: string;
  email?: string;
  direccion?: string;
  notas?: string;
}

export type DonanteUpdate = Partial<DonanteInsert>;
