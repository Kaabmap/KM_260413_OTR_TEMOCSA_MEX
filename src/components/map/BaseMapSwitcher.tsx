import { BASEMAPS } from '@/data/basemaps';
import { useMapStore } from '@/store/mapStore';

export function BaseMapSwitcher() {
  const basemapId = useMapStore((s) => s.basemapId);
  const setBasemapId = useMapStore((s) => s.setBasemapId);

  return (
    <div className="absolute bottom-4 left-1/2 z-50 flex -translate-x-1/2 gap-2 rounded-full border border-temocsa-gray-700 bg-temocsa-gray-900/90 px-2 py-2 shadow-lg backdrop-blur-sm">
      {BASEMAPS.map((bm) => {
        const active = basemapId === bm.id;
        return (
          <button
            key={bm.id}
            type="button"
            title={bm.label}
            onClick={() => setBasemapId(bm.id)}
            className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 transition-all ${
              active
                ? 'border-temocsa-red ring-2 ring-temocsa-red/40'
                : 'border-temocsa-gray-600 opacity-80 hover:opacity-100'
            }`}
            style={{
              backgroundImage: `url(${bm.previewTile})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <span className="sr-only">{bm.label}</span>
            {active && (
              <span className="absolute bottom-0.5 left-1/2 max-w-[90%] -translate-x-1/2 truncate rounded bg-black/70 px-1 text-[9px] font-medium text-white">
                {bm.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
