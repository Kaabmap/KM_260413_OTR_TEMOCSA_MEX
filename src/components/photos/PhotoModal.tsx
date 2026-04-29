import { useMapStore } from '@/store/mapStore';
import { X, MapPin, Calendar, Milestone } from 'lucide-react';

export function PhotoModal() {
  const selectedPhoto = useMapStore((s) => s.selectedPhoto);
  const setSelectedPhoto = useMapStore((s) => s.setSelectedPhoto);

  if (!selectedPhoto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative bg-temocsa-gray-800 rounded-2xl shadow-2xl border border-temocsa-gray-700 max-w-2xl w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-temocsa-gray-700">
          <h3 className="text-sm font-semibold text-white">
            Fotografía de Obra
          </h3>
          <button
            onClick={() => setSelectedPhoto(null)}
            className="p-1 hover:bg-temocsa-gray-700 rounded-md transition-colors"
          >
            <X className="w-4 h-4 text-temocsa-gray-400" />
          </button>
        </div>

        {/* Image */}
        <div className="aspect-video bg-temocsa-gray-900 flex items-center justify-center">
          <img
            src={selectedPhoto.url}
            alt={selectedPhoto.desc}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-temocsa-gray-500">
                  <svg class="w-16 h-16 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p class="text-sm">Imagen no disponible</p>
                  <p class="text-xs mt-1 text-temocsa-gray-600">Coloca las fotos en /public/photos/</p>
                </div>
              `;
            }}
          />
        </div>

        {/* Info */}
        <div className="px-5 py-4 space-y-3">
          <p className="text-sm text-white font-medium">{selectedPhoto.desc}</p>
          <div className="flex flex-wrap gap-4 text-xs text-temocsa-gray-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-temocsa-red" />
              {selectedPhoto.coord[1].toFixed(4)}, {selectedPhoto.coord[0].toFixed(4)}
            </span>
            {selectedPhoto.date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-temocsa-info" />
                {selectedPhoto.date}
              </span>
            )}
            {selectedPhoto.km && (
              <span className="flex items-center gap-1">
                <Milestone className="w-3 h-3 text-temocsa-success" />
                Km {selectedPhoto.km}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
