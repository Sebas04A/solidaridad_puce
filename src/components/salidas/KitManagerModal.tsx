import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Kit, Product, KitItemWithProduct } from '../../types/salidas';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { toast } from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onKitUpdated: () => void;
}

export const KitManagerModal: React.FC<Props> = ({ isOpen, onClose, onKitUpdated }) => {
  const [kits, setKits] = useState<Kit[]>([]);
  const [selectedKit, setSelectedKit] = useState<Kit | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editItems, setEditItems] = useState<Partial<KitItemWithProduct>[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchKits();
      fetchProducts();
    }
  }, [isOpen]);

  const fetchKits = async () => {
    const { data } = await supabase
      .from('kits')
      .select('*, items:items_kit(*, producto:productos(*))')
      .order('created_at', { ascending: false });
    if (data) setKits(data as any);
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('productos').select('*').eq('activo', true);
    if (data) setProducts(data);
  };

  const handleCreate = () => {
    setSelectedKit(null);
    setEditName('');
    setEditDesc('');
    setEditItems([]);
    setIsEditing(true);
  };

  const handleEdit = (kit: Kit) => {
    setSelectedKit(kit);
    setEditName(kit.nombre);
    setEditDesc(kit.descripcion || '');
    setEditItems(kit.items || []);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editName.trim()) return toast.error('El nombre es obligatorio');
    if (editItems.length === 0) return toast.error('El kit debe tener al menos un item');

    let kitId = selectedKit?.id;

    if (!kitId) {
      // Create Kit
      // @ts-ignore
      const { data, error } = await supabase.from('kits').insert({
        nombre: editName,
        descripcion: editDesc
      }).select().single();
      
      if (error) return toast.error('Error creando kit');
      // @ts-ignore
      kitId = data.id;
    } else {
      // Update Kit
      // @ts-ignore
      await supabase.from('kits').update({
        nombre: editName,
        descripcion: editDesc
      }).eq('id', kitId);
      
      // Delete old items to simpler replacement
      await supabase.from('items_kit').delete().eq('kit_id', kitId);
    }

    // Insert Items
    const itemsToInsert = editItems.map(item => ({
      kit_id: kitId,
      producto_id: item.producto_id,
      cantidad: item.cantidad
    }));

    // @ts-ignore
    const { error: itemsError } = await supabase.from('items_kit').insert(itemsToInsert);

    if (itemsError) {
      toast.error('Error guardando items');
    } else {
      toast.success('Kit guardado correctamente');
      setIsEditing(false);
      fetchKits();
      onKitUpdated();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este kit?')) return;
    const { error } = await supabase.from('kits').delete().eq('id', id);
    if (error) toast.error('Error al eliminar');
    else {
      toast.success('Kit eliminado');
      fetchKits();
      onKitUpdated();
    }
  };

  const addItemToEdit = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    setEditItems(prev => {
      const existing = prev.find(i => i.producto_id === productId);
      if (existing) {
        return prev.map(i => i.producto_id === productId ? { ...i, cantidad: (i.cantidad || 0) + 1 } : i);
      }
      return [...prev, { producto_id: productId, producto: product, cantidad: 1 }];
    });
  };

  const updateItemQty = (productId: number, qty: number) => {
    setEditItems(prev => prev.map(i => i.producto_id === productId ? { ...i, cantidad: qty } : i).filter(i => (i.cantidad || 0) > 0));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gestión de Kits">
      <div className="min-w-[600px] min-h-[400px]">
        {isEditing ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{selectedKit ? 'Editar Kit' : 'Nuevo Kit'}</h3>
              <Button onClick={() => setIsEditing(false)} variant="secondary">Cancelar</Button>
            </div>
            
            <Input label="Nombre del Kit" value={editName} onChange={e => setEditName(e.target.value)} />
            <Input label="Descripción" value={editDesc} onChange={e => setEditDesc(e.target.value)} />
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Items del Kit</h4>
              <div className="flex gap-2 mb-2">
                 <select 
                   className="flex-1 border rounded p-2"
                   onChange={(e) => {
                      addItemToEdit(Number(e.target.value));
                      e.target.value = '';
                   }}
                 >
                    <option value="">Agregar producto...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre} ({p.unidad_medida})</option>
                    ))}
                 </select>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto bg-gray-50 p-2 rounded">
                {editItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span>{item.producto?.nombre}</span>
                    <div className="flex items-center gap-2">
                       <input 
                         type="number" 
                         min="1" 
                         className="w-16 border rounded p-1"
                         value={item.cantidad}
                         onChange={e => updateItemQty(item.producto_id!, Number(e.target.value))}
                       />
                       <button onClick={() => updateItemQty(item.producto_id!, 0)} className="text-red-500">X</button>
                    </div>
                  </div>
                ))}
                {editItems.length === 0 && <p className="text-gray-400 text-center">Sin items</p>}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button onClick={handleSave} variant="primary">Guardar Kit</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
             <Button onClick={handleCreate} className="w-full bg-green-600 hover:bg-green-700 text-white">
                + Crear Nuevo Kit
             </Button>

             <div className="grid gap-4 max-h-[400px] overflow-y-auto">
                {kits.map(kit => (
                  <div key={kit.id} className="border p-4 rounded-lg flex justify-between items-center hover:shadow-md transition">
                    <div>
                      <h4 className="font-bold">{kit.nombre}</h4>
                      <p className="text-sm text-gray-500">{kit.items?.length || 0} productos</p>
                      <p className="text-xs text-gray-400">{kit.descripcion}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleEdit(kit)}>Editar</Button>
                      <Button size="sm" className="bg-red-100 text-red-600 hover:bg-red-200" onClick={() => handleDelete(kit.id)}>Eliminar</Button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
