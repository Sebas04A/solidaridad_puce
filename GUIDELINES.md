# 📘 Guía de Desarrollo - Sistema de Ayuda Humanitaria

## 1. Información del Proyecto

| Campo | Valor |
|-------|-------|
| **Nombre** | Solidaridad PUCE - Sistema de Gestión de Ayuda Humanitaria |
| **Stack** | React 18 + Vite + TailwindCSS + Supabase |
| **Lenguaje** | TypeScript |
| **Node** | >= 18.x |

---

## 2. Estructura de Carpetas

```
src/
├── components/           # Componentes reutilizables
│   ├── ui/              # Primitivos: Button, Input, Modal, Card, Table
│   └── layout/          # Header, Sidebar, MainLayout, Footer
│
├── features/            # Módulos por dominio (feature-based architecture)
│   ├── auth/            # Autenticación y permisos
│   │   ├── components/  # LoginForm, RoleGuard
│   │   ├── hooks/       # useAuth, usePermissions
│   │   ├── services/    # authService.ts
│   │   └── types/       # auth.types.ts
│   │
│   ├── donantes/        # Gestión de donantes
│   │   ├── components/  # DonanteForm, DonanteList, DonanteCard
│   │   ├── hooks/       # useDonantes
│   │   ├── services/    # donantesService.ts
│   │   └── types/       # donantes.types.ts
│   │
│   ├── productos/       # Catálogo de productos
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   │
│   ├── inventario/      # Lotes, stock, FEFO
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   │
│   ├── ingresos/        # Flujo normal y crisis
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   │
│   ├── egresos/         # Despachos y beneficiarios
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   │
│   └── reportes/        # Dashboards de impacto
│       ├── components/
│       ├── hooks/
│       └── services/
│
├── hooks/               # Hooks compartidos globales
│   └── useDebounce.ts
│
├── lib/                 # Configuraciones y utilidades
│   ├── supabase.ts      # Cliente Supabase
│   ├── utils.ts         # Funciones helper
│   └── constants.ts     # Constantes globales
│
├── pages/               # Páginas/rutas principales
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   └── ...
│
├── types/               # Tipos globales y de Supabase
│   └── database.types.ts
│
├── styles/              # Estilos globales
│   └── globals.css
│
├── App.tsx              # Componente raíz + Router
└── main.tsx             # Entry point
```

---

## 3. Convenciones de Código

### 3.1 Nomenclatura de Archivos

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Componentes | PascalCase | `DonanteForm.tsx` |
| Hooks | camelCase con `use` | `useDonantes.ts` |
| Servicios | camelCase + Service | `donantesService.ts` |
| Tipos | camelCase + `.types.ts` | `donantes.types.ts` |
| Utilidades | camelCase | `formatDate.ts` |

### 3.2 Nomenclatura de Código

```typescript
// ✅ Componentes: PascalCase
export function DonanteCard({ donante }: DonanteCardProps) {}

// ✅ Hooks: camelCase con prefijo "use"
export function useDonantes() {}

// ✅ Funciones: camelCase verbales
export function calcularStockTotal() {}
export function formatearFecha() {}

// ✅ Constantes: SCREAMING_SNAKE_CASE
export const API_BASE_URL = '...';
export const ROLES = { ADMIN: 'admin', ... };

// ✅ Tipos/Interfaces: PascalCase
interface Donante { ... }
type DonanteFormData = { ... }

// ✅ Props de componentes: NombreComponente + Props
interface DonanteCardProps { ... }
```

### 3.3 Estructura de Componentes

```typescript
// 1. Imports (externos primero, luego internos)
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useDonantes } from '../hooks/useDonantes';
import type { Donante } from '../types/donantes.types';

// 2. Tipos/Interfaces del componente
interface DonanteCardProps {
  donante: Donante;
  onEdit?: (id: number) => void;
}

// 3. Componente (export nombrado preferido)
export function DonanteCard({ donante, onEdit }: DonanteCardProps) {
  // 3.1 Hooks primero
  const [isOpen, setIsOpen] = useState(false);
  
  // 3.2 Handlers
  const handleEdit = () => {
    onEdit?.(donante.id);
  };
  
  // 3.3 Early returns
  if (!donante) return null;
  
  // 3.4 Render
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

---

## 4. Patrones de Servicios (Supabase)

```typescript
// features/donantes/services/donantesService.ts
import { supabase } from '@/lib/supabase';
import type { Donante, DonanteInsert } from '../types/donantes.types';

export const donantesService = {
  async getAll(): Promise<Donante[]> {
    const { data, error } = await supabase
      .from('donantes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getById(id: number): Promise<Donante | null> {
    const { data, error } = await supabase
      .from('donantes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(donante: DonanteInsert): Promise<Donante> {
    const { data, error } = await supabase
      .from('donantes')
      .insert(donante)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: number, donante: Partial<DonanteInsert>): Promise<Donante> {
    const { data, error } = await supabase
      .from('donantes')
      .update(donante)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('donantes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};
```

---

## 5. Patrones de Hooks

```typescript
// features/donantes/hooks/useDonantes.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { donantesService } from '../services/donantesService';

const QUERY_KEY = ['donantes'];

export function useDonantes() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: donantesService.getAll,
  });
}

export function useCreateDonante() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: donantesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
```

---

## 6. Estilos con TailwindCSS

### 6.1 Clases Organizadas

```tsx
// ✅ Orden: layout → sizing → spacing → colors → typography → effects
<div className="flex items-center w-full p-4 bg-white text-gray-800 rounded-lg shadow-md" />

// ✅ Usar cn() para condicionales (instalar clsx)
import { clsx } from 'clsx';
<button className={clsx(
  'px-4 py-2 rounded-lg font-medium',
  isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
)} />
```

### 6.2 Componentes UI Base

Todos los componentes en `src/components/ui/` deben:
- Aceptar `className` para personalización
- Usar variantes con props (`variant`, `size`)
- Ser accesibles (aria-labels, roles)

---

## 7. Manejo de Estado

| Caso | Solución |
|------|----------|
| Estado del servidor | TanStack Query (React Query) |
| Estado local simple | useState |
| Estado local complejo | useReducer |
| Estado global UI | Context API (tema, sidebar) |

---

## 8. Imports con Alias

```typescript
// tsconfig.json / vite.config.ts ya configurados
import { Button } from '@/components/ui/Button';  // ✅
import { useDonantes } from '@/features/donantes/hooks/useDonantes';  // ✅

// Evitar imports relativos largos
import { Button } from '../../../components/ui/Button';  // ❌
```

---

## 9. Commits (Conventional Commits)

```
feat: agregar formulario de donantes
fix: corregir cálculo de stock FEFO
style: ajustar espaciado en cards
refactor: extraer lógica a hook useInventario
docs: actualizar README con instrucciones
```

---

## 10. Checklist de Calidad

Antes de cada merge/push:

- [ ] Sin errores de TypeScript (`npm run type-check`)
- [ ] Código formateado (`npm run format`)
- [ ] Sin console.log olvidados
- [ ] Componentes con tipos de props
- [ ] Servicios manejan errores
- [ ] UI responsiva (probado en móvil)
