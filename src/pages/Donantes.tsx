import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

import { DataTable as Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';


// Demo data
const donantesDemo = [
  { id: 1, nombre: 'Juan Pérez', tipo: 'persona', telefono: '0991234567', email: 'juan@email.com', es_anonimo: false },
  { id: 2, nombre: 'Empresa ABC', tipo: 'empresa', telefono: '022456789', email: 'contacto@abc.com', es_anonimo: false },
  { id: 3, nombre: 'Donante Anónimo', tipo: 'anonimo', telefono: null, email: null, es_anonimo: true },
];

const tipoLabels: Record<string, string> = {
  persona: 'Persona',
  empresa: 'Empresa',
  anonimo: 'Anónimo',
};

const tipoVariants: Record<string, 'info' | 'success' | 'default'> = {
  persona: 'info',
  empresa: 'success',
  anonimo: 'default',
};

export function DonantesPage() {
  const [search, setSearch] = useState('');

  const columns = [
    { key: 'nombre', header: 'Nombre' },
    { 
      key: 'tipo', 
      header: 'Tipo',
      render: (item: typeof donantesDemo[0]) => (
        <Badge variant={tipoVariants[item.tipo]}>{tipoLabels[item.tipo]}</Badge>
      )
    },
    { key: 'telefono', header: 'Teléfono', render: (item: typeof donantesDemo[0]) => item.telefono || '-' },
    { key: 'email', header: 'Email', render: (item: typeof donantesDemo[0]) => item.email || '-' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donantes</h1>
          <p className="text-gray-500">Gestiona los donantes del centro de acopio</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Donante
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar donante..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <Button variant="secondary">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Table
        data={donantesDemo}
        columns={columns}
        onRowClick={(item) => console.log('Click:', item)}
        emptyMessage="No hay donantes registrados"
      />
    </div>
  );
}
