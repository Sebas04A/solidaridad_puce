
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { productosService } from '../services/productosService';
import { Producto, CategoriaProducto } from '../types/productos.types';
import { toast } from 'react-hot-toast';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (producto: Producto) => void;
  initialName?: string;
  product?: Producto | null;
}

const CATEGORIES: { value: CategoriaProducto; label: string }[] = [
  { value: 'alimentos', label: 'Alimentos' },
  { value: 'ropa', label: 'Ropa' },
  { value: 'higiene', label: 'Higiene' },
  { value: 'medicamentos', label: 'Medicamentos' },
  { value: 'juguetes', label: 'Juguetes' },
  { value: 'enseres', label: 'Enseres' },
  { value: 'otros', label: 'Otros' },
];

export function CreateProductModal({ isOpen, onClose, onSuccess, initialName = "", product }: CreateProductModalProps) {
  const [name, setName] = useState(product?.nombre || initialName);
  const [category, setCategory] = useState<CategoriaProducto>(product?.categoria || 'alimentos');
  const [unit, setUnit] = useState(product?.unidad_medida || 'unidad');
  const [clima, setClima] = useState<"costa" | "sierra" | "ambos">(product?.clima || 'ambos');
  const [precio, setPrecio] = useState(product?.precio_referencial?.toString() || '0');
  
  const [loading, setLoading] = useState(false);

  // Reset state when opening (or changing product)
  // Note: For simplicity relying on key or unmount. Ideally use useEffect if modal stays mounted.
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      let result;
      const payload = {
        nombre: name,
        categoria: category,
        unidad_medida: unit,
        clima: clima,
        precio_referencial: parseFloat(precio) || 0,
        activo: true
      };

      if (product) {
        // Update
        result = await productosService.update(product.id, payload);
        toast.success('Producto actualizado correctamente');
      } else {
        // Create
        result = await productosService.create(payload);
        toast.success('Producto creado correctamente');
      }
      
      onSuccess(result);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(product ? 'Error al actualizar' : 'Error al crear producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Definir Nuevo Producto en Catálogo">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600 mb-4">
          El producto se añadirá automáticamente a la lista para ser usado inmediatamente.
        </div>

        <Select
          label="Seleccionar Categoría Existente"
          value={category}
          onChange={(e) => setCategory(e.target.value as CategoriaProducto)}
          options={CATEGORIES}
        />

        <Input
          label="Nombre Detallado del Producto"
          placeholder="Ej: Arroz Grano Largo 1kg - Bolsa"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Unidad de Medida"
          placeholder="Ej: unidad, paquete, caja"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Clima"
            value={clima}
            onChange={(e) => setClima(e.target.value as "costa" | "sierra" | "ambos")}
            options={[
              { value: 'ambos', label: 'Ambos / Indistinto' },
              { value: 'costa', label: 'Costa (Calor)' },
              { value: 'sierra', label: 'Sierra (Frío)' },
            ]}
          />

          <Input
            label="Precio Referencial"
            type="number"
            min="0"
            step="0.01"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-white">
            {loading ? 'Guardando...' : 'Guardar Producto y Usar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
