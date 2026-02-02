import { supabase } from '@/lib/supabase';
import type { UserProfile } from '../../auth/types/auth.types';
import type { PuceUser, CreateUserDTO } from '../types/users.types';

// Mock data for PUCE search
const MOCK_PUCE_USERS: PuceUser[] = [
  { identification: '1723456789', email: 'estudiante1@puce.edu.ec', nombres: 'Juan', apellidos: 'Perez', facultad: 'Ingeniería', carrera: 'Sistemas' },
  { identification: '1712345678', email: 'maria.gomez@puce.edu.ec', nombres: 'Maria', apellidos: 'Gomez', facultad: 'Psicología', carrera: 'Clínica' },
  { identification: '1798765432', email: 'pedro.loja@puce.edu.ec', nombres: 'Pedro', apellidos: 'Loja', facultad: 'Administración', carrera: 'Negocios' },
];

export const usersService = {
  // Mock search against "Institutional DB"
  async searchPuceUser(query: string): Promise<PuceUser[]> {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const lowerQuery = query.toLowerCase();
    return MOCK_PUCE_USERS.filter(u => 
      u.identification.includes(query) || 
      u.email.toLowerCase().includes(lowerQuery) ||
      `${u.nombres} ${u.apellidos}`.toLowerCase().includes(lowerQuery)
    );
  },

  async getAll(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Cast to ensure type safety with the new role
    return data as UserProfile[];
  },

  async toggleStatus(id: string, activo: boolean): Promise<void> {
    const { error } = await supabase
      .from('perfiles')
      // @ts-ignore
      .update({ activo })
      .eq('id', id);
    
    if (error) throw error;
  },

  async deactivateUsers(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('perfiles')
      // @ts-ignore
      .update({ activo: false })
      .in('id', ids);
    
    if (error) throw error;
  },

  // This calls our Edge Function to create a user without logging out the admin
  async importUser(user: CreateUserDTO): Promise<void> {
    const { data, error } = await supabase.functions.invoke('admin-create-user', {
      body: {
        email: user.email,
        password: user.password || 'Temporal123!', // Default temporary password
        nombre: user.nombre,
        rol: user.rol,
        activo_hasta: user.activo_hasta
      }
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);
  }
};
