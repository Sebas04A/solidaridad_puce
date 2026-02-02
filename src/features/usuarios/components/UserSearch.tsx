import { useState } from 'react';
import { usePuceSearch } from '../hooks/useUsers';
import { Button } from '@/components/ui/Button'; // Assuming existing
import { Input } from '@/components/ui/Input';   // Assuming existing
import { Spinner } from '@/components/ui/Spinner'; // Assuming existing
import type { PuceUser } from '../types/users.types';

interface UserSearchProps {
  onSelectUser: (user: PuceUser) => void;
}

export function UserSearch({ onSelectUser }: UserSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PuceUser[]>([]);
  const { mutate: search, isPending } = usePuceSearch();

  const handleSearch = () => {
    if (!query.trim()) return;
    search(query, {
      onSuccess: (data) => setResults(data),
    });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-medium">Búsqueda Institucional (PUCE)</h3>
      <div className="flex gap-2">
        <Input 
          placeholder="Cédula, Correo o Nombre" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={isPending}>
          {isPending ? <Spinner size="sm" /> : 'Buscar'}
        </Button>
      </div>

      <div className="space-y-2 mt-4">
        {results.length === 0 && query && !isPending && (
          <p className="text-gray-500 text-sm">No se encontraron resultados.</p>
        )}
        
        {results.map((user) => (
          <div 
            key={user.identification} 
            className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => onSelectUser(user)}
          >
            <div>
              <p className="font-medium">{user.nombres} {user.apellidos}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-xs text-gray-400">{user.identification} • {user.facultad} - {user.carrera}</p>
            </div>
            <Button variant="outline" size="sm">Seleccionar</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
