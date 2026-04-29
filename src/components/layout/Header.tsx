import { useAuthStore } from '@/store/authStore';
import { useMapStore } from '@/store/mapStore';
import { useProjectStore } from '@/store/projectStore';
import { PROJECTS } from '@/data/projects';
import {
  MapPin,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Shield,
  Eye,
  Pencil,
  FolderOpen,
} from 'lucide-react';

const ROLE_CONFIG = {
  admin: { label: 'Administrador', icon: Shield, color: 'text-temocsa-red' },
  editor: { label: 'Editor', icon: Pencil, color: 'text-temocsa-warning' },
  visor: { label: 'Visor', icon: Eye, color: 'text-temocsa-info' },
} as const;

export function Header() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const sidebarOpen = useMapStore((s) => s.sidebarOpen);
  const toggleSidebar = useMapStore((s) => s.toggleSidebar);
  const selectedProjectId = useProjectStore((s) => s.selectedProjectId);
  const setSelectedProjectId = useProjectStore((s) => s.setSelectedProjectId);

  if (!user) return null;

  const project = PROJECTS.find((p) => p.id === selectedProjectId);

  const roleInfo = ROLE_CONFIG[user.role];
  const RoleIcon = roleInfo.icon;

  return (
    <header className="h-12 bg-temocsa-gray-800 border-b border-temocsa-gray-700 flex items-center justify-between px-4 shrink-0 z-50">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 hover:bg-temocsa-gray-700 rounded-md transition-colors"
          title={sidebarOpen ? 'Colapsar panel' : 'Expandir panel'}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="w-4 h-4 text-temocsa-gray-400" />
          ) : (
            <PanelLeftOpen className="w-4 h-4 text-temocsa-gray-400" />
          )}
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-temocsa-red rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-white leading-tight">
              TEMOCSA <span className="text-temocsa-red">Geoportal</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Center */}
      <div className="hidden max-w-md flex-1 items-center justify-center gap-2 md:flex">
        <span className="truncate rounded-md bg-temocsa-gray-700 px-2 py-1 text-xs font-medium text-temocsa-gray-200">
          {project?.name ?? 'Proyecto'}
        </span>
        <button
          type="button"
          onClick={() => setSelectedProjectId(null)}
          className="flex shrink-0 items-center gap-1 rounded-md border border-temocsa-gray-600 px-2 py-1 text-[11px] text-temocsa-gray-300 hover:bg-temocsa-gray-700"
          title="Elegir otro proyecto"
        >
          <FolderOpen className="h-3 w-3" />
          Proyectos
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <RoleIcon className={`w-3.5 h-3.5 ${roleInfo.color}`} />
          <span className="text-xs text-temocsa-gray-300 hidden sm:inline">
            {user.name}
          </span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded ${roleInfo.color} bg-temocsa-gray-700`}
          >
            {roleInfo.label}
          </span>
        </div>

        <button
          onClick={logout}
          className="p-1.5 hover:bg-temocsa-gray-700 rounded-md transition-colors group"
          title="Cerrar sesión"
        >
          <LogOut className="w-4 h-4 text-temocsa-gray-400 group-hover:text-temocsa-red" />
        </button>
      </div>
    </header>
  );
}
