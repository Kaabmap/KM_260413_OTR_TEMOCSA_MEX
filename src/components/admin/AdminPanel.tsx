import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
  Users,
  FolderKanban,
  Plus,
  Trash2,
  Shield,
  Pencil,
  Eye,
  ArrowLeft,
} from 'lucide-react';
import type { User, UserRole, Project } from '@/types';

const MOCK_USERS: User[] = [
  { id: '1', name: 'Administrador TEMOCSA', email: 'admin@temocsa.com', role: 'admin' },
  { id: '2', name: 'Ing. Carlos Mendoza', email: 'editor@temocsa.com', role: 'editor' },
  { id: '3', name: 'Consultor Externo', email: 'visor@temocsa.com', role: 'visor' },
];

const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Autopista Las Varas — Puerto Vallarta',
    description: 'Supervisión geotécnica y levantamiento LiDAR del tramo carretero.',
    route: 'Las Varas - Puerto Vallarta',
    kmStart: 35,
    kmEnd: 70,
    status: 'activo',
    createdAt: '2025-01-15',
    assignedUsers: ['1', '2', '3'],
  },
];

const ROLE_ICONS = {
  admin: Shield,
  editor: Pencil,
  visor: Eye,
};

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'text-temocsa-red bg-temocsa-red/10',
  editor: 'text-temocsa-warning bg-temocsa-warning/10',
  visor: 'text-temocsa-info bg-temocsa-info/10',
};

interface AdminPanelProps {
  onBack: () => void;
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'projects'>('users');
  const user = useAuthStore((s) => s.user);

  if (user?.role !== 'admin') {
    return (
      <div className="flex-1 flex items-center justify-center bg-temocsa-gray-900">
        <p className="text-temocsa-gray-500">Acceso restringido a administradores.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-temocsa-gray-900 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="p-2 hover:bg-temocsa-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-temocsa-gray-400" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white">Panel de Administración</h2>
            <p className="text-sm text-temocsa-gray-400">
              Gestión de usuarios y proyectos
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-temocsa-gray-800 p-1 rounded-lg w-fit">
          {[
            { id: 'users' as const, label: 'Usuarios', icon: Users },
            { id: 'projects' as const, label: 'Proyectos', icon: FolderKanban },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-temocsa-red text-white'
                    : 'text-temocsa-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-temocsa-gray-300">
                Usuarios registrados ({MOCK_USERS.length})
              </h3>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-temocsa-red hover:bg-temocsa-red-dark text-white text-xs font-medium rounded-lg transition-colors">
                <Plus className="w-3.5 h-3.5" /> Nuevo usuario
              </button>
            </div>

            <div className="bg-temocsa-gray-800 rounded-xl border border-temocsa-gray-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-temocsa-gray-700">
                    <th className="text-left text-xs font-medium text-temocsa-gray-400 px-4 py-3">
                      Nombre
                    </th>
                    <th className="text-left text-xs font-medium text-temocsa-gray-400 px-4 py-3">
                      Email
                    </th>
                    <th className="text-left text-xs font-medium text-temocsa-gray-400 px-4 py-3">
                      Rol
                    </th>
                    <th className="text-right text-xs font-medium text-temocsa-gray-400 px-4 py-3">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_USERS.map((u) => {
                    const RoleIcon = ROLE_ICONS[u.role];
                    return (
                      <tr
                        key={u.id}
                        className="border-b border-temocsa-gray-700/50 last:border-0 hover:bg-temocsa-gray-700/30"
                      >
                        <td className="px-4 py-3 text-sm text-white">{u.name}</td>
                        <td className="px-4 py-3 text-sm text-temocsa-gray-400">
                          {u.email}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role]}`}
                          >
                            <RoleIcon className="w-3 h-3" />
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="p-1 hover:bg-temocsa-gray-700 rounded transition-colors">
                            <Pencil className="w-3.5 h-3.5 text-temocsa-gray-500" />
                          </button>
                          <button className="p-1 hover:bg-temocsa-red/20 rounded transition-colors ml-1">
                            <Trash2 className="w-3.5 h-3.5 text-temocsa-gray-500 hover:text-temocsa-red" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-temocsa-gray-300">
                Proyectos ({MOCK_PROJECTS.length})
              </h3>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-temocsa-red hover:bg-temocsa-red-dark text-white text-xs font-medium rounded-lg transition-colors">
                <Plus className="w-3.5 h-3.5" /> Nuevo proyecto
              </button>
            </div>

            {MOCK_PROJECTS.map((proj) => (
              <div
                key={proj.id}
                className="bg-temocsa-gray-800 rounded-xl border border-temocsa-gray-700 p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{proj.name}</h4>
                    <p className="text-xs text-temocsa-gray-400 mt-1">
                      {proj.description}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      proj.status === 'activo'
                        ? 'bg-temocsa-success/10 text-temocsa-success'
                        : proj.status === 'pausado'
                          ? 'bg-temocsa-warning/10 text-temocsa-warning'
                          : 'bg-temocsa-gray-600/20 text-temocsa-gray-400'
                    }`}
                  >
                    {proj.status}
                  </span>
                </div>
                <div className="flex gap-6 mt-4 text-xs text-temocsa-gray-500">
                  <span>Ruta: {proj.route}</span>
                  <span>Km {proj.kmStart}–{proj.kmEnd}</span>
                  <span>{proj.assignedUsers.length} usuarios asignados</span>
                  <span>Creado: {proj.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
