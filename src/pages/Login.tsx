import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ROLES_LABELS } from '@/lib/constants';
import { formatAuthError } from '@/lib/utils';
import toast from 'react-hot-toast';

type Tab = 'login' | 'register';

export function LoginPage() {
  const [activeTab, setActiveTab] = useState<Tab>('login');
  
  // Login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register form
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerNombre, setRegisterNombre] = useState('');
  const [registerRol, setRegisterRol] = useState<'admin' | 'operador' | 'voluntario' | 'auditor'>('operador');
  
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Por favor, ingresa tu email y contraseña');
      return;
    }

    setIsLoading(true);
    console.log('🔵 LoginPage: Iniciando proceso de login...', { email });
    
    try {
      console.log('📞 LoginPage: Llamando a signIn...');
      await signIn(email, password);
      console.log('✅ LoginPage: signIn completado exitosamente');
      
      // Wait a bit for auth state to update
      console.log('⏳ LoginPage: Esperando actualización de estado de auth...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('🎯 LoginPage: Mostrando toast de éxito');
      toast.success('¡Inicio de sesión exitoso! Bienvenido 👋', {
        icon: '✅',
        duration: 3000,
      });
      
      console.log('🚀 LoginPage: Navegando a:', from);
      navigate(from, { replace: true });
      console.log('✅ LoginPage: Navegación completada');
    } catch (error: any) {
      console.error('❌ LoginPage: Error en login:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      const errorMessage = formatAuthError(error);
      toast.error(errorMessage, {
        icon: '❌',
        duration: 4000,
      });
    } finally {
      console.log('🏁 LoginPage: Finalizando, isLoading = false');
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerEmail || !registerPassword || !registerNombre) {
      toast.error('Por favor, completa todos los campos');
      return;
    }

    if (registerPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    console.log('🔵 LoginPage: Iniciando registro...', { email: registerEmail, nombre: registerNombre, rol: registerRol });
    
    try {
      console.log('📞 LoginPage: Llamando a signUp...');
      await signUp({
        email: registerEmail,
        password: registerPassword,
        nombre: registerNombre,
        rol: registerRol,
      });
      console.log('✅ LoginPage: Usuario creado exitosamente');
      toast.success('¡Cuenta creada exitosamente! 🎉', {
        icon: '✅',
        duration: 2000,
      });
      
      // Navegar al dashboard (el listener ya está cargando el perfil)
      console.log('🚀 LoginPage: Navegando al dashboard...');
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      console.error('❌ LoginPage: Error en registro:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      const errorMessage = formatAuthError(error);
      toast.error(errorMessage, {
        icon: '❌',
        duration: 4000,
      });
    } finally {
      console.log('🏁 LoginPage: Finalizando registro');
      setIsLoading(false);
    }
  };

  const rolesOptions = Object.entries(ROLES_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
        {/* Logo */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold">Solidaridad PUCE</h1>
          <p className="text-blue-100 mt-1 text-sm">Centro de Acopio - Ayuda Humanitaria</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'login'
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Iniciar Sesión
            {activeTab === 'login' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'register'
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Registrarse
            {activeTab === 'register' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>

        {/* Forms */}
        <div className="p-8">
          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                label="Correo electrónico"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              
              <Input
                type="password"
                label="Contraseña"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />

              <Button 
                type="submit" 
                className="w-full mt-6" 
                size="lg"
                isLoading={isLoading}
              >
                Iniciar Sesión
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                type="text"
                label="Nombre completo"
                placeholder="Juan Pérez"
                value={registerNombre}
                onChange={(e) => setRegisterNombre(e.target.value)}
                autoComplete="name"
              />

              <Input
                type="email"
                label="Correo electrónico"
                placeholder="correo@ejemplo.com"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                autoComplete="email"
              />
              
              <Input
                type="password"
                label="Contraseña"
                placeholder="Mínimo 6 caracteres"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                autoComplete="new-password"
              />

              <Select
                label="Rol"
                options={rolesOptions}
                value={registerRol}
                onChange={(e) => setRegisterRol(e.target.value as any)}
              />

              <Button 
                type="submit" 
                className="w-full mt-6" 
                size="lg"
                isLoading={isLoading}
              >
                Crear Cuenta
              </Button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-6">
          <p className="text-center text-xs text-gray-400">
            Sistema de Gestión de Ayuda Humanitaria
          </p>
        </div>
      </div>
    </div>
  );
}
