import React from 'react';

import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';



// NOTE: This modal is intended to be used *after* the dispatch is created in DB (status: preparing),
// or as a final check before "finalizing". context_detailed says "Justo antes de confirmar la salida definitiva".
// "El Admin edita y pone 48... Generar movimiento de Ajuste".

// Simple version for Wizard flow: 
// We are in wizard, we haven't saved to DB yet? Or are we saving at the end of Wizard?
// The Wizard conceptual flow suggests we build up state then save.
// RF-EGR-03 says "Paso obligatorio antes de finalizar el despacho".
// So, we likely save the dispatch as 'preparando', then show specific review screen where we can "Rectify".

// For this prototype, I will assume we show this modal at the "Review" step before final submission, 
// OR we submit, get an ID, and then have a "Confirmar Entrega" phase.
// Let's implement it as a component that takes a list of items and allows editing "Real Quantity".

export const RectificationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  items: { tempId: string; nombre: string; cantidad: number }[]; // Using local state items
  onConfirm: (adjustments: Record<string, number>) => void; // tempId -> realQty
}> = ({ isOpen, onClose, items, onConfirm }) => {
  const [adjustments, setAdjustments] = React.useState<Record<string, number>>({});

  const handleQtyChange = (tempId: string, qty: number) => {
    setAdjustments(prev => ({ ...prev, [tempId]: qty }));
  };

  const handleSave = () => {
    onConfirm(adjustments);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rectificación de Inventario Físico">
      <div className="min-w-[500px]">
        <div className="bg-yellow-50 p-4 rounded-md mb-4 text-sm text-yellow-800">
          ⚠️ Verifique el conteo físico antes de despachar. Si hay diferencias, se generará un registro automático de mermas.
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Producto</th>
                <th className="p-2 text-center">Cant. Sistema</th>
                <th className="p-2 text-center">Cant. Real (Física)</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const realQty = adjustments[item.tempId] !== undefined ? adjustments[item.tempId] : item.cantidad;
                const diff = realQty - item.cantidad;
                
                return (
                  <tr key={item.tempId} className="border-b">
                    <td className="p-2 font-medium">{item.nombre}</td>
                    <td className="p-2 text-center">{item.cantidad}</td>
                    <td className="p-2 text-center">
                      <input 
                        type="number"
                        min="0"
                        className={`w-20 p-1 border rounded text-center font-bold
                          ${diff < 0 ? 'text-red-600 border-red-300 bg-red-50' : 'text-green-600'}`}
                        value={realQty}
                        onChange={(e) => handleQtyChange(item.tempId, Number(e.target.value))}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-4 gap-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave}>Confirmar Despacho</Button>
        </div>
      </div>
    </Modal>
  );
};
