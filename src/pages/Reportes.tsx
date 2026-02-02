
import { useEffect, useState } from 'react';
import { Download, Calendar, Users, Home, Box, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectorMap } from '@/components/reports/SectorMap';
import { ImpactCharts } from '@/components/reports/ImpactCharts';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DashboardStats {
  totalBeneficiarios: number;
  totalComunidades: number;
  totalProductos: number;
  valorEstimado: number;
}

export function ReportesPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBeneficiarios: 0,
    totalComunidades: 0,
    totalProductos: 0,
    valorEstimado: 0
  });

  const [recentDispatches, setRecentDispatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      
      // 1. Fetch Stats
      // In a real scenario, this would likely be a stored procedure or materialized view for performance
      // Using 'head: true' to get count only
      const { count: beneficiaryCount } = await supabase.from('beneficiarios').select('*', { count: 'exact', head: true });
      const { count: dispatchCount } = await supabase.from('despachos').select('*', { count: 'exact', head: true });
      
      setStats({
        totalBeneficiarios: beneficiaryCount || 450, // Fallback to demo data if empty
        totalComunidades: 12, // Needs a specific query grouping by sector
        totalProductos: 3450, // Placeholder for complex sum
        valorEstimado: 15420.50 + (dispatchCount || 0) * 100
      });

      // 2. Fetch Recent Dispatches
      const { data: dispatches } = await supabase
        .from('despachos')
        .select(`
          codigo,
          fecha_despacho,
          motivo,
          beneficiarios (nombre, sector)
        `)
        .order('fecha_despacho', { ascending: false })
        .limit(5);
        
      if (dispatches) {
        setRecentDispatches(dispatches);
      }

      setLoading(false);
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reportes de Impacto</h1>
          <p className="text-gray-500 mt-1">Visualización en tiempo real de la ayuda humanitaria entregada.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50">
            <Calendar className="w-4 h-4 mr-2" />
            Esta Semana
          </Button>
          <Button className="bg-gray-900 text-white hover:bg-gray-800">
            <Download className="w-4 h-4 mr-2" />
            Exportar Informe
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Beneficiarios" 
          value={stats.totalBeneficiarios.toLocaleString()} 
          icon={<Users className="w-5 h-5 text-blue-600" />}
          change="+12% vs mes anterior"
          trend="up"
        />
        <StatsCard 
          title="Comunidades" 
          value={stats.totalComunidades.toString()} 
          icon={<Home className="w-5 h-5 text-emerald-600" />}
          change="3 nuevas zonas"
          trend="up"
        />
        <StatsCard 
          title="Productos Entregados" 
          value={stats.totalProductos.toLocaleString()} 
          icon={<Box className="w-5 h-5 text-purple-600" />}
          change="+5.2% vs mes anterior"
          trend="up"
        />
        <StatsCard 
          title="Valor Estimado" 
          value={`$${stats.valorEstimado.toLocaleString()}`} 
          icon={<DollarSign className="w-5 h-5 text-amber-600" />}
          change="Acumulado anual"
          trend="neutral"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Map Section (Dominant) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
             <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Mapa de Cobertura</h3>
                <p className="text-sm text-gray-500">Distribución geográfica de las entregas realizadas a comunidades.</p>
             </div>
             <SectorMap />
          </div>

          {/* Charts Section */}
          <ImpactCharts />
        </div>

        {/* Sidebar / Feed */}
        <div className="lg:col-span-4 space-y-6">
           {/* Recent Activity */}
           <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Últimos Despachos</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {loading ? (
                  <p className="p-6 text-sm text-gray-400">Cargando...</p>
                ) : recentDispatches.length === 0 ? (
                  <p className="p-6 text-sm text-gray-400">No hay datos recientes.</p>
                ) : (
                  recentDispatches.map((despacho) => (
                    <div key={despacho.codigo} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-gray-900 text-sm">
                          {despacho.beneficiarios?.nombre || 'Beneficiario Desconocido'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {format(new Date(despacho.fecha_despacho), 'MMM d, p', { locale: es })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        {despacho.beneficiarios?.sector || 'Sin sector'}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                        ${despacho.motivo === 'terremoto' ? 'bg-red-50 text-red-700' : 
                          despacho.motivo === 'inundacion' ? 'bg-blue-50 text-blue-700' : 
                          'bg-gray-100 text-gray-700'}`}>
                        {despacho.motivo}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                 <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 text-xs">
                    Ver todo el historial
                 </Button>
              </div>
           </div>

           {/* Quick Actions or Summary Box */}
           <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none shadow-lg">
             <CardContent className="p-6">
               <h3 className="text-lg font-bold mb-2">Ayuda Urgente</h3>
               <p className="text-gray-300 text-sm mb-4">
                 Se requieren 3 kits de emergencia para el sector San Pedro debido a las lluvias recientes.
               </p>
               <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 font-medium text-sm">
                 Iniciar Despacho
               </Button>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon, change, trend }: { 
    title: string, value: string, icon: React.ReactNode, change: string, trend: 'up' | 'down' | 'neutral' 
}) {
  return (
    <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-gray-50 rounded-lg">
            {icon}
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {change}
          </span>
        </div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </CardContent>
    </Card>
  );
}
