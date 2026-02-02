
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Calendar, Package, Weight } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ingresosService } from '../services/ingresosService';
import { toast } from 'react-hot-toast';

export default function IngresoCrisisPage({ onBack }: { onBack?: () => void }) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [donorName, setDonorName] = useState('');
  const [fechaIngreso, setFechaIngreso] = useState(new Date().toISOString().split('T')[0]);
  const [measureType, setMeasureType] = useState<'bultos' | 'peso'>('bultos');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Usuario no autenticado");
      return;
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Cantidad inválida");
      return;
    }

    setIsSubmitting(true);
    try {
      await ingresosService.registrarCrisis(
        donorName,
        fechaIngreso,
        measureType,
        qty,
        notes,
        user.id
      );
      toast.success("Ingreso de crisis registrado como 'Por Clasificar'");
      if (onBack) onBack();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error al registrar ingreso");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-sm min-h-screen">
      {/* Header Crisis */}
      <div className="bg-orange-500 text-white -mx-6 -mt-6 p-6 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Ingreso Rápido de Emergencia</h1>
          <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-0.5 rounded-full">RF-ING-03</span>
        </div>
        {onBack && (
          <button onClick={onBack} className="text-white hover:text-orange-100 transition-colors">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-8 text-sm text-orange-800">
        <p className="font-medium">MODO CRISIS: Enfocado en velocidad.</p> 
        La donación se marcará como "Por Clasificar" y entrará a cuarentena de inventario.
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. Origen y Fecha */}
        <section className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">1. Origen y Fecha</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Donante o Fuente (Opcional)"
              placeholder="Ej: Camión #3 / Donante Anónimo"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
            />
            <div className="relative">
              <Input
                type="date"
                label="Fecha de Ingreso"
                value={fechaIngreso}
                onChange={(e) => setFechaIngreso(e.target.value)}
                required
              />
              <Calendar className="absolute right-3 top-[34px] w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </section>

        {/* 2. Cantidad Macro */}
        <section className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">2. Cantidad Macro</h2>
          
          <div className="mb-4">
             <label className="block text-sm font-medium text-gray-700 mb-2">Medida de Ingreso</label>
             <div className="flex gap-6">
               <label className="flex items-center gap-2 cursor-pointer">
                 <input 
                   type="radio" 
                   name="measureType" 
                   value="bultos" 
                   checked={measureType === 'bultos'}
                   onChange={() => setMeasureType('bultos')}
                   className="text-orange-500 focus:ring-orange-500"
                 />
                 <span className="flex items-center gap-1.5"><Package className="w-4 h-4 text-gray-500"/> Número de Bultos</span>
               </label>
               <label className="flex items-center gap-2 cursor-pointer">
                 <input 
                   type="radio" 
                   name="measureType" 
                   value="peso" 
                   checked={measureType === 'peso'}
                   onChange={() => setMeasureType('peso')}
                   className="text-orange-500 focus:ring-orange-500"
                 />
                 <span className="flex items-center gap-1.5"><Weight className="w-4 h-4 text-gray-500"/> Peso Aproximado (Kg)</span>
               </label>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="number"
              label={measureType === 'bultos' ? "Número de Bultos" : "Peso Estimado (Kg)"}
              min="1"
              step={measureType === 'bultos' ? "1" : "0.1"}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="text-xl font-medium"
              required
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas / Ubicación Temporal</label>
            <textarea
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all min-h-[80px]"
              placeholder="Ej: Pallet 4, Lado Oeste del Almacén. Prioridad Alta."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit"
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-white w-full md:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registrando...' : 'Registrar como Por Clasificar (RF-ING-03)'}
          </Button>
        </div>
      </form>
    </div>
  );
}
