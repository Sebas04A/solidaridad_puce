// Utility functions

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with Tailwind merge support
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string to locale format
 */
export function formatDate(date: string | Date, locale = 'es-EC'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Calculate days until expiration
 */
export function diasParaVencer(fechaCaducidad: string | null): number | null {
  if (!fechaCaducidad) return null;
  const hoy = new Date();
  const caducidad = new Date(fechaCaducidad);
  const diffTime = caducidad.getTime() - hoy.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get status color based on days until expiration
 */
export function getExpiracionColor(dias: number | null): string {
  if (dias === null) return 'text-gray-500';
  if (dias <= 0) return 'text-red-600';
  if (dias <= 7) return 'text-orange-500';
  if (dias <= 30) return 'text-yellow-500';
  return 'text-green-600';
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Convierte errores de Supabase a mensajes amigables en español
 */
export function formatAuthError(error: any): string {
  // Errores de Supabase Auth
  const errorMap: Record<string, string> = {
    // Login
    'Invalid login credentials': 'Email o contraseña incorrectos',
    'Email not confirmed': 'Por favor, confirma tu email antes de iniciar sesión',
    'User not found': 'No existe una cuenta con este email',
    
    // Register
    'User already registered': 'Ya existe una cuenta con este email',
    'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
    'Unable to validate email address: invalid format': 'El formato del email no es válido',
    'Signup requires a valid password': 'Debes ingresar una contraseña válida',
    
    // Network
    'Failed to fetch': 'Error de conexión. Verifica tu internet',
    'NetworkError': 'Error de red. Por favor, intenta nuevamente',
    
    // Database
    'duplicate key value violates unique constraint': 'Este email ya está registrado',
    'permission denied': 'No tienes permisos para realizar esta acción',
  };

  // Buscar mensaje específico
  if (error?.message) {
    const lowercaseMessage = error.message.toLowerCase();
    
    for (const [key, value] of Object.entries(errorMap)) {
      if (lowercaseMessage.includes(key.toLowerCase())) {
        return value;
      }
    }
  }

  // Mensaje por defecto según el código de error
  if (error?.code === '23505') {
    return 'Este email ya está registrado';
  }

  // Retornar mensaje original o genérico
  return error?.message || 'Ha ocurrido un error. Por favor, intenta nuevamente';
}

