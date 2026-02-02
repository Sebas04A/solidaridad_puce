import { Plus, Filter, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable as Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { formatDate, diasParaVencer, getExpiracionColor } from '@/lib/utils';

// Demo data
const lotesDemo = [
  { id: 1, codigo: 'L20260201-0001', producto: 'Arroz 1kg', donante: 'Juan Pérez', cantidad_actual: 50, fecha_caducidad: '2026-03-15', estado: 'disponible' },
  { id: 2, codigo: 'L20260201-0002', producto: 'Chompa térmica', donante: 'Empresa ABC', cantidad_actual: 25, fecha_caducidad: null, estado: 'disponible' },
  { id: 3, codigo: 'L20260130-0003', producto: 'Atún en lata', donante: 'Anónimo', cantidad_actual: 100, fecha_caducidad: '2026-02-10', estado: 'disponible' },
];

const estadoVariants: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  disponible: 'success',
  triaje_pendiente: 'warning',
  agotado: 'default',
  descartado: 'danger',
};

const estadoLabels: Record<string, string> = {
  disponible: 'Disponible',
  triaje_pendiente: 'Triaje Pendiente',
  agotado: 'Agotado',
  descartado: 'Descartado',
};

export function InventarioPage() {
  const columns = [
    { key: 'codigo', header: 'Código' },
    { key: 'producto', header: 'Producto' },
    { key: 'donante', header: 'Donante' },
    { key: 'cantidad_actual', header: 'Cantidad' },
    { 
      key: 'fecha_caducidad', 
      header: 'Caducidad',
      render: (item: typeof lotesDemo[0]) => {
        if (!item.fecha_caducidad) return <span className="text-gray-400">N/A</span>;
        const dias = diasParaVencer(item.fecha_caducidad);
        return (
          <div className="flex items-center gap-2">
            <span className={getExpiracionColor(dias)}>{formatDate(item.fecha_caducidad)}</span>
            {dias !== null && dias <= 7 && <AlertTriangle className="w-4 h-4 text-amber-500" />}
          </div>
        );
      }
    },
    { 
      key: 'estado', 
      header: 'Estado',
      render: (item: typeof lotesDemo[0]) => (
        <Badge variant={estadoVariants[item.estado]}>{estadoLabels[item.estado]}</Badge>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-500">Gestión de lotes y stock (FEFO)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = '/triaje'} className="border-blue-200 text-blue-700 hover:bg-blue-50">
            <Filter className="w-4 h-4 mr-2" />
            Triaje / Clasificación
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Lote
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Total Lotes</p>
            <p className="text-2xl font-bold text-gray-900">89</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Próximos a Vencer</p>
            <p className="text-2xl font-bold text-amber-600">5</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Triaje Pendiente</p>
            <p className="text-2xl font-bold text-blue-600">2</p>
          </CardContent>
        </Card>
      </div>

      <Table
        data={lotesDemo}
        columns={columns}
        emptyMessage="No hay lotes registrados"
      />
    </div>
  );
}
