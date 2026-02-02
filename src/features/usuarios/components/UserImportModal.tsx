import { useState } from 'react';
import { Modal } from '@/components/ui/Modal'; // Assuming existing
import { Button } from '@/components/ui/Button';
import { useImportUser } from '../hooks/useUsers';

import type { PuceUser, UserRole } from '../types/users.types';

interface UserImportModalProps {
  user: PuceUser | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserImportModal({ user, isOpen, onClose }: UserImportModalProps) {
  const [role, setRole] = useState<UserRole>('estudiante');
  const { mutate: importUser, isPending } = useImportUser();

  const handleImport = () => {
    if (!user) return;
    
    importUser({
      email: user.email,
      nombre: `${user.nombres} ${user.apellidos}`,
      rol: role,
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Importar Usuario">
      <div className="space-y-4">
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="font-medium text-blue-900">{user.nombres} {user.apellidos}</p>
          <p className="text-sm text-blue-700">{user.email}</p>
          <p className="text-xs text-blue-600">{user.facultad} - {user.carrera}</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Asignar Rol</label>
          <select 
            className="w-full border rounded-md p-2"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
          >
            <option value="estudiante">Estudiante (Predeterminado)</option>
            <option value="voluntario">Voluntario</option>
            <option value="operador">Operador (Logística)</option>
            <option value="admin">Administrador</option>
            <option value="auditor">Auditor</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {role === 'estudiante' && 'Acceso a Registro de Donaciones y Entrega.'}
            {role === 'voluntario' && 'Acceso limitado según crisis.'}
            {role === 'operador' && 'Acceso completo a inventario.'}
          </p>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleImport} disabled={isPending}>
            {isPending ? 'Importando...' : 'Confirmar Importación'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
