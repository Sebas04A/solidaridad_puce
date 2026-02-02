
import { supabase } from '@/lib/supabase';
import type { Donante, DonanteInsert } from '../types/donantes.types';

export const donantesService = {
  async search(query: string): Promise<Donante[]> {
    if (!query) return [];
    
    // Search by name (case insensitive)
    const { data, error } = await supabase
      .from('donantes')
      .select('*')
      .ilike('nombre', `%${query}%`)
      .order('nombre')
      .limit(10);
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: number): Promise<Donante | null> {
    const { data, error } = await supabase
      .from('donantes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(donante: DonanteInsert): Promise<Donante> {
    const { data, error } = await supabase
      .from('donantes')
      // @ts-ignore
      .insert(donante)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};
