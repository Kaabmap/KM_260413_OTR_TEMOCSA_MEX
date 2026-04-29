import { Route, Camera, Box, Users } from 'lucide-react';

const STATS = [
  {
    label: 'Km supervisados',
    value: '+1,100',
    icon: Route,
    color: 'text-temocsa-red',
    bg: 'bg-temocsa-red/10',
  },
  {
    label: 'Secciones LiDAR',
    value: '1',
    icon: Box,
    color: 'text-temocsa-info',
    bg: 'bg-temocsa-info/10',
  },
  {
    label: 'Fotografías',
    value: '1',
    icon: Camera,
    color: 'text-temocsa-warning',
    bg: 'bg-temocsa-warning/10',
  },
  {
    label: 'Usuarios activos',
    value: '3',
    icon: Users,
    color: 'text-temocsa-success',
    bg: 'bg-temocsa-success/10',
  },
];

export function DashboardOverlay() {
  return (
    <div className="absolute top-3 left-3 z-30 flex flex-col gap-2">
      {STATS.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="flex items-center gap-3 bg-temocsa-gray-800/90 backdrop-blur-sm border border-temocsa-gray-700/50 rounded-lg px-3 py-2 shadow-lg min-w-[180px]"
          >
            <div className={`p-1.5 rounded-md ${stat.bg}`}>
              <Icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">
                {stat.value}
              </p>
              <p className="text-[10px] text-temocsa-gray-400">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
