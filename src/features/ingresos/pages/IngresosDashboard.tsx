
import { Package, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { DataTable as Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';

// Demo data - in a real app this would come from the API
const ingresosDemo = [
  { id: 1, lote: 'L20260201-0001', producto: 'Arroz 1kg', tipo: 'normal', cantidad: 50, fecha: '2026-02-01', registrado_por: 'María López' },
  { id: 2, lote: 'L20260201-0002', producto: 'Bulto Ropa', tipo: 'crisis', cantidad: 1, fecha: '2026-02-01', registrado_por: 'Carlos Ruiz' },
  { id: 3, lote: 'L20260130-0003', producto: 'Atún en lata', tipo: 'normal', cantidad: 100, fecha: '2026-01-30', registrado_por: 'María López' },
];

interface IngresosDashboardProps {
  onNavigate: (view: 'normal' | 'crisis') => void;
}

export function IngresosDashboard({ onNavigate }: IngresosDashboardProps) {
  const columns = [
    { key: 'lote', header: 'Lote' },
    { key: 'producto', header: 'Producto' },
    { 
      key: 'tipo', 
      header: 'Tipo',
      render: (item: typeof ingresosDemo[0]) => (
        <Badge variant={item.tipo === 'normal' ? 'success' : 'warning'}>
          {item.tipo === 'normal' ? 'Normal' : 'Crisis'}
        </Badge>
      )
    },
    { key: 'cantidad', header: 'Cantidad' },
    { key: 'fecha', header: 'Fecha' },
    { key: 'registrado_por', header: 'Registrado por' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ingresos</h1>
          <p className="text-gray-500">Registro de donaciones recibidas</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 cursor-pointer hover:shadow-md transition-shadow group"
          onClick={() => onNavigate('normal')}
        >
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-900">Ingreso Normal</h3>
              <p className="text-sm text-green-700 mt-1">Registro detallado (Conozco los ítems)</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 cursor-pointer hover:shadow-md transition-shadow group"
          onClick={() => onNavigate('crisis')}
        >
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-amber-900">Ingreso en Crisis</h3>
              <p className="text-sm text-amber-700 mt-1">Registro rápido (Bultos sin clasificar)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="pt-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Ingresos Recientes</h2>
        <Table
          data={ingresosDemo}
          columns={columns}
          emptyMessage="No hay ingresos registrados"
        />
      </div>
    </div>
  );
}
