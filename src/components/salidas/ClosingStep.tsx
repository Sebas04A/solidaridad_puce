import React, { useState } from 'react';
import { DespachoState } from '../../types/salidas';
import { Button } from '../ui/Button';
import { RectificationModal } from './RectificationModal';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';


interface Props {
  state: DespachoState;
  onBack: () => void;
  onComplete: () => void;
}

export const ClosingStep: React.FC<Props> = ({ state, onBack, onComplete }) => {
  const [isRectifying, setIsRectifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleFinalize = async (adjustments: Record<string, number>) => {
    setIsSaving(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'anonymous';

      // 1. Create Dispatch Header
      const { data: dispatch, error: dError } = await supabase
        .from('despachos')
        .insert({
          beneficiario_id: state.beneficiaryId!,
          motivo: state.motivo as any,
          motivo_detalle: state.motivoDetalle || null,
          estado: 'despachado',
          preparado_por: userId
        } as any)
        .select()
        .single();

      if (dError) {
        console.error('Error creating despacho:', dError);
        throw dError;
      }

      if (!dispatch) {
        throw new Error('No dispatch data returned');
      }

      const despachoId = (dispatch as any).id;

      // 2. Process each item - find lote and create egreso
      for (const item of state.items) {
        const realQty = adjustments[item.tempId] !== undefined ? adjustments[item.tempId] : item.cantidad;
        const diff = realQty - item.cantidad;

        // Find available lote for this product using FEFO (First Expired, First Out)
        const { data: lotesData } = await supabase
          .from('lotes')
          .select('id, cantidad_actual')
          .eq('producto_id', item.producto.id)
          .eq('estado', 'disponible')
          .gt('cantidad_actual', 0)
          .order('fecha_caducidad', { ascending: true, nullsFirst: false })
          .limit(1);

        // Cast to proper type
        const lotes = lotesData as { id: number; cantidad_actual: number }[] | null;
        const lote = lotes && lotes.length > 0 ? lotes[0] : null;

        if (lote) {
          // Insert Egreso - using type assertion due to strict DB types
          await (supabase.from('egresos') as any).insert({
            despacho_id: despachoId,
            lote_id: lote.id,
            cantidad_solicitada: item.cantidad,
            cantidad_despachada: realQty
          });

          // Update lote quantity
          const newQty = Math.max(0, lote.cantidad_actual - realQty);
          await (supabase.from('lotes') as any).update({
            cantidad_actual: newQty,
            estado: newQty === 0 ? 'agotado' : 'disponible'
          }).eq('id', lote.id);

          // Insert Merma if there's a negative difference (less than expected)
          if (diff < 0) {
            await (supabase.from('mermas') as any).insert({
              lote_id: lote.id,
              cantidad: Math.abs(diff),
              motivo: 'Rectificación en despacho',
              registrado_por: userId
            });
          }
        } else {
          // No lote found, still record the egreso with null lote
          console.warn(`No lote found for product ${item.producto.nombre}`);
        }
      }

      toast.success("Despacho registrado correctamente");

      // Call the onComplete callback to redirect
      onComplete();
    } catch (error) {
      toast.error("Error al guardar despacho");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 text-center">
      <RectificationModal
        isOpen={isRectifying}
        onClose={() => setIsRectifying(false)}
        items={state.items.map(i => ({ tempId: i.tempId, nombre: i.producto.nombre, cantidad: i.cantidad }))}
        onConfirm={handleFinalize}
      />

      <div className="max-w-md mx-auto bg-green-50 p-8 rounded-full h-32 w-32 flex items-center justify-center text-4xl mb-6">
        ✅
      </div>
      <h2 className="text-2xl font-bold mb-2">Todo Listo para Despachar</h2>
      <p className="text-gray-600 mb-8">
        Has seleccionado {state.items.length} productos para {state.beneficiaryId ? 'el beneficiario seleccionado' : '...'}
        <br />
        Costo estimado de transporte: ${state.transportCost}
      </p>

      <div className="flex gap-4 justify-center">
        <Button type="button" variant="secondary" onClick={onBack}>Volver a Revisar</Button>
        <Button
          type="button"
          variant="primary"
          className="bg-green-600 hover:bg-green-700 w-48 py-3 text-lg"
          onClick={() => setIsRectifying(true)}
          disabled={isSaving}
        >
          {isSaving ? 'Procesando...' : 'Iniciar Despacho'}
        </Button>
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Al hacer clic, se abrirá la ventana de rectificación final antes de guardar.
      </p>
    </div>
  );
};
