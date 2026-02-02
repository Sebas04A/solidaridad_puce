
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { triajeService } from '../services/triajeService';
import type { TriajeItem, TriajeProcessItem, TriajeDiscardItem } from '../types/triaje.types';
import { toast } from 'react-hot-toast';
import { Loader2, ArrowLeft, Plus, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { Modal } from '@/components/ui/Modal';

// Helper for product selection
interface ProductOption {
  id: number;
  nombre: string;
  unidad_medida: string;
}

export default function TriajeProcessPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bulto, setBulto] = useState<TriajeItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Local State for New Items & Discards
  const [validItems, setValidItems] = useState<TriajeProcessItem[]>([]);
  const [discardItems, setDiscardItems] = useState<TriajeDiscardItem[]>([]);

  // Form State for Adding Item
  const [newItemProdId, setNewItemProdId] = useState<string>('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemExpiry, setNewItemExpiry] = useState('');
  
  // Form State for Adding Discard
  const [newDiscardDesc, setNewDiscardDesc] = useState('');
  const [newDiscardQty, setNewDiscardQty] = useState('');
  const [newDiscardReason, setNewDiscardReason] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      if (!id) return;
      
      const [itemData, { data: prods }] = await Promise.all([
        triajeService.getById(parseInt(id)),
        supabase.from('productos').select('id, nombre, unidad_medida').eq('activo', true)
      ]);

      setBulto(itemData);
      setProducts(prods || []);
    } catch (error) {
      console.error(error);
      toast.error('Error cargando datos');
      navigate('/triaje');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddValidItem = () => {
    if (!newItemProdId || !newItemQty) return toast.error('Complete producto y cantidad');
    
    setValidItems([...validItems, {
      producto_id: parseInt(newItemProdId),
      cantidad: parseFloat(newItemQty),
      fecha_vencimiento: newItemExpiry || undefined
    }]);

    setNewItemProdId('');
    setNewItemQty('');
    setNewItemExpiry('');
  };

  const handleAddDiscard = () => {
    if (!newDiscardDesc || !newDiscardQty || !newDiscardReason) return toast.error('Complete los datos de descarte');

    setDiscardItems([...discardItems, {
      descripcion: newDiscardDesc,
      cantidad: parseFloat(newDiscardQty),
      motivo_descarte: newDiscardReason
    }]);

    setNewDiscardDesc('');
    setNewDiscardQty('');
    setNewDiscardReason('');
  };

  // Auxiliary effect to get lote_id if not in view
  const [realLoteId, setRealLoteId] = useState<number | null>(null);
  useEffect(() => {
    async function fetchLoteId() {
      if (bulto) {
          // Fetch the underlying lote_id from ingresos table
          const { data } = await (supabase
            .from('ingresos') as any)
            .select('lote_id')
            .eq('id', bulto.ingreso_id)
            .single();
          
          if (data) setRealLoteId(data.lote_id);
      }
    }
    fetchLoteId();
  }, [bulto]);
  
  const submitWithLoteId = async () => {
      if (!realLoteId) {
          toast.error("Error identificando el lote origen");
          return;
      }
      if (!user) return;
      
      try {
        setIsSubmitting(true);
        await triajeService.processTriaje({
            ingreso_id: bulto!.ingreso_id,
            lote_id: realLoteId,
            items: validItems,
            descartes: discardItems
        }, user.id);
        toast.success("Triaje procesado exitosamente");
        navigate('/triaje');
      } catch (error: any) {
        console.error(error);
        toast.error(error.message || "Error procesando triaje");
      } finally {
        setIsSubmitting(false);
      }
  };

  const handlePreSubmit = () => {
    if (!bulto || !user) return;
    if (validItems.length === 0 && discardItems.length === 0) {
      return toast.error("Debe registrar al menos un ítem o descarte");
    }
    setIsConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
      setIsConfirmOpen(false); // Close first
      submitWithLoteId();
  };

  if (isLoading || !bulto) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/triaje')} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Procesar Bulto {bulto.lote_codigo}</h1>
          <p className="text-sm text-gray-500">{bulto.descripcion_bulto}</p>
        </div>
      </div>

      {/* 1. Add Valid Items */}
      <Card className="border-blue-100 bg-blue-50/30">
        <CardContent className="p-4 md:p-6 space-y-4">
          <h2 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" /> Encontrado (Aprobado)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-white p-4 rounded-lg shadow-sm">
            <div className="md:col-span-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
              <select 
                className="w-full p-2 border rounded-md text-sm"
                value={newItemProdId}
                onChange={(e) => setNewItemProdId(e.target.value)}
              >
                <option value="">Seleccionar Producto...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} ({p.unidad_medida})</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
              <Input 
                type="number" 
                value={newItemQty} 
                onChange={(e) => setNewItemQty(e.target.value)}
                placeholder="0"
                className="h-[38px]" 
              />
            </div>
             <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Vencimiento</label>
              <Input 
                type="date" 
                value={newItemExpiry} 
                onChange={(e) => setNewItemExpiry(e.target.value)}
                className="h-[38px]" 
              />
            </div>
            <div className="md:col-span-1">
              <Button onClick={handleAddValidItem} size="sm" className="w-full h-[38px] bg-blue-600 hover:bg-blue-700">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* List Valid Items */}
          {validItems.length > 0 && (
            <div className="space-y-2">
              {validItems.map((item, idx) => {
                const prod = products.find(p => p.id === item.producto_id);
                return (
                  <div key={idx} className="flex justify-between items-center bg-white p-3 rounded border border-blue-100">
                    <div>
                      <span className="font-medium text-gray-900">{prod?.nombre}</span>
                      <div className="text-xs text-gray-500">Cantidad: {item.cantidad} {prod?.unidad_medida}</div>
                    </div>
                    <button 
                      onClick={() => setValidItems(items => items.filter((_, i) => i !== idx))}
                      className="text-red-500 hover:bg-red-50 p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Add Discards */}
      <Card className="border-red-100 bg-red-50/30">
        <CardContent className="p-4 md:p-6 space-y-4">
          <h2 className="text-lg font-semibold text-red-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Descarte (Basura/Dañado)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-white p-4 rounded-lg shadow-sm">
            <div className="md:col-span-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
               <Input 
                value={newDiscardDesc} 
                onChange={(e) => setNewDiscardDesc(e.target.value)}
                placeholder="Ej: Ropa sucia, Comida vencida"
                className="h-[38px]" 
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad Estimada</label>
              <Input 
                type="number" 
                value={newDiscardQty} 
                onChange={(e) => setNewDiscardQty(e.target.value)}
                placeholder="0"
                className="h-[38px]" 
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
               <select 
                className="w-full p-2 border rounded-md text-sm h-[38px]"
                value={newDiscardReason}
                onChange={(e) => setNewDiscardReason(e.target.value)}
              >
                <option value="">Motivo...</option>
                <option value="caducado">Caducado</option>
                <option value="roto">Roto / Dañado</option>
                <option value="incompleto">Incompleto</option>
                <option value="sucio">Sucio / Contaminado</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div className="md:col-span-1">
              <Button onClick={handleAddDiscard} size="sm" variant="danger" className="w-full h-[38px]">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>

           {/* List Discard Items */}
           {discardItems.length > 0 && (
            <div className="space-y-2">
              {discardItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white p-3 rounded border border-red-100">
                  <div>
                    <span className="font-medium text-red-900">{item.descripcion}</span>
                    <div className="text-xs text-red-700">Cant: {item.cantidad} | {item.motivo_descarte}</div>
                  </div>
                  <button 
                    onClick={() => setDiscardItems(items => items.filter((_, i) => i !== idx))}
                    className="text-red-500 hover:bg-red-50 p-1 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg md:static md:bg-transparent md:border-0 md:shadow-none z-10">
         <div className="max-w-4xl mx-auto flex gap-4">
            <Button 
                variant="outline" 
                className="flex-1 md:flex-none"
                onClick={() => navigate('/triaje')}
            >
                Cancelar
            </Button>
            <Button 
                className="flex-1 md:w-auto bg-green-600 hover:bg-green-700 text-white"
                onClick={handlePreSubmit}
                disabled={isSubmitting || (validItems.length === 0 && discardItems.length === 0)}
            >
                {isSubmitting ? 'Procesando...' : 'Finalizar Triaje'}
            </Button>
         </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirmar Clasificación"
      >
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Estás a punto de procesar el bulto <span className="font-bold">{bulto?.lote_codigo}</span>.
            Verifica los datos antes de continuar.
          </p>

          <div className="bg-gray-50 p-3 rounded-lg space-y-3 text-sm">
            <div>
              <h4 className="font-semibold text-gray-900 flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" /> Aprobados ({validItems.length})
              </h4>
              {validItems.length > 0 ? (
                <ul className="pl-5 list-disc text-gray-600 mt-1 space-y-1">
                   {validItems.map((item, i) => {
                      const p = products.find(x => x.id === item.producto_id);
                      return <li key={i}>{p?.nombre} x {item.cantidad}</li>
                   })}
                </ul>
              ) : <span className="text-gray-400 italic pl-5">Ninguno</span>}
            </div>

            <div className="border-t pt-2">
              <h4 className="font-semibold text-gray-900 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-red-600" /> Descartes ({discardItems.length})
              </h4>
              {discardItems.length > 0 ? (
                <ul className="pl-5 list-disc text-gray-600 mt-1 space-y-1">
                   {discardItems.map((item, i) => (
                      <li key={i}>{item.descripcion} x {item.cantidad} ({item.motivo_descarte})</li>
                   ))}
                </ul>
              ) : <span className="text-gray-400 italic pl-5">Ninguno</span>}
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Revisar
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleConfirmSubmit}>
              Confirmar y Guardar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
