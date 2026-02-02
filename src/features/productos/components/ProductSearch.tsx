
import { useState, useCallback } from 'react';
import { Combobox, ComboboxOption } from '@/components/ui/Combobox';
import { productosService } from '../services/productosService';
import { Producto } from '../types/productos.types';

interface ProductSearchProps {
  selectedId?: number | null;
  onSelect: (producto: Producto | null) => void;
  onCreateRequest: () => void;
  error?: string;
  categoryFilter?: string; // Optional filter by category
}

export function ProductSearch({ selectedId, onSelect, onCreateRequest, error, categoryFilter }: ProductSearchProps) {
  const [options, setOptions] = useState<ComboboxOption[]>([]);
  const [loading, setLoading] = useState(false);





  // Improved implementation to avoid fetch on every change if we have it in options?
  // But options only have label/value.
  // I'll add `getById` to productsService later if needed, or just leverage that search returns full objects.
  
  // Revised approach:
  // Store products map.
  const [productsMap, setProductsMap] = useState<Record<number, Producto>>({});

  const handleSearchWithMap = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const results = await productosService.search(query);
      
      setProductsMap(prev => {
        const newMap = { ...prev };
        results.forEach(p => { newMap[p.id] = p; });
        return newMap;
      });
      
      let filtered = results;
      if (categoryFilter) {
        filtered = results.filter(p => p.categoria === categoryFilter);
      }
      
      setOptions(filtered.map(p => ({
        value: p.id,
        label: p.nombre
      })));
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  return (
    <div className="w-full">
      <Combobox
        label="Producto / Ítem"
        placeholder="Buscar..."
        value={selectedId}
        onChange={(val) => {
          if (typeof val === 'number') {
             onSelect(productsMap[val] || null);
          } else {
             onSelect(null);
          }
        }}
        onSearch={handleSearchWithMap}
        options={options}
        isLoading={loading}
        error={error}
        emptyText="No encontrado."
      />
      <button 
        type="button"
        onClick={onCreateRequest}
        className="mt-1 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"
      >
        + Crear Nuevo Producto (Si no existe en la lista)
      </button>
    </div>
  );
}
