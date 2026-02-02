
import { Badge } from '@/components/ui/Badge';
import { X } from 'lucide-react';

export function IngresoHeader({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex items-center justify-between pb-4 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-gray-900">Registro Detallado de Ingreso</h1>
        <Badge variant="success" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
          RF-ING-02
        </Badge>
      </div>
      {onClose && (
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
