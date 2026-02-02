
import { DonanteSearch } from '../../donantes/components/DonanteSearch';
import { Donante } from '../../donantes/types/donantes.types';
import { cn } from '@/lib/utils';

interface DonationDetailsSectionProps {
  donorType: 'persona' | 'empresa';
  onTypeChange: (type: 'persona' | 'empresa') => void;
  selectedDonor: Donante | null;
  onDonorSelect: (donante: Donante | null) => void;
  newDonorName: string;
  onNewDonorNameChange: (name: string) => void;
}

export function DonationDetailsSection({
  donorType,
  onTypeChange,
  selectedDonor,
  onDonorSelect,
  newDonorName,
  onNewDonorNameChange
}: DonationDetailsSectionProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-5">
      <h3 className="text-gray-700 font-semibold mb-4 text-base">
        1. Detalle de Procedencia (Donante)
      </h3>
      
      <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-500 mb-6">
        Ingrese el nombre. Si no existe en nuestro sistema, será registrado automáticamente.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Donor Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de Donante
          </label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <div 
                className={cn(
                  "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                  donorType === 'persona' ? "border-primary-500" : "border-gray-300"
                )}
              >
                {donorType === 'persona' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                )}
              </div>
              <input 
                type="radio" 
                name="donorType" 
                value="persona" 
                className="hidden" 
                checked={donorType === 'persona'}
                onChange={() => onTypeChange('persona')}
              />
              <span className="text-sm text-gray-700">Persona</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <div 
                className={cn(
                  "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                  donorType === 'empresa' ? "border-primary-500" : "border-gray-300"
                )}
              >
                {donorType === 'empresa' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                )}
              </div>
              <input 
                type="radio" 
                name="donorType" 
                value="empresa" 
                className="hidden" 
                checked={donorType === 'empresa'}
                onChange={() => onTypeChange('empresa')}
              />
              <span className="text-sm text-gray-700">Empresa / Institución</span>
            </label>
          </div>
        </div>

        {/* Donor Search */}
        <div>
          <DonanteSearch
            selectedId={selectedDonor?.id}
            onSelect={onDonorSelect}
            onNewName={onNewDonorNameChange}
          />
          {newDonorName && !selectedDonor && (
             <p className="mt-1 text-xs text-green-600 font-medium">
               Se registrará como nuevo donante: "{newDonorName}"
             </p>
          )}
        </div>
      </div>
    </div>
  );
}
