import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LayerConfig, GeoPhoto, PointCloudSection, GeoBIMComment } from '@/types';
import { BASEMAPS } from '@/data/basemaps';

export const VECTOR_GEOJSON_URL = '/data/vector/traza.geojson';

export type PotreeUiMode = 'docked' | 'floating';

interface MapState {
  layers: LayerConfig[];
  basemapId: string;
  selectedSection: PointCloudSection | null;
  showPotreeViewer: boolean;
  /** Acoplado abajo 50% vs ventana flotante sobre el mapa */
  potreeUiMode: PotreeUiMode;
  selectedPhoto: GeoPhoto | null;
  comments: GeoBIMComment[];
  sidebarOpen: boolean;
  activeTool: 'select' | 'measure-distance' | 'measure-area' | 'comment';
  /** Medición en curso o último resultado (texto para panel) */
  measureStatus: string | null;
  /** Click en mapa para comentario GeoBIM */
  commentDraftCoord: [number, number] | null;
  /** Efecto “sonar” en el último comentario guardado */
  pulseCommentId: string | null;

  setLayers: (layers: LayerConfig[]) => void;
  toggleLayerVisibility: (layerId: string) => void;
  setLayerOpacity: (layerId: string, opacity: number) => void;
  setBasemapId: (id: string) => void;
  setSelectedSection: (section: PointCloudSection | null) => void;
  setShowPotreeViewer: (show: boolean) => void;
  setPotreeUiMode: (mode: PotreeUiMode) => void;
  setSelectedPhoto: (photo: GeoPhoto | null) => void;
  setComments: (comments: GeoBIMComment[]) => void;
  addComment: (comment: GeoBIMComment) => void;
  removeComment: (commentId: string) => void;
  resolveComment: (commentId: string) => void;
  toggleSidebar: () => void;
  setActiveTool: (tool: MapState['activeTool'] | null) => void;
  setMeasureStatus: (msg: string | null) => void;
  setCommentDraftCoord: (c: [number, number] | null) => void;
  setPulseCommentId: (id: string | null) => void;
}

const defaultBasemap =
  BASEMAPS.find((b) => b.id === 'esri-sat')?.id ?? BASEMAPS[0]?.id ?? 'esri-sat';

export const useMapStore = create<MapState>()(
  persist(
    (set) => ({
      layers: [
        {
          id: 'traza',
          name: 'Traza (GeoJSON)',
          type: 'vector',
          visible: true,
          opacity: 1,
          source: VECTOR_GEOJSON_URL,
          color: '#C8102E',
        },
        {
          id: 'secciones',
          name: 'Área LiDAR',
          type: 'pointcloud',
          visible: true,
          opacity: 0.85,
          color: '#3498DB',
        },
        {
          id: 'fotos',
          name: 'Fotos de obra',
          type: 'photos',
          visible: true,
          opacity: 1,
          color: '#F39C12',
        },
        {
          id: 'comentarios',
          name: 'Comentarios GeoBIM',
          type: 'comments',
          visible: true,
          opacity: 1,
          color: '#9B59B6',
        },
      ],
      basemapId: defaultBasemap,
      selectedSection: null,
      showPotreeViewer: false,
      potreeUiMode: 'docked',
      selectedPhoto: null,
      comments: [],
      sidebarOpen: true,
      activeTool: 'select',
      measureStatus: null,
      commentDraftCoord: null,
      pulseCommentId: null,

      setLayers: (layers) => set({ layers }),
      toggleLayerVisibility: (layerId) =>
        set((state) => ({
          layers: state.layers.map((l) =>
            l.id === layerId ? { ...l, visible: !l.visible } : l
          ),
        })),
      setLayerOpacity: (layerId, opacity) =>
        set((state) => ({
          layers: state.layers.map((l) =>
            l.id === layerId ? { ...l, opacity } : l
          ),
        })),
      setBasemapId: (id) => set({ basemapId: id }),
      setSelectedSection: (section) => set({ selectedSection: section }),
      setShowPotreeViewer: (show) =>
        set({
          showPotreeViewer: show,
          ...(show ? {} : { potreeUiMode: 'docked' as PotreeUiMode }),
        }),
      setPotreeUiMode: (mode) => set({ potreeUiMode: mode }),
      setSelectedPhoto: (photo) => set({ selectedPhoto: photo }),
      setComments: (comments) => set({ comments }),
      addComment: (comment) =>
        set((state) => ({ comments: [...state.comments, comment] })),
      removeComment: (commentId) =>
        set((state) => ({
          comments: state.comments.filter((c) => c.id !== commentId),
        })),
      resolveComment: (commentId) =>
        set((state) => ({
          comments: state.comments.map((c) =>
            c.id === commentId ? { ...c, resolved: true } : c
          ),
        })),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setActiveTool: (tool) =>
        set({
          activeTool: tool ?? 'select',
          commentDraftCoord: null,
        }),
      setMeasureStatus: (msg) => set({ measureStatus: msg }),
      setCommentDraftCoord: (c) => set({ commentDraftCoord: c }),
      setPulseCommentId: (id) => set({ pulseCommentId: id }),
    }),
    {
      name: 'temocsa-map',
      partialize: (state) => ({ comments: state.comments }),
    }
  )
);
