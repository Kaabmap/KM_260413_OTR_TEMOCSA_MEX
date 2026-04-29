import { useMapStore } from '@/store/mapStore';
import {
  X,
  GripVertical,
  Box,
  PictureInPicture2,
  PanelBottom,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const METADATA_PATH = '/data/pointclouds/seccion_1/metadata.json';

export function PotreeViewer() {
  const selectedSection = useMapStore((s) => s.selectedSection);
  const showPotreeViewer = useMapStore((s) => s.showPotreeViewer);
  const potreeUiMode = useMapStore((s) => s.potreeUiMode);
  const setShowPotreeViewer = useMapStore((s) => s.setShowPotreeViewer);
  const setPotreeUiMode = useMapStore((s) => s.setPotreeUiMode);
  const setSelectedSection = useMapStore((s) => s.setSelectedSection);

  const [floatPos, setFloatPos] = useState({ left: 80, top: 88 });
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const floatDrag = useRef<{
    active: boolean;
    sx: number;
    sy: number;
    ox: number;
    oy: number;
  } | null>(null);

  const onFloatMove = useCallback((e: MouseEvent) => {
    const d = floatDrag.current;
    if (!d?.active) return;
    setFloatPos({
      left: Math.max(8, d.ox + (e.clientX - d.sx)),
      top: Math.max(56, d.oy + (e.clientY - d.sy)),
    });
  }, []);

  const onFloatUp = useCallback(() => {
    if (floatDrag.current) floatDrag.current.active = false;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onFloatMove);
    window.addEventListener('mouseup', onFloatUp);
    return () => {
      window.removeEventListener('mousemove', onFloatMove);
      window.removeEventListener('mouseup', onFloatUp);
    };
  }, [onFloatMove, onFloatUp]);

  useEffect(() => {
    // Reinicia el estado cada vez que se abre/cambia sección.
    setIframeLoaded(false);
  }, [showPotreeViewer, selectedSection?.id]);

  const handleClose = () => {
    setShowPotreeViewer(false);
    setSelectedSection(null);
    setPotreeUiMode('docked');
  };

  const iframeSrc = `/potree/viewer.html?metadata=${encodeURIComponent(METADATA_PATH)}`;

  if (!showPotreeViewer || !selectedSection) return null;

  const isFloating = potreeUiMode === 'floating';

  const startFloatDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    floatDrag.current = {
      active: true,
      sx: e.clientX,
      sy: e.clientY,
      ox: floatPos.left,
      oy: floatPos.top,
    };
  };

  const header = (
    <div className="flex shrink-0 items-center justify-between border-b border-temocsa-gray-700 bg-temocsa-gray-800 px-2 py-2">
      <div
        className={`flex min-w-0 flex-1 items-center gap-2 pl-1 ${
          isFloating ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
        onMouseDown={isFloating ? startFloatDrag : undefined}
        title={isFloating ? 'Arrastrar desde aquí' : undefined}
      >
        {isFloating && (
          <GripVertical className="h-4 w-4 shrink-0 text-temocsa-gray-500" />
        )}
        <Box className="h-4 w-4 shrink-0 text-temocsa-info" />
        <span className="truncate text-xs font-medium text-white sm:text-sm">
          {selectedSection.name}
        </span>
      </div>

      <div
        className="flex shrink-0 items-center gap-1"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {!isFloating ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPotreeUiMode('floating');
              requestAnimationFrame(() => {
                window.dispatchEvent(new CustomEvent('temocsa-map-resize'));
              });
            }}
            className="flex items-center gap-1 rounded-md border border-temocsa-gray-600 px-2 py-1 text-[11px] font-medium text-temocsa-gray-200 hover:bg-temocsa-gray-700"
            title="Ventana flotante: el mapa vuelve a pantalla completa"
          >
            <PictureInPicture2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ventana flotante</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPotreeUiMode('docked');
              requestAnimationFrame(() => {
                window.dispatchEvent(new CustomEvent('temocsa-map-resize'));
              });
            }}
            className="flex items-center gap-1 rounded-md border border-temocsa-gray-600 px-2 py-1 text-[11px] font-medium text-temocsa-gray-200 hover:bg-temocsa-gray-700"
            title="Acoplar visor en la mitad inferior"
          >
            <PanelBottom className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Acoplar abajo</span>
          </button>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="rounded p-1.5 transition-colors hover:bg-temocsa-red/20"
          title="Cerrar visor"
        >
          <X className="h-4 w-4 text-temocsa-gray-400 hover:text-temocsa-red" />
        </button>
      </div>
    </div>
  );

  const frame = (
    <div className="relative min-h-0 flex-1 bg-black">
      {!iframeLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-[1px]">
          <div className="w-[min(92%,420px)] rounded-xl border border-temocsa-gray-700 bg-temocsa-gray-900/95 p-4 shadow-xl">
            <p className="mb-2 text-sm font-medium text-white">
              Cargando nube de puntos...
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-temocsa-gray-700">
              <div className="h-full w-full animate-pulse rounded-full bg-temocsa-info" />
            </div>
            <p className="mt-2 text-xs text-temocsa-gray-400">
              Esto puede tardar un poco en web por el tamaño del octree.
            </p>
          </div>
        </div>
      )}
      <iframe
        src={iframeSrc}
        className="h-full w-full border-0"
        title={`Potree — ${selectedSection.name}`}
        allow="fullscreen"
        onLoad={() => setIframeLoaded(true)}
      />
    </div>
  );

  if (!isFloating) {
    return (
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
        {header}
        {frame}
      </div>
    );
  }

  return (
    <div
      className="pointer-events-auto fixed z-[40] flex flex-col rounded-xl border border-temocsa-gray-600 bg-temocsa-gray-900 shadow-2xl"
      style={{
        left: floatPos.left,
        top: floatPos.top,
        width: 'min(720px, calc(100vw - 32px))',
        height: 'min(520px, calc(100vh - 72px))',
        minWidth: 280,
        minHeight: 220,
        maxWidth: 'calc(100vw - 16px)',
        maxHeight: 'calc(100vh - 64px)',
        resize: 'both',
        overflow: 'hidden',
      }}
    >
      {header}
      {frame}
    </div>
  );
}
