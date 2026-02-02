// Auth feature - Types
// This file will contain auth-related types

export interface User {
  id: string;
  email: string;
  nombre: string;
  rol: 'admin' | 'operador' | 'voluntario' | 'auditor' | 'estudiante';
  activo: boolean;

  activo_hasta?: string;
}

export type UserProfile = User;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
