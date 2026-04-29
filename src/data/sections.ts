import type { PointCloudSection } from '@/types';

/** Única sección LiDAR: carpeta generada por PotreeConverter en public/data/pointclouds/ */
export const pointCloudSections: PointCloudSection[] = [
  {
    id: 'sec-1',
    name: 'Nube de puntos — sección 1',
    kmStart: 0,
    kmEnd: 0,
    path: '/data/pointclouds/seccion_1/',
    bounds: [-105.32, 20.86, -105.08, 21.0],
  },
];

export const ROUTE_CENTER: [number, number] = [-105.19, 20.9];
export const ROUTE_ZOOM = 11;
