import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DespachoState, Product, Kit, CartItem } from '../../types/salidas';
import { Button } from '../ui/Button';
import { KitManagerModal } from './KitManagerModal';
// import { toast } from 'react-hot-toast'; // Assuming installed

interface Props {
  state: DespachoState;
  updateState: (updates: Partial<DespachoState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const ItemSelectionStep: React.FC<Props> = ({ state, updateState, onNext, onBack }) => {
  const [activeTab, setActiveTab] = useState<'kits' | 'items'>('kits');
  const [products, setProducts] = useState<Product[]>([]);
  const [kits, setKits] = useState<Kit[]>([]);
  const [isKitManagerOpen, setIsKitManagerOpen] = useState(false);


  // Loose Item Selection
  const [selectedProduct, setSelectedProduct] = useState<string>(''); // ID as string for select
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProducts();
    fetchKits();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from('productos').select('*').eq('activo', true);
    if (data) setProducts(data);
  };

  const fetchKits = async () => {
    const { data } = await supabase
      .from('kits')
      .select('*, items:items_kit(*, producto:productos(*))')
      .order('nombre');
    if (data) setKits(data as any);
  };

  const addKitToCart = (kit: Kit) => {
    // Explode kit into items
    const newItems: CartItem[] = (kit.items || []).map(item => ({
      tempId: Math.random().toString(36).substr(2, 9),
      producto: item.producto!,
      cantidad: item.cantidad,
      kitId: kit.id,
      isKitItem: true
    }));

    updateState({ items: [...state.items, ...newItems] });
  };

  const addProductToCart = () => {
    const prod = products.find(p => p.id === Number(selectedProduct));
    if (!prod) return;

    // Climate Warning Logic
    // Assumption: 'state.beneficiaryId' -> we need to fetch beneficiary details to get location? 
    // Or we rely on user knowing? 
    // The requirement says: "compare classification_climatic (Sierra/Costa) with destination entered"
    // Since we don't have the destination in full detail in state yet (only ID), we might need to fetch it or store it better in Step 1.
    // For now, we will add the item.

    const newItem: CartItem = {
      tempId: Math.random().toString(36).substr(2, 9),
      producto: prod,
      cantidad: quantity,
      isKitItem: false
    };

    updateState({ items: [...state.items, newItem] });
    setQuantity(1);
    setSelectedProduct('');
  };

  const removeItem = (tempId: string) => {
    updateState({ items: state.items.filter(i => i.tempId !== tempId) });
  };

  return (
    <div className="p-6 h-full flex flex-col">
       <KitManagerModal 
         isOpen={isKitManagerOpen} 
         onClose={() => setIsKitManagerOpen(false)} 
         onKitUpdated={fetchKits}
       />

       <div className="flex justify-between items-center mb-4">
         <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
           <button 
             onClick={() => setActiveTab('kits')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'kits' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
           >
             📦 Kits Prediseñados
           </button>
           <button 
             onClick={() => setActiveTab('items')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'items' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
           >
             🧊 Ítems Sueltos
           </button>
         </div>

         {activeTab === 'kits' && (
           <Button size="sm" variant="outline" onClick={() => setIsKitManagerOpen(true)}>
             ⚙️ Administrar Kits
           </Button>
         )}
       </div>

       <div className="flex-1 overflow-y-auto mb-6">
         {activeTab === 'kits' ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kits.map(kit => (
                <div key={kit.id} className="border rounded-xl p-4 hover:shadow-lg transition bg-white flex flex-col">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{kit.nombre}</h3>
                    <p className="text-xs text-gray-500 mb-2">{kit.descripcion}</p>
                    <div className="text-sm bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">
                      {kit.items?.slice(0, 3).map((i, idx) => (
                        <div key={idx} className="flex justify-between text-gray-600">
                          <span>{i.producto?.nombre}</span>
                          <span>x{i.cantidad}</span>
                        </div>
                      ))}
                      {(kit.items?.length || 0) > 3 && <span className="text-xs text-blue-500">+{kit.items!.length - 3} más...</span>}
                    </div>
                  </div>
                  <Button className="mt-4 w-full" variant="secondary" onClick={() => addKitToCart(kit)}>
                    Agregar Kit
                  </Button>
                </div>
              ))}
           </div>
         ) : (
           <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-medium mb-3">Agregar producto individual</h3>
              <div className="flex gap-2">
                 <select 
                   className="flex-1 border rounded-md p-2"
                   value={selectedProduct}
                   onChange={(e) => setSelectedProduct(e.target.value)}
                 >
                   <option value="">Seleccione producto...</option>
                   {products.map(p => (
                     <option key={p.id} value={p.id}>{p.nombre} ({p.unidad_medida})</option>
                   ))}
                 </select>
                 <input 
                   type="number" 
                   min="1" 
                   className="w-20 border rounded-md p-2"
                   value={quantity}
                   onChange={(e) => setQuantity(Number(e.target.value))}
                 />
                 <Button onClick={addProductToCart} disabled={!selectedProduct}>
                   + Agregar
                 </Button>
              </div>
           </div>
         )}
       </div>

       {/* Cart Summary (Always Visible) */}
       <div className="border-t pt-4">
         <h4 className="font-bold mb-2">Resumen del Despacho ({state.items.length} items)</h4>
         <div className="bg-white border rounded-lg max-h-48 overflow-y-auto">
           {state.items.length === 0 ? (
             <div className="p-4 text-center text-gray-400">El carrito está vacío</div>
           ) : (
             <table className="w-full text-sm">
               <thead className="bg-gray-50">
                 <tr>
                   <th className="p-2 text-left">Producto</th>
                   <th className="p-2 text-center">Cant.</th>
                   <th className="p-2 text-left">Origen</th>
                   <th className="p-2"></th>
                 </tr>
               </thead>
               <tbody>
                 {state.items.map((item) => (
                   <tr key={item.tempId} className="border-t">
                     <td className="p-2">{item.producto.nombre}</td>
                     <td className="p-2 text-center">{item.cantidad}</td>
                     <td className="p-2 text-gray-500 text-xs">
                       {item.isKitItem ? '📦 Kit' : '👤 Manual'}
                     </td>
                     <td className="p-2 text-right">
                       <button onClick={() => removeItem(item.tempId)} className="text-red-500 hover:text-red-700">🗑️</button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           )}
         </div>
       </div>

       <div className="flex justify-between pt-4 mt-2">
         <Button onClick={onBack} variant="secondary">Atrás</Button>
         <Button onClick={onNext} disabled={state.items.length === 0} variant="primary">Siguiente</Button>
       </div>
    </div>
  );
};
