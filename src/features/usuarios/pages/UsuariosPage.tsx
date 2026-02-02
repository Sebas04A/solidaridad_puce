import { useState } from 'react';
import { UserSearch } from '../components/UserSearch';
import { UserImportModal } from '../components/UserImportModal';
import { MassDeactivationModal } from '../components/MassDeactivationModal';
import { UserList } from '../components/UserList';
import type { PuceUser } from '../types/users.types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useImportUser } from '../hooks/useUsers';

export function UsuariosPage() {
  const [selectedUser, setSelectedUser] = useState<PuceUser | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // Credentials display state
  const [createdCredentials, setCreatedCredentials] = useState<{email: string; password: string} | null>(null);
  
  // Crisis Mode State
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [temporalName, setTemporalName] = useState('');
  const [temporalValidHours, setTemporalValidHours] = useState(48);
  const [isMassDeactivationOpen, setIsMassDeactivationOpen] = useState(false);
  const { mutate: createTemporalUser, isPending: isCreatingTemporal } = useImportUser();

  const handleUserSelect = (user: PuceUser) => {
    setSelectedUser(user);
    setIsImportModalOpen(true);
  };

  const handleCreateTemporal = () => {
    // Generate valid random email and password
    const randomId = Math.random().toString(36).substring(7);
    const email = `voluntario.${randomId}@crisis.temp`;
    const password = Math.random().toString(36).slice(-8) + 'Aa1!'; // Simple random password
    
    // Calculate expiration date
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + temporalValidHours);

    createTemporalUser({
      email,
      password,
      nombre: temporalName || `Voluntario Temporal ${randomId}`,
      rol: 'voluntario',
      activo_hasta: expirationDate.toISOString(),
    }, {
      onSuccess: () => {
        setIsCrisisModalOpen(false);
        setTemporalName('');
        setCreatedCredentials({ email, password });
      }
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p className="text-gray-500">Administración de accesos, roles y vinculación institucional.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <UserSearch onSelectUser={handleUserSelect} />
        </div>
        
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-end">
            <Button variant="danger" size="sm" onClick={() => setIsMassDeactivationOpen(true)}>
              📋 Baja Masiva de Estudiantes
            </Button>
          </div>
          <UserList onCrisisMode={() => setIsCrisisModalOpen(true)} />
        </div>
      </div>

      <MassDeactivationModal 
        isOpen={isMassDeactivationOpen} 
        onClose={() => setIsMassDeactivationOpen(false)} 
      />

      <UserImportModal 
        user={selectedUser} 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
      />

      {/* Basic Crisis Modal - could be extracted */}
      <Modal isOpen={isCrisisModalOpen} onClose={() => setIsCrisisModalOpen(false)} title="Generar Credencial de Crisis">
        <div className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
            <h4 className="font-bold text-yellow-800">⚠️ Modo de Emergencia</h4>
            <p className="text-sm text-yellow-700">
              Esta acción creará un usuario <strong>Voluntario</strong> temporal sin vinculación PUCE.
              Las credenciales expirarán automáticamente.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium">Nombre Referencial</label>
            <Input 
              value={temporalName} 
              onChange={(e) => setTemporalName(e.target.value)} 
              placeholder="Ej: Voluntario Cruz Roja 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Duración (Horas)</label>
            <Input 
              type="number"
              value={temporalValidHours}
              onChange={(e) => setTemporalValidHours(parseInt(e.target.value))}
              min={1}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsCrisisModalOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleCreateTemporal} disabled={isCreatingTemporal}>
              {isCreatingTemporal ? 'Generando...' : 'Generar Acceso'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Credentials Modal */}
      <Modal isOpen={!!createdCredentials} onClose={() => setCreatedCredentials(null)} title="✅ Credenciales Generadas">
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded border border-green-200">
            <p className="text-sm text-green-800 mb-2">¡Usuario creado exitosamente! Comparte estas credenciales:</p>
            <div className="space-y-2 font-mono text-sm bg-white p-3 rounded border border-green-100">
              <p><span className="text-gray-500">Email:</span> <span className="font-bold select-all">{createdCredentials?.email}</span></p>
              <p><span className="text-gray-500">Contraseña:</span> <span className="font-bold select-all">{createdCredentials?.password}</span></p>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Esta contraseña no se podrá ver nuevamente. Guárdala si es necesario.
          </p>
          <div className="flex justify-end">
             <Button onClick={() => setCreatedCredentials(null)}>Entendido</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
