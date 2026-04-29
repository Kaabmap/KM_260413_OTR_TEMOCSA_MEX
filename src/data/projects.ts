import type { Project } from '@/types';

export const PROJECTS: Project[] = [
  {
    id: 'lv-pv-2025',
    name: 'Autopista Las Varas — Puerto Vallarta',
    description:
      'Supervisión geomática, LiDAR y fotografía de obra del tramo carretero.',
    route: 'Las Varas — Puerto Vallarta',
    kmStart: 35,
    kmEnd: 70,
    status: 'activo',
    createdAt: '2025-01-15',
    assignedUsers: ['1', '2', '3'],
  },
];
