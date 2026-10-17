import { useEffect, useState, useCallback } from 'react';
import { useHydroStore } from '@/store/hydroStore';
import { parseHydroJson } from '@/lib/data-parser';

export function useHydroSync() {
  const setData = useHydroStore((s) => s.setData);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      // Leemos directamente de la carpeta public/ o la raíz del dominio
      const response = await fetch('/datos_embalses_optimizado.json');
      const rawData = await response.json();
      const result = parseHydroJson(rawData);

      // Prefer the server-side refresh timestamp exposed by the Worker
      // (x-data-uploaded-at header); fall back to the client fetch time.
      const serverSyncDate = response.headers.get('x-data-uploaded-at');

      setData({
        basins: result.basins,
        reservoirs: result.reservoirs,
        dataDate: result.dataDate,
        syncDate: serverSyncDate ?? result.syncDate
      });
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setIsInitialLoading(false);
    }
  }, [setData]);

  useEffect(() => { refetch(); }, [refetch]);
  return { isInitialLoading, refetch };
}