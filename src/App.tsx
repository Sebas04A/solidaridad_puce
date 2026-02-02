import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoginPage } from '@/pages/Login';
import { DashboardPage } from '@/pages/Dashboard';
import { DonantesPage } from '@/pages/Donantes';
import { ProductosPage } from '@/pages/Productos';
import { InventarioPage } from '@/pages/Inventario';
import { IngresosPage } from '@/pages/Ingresos';
import { EgresosPage } from '@/pages/Egresos';
import { ReportesPage } from '@/pages/Reportes';
import { UsuariosPage } from '@/features/usuarios/pages/UsuariosPage';
import TriajeDashboard from '@/features/triaje/pages/TriajeDashboard';
import TriajeProcessPage from '@/features/triaje/pages/TriajeProcessPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/reportes" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/donantes" element={<DonantesPage />} />
              <Route path="/productos" element={<ProductosPage />} />
              <Route path="/inventario" element={<InventarioPage />} />
              <Route path="/ingresos" element={<IngresosPage />} />
              <Route path="/egresos" element={<EgresosPage />} />
              <Route path="/reportes" element={<ReportesPage />} />
              <Route path="/usuarios" element={<UsuariosPage />} />
              <Route path="/triaje" element={<TriajeDashboard />} />
              <Route path="/triaje/:id" element={<TriajeProcessPage />} />
            </Route>
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/reportes" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
