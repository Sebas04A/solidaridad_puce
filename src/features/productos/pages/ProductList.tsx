
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Plus, Search, Edit, Eye } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable as Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { CreateProductModal } from '../components/CreateProductModal';
import { ProductDetailModal } from '../components/ProductDetailModal';
import type { Producto } from '../types/productos.types';

const CATEGORY_LABELS: Record<string, string> = {
  alimentos: 'Alimentos',
  ropa: 'Ropa',
  higiene: 'Higiene',
  medicamentos: 'Medicamentos',
  juguetes: 'Juguetes',
  enseres: 'Enseres',
  otros: 'Otros',
};

const CLIMA_LABELS: Record<string, string> = {
  costa: '☀️ Costa',
  sierra: '❄️ Sierra',
  ambos: '🌍 Ambos',
};

export function ProductList() {
  const [search, setSearch] = useState('');
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Producto | null>(null);

  const queryClient = useQueryClient();

  // 1. Fetch Products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['productos', search],
    queryFn: async () => {
      let query = supabase
        .from('productos')
        .select('*')
        .order('nombre', { ascending: true });

      if (search) {
        query = query.ilike('nombre', `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Producto[];
    }
  });

  // 2. Format Table Columns
  const columns = [
    { key: 'nombre', header: 'Producto' },
    { 
      key: 'categoria', 
      header: 'Categoría',
      render: (item: Producto) => (
        <Badge variant="info">{CATEGORY_LABELS[item.categoria] || item.categoria}</Badge>
      )
    },
    { 
      key: 'clima', 
      header: 'Clima',
      render: (item: Producto) => CLIMA_LABELS[item.clima] || item.clima
    },
    { key: 'unidad_medida', header: 'Unidad' },
    { 
      key: 'precio_referencial', 
      header: 'Precio Ref.',
      render: (item: Producto) => `$${(item.precio_referencial || 0).toFixed(2)}`
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (item: Producto) => (
        <div className="flex gap-2">
           <Button variant="ghost" size="sm" onClick={() => setViewingProduct(item)}>
             <Eye className="w-4 h-4 text-gray-500" />
           </Button>
           <Button variant="ghost" size="sm" onClick={() => {
             setEditingProduct(item);
             setIsCreateOpen(true);
           }}>
             <Edit className="w-4 h-4 text-blue-500" />
           </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500">Catálogo de productos del centro de acopio</p>
        </div>
        <Button onClick={() => {
            setEditingProduct(null);
            setIsCreateOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row items-center gap-4 p-4">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          {/* Add Category Filter here if needed */}
        </div>
      </Card>

      <Table
        data={products}
        columns={columns}
        emptyMessage={isLoading ? "Cargando..." : "No hay productos registrados"}
      />

      {/* Create/Edit Modal */}
      {isCreateOpen && (
        <CreateProductModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
             queryClient.invalidateQueries({ queryKey: ['productos'] });
             setIsCreateOpen(false);
          }}
          product={editingProduct} 
        />
      )}

      {/* View Detail Modal */}
      {viewingProduct && (
        <ProductDetailModal
          isOpen={!!viewingProduct}
          onClose={() => setViewingProduct(null)}
          data={viewingProduct} 
        />
      )}
    </div>
  );
}
