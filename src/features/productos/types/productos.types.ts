// Productos feature - Types

export type CategoriaProducto = 
  | 'alimentos'
  | 'ropa'
  | 'higiene'
  | 'medicamentos'
  | 'juguetes'
  | 'enseres'
  | 'otros';

export type ClimaProducto = 'costa' | 'sierra' | 'ambos';

export interface Producto {
  id: number;
  nombre: string;
  categoria: CategoriaProducto;
  clima: ClimaProducto;
  unidad_medida: string;
  precio_referencial: number;
  descripcion?: string;
  activo: boolean;
  created_at: string;
}

export interface ProductoInsert {
  nombre: string;
  categoria: CategoriaProducto;
  clima?: ClimaProducto;
  unidad_medida?: string;
  precio_referencial?: number;
  descripcion?: string;
  activo?: boolean;
}

export type ProductoUpdate = Partial<ProductoInsert>;
