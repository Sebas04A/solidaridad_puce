import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '../types/auth.types';

interface SignUpData {
  email: string;
  password: string;
  nombre: string;
  rol?: 'admin' | 'operador' | 'voluntario' | 'auditor' | 'estudiante';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      console.log('🔍 AuthContext: Verificando sesión inicial...');
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('📦 AuthContext: Sesión obtenida:', session ? 'Sesión activa' : 'Sin sesión');
        
        if (session?.user) {
          console.log('👤 AuthContext: Usuario encontrado, obteniendo perfil...', { userId: session.user.id, email: session.user.email });
          
          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from('perfiles')
            .select('*')
            .eq('id', session.user.id)
            .single<{
              id: string;
              email: string;
              nombre: string;
              rol: 'admin' | 'operador' | 'voluntario' | 'auditor' | 'estudiante';
              activo: boolean;
              activo_hasta: string | null;
            }>();
          
          if (profileError) {
            console.error('❌ AuthContext: Error al obtener perfil:', profileError);
          }
          
          if (profile) {
            console.log('✅ AuthContext: Perfil obtenido:', profile);
            const userObject = {
              id: profile.id as string,
              email: profile.email as string,
              nombre: profile.nombre as string,
              rol: profile.rol as 'admin' | 'operador' | 'voluntario' | 'auditor' | 'estudiante',
              activo: profile.activo as boolean,
              activo_hasta: (profile.activo_hasta as string) || undefined,
            };
            console.log('👥 AuthContext: Estableciendo usuario en estado:', userObject);
            setUser(userObject);
          } else {
            console.warn('⚠️ AuthContext: No se encontró perfil para el usuario');
          }
        }
      } catch (error) {
        console.error('❌ AuthContext: Error al verificar sesión:', error);
      } finally {
        console.log('✅ AuthContext: Verificación de sesión completada, isLoading = false');
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    console.log('🎧 AuthContext: Configurando listener de cambios de auth...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 AuthContext: Evento de auth recibido:', { event, hasSession: !!session });
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('🔐 AuthContext: SIGNED_IN detectado, obteniendo perfil...', { userId: session.user.id });
        
        // Intentar obtener el perfil con timeout
        const fetchProfileWithTimeout = async () => {
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout obteniendo perfil')), 5000)
          );
          
          const profilePromise = supabase
            .from('perfiles')
            .select('*')
            .eq('id', session.user.id)
            .single<{
              id: string;
              email: string;
              nombre: string;
              rol: 'admin' | 'operador' | 'voluntario' | 'auditor' | 'estudiante';
              activo: boolean;
              activo_hasta: string | null;
            }>();
          
          return Promise.race([profilePromise, timeoutPromise]);
        };
        
        try {
          const result = await fetchProfileWithTimeout();
          const { data: profile, error: profileError } = result as any;
          
          console.log('📦 AuthContext: Resultado de query:', { profile, error: profileError });
          
          if (profileError) {
            console.error('❌ AuthContext: Error al obtener perfil después de SIGNED_IN:', profileError);
            console.error('Detalles:', {
              message: profileError.message,
              code: profileError.code,
              hint: profileError.hint,
              details: profileError.details
            });
          } else if (profile) {
            console.log('✅ AuthContext: Perfil obtenido después de SIGNED_IN:', profile);
            const userObject = {
              id: profile.id as string,
              email: profile.email as string,
              nombre: profile.nombre as string,
              rol: profile.rol as 'admin' | 'operador' | 'voluntario' | 'auditor' | 'estudiante',
              activo: profile.activo as boolean,
              activo_hasta: (profile.activo_hasta as string) || undefined,
            };
            console.log('👥 AuthContext: Estableciendo usuario después de SIGNED_IN:', userObject);
            setUser(userObject);
          } else {
            console.warn('⚠️ AuthContext: No se encontró perfil para el usuario');
          }
        } catch (error) {
          console.error('❌ AuthContext: Error o timeout al obtener perfil:', error);
          console.warn('⚠️ AuthContext: Continuando sin perfil, puede ser problema de RLS');
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('🚪 AuthContext: SIGNED_OUT detectado, limpiando usuario');
        setUser(null);
      }
    });

    return () => {
      console.log('🧹 AuthContext: Limpiando subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔑 AuthContext.signIn: Iniciando login con Supabase...', { email });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      console.error('❌ AuthContext.signIn: Error de Supabase:', error);
      throw error;
    }
    
    console.log('✅ AuthContext.signIn: Login exitoso en Supabase:', {
      userId: data.user?.id,
      email: data.user?.email,
      hasSession: !!data.session
    });
  };

  const signUp = async ({ email, password, nombre, rol = 'operador' }: SignUpData) => {
    console.log('📝 AuthContext.signUp: Iniciando registro...', { email, nombre, rol });
    
    try {
      // Crear usuario en Supabase Auth
      // El trigger de base de datos creará automáticamente el perfil
      console.log('🔐 AuthContext.signUp: Creando usuario en Supabase Auth...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre,
            rol,
          }
        }
      });

      if (authError) {
        console.error('❌ AuthContext.signUp: Error al crear usuario:', authError);
        throw authError;
      }
      
      if (!authData.user) {
        console.error('❌ AuthContext.signUp: No se obtuvo usuario después de signUp');
        throw new Error('No se pudo crear el usuario');
      }
      
      console.log('✅ AuthContext.signUp: Usuario creado:', {
        userId: authData.user.id,
        email: authData.user.email
      });
      console.log('🎉 AuthContext.signUp: El listener cargará el perfil automáticamente');
    } catch (error) {
      console.error('❌ AuthContext.signUp: Error en registro:', error);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  console.log('🔄 AuthContext: Estado actual:', { 
    hasUser: !!user, 
    userId: user?.id,
    userName: user?.nombre,
    isLoading, 
    isAuthenticated: !!user 
  });

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
