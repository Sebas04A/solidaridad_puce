import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DespachoState, Beneficiary } from '../../types/salidas';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface Props {
  state: DespachoState;
  updateState: (updates: Partial<DespachoState>) => void;
  onNext: () => void;
}

const MOTIVOS = [
  'terremoto', 'inundacion', 'incendio', 'deslizamiento', 'sequia', 'pandemia', 'pobreza_extrema', 'otro'
];

export const BeneficiaryStep: React.FC<Props> = ({ state, updateState, onNext }) => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  // const [loading, setLoading] = useState(false);
  // const [searchTerm, setSearchTerm] = useState('');

  // Fetch Beneficiaries on mount
  useEffect(() => {
    const fetchBeneficiaries = async () => {
      const { data } = await supabase.from('beneficiarios').select('*');
      if (data) setBeneficiaries(data);
    };
    fetchBeneficiaries();
  }, []);
  
  // For now, hardcode some since I can't easily hook up supabase without checking client code
  // I will leave the hook commented out and provide specific instructions to user or check client file in next turn.

  const isValid = state.beneficiaryId && state.motivo;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Identificación del Destinatario y Motivo</h2>
        <p className="text-sm text-gray-500 mb-6">Seleccione la comunidad u organización que recibirá la ayuda.</p>

        {/* Beneficiary Selector */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organización / Beneficiario</label>
             {/* Simple Select for now, ideally Combobox */}
             <select 
               className="w-full border rounded-md p-2"
               value={state.beneficiaryId || ''}
               onChange={(e) => updateState({ beneficiaryId: Number(e.target.value) })}
             >
               <option value="">Seleccione un beneficiario...</option>
               {/* Iterate real data here */}
               {beneficiaries.map((b) => (
                 <option key={b.id} value={b.id}>
                   {b.nombre} {b.sector ? `(${b.sector})` : ''}
                 </option>
               ))}
             </select>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de la Ayuda</label>
             <div className="grid grid-cols-2 gap-2">
                {MOTIVOS.map(m => (
                  <button
                    key={m}
                    onClick={() => updateState({ motivo: m as any })}
                    className={`p-2 border rounded-md text-sm capitalize transition-colors
                      ${state.motivo === m ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'hover:bg-gray-50'}`}
                  >
                    {m.replace('_', ' ')}
                  </button>
                ))}
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Provincia / Sector (Lectura)</label>
             <Input 
                disabled 
                value={state.beneficiaryId ? "Información automática del beneficiario seleccionado" : "..."} 
             />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Detalle (Opcional)</label>
             <Input 
                placeholder="Ej. Damnificados del sector norte..." 
                value={state.motivoDetalle}
                onChange={(e) => updateState({ motivoDetalle: e.target.value })}
             />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={onNext} disabled={!isValid} variant="primary">
          Siguiente
        </Button>
      </div>
    </div>
  );
};
