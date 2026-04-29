import { useAuthStore } from '@/store/authStore';
import { Settings } from 'lucide-react';

interface MapToolbarProps {
  onOpenAdmin: () => void;
}

export function MapToolbar({ onOpenAdmin }: MapToolbarProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="absolute right-3 top-3 z-30 flex flex-col gap-2">
      {user?.role === 'admin' && (
        <button
          onClick={onOpenAdmin}
          className="flex items-center gap-2 rounded-lg border border-temocsa-gray-700/50 bg-temocsa-gray-800/90 px-2.5 py-2 shadow-lg backdrop-blur-sm transition-colors hover:bg-temocsa-gray-700 sm:px-3"
          title="Panel de administración"
        >
          <Settings className="w-4 h-4 text-temocsa-gray-400" />
          <span className="hidden text-xs text-temocsa-gray-300 sm:inline">Admin</span>
        </button>
      )}
    </div>
  );
}
