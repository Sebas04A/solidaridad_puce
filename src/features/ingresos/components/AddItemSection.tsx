
import { useState } from 'react';
import { ProductSearch } from '../../productos/components/ProductSearch';
import { CreateProductModal } from '../../productos/components/CreateProductModal';
import { Producto } from '../../productos/types/productos.types';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

export interface AddedItem {
  tempId: string; // unique id for list management
  producto: Producto;
  cantidad: number;
  precio: number;
  fechaVencimiento?: string;
  fechaDonacion?: string;
  isNew?: boolean; 
}

interface AddItemSectionProps {
  onAddItem: (item: AddedItem) => void;
}

const CATEGORIES: { value: string; label: string }[] = [
  { value: '', label: 'Todas' },
  { value: 'alimentos', label: 'Alimentos' },
  { value: 'ropa', label: 'Ropa' },
  { value: 'higiene', label: 'Higiene' },
  { value: 'medicamentos', label: 'Medicamentos' },
  { value: 'juguetes', label: 'Juguetes' },
  { value: 'enseres', label: 'Enseres' },
  { value: 'otros', label: 'Otros' },
];

export function AddItemSection({ onAddItem }: AddItemSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [quantity, setQuantity] = useState<string>('1');
  const [price, setPrice] = useState<string>('0.00'); // Optional price
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [donationDate, setDonationDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddItem = () => {
    if (!selectedProduct) {
      toast.error("Seleccione un producto");
      return;
    }
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Cantidad inválida");
      return;
    }

    onAddItem({
      tempId: crypto.randomUUID(),
      producto: selectedProduct,
      cantidad: qty,
      precio: parseFloat(price) || 0,
      fechaVencimiento: expiryDate || undefined,
      fechaDonacion: donationDate || undefined
    });

    // Reset fields
    setSelectedProduct(null);
    setQuantity('1');
    setPrice('0.00');
    setExpiryDate('');
    toast.success("Ítem agregado a la lista");
  };

  const handleProductCreated = (product: Producto) => {
    setSelectedProduct(product);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-5 mt-6">
      <h3 className="text-gray-700 font-semibold mb-4 text-base border-b pb-2">
        2. Items de la Donación (Registro a Stock)
      </h3>
      
      <div className="bg-white border rounded-lg p-4 shadow-sm border-dashed border-gray-300">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Añadir Nuevo Ítem</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Category Filter */}
          <Select
            label="Categoría"
            options={CATEGORIES}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          />
          
          {/* Product Search */}
          <div className="lg:col-span-3">
             <ProductSearch
               categoryFilter={selectedCategory || undefined}
               selectedId={selectedProduct?.id}
               onSelect={setSelectedProduct}
               onCreateRequest={() => setIsModalOpen(true)}
             />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <Input
            label="Cantidad Exacta"
            type="number"
            min="0.01"
            step="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          
          <Select
             label="Unidad"
             disabled
             options={[{ value: selectedProduct?.unidad_medida || 'unidad', label: selectedProduct?.unidad_medida || 'Unidad(es)' }]}
             value={selectedProduct?.unidad_medida || 'unidad'}
          />

          <Input
            label="Fecha Donación"
            type="date"
            value={donationDate}
            onChange={(e) => setDonationDate(e.target.value)}
          />

          <Input
            label="Fecha Vencimiento (Opcional)"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />

          <Input
            label="Precio Unitario (Opcional)"
            type="number"
            min="0"
            step="0.01"
            placeholder="$ 0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="md:col-span-2 lg:col-span-1" 
          />
        </div>

        <div className="flex justify-end mt-4">
          <Button 
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 w-full sm:w-auto"
            onClick={handleAddItem}
          >
            <Plus className="w-4 h-4 mr-2" />
            Añadir Ítem a la Lista
          </Button>
        </div>
      </div>

      <CreateProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleProductCreated}
      />
    </div>
  );
}
