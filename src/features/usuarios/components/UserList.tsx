import { useUsers, useToggleUserStatus } from '../hooks/useUsers';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'; // Check if Table exists
import { Spinner } from '@/components/ui/Spinner';
import { formatDate } from '@/lib/utils'; // Assuming generic utils

interface UserListProps {
  onCrisisMode: () => void;
}

export function UserList({ onCrisisMode }: UserListProps) {
  const { data: users, isLoading } = useUsers();
  const { mutate: toggleStatus } = useToggleUserStatus();

  if (isLoading) return <div className="p-4"><Spinner /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Usuarios Activos</h2>
        <Button variant="destructive" onClick={onCrisisMode}>
          ⚠️ Generar Usuario Crisis
        </Button>
      </div>

      <div className="bg-white rounded-md shadow border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.nombre}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${user.rol === 'admin' ? 'bg-purple-100 text-purple-700' : 
                      user.rol === 'estudiante' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}
                  `}>
                    {user.rol.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`w-2 h-2 rounded-full inline-block mr-2 ${user.activo ? 'bg-green-500' : 'bg-red-500'}`} />
                  {user.activo ? 'Activo' : 'Inactivo'}
                  {user.activo_hasta && <span className="text-xs text-red-500 block">Hasta: {formatDate(user.activo_hasta)}</span>}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => toggleStatus({ id: user.id, activo: !user.activo })}
                    className={user.activo ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                  >
                    {user.activo ? 'Desactivar' : 'Activar'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {users?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No hay usuarios registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
