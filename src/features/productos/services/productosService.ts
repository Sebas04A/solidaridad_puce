
import { supabase } from '@/lib/supabase';
import type { Producto, ProductoInsert } from '../types/productos.types';

export const productosService = {
  async search(query: string): Promise<Producto[]> {
    if (!query) return [];
    
    // Actual query
     const { data: results, error: searchError } = await supabase
      .from('productos')
      .select('*')
      .ilike('nombre', `%${query}%`)
      .eq('activo', true)
      .order('nombre')
      .limit(20);
    
    if (searchError) throw searchError;
    return (results as any[]) || [];
  },

  async getAllCategories() {
    // This is hardcoded in the Type, but we might want to fetch it if it was a table.
    // For now we return the Enum values.
    return [
      'alimentos',
      'ropa',
      'higiene',
      'medicamentos',
      'juguetes',
      'enseres',
      'otros'
    ] as const;
  },

  async create(producto: ProductoInsert): Promise<Producto> {
    const { data, error } = await supabase
      .from('productos')
      .insert(producto as any)
      .select()
      .single();
    
    if (error) throw error;
    return data as any;
  },

  async update(id: number, producto: Partial<ProductoInsert>): Promise<Producto> {
    const { data, error } = await supabase
      .from('productos')
      // @ts-ignore
      .update(producto as any)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as any;
  },
};
