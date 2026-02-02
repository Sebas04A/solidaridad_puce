
import { useState, useCallback } from 'react';
import { Combobox, ComboboxOption } from '@/components/ui/Combobox';
import { donantesService } from '../services/donantesService';
import { Donante } from '../types/donantes.types';

interface DonanteSearchProps {
  selectedId?: number | null;
  onSelect: (donante: Donante | null) => void;
  onNewName: (name: string) => void;
  error?: string;
}

export function DonanteSearch({ selectedId, onSelect, onNewName, error }: DonanteSearchProps) {
  const [options, setOptions] = useState<ComboboxOption[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const results = await donantesService.search(query);
      setOptions(results.map(d => ({
        value: d.id,
        label: d.nombre // Could add type e.g. `${d.nombre} (${d.tipo})`
      })));
    } catch (err) {
      console.error("Error searching donors:", err);
      // toast.error?
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = async (value: string | number | null) => {
    if (typeof value === 'number') {
      const donante = await donantesService.getById(value);
      onSelect(donante);
    } else {
      onSelect(null);
    }
  };

  const handleCreate = (name: string) => {
    onNewName(name); 
    // We don't select an ID, we just pass the name up so the form knows we are in "creation mode"
  };

  return (
    <Combobox
      label="Nombre del Donante (Búsqueda y Registro)"
      placeholder="Ej: Juan Pérez o Fundación Esperanza"
      value={selectedId}
      onChange={handleChange}
      onSearch={handleSearch}
      options={options}
      isLoading={loading}
      onCreate={handleCreate}
      emptyText="No existe. Selecciona 'Crear' para registrarlo."
      error={error}
    />
  );
}
