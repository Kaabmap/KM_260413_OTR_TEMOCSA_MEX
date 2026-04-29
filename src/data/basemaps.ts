export interface BasemapConfig {
  id: string;
  label: string;
  tiles: string[];
  attribution: string;
  /** Miniatura para botón circular (tile z/x/y) */
  previewTile: string;
}

export const BASEMAPS: BasemapConfig[] = [
  {
    id: 'carto-dark',
    label: 'Oscuro',
    tiles: [
      'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
      'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
      'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
    ],
    attribution:
      '© OpenStreetMap © CARTO',
    previewTile:
      'https://a.basemaps.cartocdn.com/dark_all/2/2/1@2x.png',
  },
  {
    id: 'carto-light',
    label: 'Claro',
    tiles: [
      'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
      'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
      'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
    ],
    attribution: '© OpenStreetMap © CARTO',
    previewTile:
      'https://a.basemaps.cartocdn.com/light_all/2/2/1@2x.png',
  },
  {
    id: 'osm',
    label: 'OSM',
    tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
    attribution: '© OpenStreetMap',
    previewTile: 'https://tile.openstreetmap.org/2/2/1.png',
  },
  {
    id: 'esri-sat',
    label: 'Satélite',
    tiles: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    ],
    attribution:
      'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics',
    previewTile:
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/2/1/1',
  },
];
