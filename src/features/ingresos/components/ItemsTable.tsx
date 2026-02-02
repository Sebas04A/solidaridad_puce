
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Trash2 } from 'lucide-react';
import type { AddedItem } from './AddItemSection';

interface ItemsTableProps {
  items: AddedItem[];
  onRemove: (id: string) => void;
}

export function ItemsTable({ items, onRemove }: ItemsTableProps) {
  return (
    <div className="mt-6 border border-gray-200 rounded-lg p-5">
      <h3 className="text-gray-700 font-semibold mb-4 text-base">
        Lista de Ítems a Registrar: ({items.length})
      </h3>
      
      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500 italic bg-gray-50 rounded-lg border border-dashed">
          Aún no se han agregado ítems.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead>ÍTEM</TableHead>
                <TableHead>CATEGORÍA</TableHead>
                <TableHead>CANTIDAD</TableHead>
                <TableHead>PRECIO UNIT.</TableHead>
                <TableHead>F. VENCIMIENTO</TableHead>
                <TableHead className="text-right">ACCIÓN</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.tempId}>
                  <TableCell className="font-medium">{item.producto.nombre}</TableCell>
                  <TableCell className="capitalize">{item.producto.categoria}</TableCell>
                  <TableCell>
                    {item.cantidad} {item.producto.unidad_medida}
                  </TableCell>
                  <TableCell>
                    {item.precio > 0 ? `$ ${item.precio.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell>
                    {item.fechaVencimiento || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                      onClick={() => onRemove(item.tempId)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
