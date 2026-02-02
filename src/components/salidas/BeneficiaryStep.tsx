import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { DespachoState, Beneficiary } from '../../types/salidas';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { BeneficiaryFormModal } from './BeneficiaryFormModal';
import { Plus } from 'lucide-react';

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Beneficiaries
  const fetchBeneficiaries = async () => {
    const { data } = await supabase.from('beneficiarios').select('*').order('nombre');
    if (data) setBeneficiaries(data);
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  // Handle new beneficiary created
  const handleBeneficiaryCreated = (newId: number) => {
    fetchBeneficiaries();
    updateState({ beneficiaryId: newId });
  };

  // Find selected beneficiary
  const selectedBeneficiary = useMemo(() => {
    return beneficiaries.find(b => b.id === state.beneficiaryId);
  }, [beneficiaries, state.beneficiaryId]);

  // Build beneficiary info string
  const beneficiaryInfoText = useMemo(() => {
    if (!selectedBeneficiary) return '...';
    const parts = [];
    if (selectedBeneficiary.provincia) parts.push(selectedBeneficiary.provincia);
    if (selectedBeneficiary.canton) parts.push(selectedBeneficiary.canton);
    if (selectedBeneficiary.parroquia) parts.push(selectedBeneficiary.parroquia);
    if (selectedBeneficiary.sector) parts.push(`Sector: ${selectedBeneficiary.sector}`);
    return parts.length > 0 ? parts.join(' - ') : 'Sin información de ubicación';
  }, [selectedBeneficiary]);

  // Validation: if motivo is 'otro', motivoDetalle is required
  const isValid = state.beneficiaryId && state.motivo &&
    (state.motivo !== 'otro' || (state.motivoDetalle && state.motivoDetalle.trim().length > 0));

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Identificación del Destinatario y Motivo</h2>
        <p className="text-sm text-gray-500 mb-6">Seleccione la comunidad u organización que recibirá la ayuda.</p>

        {/* Beneficiary Selector */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organización / Beneficiario</label>
            <div className="flex gap-2">
              <select
                className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={state.beneficiaryId || ''}
                onChange={(e) => updateState({ beneficiaryId: Number(e.target.value) })}
              >
                <option value="">Seleccione un beneficiario...</option>
                {beneficiaries.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nombre} {b.sector ? `(${b.sector})` : ''}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsModalOpen(true)}
                className="shrink-0"
              >
                <Plus className="w-4 h-4 mr-1" />
                Nuevo
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de la Ayuda</label>
            <div className="grid grid-cols-2 gap-2">
              {MOTIVOS.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => updateState({ motivo: m as any })}
                  className={`p-2 border rounded-md text-sm capitalize transition-colors
                      ${state.motivo === m ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'hover:bg-gray-50'}`}
                >
                  {m.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional: Show text field when 'otro' is selected */}
          {state.motivo === 'otro' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especifique el motivo <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Describa el motivo del despacho..."
                value={state.motivoDetalle}
                onChange={(e) => updateState({ motivoDetalle: e.target.value })}
                error={state.motivo === 'otro' && !state.motivoDetalle?.trim() ? 'Este campo es requerido' : undefined}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación del Beneficiario</label>
            <Input
              disabled
              value={beneficiaryInfoText}
            />
          </div>

          {/* Only show Detalle if motivo is NOT 'otro' (since 'otro' already has the required field above) */}
          {state.motivo !== 'otro' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Detalle (Opcional)</label>
              <Input
                placeholder="Ej. Damnificados del sector norte..."
                value={state.motivoDetalle}
                onChange={(e) => updateState({ motivoDetalle: e.target.value })}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={onNext} disabled={!isValid} variant="primary">
          Siguiente
        </Button>
      </div>

      {/* Modal for creating new beneficiary */}
      <BeneficiaryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleBeneficiaryCreated}
      />
    </div>
  );
};

