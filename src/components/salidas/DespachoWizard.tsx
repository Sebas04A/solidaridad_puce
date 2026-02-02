import React, { useState } from 'react';
import { DespachoState } from '../../types/salidas';
// Steps will be imported here
import { BeneficiaryStep } from './BeneficiaryStep';
import { ItemSelectionStep } from './ItemSelectionStep';
import { TransportStep } from './TransportStep';
import { ClosingStep } from './ClosingStep';


// import PreDispatchSummary from './PreDispatchSummary';
// import ClosingStep from './ClosingStep';

const STEPS = [
  'Beneficiario',
  'Selección de Artículos',
  'Transporte y Revisión',
  'Rectificación (opcional)', // This might be a separate flow or modal
  'Cierre'
];

export const DespachoWizard: React.FC = () => {
  const [state, setState] = useState<DespachoState>({
    step: 0,
    beneficiaryId: null,
    motivo: '',
    motivoDetalle: '',
    items: [],
    transportType: null,
    transportCost: 0,
    evidenceFile: null,
    evidenceUrl: null,
  });

  const nextStep = () => setState(prev => ({ ...prev, step: Math.min(prev.step + 1, STEPS.length - 1) }));
  const prevStep = () => setState(prev => ({ ...prev, step: Math.max(prev.step - 1, 0) }));

  const updateState = (updates: Partial<DespachoState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const renderStep = () => {
    switch (state.step) {
      case 0:
        return <BeneficiaryStep state={state} updateState={updateState} onNext={nextStep} />;
      case 1:
        return <ItemSelectionStep state={state} updateState={updateState} onNext={nextStep} onBack={prevStep} />;
      case 2:
        return <TransportStep state={state} updateState={updateState} onNext={nextStep} onBack={prevStep} />;
      case 3: 
        // Rectification / Closing Flow
        return <ClosingStep state={state} onBack={prevStep} />;
      default:
        return <div>Step {state.step + 1}</div>;

    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white shadow rounded-lg min-h-[600px] flex flex-col">
      {/* Stepper Header */}
      <div className="border-b px-6 py-4">
        <h1 className="text-xl font-bold text-gray-800">Registro de Despacho de Ayuda</h1>
        <div className="flex items-center mt-4 space-x-2">
          {STEPS.map((label, index) => (
            <div key={index} className={`flex items-center ${index < STEPS.length - 1 ? 'flex-1' : ''}`}>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold
                  ${state.step >= index ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}
              >
                {index + 1}
              </div>
              <span className={`ml-2 text-sm ${state.step >= index ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                {label}
              </span>
              {index < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${state.step > index ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {renderStep()}
      </div>
    </div>
  );
};
