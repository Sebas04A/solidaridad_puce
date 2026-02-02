import { useState } from 'react';
import { Plus, Truck, CheckCircle, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable as Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { MOTIVOS_EGRESO } from '@/lib/constants';
import { DespachoWizard } from '@/components/salidas/DespachoWizard';

// Demo data
const despachosDemo = [
  { id: 1, codigo: 'D20260201-0001', beneficiario: 'Comunidad San Pedro', motivo: 'terremoto', estado: 'despachado', fecha: '2026-02-01', items: 5 },
  { id: 2, codigo: 'D20260131-0002', beneficiario: 'Barrio La Esperanza', motivo: 'inundacion', estado: 'validado', fecha: '2026-01-31', items: 8 },
  { id: 3, codigo: 'D20260130-0003', beneficiario: 'Parroquia El Carmen', motivo: 'pobreza_extrema', estado: 'preparando', fecha: '2026-01-30', items: 3 },
];

const estadoVariants: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
  preparando: 'info',
  validado: 'success',
  despachado: 'default',
  rectificado: 'warning',
};

const estadoLabels: Record<string, string> = {
  preparando: 'Preparando',
  validado: 'Validado',
  despachado: 'Despachado',
  rectificado: 'Rectificado',
};

const motivoLabels = Object.fromEntries(MOTIVOS_EGRESO.map(m => [m.value, m.label]));

export function EgresosPage() {
  const [isCreating, setIsCreating] = useState(false);

  const columns = [
    { key: 'codigo', header: 'Código' },
    { key: 'beneficiario', header: 'Beneficiario' },
    {
      key: 'motivo',
      header: 'Motivo',
      render: (item: typeof despachosDemo[0]) => motivoLabels[item.motivo] || item.motivo
    },
    { key: 'items', header: 'Items' },
    { key: 'fecha', header: 'Fecha' },
    {
      key: 'estado',
      header: 'Estado',
      render: (item: typeof despachosDemo[0]) => (
        <Badge variant={estadoVariants[item.estado]}>{estadoLabels[item.estado]}</Badge>
      )
    },
  ];

  const handleCompleteDispatch = () => {
    // Return to list view
    setIsCreating(false);
    // TODO: In a real app, we would refetch despachos from Supabase here
    // to show the newly created dispatch in the table
  };

  if (isCreating) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setIsCreating(false)} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al listado
        </Button>
        <DespachoWizard onComplete={handleCompleteDispatch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Egresos / Despachos</h1>
          <p className="text-gray-500">Gestión de despachos a beneficiarios</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Despacho
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">En Preparación</p>
              <p className="text-xl font-bold">3</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Despachados (mes)</p>
              <p className="text-xl font-bold">15</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">👥</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Beneficiarios</p>
              <p className="text-xl font-bold">12</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Table
        data={despachosDemo}
        columns={columns}
        emptyMessage="No hay despachos registrados"
      />
    </div>
  );
}

