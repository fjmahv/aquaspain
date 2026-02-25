import { create } from 'zustand';

interface HydroState {
  basins: any[]; reservoirs: any[]; dataDate: string | null; syncDate: string | null;
  selectedId: string | null; filterBasinId: string | null; sortOrder: 'percentage' | 'capacity';
  setSelected: (id: string | null) => void;
  setSortOrder: (order: 'percentage' | 'capacity') => void;
  setData: (data: { basins: any[], reservoirs: any[], dataDate: string, syncDate: string }) => void;
}

export const useHydroStore = create<HydroState>((set) => ({
  basins: [], reservoirs: [], dataDate: null, syncDate: null, selectedId: null, filterBasinId: null, sortOrder: 'percentage',
  setSelected: (id) => set({ selectedId: id, filterBasinId: id }),
  setSortOrder: (order) => set({ sortOrder: order }),
  setData: ({ basins, reservoirs, dataDate, syncDate }) => set({ basins, reservoirs, dataDate, syncDate })
}));