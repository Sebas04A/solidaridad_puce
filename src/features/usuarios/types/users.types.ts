

export interface PuceUser {
  identification: string;
  email: string;
  nombres: string;
  apellidos: string;
  facultad?: string;
  carrera?: string;
}

export type UserRole = 'admin' | 'operador' | 'voluntario' | 'auditor' | 'estudiante';

export interface CreateUserDTO {
  email: string;
  nombre: string;
  rol: UserRole;
  activo_hasta?: string;
  password?: string; // For initial password setting
}
