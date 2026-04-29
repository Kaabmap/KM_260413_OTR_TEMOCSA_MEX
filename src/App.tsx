import { useAuthStore } from '@/store/authStore';
import { useProjectStore } from '@/store/projectStore';
import { LoginPage } from '@/components/auth/LoginPage';
import { ProjectSelectorPage } from '@/pages/ProjectSelectorPage';
import { GeoportalPage } from '@/pages/GeoportalPage';

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const selectedProjectId = useProjectStore((s) => s.selectedProjectId);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (!selectedProjectId) {
    return <ProjectSelectorPage />;
  }

  return <GeoportalPage />;
}
