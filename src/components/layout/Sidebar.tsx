import { useMapStore } from '@/store/mapStore';
import { useAuthStore } from '@/store/authStore';
import {
  Layers,
  Eye,
  EyeOff,
  Ruler,
  PenSquare,
  MousePointer,
  TriangleRight,
  Camera,
  Route,
  Radar,
  MessageSquarePlus,
} from 'lucide-react';

export function Sidebar() {
  const sidebarOpen = useMapStore((s) => s.sidebarOpen);
  const layers = useMapStore((s) => s.layers);
  const toggleLayerVisibility = useMapStore((s) => s.toggleLayerVisibility);
  const setLayerOpacity = useMapStore((s) => s.setLayerOpacity);
  const activeTool = useMapStore((s) => s.activeTool);
  const setActiveTool = useMapStore((s) => s.setActiveTool);
  const user = useAuthStore((s) => s.user);

  if (!sidebarOpen) return null;

  const LAYER_ICONS: Record<string, React.ReactNode> = {
    traza: <Route className="w-3.5 h-3.5" />,
    secciones: <Radar className="w-3.5 h-3.5" />,
    fotos: <Camera className="w-3.5 h-3.5" />,
  };

  const tools = [
    { id: 'select' as const, icon: MousePointer, label: 'Seleccionar' },
    { id: 'measure-distance' as const, icon: Ruler, label: 'Medir distancia' },
    {
      id: 'measure-area' as const,
      icon: TriangleRight,
      label: 'Medir área',
    },
    ...(user?.role !== 'visor'
      ? [
          {
            id: 'comment' as const,
            icon: MessageSquarePlus,
            label: 'Comentario GeoBIM',
          },
        ]
      : []),
  ];

  return (
    <aside className="w-72 bg-temocsa-gray-800 border-r border-temocsa-gray-700 flex flex-col shrink-0 overflow-hidden">
      {/* Tools */}
      <div className="p-3 border-b border-temocsa-gray-700">
        <h3 className="text-xs font-semibold text-temocsa-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <PenSquare className="w-3 h-3" /> Herramientas
        </h3>
        <div className="flex flex-wrap gap-1">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(isActive ? null : tool.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                  isActive
                    ? 'bg-temocsa-red text-white'
                    : 'bg-temocsa-gray-700 text-temocsa-gray-300 hover:bg-temocsa-gray-600'
                }`}
                title={tool.label}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">{tool.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Layers */}
      <div className="flex-1 overflow-y-auto p-3">
        <h3 className="text-xs font-semibold text-temocsa-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Layers className="w-3 h-3" /> Capas
        </h3>
        <div className="space-y-2">
          {layers.map((layer) => (
            <div
              key={layer.id}
              className="bg-temocsa-gray-900 rounded-lg p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex min-w-0 items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: layer.color || '#fff' }}
                  />
                  <span className="shrink-0 text-temocsa-gray-200">
                    {LAYER_ICONS[layer.id]}
                  </span>
                  <span className="truncate text-xs text-temocsa-gray-300">
                    {layer.name}
                  </span>
                </div>
                <button
                  onClick={() => toggleLayerVisibility(layer.id)}
                  className="p-1 hover:bg-temocsa-gray-700 rounded transition-colors"
                >
                  {layer.visible ? (
                    <Eye className="w-3.5 h-3.5 text-temocsa-gray-400" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-temocsa-gray-600" />
                  )}
                </button>
              </div>

              {layer.visible && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-temocsa-gray-500 w-12">
                    Opacidad
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={layer.opacity}
                    onChange={(e) =>
                      setLayerOpacity(layer.id, parseFloat(e.target.value))
                    }
                    className="flex-1 h-1 accent-temocsa-red"
                  />
                  <span className="text-[10px] text-temocsa-gray-500 w-8 text-right">
                    {Math.round(layer.opacity * 100)}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-temocsa-gray-700">
        <p className="text-[10px] text-temocsa-gray-600 text-center">
          Kaab Map · Geomática Aplicada
        </p>
      </div>
    </aside>
  );
}
