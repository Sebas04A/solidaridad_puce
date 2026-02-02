import React, { useState } from 'react';
import { DespachoState } from '../../types/salidas';
import { Button } from '../ui/Button';
import { RectificationModal } from './RectificationModal';
import { toast } from 'react-hot-toast';


interface Props {
  state: DespachoState;
  onBack: () => void;
}

export const ClosingStep: React.FC<Props> = ({ state, onBack }) => {
  const [isRectifying, setIsRectifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // This step assumes we are reviewing -> rectifying -> saving.
  // Or maybe we save first? 
  // Let's follow: Review -> Open Rectification Modal -> Confirm -> Save everything.

  const handleFinalize = async (adjustments: Record<string, number>) => {
    setIsSaving(true);
    try {
      // 1. Create Dispatch Header
      /*
      const { data: dispatch, error: dError } = await supabase.from('despachos').insert({
        beneficiario_id: state.beneficiaryId,
        motivo: state.motivo,
        motivo_detalle: state.motivoDetalle,
        tipo_transporte: state.transportType,
        costo_transporte: state.transportCost,
        preparado_por: 'USER_ID_HERE', // TODO: Get auth user
        estado: 'despachado' // or 'validado' depending on role
      }).select().single();
      
      if (dError) throw dError;

      // 2. Create Items & Mermas
      for (const item of state.items) {
        const realQty = adjustments[item.tempId] !== undefined ? adjustments[item.tempId] : item.cantidad;
        const diff = realQty - item.cantidad;

        // Insert Egreso
        await supabase.from('egresos').insert({
          despacho_id: dispatch.id,
          lote_id: 1, // TODO: FEFO Logic to pick lote_id! This is complex backend logic usually.
                      // For prototype, we might pick the first available lot or assume BE function does it.
                      // We will need a stored procedure or simple logic here.
          cantidad_solicitada: item.cantidad,
          cantidad_despachada: realQty
        });

        // Insert Merma if diff < 0
        if (diff < 0) {
           await supabase.from('mermas').insert({
             despacho_id: dispatch.id,
             lote_id: 1, // Same lote
             cantidad_faltante: Math.abs(diff),
             motivo: 'Rectificación en Despacho'
           });
        }
      }
      */
     
      // Simulation for now
      console.log("Saving Dispatch with Adjustments:", adjustments);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Despacho registrado correctamente");
      // Redirect or Reset
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
        <br/>
        Costo estimado de transporte: ${state.transportCost}
      </p>

      <div className="flex gap-4 justify-center">
        <Button variant="secondary" onClick={onBack}>Volver a Revisar</Button>
        <Button 
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
