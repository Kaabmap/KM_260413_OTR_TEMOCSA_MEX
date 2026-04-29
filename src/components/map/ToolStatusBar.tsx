import { useMapStore } from '@/store/mapStore';
import { areaToolBridge } from '@/map/areaToolBridge';
import { X } from 'lucide-react';

export function ToolStatusBar() {
  const activeTool = useMapStore((s) => s.activeTool);
  const measureStatus = useMapStore((s) => s.measureStatus);
  const setActiveTool = useMapStore((s) => s.setActiveTool);
  const setMeasureStatus = useMapStore((s) => s.setMeasureStatus);

  if (activeTool === 'select') return null;

  return (
    <div className="absolute bottom-24 left-1/2 z-[45] max-w-lg -translate-x-1/2 rounded-lg border border-temocsa-gray-600 bg-temocsa-gray-900/95 px-4 py-2 text-center text-xs text-temocsa-gray-200 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <p className="flex-1 text-left">{measureStatus ?? '…'}</p>
          <button
            type="button"
            onClick={() => {
              setMeasureStatus(null);
              setActiveTool('select');
            }}
            className="shrink-0 rounded p-0.5 hover:bg-temocsa-gray-700"
            title="Cerrar"
          >
            <X className="h-4 w-4 text-temocsa-gray-400" />
          </button>
        </div>
        {activeTool === 'measure-area' && areaToolBridge.closePolygon && (
          <button
            type="button"
            onClick={() => areaToolBridge.closePolygon?.()}
            className="w-full rounded-md border border-temocsa-gray-600 py-1.5 text-[11px] font-medium text-temocsa-gray-200 hover:bg-temocsa-gray-700"
          >
            Cerrar polígono y calcular área
          </button>
        )}
      </div>
    </div>
  );
}
