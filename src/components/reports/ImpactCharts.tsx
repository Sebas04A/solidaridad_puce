
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

const dataDistribucion = [
  { name: 'Alimentos', value: 4500 },
  { name: 'Ropa', value: 2300 },
  { name: 'Higiene', value: 1200 },
  { name: 'Juguetes', value: 800 },
  { name: 'Otros', value: 500 },
];

const dataEvolucion = [
  { name: 'En', asistencias: 12 },
  { name: 'Feb', asistencias: 19 },
  { name: 'Mar', asistencias: 15 },
  { name: 'Abr', asistencias: 25 },
  { name: 'May', asistencias: 32 },
  { name: 'Jun', asistencias: 28 },
];

export function ImpactCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Distribution by Category */}
      <Card className="bg-white shadow-sm border border-gray-100">
        <CardHeader className="pb-2">
            <CardTitle className="text-lg text-gray-800 font-semibold">Distribución por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataDistribucion}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataDistribucion.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 flex-wrap mt-2">
                {dataDistribucion.map((entry, index) => (
                    <div key={index} className="flex items-center text-xs text-gray-500">
                        <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        {entry.name}
                    </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evolution of Aid */}
      <Card className="bg-white shadow-sm border border-gray-100">
        <CardHeader className="pb-2">
            <CardTitle className="text-lg text-gray-800 font-semibold">Evolución de Asistencia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dataEvolucion}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="asistencias" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
