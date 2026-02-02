import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { DespachoState, Product, Kit, CartItem } from '../../types/salidas';
import { Button } from '../ui/Button';
import { KitManagerModal } from './KitManagerModal';

interface Props {
  state: DespachoState;
  updateState: (updates: Partial<DespachoState>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface StockInfo {
  producto_id: number;
  producto: string;
  stock_total: number;
  unidad_medida: string;
}

export const ItemSelectionStep: React.FC<Props> = ({ state, updateState, onNext, onBack }) => {
  const [activeTab, setActiveTab] = useState<'kits' | 'items'>('kits');
  const [products, setProducts] = useState<Product[]>([]);
  const [kits, setKits] = useState<Kit[]>([]);
  const [stockData, setStockData] = useState<StockInfo[]>([]);
  const [isKitManagerOpen, setIsKitManagerOpen] = useState(false);

  // Loose Item Selection
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProducts();
    fetchKits();
    fetchStock();
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

  const fetchStock = async () => {
    const { data } = await supabase
      .from('v_stock_actual')
      .select('producto_id, producto, stock_total, unidad_medida');
    if (data) setStockData(data as StockInfo[]);
  };

  // Get stock for selected product
  const selectedProductStock = useMemo(() => {
    if (!selectedProduct) return null;
    const productId = Number(selectedProduct);
    return stockData.find(s => s.producto_id === productId);
  }, [selectedProduct, stockData]);

  // Get stock for a product by ID
  const getProductStock = (productId: number): number => {
    const stock = stockData.find(s => s.producto_id === productId);
    return stock?.stock_total || 0;
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
            type="button"
            onClick={() => setActiveTab('kits')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'kits' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            📦 Kits Prediseñados
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('items')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'items' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            🧊 Ítems Sueltos
          </button>
        </div>

        {activeTab === 'kits' && (
          <Button type="button" size="sm" variant="outline" onClick={() => setIsKitManagerOpen(true)}>
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
                <Button type="button" className="mt-4 w-full" variant="secondary" onClick={() => addKitToCart(kit)}>
                  Agregar Kit
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-xl space-y-4">
            <h3 className="font-medium mb-3">Agregar producto individual</h3>
            <div className="flex gap-2">
              <select
                className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option value="">Seleccione producto...</option>
                {products.map(p => {
                  const stock = getProductStock(p.id);
                  return (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({p.unidad_medida}) - Stock: {stock}
                    </option>
                  );
                })}
              </select>
              <input
                type="number"
                min="1"
                className="w-20 border border-gray-300 rounded-lg p-2 text-center"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
              <Button type="button" onClick={addProductToCart} disabled={!selectedProduct}>
                + Agregar
              </Button>
            </div>

            {/* Stock Info Display */}
            {selectedProduct && selectedProductStock && (
              <div className="bg-white border rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Stock disponible:</p>
                  <p className="text-xs text-gray-500">{selectedProductStock.producto}</p>
                </div>
                <div className={`text-lg font-bold px-3 py-1 rounded-full ${selectedProductStock.stock_total > 10
                    ? 'bg-green-100 text-green-700'
                    : selectedProductStock.stock_total > 0
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                  {selectedProductStock.stock_total} {selectedProductStock.unidad_medida}
                </div>
              </div>
            )}

            {selectedProduct && !selectedProductStock && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <p className="text-sm text-red-600">⚠️ Sin stock disponible para este producto</p>
              </div>
            )}
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
                  <th className="p-2 text-center">Stock</th>
                  <th className="p-2 text-left">Origen</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {state.items.map((item) => {
                  const stock = getProductStock(item.producto.id);
                  return (
                    <tr key={item.tempId} className="border-t">
                      <td className="p-2">{item.producto.nombre}</td>
                      <td className="p-2 text-center">{item.cantidad}</td>
                      <td className="p-2 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${stock >= item.cantidad
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                          }`}>
                          {stock}
                        </span>
                      </td>
                      <td className="p-2 text-gray-500 text-xs">
                        {item.isKitItem ? '📦 Kit' : '👤 Manual'}
                      </td>
                      <td className="p-2 text-right">
                        <button type="button" onClick={() => removeItem(item.tempId)} className="text-red-500 hover:text-red-700">🗑️</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-4 mt-2">
        <Button type="button" onClick={onBack} variant="secondary">Atrás</Button>
        <Button type="button" onClick={onNext} disabled={state.items.length === 0} variant="primary">Siguiente</Button>
      </div>
    </div>
  );
};

