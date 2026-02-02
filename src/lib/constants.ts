// Global constants

// Roles del sistema
export const ROLES = {
  ADMIN: 'admin',
  OPERADOR: 'operador',
  VOLUNTARIO: 'voluntario',
  AUDITOR: 'auditor',
} as const;

export const ROLES_LABELS: Record<string, string> = {
  admin: 'Administrador',
  operador: 'Operador',
  voluntario: 'Voluntario',
  auditor: 'Auditor',
  estudiante: 'Estudiante',
};

// Categorías de productos
export const CATEGORIAS = [
  { value: 'alimentos', label: 'Alimentos' },
  { value: 'ropa', label: 'Ropa' },
  { value: 'higiene', label: 'Higiene' },
  { value: 'medicamentos', label: 'Medicamentos' },
  { value: 'juguetes', label: 'Juguetes' },
  { value: 'enseres', label: 'Enseres' },
  { value: 'otros', label: 'Otros' },
] as const;

// Clasificación climática
export const CLIMAS = [
  { value: 'costa', label: 'Costa (Calor)' },
  { value: 'sierra', label: 'Sierra (Frío)' },
  { value: 'ambos', label: 'Ambos climas' },
] as const;

// Tipos de donante
export const TIPOS_DONANTE = [
  { value: 'persona', label: 'Persona Natural' },
  { value: 'empresa', label: 'Empresa' },
  { value: 'anonimo', label: 'Anónimo' },
] as const;

// Motivos de egreso
export const MOTIVOS_EGRESO = [
  { value: 'terremoto', label: 'Terremoto' },
  { value: 'inundacion', label: 'Inundación' },
  { value: 'incendio', label: 'Incendio' },
  { value: 'deslizamiento', label: 'Deslizamiento' },
  { value: 'sequia', label: 'Sequía' },
  { value: 'pandemia', label: 'Pandemia' },
  { value: 'pobreza_extrema', label: 'Pobreza Extrema' },
  { value: 'otro', label: 'Otro' },
] as const;

// Estados de lote
export const ESTADOS_LOTE = [
  { value: 'disponible', label: 'Disponible', color: 'green' },
  { value: 'triaje_pendiente', label: 'Triaje Pendiente', color: 'yellow' },
  { value: 'agotado', label: 'Agotado', color: 'gray' },
  { value: 'descartado', label: 'Descartado', color: 'red' },
] as const;

// Estados de despacho
export const ESTADOS_DESPACHO = [
  { value: 'preparando', label: 'Preparando', color: 'blue' },
  { value: 'validado', label: 'Validado', color: 'green' },
  { value: 'despachado', label: 'Despachado', color: 'gray' },
  { value: 'rectificado', label: 'Rectificado', color: 'orange' },
] as const;

// Unidades de medida comunes
export const UNIDADES_MEDIDA = [
  'unidad',
  'kg',
  'litro',
  'caja',
  'paquete',
  'bolsa',
] as const;

// Permisos por rol
export const PERMISOS = {
  admin: ['*'], // Todo
  operador: ['donantes', 'productos', 'lotes', 'ingresos', 'egresos', 'beneficiarios'],
  voluntario: ['ingresos:crisis', 'triaje'],
  auditor: ['reportes:read'],
  estudiante: ['donantes', 'egresos'],
} as const;
