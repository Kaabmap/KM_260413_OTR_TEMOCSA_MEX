import { useAuthStore } from '@/store/authStore';
import { Settings } from 'lucide-react';

interface MapToolbarProps {
  onOpenAdmin: () => void;
}

export function MapToolbar({ onOpenAdmin }: MapToolbarProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="absolute top-3 right-3 z-30 flex flex-col gap-2">
      {user?.role === 'admin' && (
        <button
          onClick={onOpenAdmin}
          className="flex items-center gap-2 bg-temocsa-gray-800/90 backdrop-blur-sm border border-temocsa-gray-700/50 rounded-lg px-3 py-2 shadow-lg hover:bg-temocsa-gray-700 transition-colors"
          title="Panel de administración"
        >
          <Settings className="w-4 h-4 text-temocsa-gray-400" />
          <span className="text-xs text-temocsa-gray-300">Admin</span>
        </button>
      )}
    </div>
  );
}
