import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import type { User, UserRole } from '@/types';
import { useProjectStore } from '@/store/projectStore';
import { DEMO_USER_PROFILES_BY_EMAIL } from '@/data/demoUserProfiles';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase';

const DEMO_USERS: Record<string, { password: string; user: User }> = {
  'admin@temocsa.com': {
    password: 'AdminTemocsa',
    user: {
      id: '1',
      name: 'Administrador TEMOCSA',
      email: 'admin@temocsa.com',
      role: 'admin',
    },
  },
  'editor@temocsa.com': {
    password: 'EditorTemocsa',
    user: {
      id: '2',
      name: 'Ing. Carlos Mendoza',
      email: 'editor@temocsa.com',
      role: 'editor',
    },
  },
  'visor@temocsa.com': {
    password: 'VisorTemocsa',
    user: {
      id: '3',
      name: 'Consultor Externo',
      email: 'visor@temocsa.com',
      role: 'visor',
    },
  },
};

interface AuthState {
  /** Listo para mostrar login / sesión (Firebase espera primer evento; demo tras rehidratación). */
  authReady: boolean;
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

function firebaseUserToAppUser(fb: FirebaseUser): User {
  const email = fb.email ?? '';
  const profile = DEMO_USER_PROFILES_BY_EMAIL[email];
  if (profile) {
    return {
      id: fb.uid,
      email,
      name: profile.name,
      role: profile.role,
    };
  }
  return {
    id: fb.uid,
    email,
    name: fb.displayName || email.split('@')[0] || 'Usuario',
    role: 'visor',
  };
}

let firebaseAuthListenerStarted = false;

function startFirebaseAuthListener() {
  if (firebaseAuthListenerStarted) return;
  firebaseAuthListenerStarted = true;
  const auth = getFirebaseAuth();
  onAuthStateChanged(auth, (fbUser) => {
    useAuthStore.setState({
      authReady: true,
      user: fbUser ? firebaseUserToAppUser(fbUser) : null,
      isAuthenticated: Boolean(fbUser),
    });
  });
}

export function initAuth() {
  if (isFirebaseConfigured()) {
    startFirebaseAuthListener();
    return;
  }
  if (useAuthStore.persist.hasHydrated()) {
    useAuthStore.setState({ authReady: true });
    return;
  }
  useAuthStore.persist.onFinishHydration(() => {
    useAuthStore.setState({ authReady: true });
  });
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      authReady: false,
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        if (isFirebaseConfigured()) {
          try {
            await signInWithEmailAndPassword(
              getFirebaseAuth(),
              email,
              password
            );
            return true;
          } catch {
            return false;
          }
        }

        await new Promise((r) => setTimeout(r, 500));
        const entry = DEMO_USERS[email];
        if (entry && entry.password === password) {
          set({ user: entry.user, isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => {
        useProjectStore.getState().clearProject();
        if (isFirebaseConfigured()) {
          void signOut(getFirebaseAuth());
          return;
        }
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
      partialize: (state) =>
        isFirebaseConfigured()
          ? {}
          : {
              user: state.user,
              isAuthenticated: state.isAuthenticated,
            },
    }
  )
);
