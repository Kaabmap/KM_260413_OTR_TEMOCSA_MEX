import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
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

const API_KEY_HELP =
  'Revisa: (1) En Firebase → Configuración → tu app Web, copia de nuevo el campo apiKey al .env como VITE_FIREBASE_API_KEY (sin espacios ni comillas). (2) En Google Cloud → APIs y servicios → Credenciales, edita la clave de tipo “Clave de API del navegador”: en “Restricciones de sitios web” añade https://*.web.app/* y https://*.firebaseapp.com/* (o deja “Ninguno” solo para probar). (3) En “Restricciones de API” permite “Identity Toolkit API” o “No restringir”. (4) npm run build y vuelve a desplegar.';

function firebaseLoginErrorMessage(err: unknown): string {
  if (err instanceof FirebaseError) {
    const { code, message } = err;
    const msgLower = message.toLowerCase();
    if (
      code.includes('api-key') ||
      code === 'auth/invalid-api-key' ||
      msgLower.includes('api key') ||
      msgLower.includes('api-key')
    ) {
      return `La API key de Firebase no es válida o está bloqueada para este sitio. ${API_KEY_HELP}`;
    }
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
      case 'auth/invalid-login-credentials':
        return 'Correo o contraseña incorrectos. Si acabas de crear el usuario en Firebase, revisa que la contraseña sea exactamente la misma (mayúsculas y minúsculas).';
      case 'auth/invalid-email':
        return 'El formato del correo no es válido.';
      case 'auth/user-disabled':
        return 'Esta cuenta está deshabilitada en Firebase.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Espera unos minutos o restablece la contraseña en la consola de Firebase.';
      case 'auth/operation-not-allowed':
        return 'Inicio con correo y contraseña no está activado. En Firebase: Authentication → Sign-in method → Correo/contraseña.';
      case 'auth/invalid-api-key':
        return 'API key de Firebase no válida o con restricciones incorrectas en Google Cloud Console.';
      default:
        if (
          message.includes('API key') ||
          message.includes('blocked') ||
          message.includes('BILLING_DISABLED')
        ) {
          return `Error de configuración en Firebase (${code}). Revisa restricciones de la API key y facturación del proyecto.`;
        }
        return `No se pudo iniciar sesión (${code}).`;
    }
  }
  return 'No se pudo iniciar sesión. Revisa la consola del navegador (pestaña Red) para más detalle.';
}

interface AuthState {
  /** Listo para mostrar login / sesión (Firebase espera primer evento; demo tras rehidratación). */
  authReady: boolean;
  user: User | null;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
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
        const emailNorm = email.trim().toLowerCase();
        if (isFirebaseConfigured()) {
          try {
            await signInWithEmailAndPassword(
              getFirebaseAuth(),
              emailNorm,
              password
            );
            return { ok: true };
          } catch (e) {
            console.warn('[auth]', e);
            return { ok: false, message: firebaseLoginErrorMessage(e) };
          }
        }

        await new Promise((r) => setTimeout(r, 500));
        const entry = DEMO_USERS[emailNorm];
        if (entry && entry.password === password) {
          set({ user: entry.user, isAuthenticated: true });
          return { ok: true };
        }
        return {
          ok: false,
          message:
            'Credenciales inválidas. Verifique su correo y contraseña.',
        };
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
