import os

ESTRUCTURA = {
    "package.json": r"""{
  "name": "aquaespana-estatico",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "clsx": "^2.1.0",
    "lucide-react": "^0.344.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwind-merge": "^2.2.1",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "@types/react": "^18.2.56",
    "@types/react-dom": "^18.2.19",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.2.2",
    "vite": "^5.1.4"
  }
}""",

    "vite.config.ts": r"""import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  build: { outDir: 'dist' }
});""",

    "tailwind.config.js": r"""/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,tsx,jsx}"],
  theme: { extend: {} },
  plugins: [],
}""",

    "postcss.config.js": r"""export default {
  plugins: { tailwindcss: {}, autoprefixer: {}, },
}""",

    "tsconfig.json": r"""{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}""",

    "tsconfig.node.json": r"""{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}""",

    "index.html": r"""<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AquaEspaña - Tablón Hidrológico</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>""",

    "src/index.css": r"""@tailwind base;
@tailwind components;
@tailwind utilities;

:root { font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif; }
body { margin: 0; background-color: #020617; color: white; overflow: hidden; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #334155; }""",

    "src/main.tsx": r"""import React from 'react'
import ReactDOM from 'react-dom/client'
import { HomePage } from './pages/HomePage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HomePage />
  </React.StrictMode>,
)""",

    "src/lib/utils.ts": r"""import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function getHealthStatus(p: number) {
  if (p < 30) return 'emergency';
  if (p < 50) return 'warning';
  if (p < 70) return 'alert';
  return 'healthy';
}

export function getStatusColorClass(status: string, type: 'text' | 'bg' | 'border' = 'text') {
  const maps: any = {
    text: { emergency: 'text-red-500', warning: 'text-orange-500', alert: 'text-yellow-500', healthy: 'text-emerald-500' },
    bg: { emergency: 'bg-red-500', warning: 'bg-orange-500', alert: 'bg-yellow-500', healthy: 'bg-emerald-500' },
    border: { emergency: 'border-red-500', warning: 'border-orange-500', alert: 'border-yellow-500', healthy: 'border-emerald-500' }
  };
  return maps[type][status] || 'text-slate-500';
}""",

    "src/lib/data-parser.ts": r"""// Adaptador para el nuevo JSON optimizado de ETL
export function parseHydroJson(jsonData: any) {
  const records = jsonData.datos || [];
  const meta = jsonData.metadatos || {};
  
  if (records.length === 0) return { basins: [], reservoirs: [], dataDate: null, syncDate: new Date().toISOString() };

  // La fecha viene en la clave 'f'
  const latestDate = records[0].f; 

  const reservoirs = records.map((r: any) => {
    const curP = (r.aa / r.at) * 100;
    // Usamos m1s (media ultima semana) para la variación reciente
    const preP = r.m1s ? (r.m1s / r.at) * 100 : curP; 
    const avgP = r.ht ? (r.ht / r.at) * 100 : 0;

    return {
      id: `res-${r.en}`,
      name: r.en,
      basin: r.an,
      capacity: r.at,
      current: r.aa,
      variation: curP - preP,
      avg10yP: avgP
    };
  });

  const basinMap: any = {};
  records.forEach((r: any) => {
    if (!basinMap[r.an]) basinMap[r.an] = { name: r.an, cur: 0, cap: 0, prev: 0, ht: 0 };
    basinMap[r.an].cur += r.aa;
    basinMap[r.an].cap += r.at;
    basinMap[r.an].prev += (r.m1s || r.aa);
    basinMap[r.an].ht += (r.ht || 0);
  });

  const basins = Object.entries(basinMap).map(([name, d]: any, i) => ({
    id: `b-${i}`,
    name,
    current: d.cur,
    capacity: d.cap,
    variation: (d.cur / d.cap) * 100 - (d.prev / d.cap) * 100,
    avg10yP: (d.ht / d.cap) * 100
  }));

  return { basins, reservoirs, dataDate: latestDate, syncDate: new Date().toISOString() };
}""",

    "src/store/hydroStore.ts": r"""import { create } from 'zustand';

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
}));""",

    "src/hooks/use-hydro-sync.ts": r"""import { useEffect, useState, useCallback } from 'react';
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
      
      setData({
        basins: result.basins,
        reservoirs: result.reservoirs,
        dataDate: result.dataDate,
        syncDate: result.syncDate
      });
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setIsInitialLoading(false);
    }
  }, [setData]);

  useEffect(() => { refetch(); }, [refetch]);
  return { isInitialLoading, refetch };
}""",

    "src/components/hydro/KPIGrid.tsx": r"""import React from 'react';
import { useHydroStore } from '@/store/hydroStore';
import { Waves, Layers, Activity, Calendar } from 'lucide-react';

export function KPIGrid() {
  const { basins, dataDate } = useHydroStore() as any;
  const totalCap = basins.reduce((a: any, b: any) => a + b.capacity, 0);
  const totalCur = basins.reduce((a: any, b: any) => a + b.current, 0);
  const p = totalCap > 0 ? Math.round((totalCur/totalCap)*100) : 0;

  const kpis = [
    { label: 'Reservas', value: `${totalCur.toLocaleString('es-ES', {maximumFractionDigits:0})} hm³`, icon: Waves, color: 'text-cyan-400' },
    { label: 'Capacidad', value: `${totalCap.toLocaleString('es-ES', {maximumFractionDigits:0})} hm³`, icon: Layers, color: 'text-slate-400' },
    { label: 'Llenado', value: `${p}%`, icon: Activity, color: 'text-emerald-400' },
    { label: 'Fecha Datos', value: dataDate || '--', icon: Calendar, color: 'text-cyan-500' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.map(k => (
        <div key={k.label} className="bg-slate-900/40 border border-slate-800/60 p-3 rounded-xl flex items-center gap-3">
          <k.icon className={`${k.color} w-4 h-4`} />
          <div>
            <div className="text-[9px] font-bold text-slate-500 uppercase">{k.label}</div>
            <div className="text-sm font-mono font-bold text-slate-100">{k.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}""",

    "src/components/hydro/BasinGrid.tsx": r"""import React from 'react';
import { useHydroStore } from '@/store/hydroStore';
import { cn, getHealthStatus, getStatusColorClass } from '@/lib/utils';
import { TrendingUp, TrendingDown, X } from 'lucide-react';

export function BasinGrid() {
  const { basins, selectedId, setSelected } = useHydroStore() as any;
  const sorted = React.useMemo(() => [...basins].sort((a,b) => b.current - a.current), [basins]);

  return (
    <div className="h-full overflow-y-auto pr-4">
      {selectedId && (
        <div className="mb-4 flex justify-end">
           <button onClick={(e) => { e.stopPropagation(); setSelected(null); }} className="text-xs flex items-center gap-1 bg-slate-800/50 hover:bg-slate-800 px-3 py-1.5 rounded-full text-slate-400 hover:text-white transition-colors">
             <X size={12}/> Quitar filtro de cuenca
           </button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
        {sorted.map((b) => {
          const p = Math.round((b.current / b.capacity) * 100);
          const pAvg = Math.round(b.avg10yP);
          const st = getHealthStatus(p);
          const color = getStatusColorClass(st, 'text');
          
          return (
            <div key={b.id} onClick={() => setSelected(b.id)}
              className={cn("p-6 rounded-3xl bg-[#0a0f1d] border cursor-pointer transition-all", selectedId === b.id ? "border-cyan-500/50 ring-1 ring-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]" : "border-slate-800/50 hover:border-slate-700")}>
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-base font-bold text-white leading-tight pr-2">{b.name}</h3>
                <div className="text-right">
                  <div className={cn("text-2xl font-bold", color)}>{p}%</div>
                  <div className={cn("text-[10px] font-bold flex items-center justify-end gap-1", b.variation >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                    {b.variation >= 0 ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}
                    {Math.abs(b.variation).toFixed(1)} pts
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="h-2 w-full bg-slate-800/30 rounded-full overflow-hidden">
                  <div className={cn("h-full", getStatusColorClass(st, 'bg'))} style={{ width: `${p}%` }} />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 bg-slate-800/10 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-500/30" style={{ width: `${pAvg}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 w-8">{pAvg}%</span>
                </div>
              </div>

              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>{b.current.toLocaleString('es-ES', {maximumFractionDigits:1})} hm³</span>
                <span className="opacity-40">Cap: {b.capacity.toLocaleString('es-ES', {maximumFractionDigits:0})}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}""",

    "src/components/hydro/ReservoirList.tsx": r"""import React from 'react';
import { useHydroStore } from '@/store/hydroStore';
import { cn, getHealthStatus, getStatusColorClass } from '@/lib/utils';

export function ReservoirList() {
  const { reservoirs, filterBasinId, basins, sortOrder, setSortOrder } = useHydroStore() as any;
  
  const list = React.useMemo(() => {
    let f = filterBasinId ? reservoirs.filter((r:any) => r.basin === basins.find((b:any)=>b.id===filterBasinId)?.name) : reservoirs;
    return f.sort((a:any, b:any) => sortOrder === 'capacity' ? b.capacity - a.capacity : (b.current/b.capacity) - (a.current/a.capacity));
  }, [reservoirs, filterBasinId, sortOrder, basins]);

  return (
    <div className="flex flex-col h-full border-r border-slate-800/40 bg-[#020617]">
      <div className="p-4 border-b border-slate-800/40 bg-slate-950/50">
        <div className="flex bg-black p-0.5 rounded-lg border border-slate-800">
          <button onClick={()=>setSortOrder('percentage')} className={cn("flex-1 py-1.5 text-[9px] font-bold rounded transition-colors", sortOrder==='percentage'?"bg-cyan-500 text-black":"text-slate-500 hover:text-slate-300")}>% LLENADO</button>
          <button onClick={()=>setSortOrder('capacity')} className={cn("flex-1 py-1.5 text-[9px] font-bold rounded transition-colors", sortOrder==='capacity'?"bg-cyan-500 text-black":"text-slate-500 hover:text-slate-300")}>CAPACIDAD</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {list.map((r:any) => {
            const p = Math.round((r.current/(r.capacity||1))*100);
            const pAvg = Math.round(r.avg10yP);
            const st = getHealthStatus(p);
            return (
              <div key={r.id} className="p-4 rounded-2xl bg-[#0a0f1d] border border-slate-800/40">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[11px] font-bold text-white truncate pr-2" title={r.name}>{r.name}</span>
                  <span className={cn("text-xs font-bold", getStatusColorClass(st, 'text'))}>{p}%</span>
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-500 mb-2">
                  <span>{r.current.toLocaleString('es-ES', {maximumFractionDigits:1})} / {r.capacity.toLocaleString('es-ES', {maximumFractionDigits:1})} hm³</span>
                  <span className={r.variation >= 0 ? 'text-emerald-500' : 'text-red-500'}>{r.variation >= 0 ? '▲' : '▼'} {Math.abs(r.variation).toFixed(1)} pts</span>
                </div>
                <div className="space-y-1.5">
                  <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden">
                    <div className={cn("h-full", getStatusColorClass(st, 'bg'))} style={{ width: `${p}%` }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 bg-slate-800/20 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-600/30" style={{ width: `${pAvg}%` }} />
                    </div>
                    <span className="text-[8px] font-mono text-slate-600">{pAvg}%</span>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}""",

    "src/pages/HomePage.tsx": r"""import React from 'react';
import { BasinGrid } from '@/components/hydro/BasinGrid';
import { ReservoirList } from '@/components/hydro/ReservoirList';
import { KPIGrid } from '@/components/hydro/KPIGrid';
import { useHydroSync } from '@/hooks/use-hydro-sync';
import { Droplet } from 'lucide-react';

export function HomePage() {
  const { isInitialLoading } = useHydroSync();

  if (isInitialLoading) return <div className="h-screen bg-[#020617] flex flex-col items-center justify-center text-cyan-500 font-mono gap-4"><Droplet className="animate-bounce w-8 h-8" /><div>SINCRONIZANDO DATOS...</div></div>;

  return (
    <div className="h-screen w-full bg-[#020617] text-slate-200 flex flex-col overflow-hidden">
      <header className="h-20 border-b border-slate-800/50 flex items-center px-6 justify-between flex-shrink-0 bg-[#020617] z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center"><Droplet className="text-white fill-current" /></div>
          <h1 className="text-xl font-black tracking-tighter uppercase hidden md:block">AQUA<span className="text-cyan-500">ESPAÑA</span></h1>
        </div>
        <div className="flex-1 max-w-4xl px-4 md:px-10"><KPIGrid /></div>
      </header>
      
      <main className="flex-1 flex overflow-hidden relative">
        <aside className="w-72 lg:w-80 flex-shrink-0 hidden md:block"><ReservoirList /></aside>
        <section className="flex-1 p-4 md:p-6 overflow-hidden"><BasinGrid /></section>
      </main>
      
      <footer className="h-10 border-t border-slate-800/40 px-6 flex items-center justify-between text-[10px] font-mono text-slate-500 flex-shrink-0 bg-[#020617]">
        <span>FUENTE: MINISTERIO DE TRANSICIÓN ECOLÓGICA</span>
        <span>VERSIÓN OPTIMIZADA (STATIC)</span>
      </footer>
    </div>
  );
}"""
}

def crear_proyecto():
    print("Iniciando creación de la aplicación Frontend...")
    
    for ruta, contenido in ESTRUCTURA.items():
        directorio = os.path.dirname(ruta)
        if directorio and not os.path.exists(directorio):
            os.makedirs(directorio)
        
        with open(ruta, 'w', encoding='utf-8') as f:
            f.write(contenido)
        print(f"✔️  Creado: {ruta}")
    
    # Crear carpeta public
    if not os.path.exists("public"):
        os.makedirs("public")
    
    print("\n✅ ¡Estructura de la aplicación generada con éxito!")

if __name__ == "__main__":
    crear_proyecto()