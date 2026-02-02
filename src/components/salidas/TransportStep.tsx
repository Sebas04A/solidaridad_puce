import React from 'react';
import { DespachoState } from '../../types/salidas';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface Props {
  state: DespachoState;
  updateState: (updates: Partial<DespachoState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const TransportStep: React.FC<Props> = ({ state, updateState, onNext, onBack }) => {
  const isValid = state.transportType === 'institucional' || 
                 (state.transportType === 'externo' && state.transportCost >= 0);

  const calculateTotal = () => {
    const itemsTotal = state.items.reduce((acc, item) => acc + (item.cantidad * (item.producto.precio_referencial || 0)), 0);
    return itemsTotal + (state.transportType === 'externo' ? state.transportCost : 0);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-4">Información de Transporte</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => updateState({ transportType: 'institucional', transportCost: 0 })}
            className={`p-6 border rounded-xl flex flex-col items-center gap-2 transition
              ${state.transportType === 'institucional' ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600' : 'hover:bg-gray-50'}`}
          >
            <span className="text-2xl">🚛</span>
            <span className="font-semibold">Institucional (PUCE)</span>
            <span className="text-xs text-gray-500">Sin costo adicional</span>
          </button>
          
          <button
            onClick={() => updateState({ transportType: 'externo' })}
            className={`p-6 border rounded-xl flex flex-col items-center gap-2 transition
              ${state.transportType === 'externo' ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600' : 'hover:bg-gray-50'}`}
          >
            <span className="text-2xl">🤝</span>
            <span className="font-semibold">Externo / Contratado</span>
            <span className="text-xs text-gray-500">Requiere registro de costo</span>
          </button>
        </div>

        {state.transportType === 'externo' && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Costo del Flete (USD)
            </label>
            <Input 
              type="number"
              min="0"
              step="0.01"
              value={state.transportCost}
              onChange={(e) => updateState({ transportCost: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
            <p className="text-xs text-gray-500 mt-1">Este valor se sumará al reporte económico.</p>
          </div>
        )}
      </div>

      <div className="border-t pt-6">
        <h3 className="font-bold text-lg mb-4">Resumen Preliminar</h3>
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
             <span className="text-gray-600">Items ({state.items.length})</span>
             <span className="font-medium">${state.items.reduce((acc, item) => acc + (item.cantidad * (item.producto.precio_referencial || 0)), 0).toFixed(2)}</span>
          </div>
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
             <span className="text-gray-600">Transporte</span>
             <span className="font-medium">${state.transportCost.toFixed(2)}</span>
          </div>
          <div className="p-4 flex justify-between items-center bg-blue-50 text-blue-800">
             <span className="font-bold">Total Estimado</span>
             <span className="font-bold text-xl">${calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button onClick={onBack} variant="secondary">Atrás</Button>
        <Button onClick={onNext} disabled={!isValid} variant="primary">
          Continuar a Revisión
        </Button>
      </div>
    </div>
  );
};
