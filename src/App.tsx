import { useEffect } from 'react';
import { useAuthStore, initAuth } from '@/store/authStore';
import { useProjectStore } from '@/store/projectStore';
import { LoginPage } from '@/components/auth/LoginPage';
import { ProjectSelectorPage } from '@/pages/ProjectSelectorPage';
import { GeoportalPage } from '@/pages/GeoportalPage';

export default function App() {
  const authReady = useAuthStore((s) => s.authReady);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const selectedProjectId = useProjectStore((s) => s.selectedProjectId);

  useEffect(() => {
    initAuth();
  }, []);

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-temocsa-gray-900 text-temocsa-gray-400 text-sm">
        Cargando sesión…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (!selectedProjectId) {
    return <ProjectSelectorPage />;
  }

  return <GeoportalPage />;
}
