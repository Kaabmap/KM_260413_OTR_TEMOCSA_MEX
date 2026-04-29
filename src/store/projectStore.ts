import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProjectState {
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  clearProject: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      selectedProjectId: null,
      setSelectedProjectId: (id) => set({ selectedProjectId: id }),
      clearProject: () => set({ selectedProjectId: null }),
    }),
    { name: 'temocsa-project' }
  )
);
