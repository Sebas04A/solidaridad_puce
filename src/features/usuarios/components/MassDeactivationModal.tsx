import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useUsers, useDeactivateUsers } from '../hooks/useUsers';
import { Spinner } from '@/components/ui/Spinner';


// Assuming Checkbox might not exist, using standard input or ensuring it's simple
// Using standard input for simplicity in this artifact, or creating a small local component if complex

interface MassDeactivationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MassDeactivationModal({ isOpen, onClose }: MassDeactivationModalProps) {
  const { data: users, isLoading } = useUsers();
  const { mutate: deactivateUsers, isPending: isDeactivating } = useDeactivateUsers();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Filter active students
  const activeStudents = users?.filter(u => u.rol === 'estudiante' && u.activo) || [];

  // Reset selection when modal opens or users change
  useEffect(() => {
    if (isOpen && activeStudents.length > 0) {
      // Default: Select ALL active students
      setSelectedIds(new Set(activeStudents.map(u => u.id)));
    }
  }, [isOpen, users]); // Depend on users to refresh if background update

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (selectedIds.size === activeStudents.length) {
      setSelectedIds(new Set()); // Deselect all
    } else {
      setSelectedIds(new Set(activeStudents.map(u => u.id))); // Select all
    }
  };

  const handleConfirm = () => {
    deactivateUsers(Array.from(selectedIds), {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Baja Masiva de Estudiantes">
      <div className="space-y-4">
        <div className="bg-red-50 p-4 rounded border border-red-200">
          <h4 className="font-bold text-red-800 flex items-center gap-2">
            ⚠️ Zona de Peligro
          </h4>
          <p className="text-sm text-red-700 mt-1">
            Estás a punto de desactivar el acceso a los estudiantes seleccionados.
            Esta acción se suele realizar al finalizar el semestre o periodo de vinculación.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-4"><Spinner /></div>
        ) : activeStudents.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No hay estudiantes activos para dar de baja.</p>
        ) : (
          <div className="border rounded-md max-h-[300px] overflow-y-auto">
            <div className="sticky top-0 bg-gray-50 p-2 border-b flex items-center gap-2 font-medium z-10">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                checked={selectedIds.size === activeStudents.length && activeStudents.length > 0}
                onChange={toggleAll}
              />
              <span className="text-sm">Seleccionar Todos ({selectedIds.size}/{activeStudents.length})</span>
            </div>
            <div className="divide-y">
              {activeStudents.map(student => (
                <div key={student.id} className="p-2 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                   <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    checked={selectedIds.has(student.id)}
                    onChange={() => toggleSelection(student.id)}
                    id={`check-${student.id}`}
                  />
                  <label htmlFor={`check-${student.id}`} className="flex-1 cursor-pointer text-sm">
                    <span className="font-medium text-gray-900">{student.nombre}</span>
                    <span className="text-gray-500 ml-2 text-xs">{student.email}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t mt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm} 
            disabled={isDeactivating || selectedIds.size === 0}
          >
            {isDeactivating ? 'Procesando...' : `Dar de Baja (${selectedIds.size})`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
