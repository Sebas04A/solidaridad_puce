
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Boxes, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  BarChart3,
  ChevronLeft,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ROLES_LABELS } from '@/lib/constants';

const navItems = [
  { path: '/reportes', label: 'Dashboard / Reportes', icon: LayoutDashboard }, // Promoted Reportes to Dashboard position or just use Reportes icon
  { path: '/donantes', label: 'Donantes', icon: Users },
  { path: '/productos', label: 'Productos', icon: Package },
  { path: '/inventario', label: 'Inventario', icon: Boxes },
  { path: '/ingresos', label: 'Ingresos', icon: ArrowDownToLine },
  { path: '/egresos', label: 'Egresos', icon: ArrowUpFromLine },
  { path: '/reportes', label: 'Reportes', icon: BarChart3 },
  { path: '/usuarios', label: 'Usuarios', icon: Users, adminOnly: true },
];

export function Sidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  const { user } = useAuth();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-white border-r border-gray-100 transition-all duration-300 z-40',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center w-full')}>
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary-600" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-gray-900">Solidaridad</h1>
              <p className="text-xs text-gray-500">PUCE</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'p-1.5 rounded-lg hover:bg-gray-100 transition-colors',
            collapsed && 'absolute -right-3 top-6 bg-white border border-gray-200 shadow-sm'
          )}
        >
          <ChevronLeft className={cn('w-4 h-4 text-gray-600 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          if (item.adminOnly && user?.rol !== 'admin') return null;
          
          return (
            <NavLink
              key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                'hover:bg-gray-50',
                isActive
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-600',
                collapsed && 'justify-center px-2'
              )
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
          );
        })}
      </nav>

      {/* User info */}
      {user && (
        <div className={cn(
          'absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100',
          collapsed && 'px-2'
        )}>
          <div className={cn(
            'flex items-center gap-3 p-2 rounded-lg bg-gray-50',
            collapsed && 'justify-center'
          )}>
            <div className="w-8 h-8 bg-primary-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-700">
                {user.nombre[0]?.toUpperCase()}
              </span>
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-gray-900 truncate">{user.nombre}</p>
                <p className="text-xs text-gray-500">{ROLES_LABELS[user.rol]}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
