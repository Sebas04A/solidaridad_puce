import { useState, useEffect, useCallback } from 'react';
import { Plus, Truck, CheckCircle, ArrowLeft, RefreshCw, Eye, Edit2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable as Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { MOTIVOS_EGRESO } from '@/lib/constants';
import { DespachoWizard } from '@/components/salidas/DespachoWizard';
import { DespachoStateModal } from '@/components/salidas/DespachoStateModal';
import { DespachoDetailModal } from '@/components/salidas/DespachoDetailModal';
import { supabase } from '@/lib/supabase';

// Type for despacho data from Supabase
interface DespachoRow {
  id: number;
  codigo: string;
  beneficiario_id: number;
  motivo: string;
  fecha_despacho: string;
  estado: string;
  beneficiarios: {
    nombre: string;
  } | null;
}

const estadoVariants: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
  preparando: 'info',
  validado: 'success',
  despachado: 'default',
  en_camino: 'info',
  completado: 'success',
  cancelado: 'warning',
  rectificado: 'warning',
};

const estadoLabels: Record<string, string> = {
  preparando: 'Preparando',
  validado: 'Validado',
  despachado: 'Despachado',
  en_camino: 'En Camino',
  completado: 'Completado',
  cancelado: 'Cancelado',
  rectificado: 'Rectificado',
};

const motivoLabels = Object.fromEntries(MOTIVOS_EGRESO.map(m => [m.value, m.label]));

export function EgresosPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [despachos, setDespachos] = useState<DespachoRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ preparando: 0, despachados: 0, beneficiarios: 0 });

  // Modal states
  const [selectedDespacho, setSelectedDespacho] = useState<DespachoRow | null>(null);
  const [isStateModalOpen, setIsStateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchDespachos = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('despachos')
        .select(`
          id,
          codigo,
          beneficiario_id,
          motivo,
          fecha_despacho,
          estado,
          beneficiarios (
            nombre
          )
        `)
        .order('fecha_despacho', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching despachos:', error);
      } else {
        const typedData = (data || []) as DespachoRow[];
        setDespachos(typedData);

        // Calculate stats
        const preparando = typedData.filter(d => d.estado === 'preparando').length;
        const despachados = typedData.filter(d => d.estado === 'despachado' || d.estado === 'completado').length;
        const uniqueBeneficiarios = new Set(typedData.map(d => d.beneficiario_id)).size;
        setStats({ preparando, despachados, beneficiarios: uniqueBeneficiarios });
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDespachos();
  }, [fetchDespachos]);

  const handleOpenStateModal = (despacho: DespachoRow) => {
    setSelectedDespacho(despacho);
    setIsStateModalOpen(true);
  };

  const handleOpenDetailModal = (despacho: DespachoRow) => {
    setSelectedDespacho(despacho);
    setIsDetailModalOpen(true);
  };

  const columns = [
    { key: 'codigo', header: 'Código' },
    {
      key: 'beneficiario',
      header: 'Beneficiario',
      render: (item: DespachoRow) => item.beneficiarios?.nombre || 'Sin beneficiario'
    },
    {
      key: 'motivo',
      header: 'Motivo',
      render: (item: DespachoRow) => motivoLabels[item.motivo] || item.motivo
    },
    {
      key: 'fecha_despacho',
      header: 'Fecha',
      render: (item: DespachoRow) => new Date(item.fecha_despacho).toLocaleDateString('es-EC')
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (item: DespachoRow) => (
        <Badge variant={estadoVariants[item.estado] || 'default'}>{estadoLabels[item.estado] || item.estado}</Badge>
      )
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (item: DespachoRow) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenDetailModal(item)}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Ver detalle"
          >
            <Eye className="w-4 h-4" />
          </button>
          {item.estado !== 'completado' && item.estado !== 'cancelado' && (
            <button
              type="button"
              onClick={() => handleOpenStateModal(item)}
              className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Cambiar estado"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    },
  ];

  const handleCompleteDispatch = () => {
    // Return to list view and refresh data
    setIsCreating(false);
    fetchDespachos();
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
        <div className="flex gap-2">
          <Button variant="ghost" onClick={fetchDespachos} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Despacho
          </Button>
        </div>
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
              <p className="text-xl font-bold">{stats.preparando}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Despachados</p>
              <p className="text-xl font-bold">{stats.despachados}</p>
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
              <p className="text-xl font-bold">{stats.beneficiarios}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mr-2" />
          <span className="text-gray-500">Cargando despachos...</span>
        </div>
      ) : (
        <Table
          data={despachos}
          columns={columns}
          emptyMessage="No hay despachos registrados"
        />
      )}

      {/* Modals */}
      <DespachoStateModal
        isOpen={isStateModalOpen}
        onClose={() => {
          setIsStateModalOpen(false);
          setSelectedDespacho(null);
        }}
        despacho={selectedDespacho}
        onSuccess={fetchDespachos}
      />

      <DespachoDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDespacho(null);
        }}
        despachoId={selectedDespacho?.id || null}
      />
    </div>
  );
}

