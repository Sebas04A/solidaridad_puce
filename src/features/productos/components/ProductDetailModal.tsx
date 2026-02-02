
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any; // Flexible for now, ideally typed as Lote + Producto + Ingreso
}

export function ProductDetailModal({ isOpen, onClose, data }: ProductDetailModalProps) {
  if (!data) return null;

  // Adapt data based on what we have. 
  // If it's just a product, some fields might be empty or N/A.
  const product = data.producto || data;
  const lote = data.lote || data; // fallback if flattened
  const ingreso = data.ingreso || {};
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ficha de Producto">
        <div className="flex flex-col items-center justify-center mb-6 border-b pb-4">
             <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl mb-2">
               PUCE
             </div>
             <h3 className="text-xl font-bold text-gray-800">SOLIDARIDAD</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 px-4">
          
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase">ID Donante</label>
              <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                {lote.donante_id || 'Anónimo / No registrado'}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase">Nombre Producto</label>
              <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                {product.nombre}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase">Categoría</label>
              <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 text-sm capitalize">
                {product.categoria}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase">C. Climática</label>
              <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 text-sm capitalize">
                {product.clima}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase">Cantidad Donada</label>
              <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                {lote.cantidad_inicial || 0}
              </div>
            </div>

             <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase">Unidades (Kg-L-Uds)</label>
              <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                {product.unidad_medida}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase">Fecha de Expiración</label>
              <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                {lote.fecha_caducidad ? format(new Date(lote.fecha_caducidad), 'dd-MM-yyyy') : 'No aplica'}
              </div>
            </div>

            <div>
               <label className="block text-xs font-semibold text-gray-500 uppercase">Lote</label>
               <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 text-sm font-mono">
                 {lote.codigo || '---'}
               </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
             <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase">Valor Estimado</label>
              <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                $ {((product.precio_referencial || 0) * (lote.cantidad_actual || 0)).toFixed(2)}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase">Responsable registro</label>
              <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                 {ingreso.registrado_por_nombre || '---'}
              </div>
            </div>

             <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase">Cantidad en Stock</label>
              <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                {lote.cantidad_actual || 0}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase">Fecha de Recepción</label>
              <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                 {lote.fecha_ingreso ? format(new Date(lote.fecha_ingreso), 'dd-MM-yyyy') : '---'}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase">Observaciones</label>
              <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 text-sm min-h-[100px]">
                {lote.notas || 'Sin observaciones'}
              </div>
            </div>
          </div>

        </div>

        <div className="flex justify-end gap-3 mt-8 border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Imprimir Ficha
          </Button>
        </div>
    </Modal>
  );
}
