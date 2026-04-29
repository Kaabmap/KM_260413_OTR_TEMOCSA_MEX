import { useAuthStore } from '@/store/authStore';
import { useProjectStore } from '@/store/projectStore';
import { PROJECTS } from '@/data/projects';
import { MapPin, LogOut, ChevronRight } from 'lucide-react';

export function ProjectSelectorPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const setSelectedProjectId = useProjectStore((s) => s.setSelectedProjectId);

  return (
    <div className="flex min-h-screen flex-col bg-temocsa-gray-900">
      <header className="flex items-center justify-between border-b border-temocsa-gray-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-temocsa-red">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">
              TEMOCSA <span className="text-temocsa-red">Geoportal</span>
            </h1>
            <p className="text-xs text-temocsa-gray-500">Selecciona un proyecto</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-temocsa-gray-400 sm:inline">
            {user?.name}
          </span>
          <button
            type="button"
            onClick={logout}
            className="rounded-md p-2 hover:bg-temocsa-gray-800"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4 text-temocsa-gray-400" />
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-10">
        <h2 className="mb-6 text-lg font-semibold text-white">Proyectos disponibles</h2>
        <ul className="space-y-3">
          {PROJECTS.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setSelectedProjectId(p.id)}
                className="group flex w-full items-center justify-between rounded-xl border border-temocsa-gray-700 bg-temocsa-gray-800 p-5 text-left transition-colors hover:border-temocsa-red/50 hover:bg-temocsa-gray-800/80"
              >
                <div>
                  <p className="font-medium text-white">{p.name}</p>
                  <p className="mt-1 text-xs text-temocsa-gray-400">{p.description}</p>
                  <p className="mt-2 text-[11px] text-temocsa-gray-500">
                    {p.route} · Km {p.kmStart}–{p.kmEnd} ·{' '}
                    <span
                      className={
                        p.status === 'activo'
                          ? 'text-temocsa-success'
                          : 'text-temocsa-gray-500'
                      }
                    >
                      {p.status}
                    </span>
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-temocsa-gray-500 transition-transform group-hover:translate-x-0.5 group-hover:text-temocsa-red" />
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
