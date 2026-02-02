
import { format } from 'date-fns';
import { Package, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import type { TriajeItem } from '../types/triaje.types';

interface TriajeListProps {
  items: TriajeItem[];
  onProcess: (item: TriajeItem) => void;
}

export function TriajeList({ items, onProcess }: TriajeListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No hay bultos pendientes</h3>
        <p className="text-gray-500 mt-1">Todo el material recibido ha sido clasificado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.ingreso_id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 md:p-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="warning">Por Clasificar</Badge>
                <div className="flex items-center text-xs text-gray-500 gap-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(item.fecha_ingreso), 'dd/MM/yyyy HH:mm')}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900">{item.lote_codigo}</h4>
                <p className="text-sm text-gray-600 font-medium">{item.descripcion_bulto}</p>
                {item.peso_estimado && (
                   <div className="text-xs text-gray-500 mt-1">Peso Est: {item.peso_estimado}kg</div>
                )}
              </div>

               <div className="text-xs text-gray-400">
                  Registrado por: {item.registrado_por}
               </div>
            </div>

            <Button 
              onClick={() => onProcess(item)}
              className="w-full md:w-auto shrink-0 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              size="sm"
            >
              Procesar Bulto
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
