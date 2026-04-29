import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types';
import { useProjectStore } from '@/store/projectStore';

const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'admin@temocsa.com': {
    password: 'admin123',
    user: {
      id: '1',
      name: 'Administrador TEMOCSA',
      email: 'admin@temocsa.com',
      role: 'admin',
    },
  },
  'editor@temocsa.com': {
    password: 'editor123',
    user: {
      id: '2',
      name: 'Ing. Carlos Mendoza',
      email: 'editor@temocsa.com',
      role: 'editor',
    },
  },
  'visor@temocsa.com': {
    password: 'visor123',
    user: {
      id: '3',
      name: 'Consultor Externo',
      email: 'visor@temocsa.com',
      role: 'visor',
    },
  },
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (requiredRole: UserRole) => boolean;
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 3,
  editor: 2,
  visor: 1,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        await new Promise((r) => setTimeout(r, 800));

        const entry = DEMO_USERS[email];
        if (entry && entry.password === password) {
          set({ user: entry.user, isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => {
        useProjectStore.getState().clearProject();
        set({ user: null, isAuthenticated: false });
      },

      hasPermission: (requiredRole: UserRole) => {
        const { user } = get();
        if (!user) return false;
        return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[requiredRole];
      },
    }),
    {
      name: 'temocsa-auth',
    }
  )
);
