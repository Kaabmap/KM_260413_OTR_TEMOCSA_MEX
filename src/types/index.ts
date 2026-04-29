export type UserRole = 'admin' | 'editor' | 'visor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  route: string;
  kmStart: number;
  kmEnd: number;
  status: 'activo' | 'pausado' | 'finalizado';
  createdAt: string;
  assignedUsers: string[];
}

export interface GeoPhoto {
  id: number;
  coord: [number, number];
  url: string;
  desc: string;
  date?: string;
  km?: number;
}

export interface PointCloudSection {
  id: string;
  name: string;
  kmStart: number;
  kmEnd: number;
  path: string;
  bounds: [number, number, number, number];
}

export interface LayerConfig {
  id: string;
  name: string;
  type: 'vector' | 'raster' | 'pointcloud' | 'photos' | 'comments';
  visible: boolean;
  opacity: number;
  source?: string;
  color?: string;
}

export interface GeoBIMComment {
  id: string;
  userId: string;
  userName: string;
  coord: [number, number];
  text: string;
  section?: string;
  createdAt: string;
  resolved: boolean;
}

export interface MeasurementResult {
  type: 'distance' | 'area';
  value: number;
  unit: string;
  coordinates: [number, number][];
}
