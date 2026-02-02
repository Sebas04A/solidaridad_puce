# Solidaridad PUCE - Sistema de Gestión de Ayuda Humanitaria

Sistema de gestión para centro de acopio de ayuda humanitaria desarrollado para la PUCE.

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js >= 18.x
- Cuenta de Supabase (gratuita)

### Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# Iniciar servidor de desarrollo
npm run dev
```

### Configurar Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir al SQL Editor y ejecutar `supabase/schema.sql`
3. Copiar la URL y anon key del proyecto
4. Pegarlas en el archivo `.env`

## 📁 Estructura del Proyecto

```
src/
├── components/     # Componentes reutilizables
│   ├── ui/        # Primitivos: Button, Input, Modal, etc.
│   └── layout/    # Header, Sidebar, MainLayout
├── features/      # Módulos por dominio
│   ├── auth/      # Autenticación
│   ├── donantes/  # Gestión de donantes
│   ├── productos/ # Catálogo de productos
│   ├── inventario/# Lotes y stock (FEFO)
│   ├── ingresos/  # Flujo normal y crisis
│   ├── egresos/   # Despachos
│   └── reportes/  # Dashboard de impacto
├── lib/           # Supabase client, utils
├── pages/         # Páginas principales
└── types/         # TypeScript types
```

## 📋 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |
| `npm run lint` | Verificar código |
| `npm run type-check` | Verificar tipos |

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + TypeScript
- **Build**: Vite
- **Estilos**: TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, APIs)
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Iconos**: Lucide React
- **Notificaciones**: React Hot Toast

## 📖 Documentación

- [GUIDELINES.md](./GUIDELINES.md) - Guía de desarrollo y convenciones
- [supabase/schema.sql](./supabase/schema.sql) - Schema de base de datos

## 🏫 Proyecto Universitario

Desarrollado como proyecto de vinculación para la Pontificia Universidad Católica del Ecuador (PUCE).
