import type { UserRole } from '@/types';

/** Perfiles de demostración (mismo criterio que usuarios en Firebase Auth + colección app_users). */
export const DEMO_USER_PROFILES_BY_EMAIL: Record<
  string,
  { name: string; role: UserRole }
> = {
  'admin@temocsa.com': {
    name: 'Administrador TEMOCSA',
    role: 'admin',
  },
  'editor@temocsa.com': {
    name: 'Ing. Carlos Mendoza',
    role: 'editor',
  },
  'visor@temocsa.com': {
    name: 'Consultor Externo',
    role: 'visor',
  },
};
