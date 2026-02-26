

import React from 'react';
import { useHydroStore } from '@/store/hydroStore';
import { cn, getHealthStatus, getStatusColorClass } from '@/lib/utils';
import { TrendingUp, TrendingDown, X } from 'lucide-react';

export function BasinGrid() {
  const { basins, selectedId, setSelected } = useHydroStore() as any;
  const sorted = React.useMemo(() => [...basins].sort((a: any, b: any) => b.current - a.current), [basins]);

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
        {sorted.map((b: any) => {
          const p = Math.round((b.current / b.capacity) * 100);
          const st = getHealthStatus(p);
          const color = getStatusColorClass(st, 'text');
          
          // Configuramos los datos para el mini gráfico
          const histBars = [
            { label: 'HOY', p: p },
            { label: '1M', p: b.m1mP },
            { label: '1A', p: b.ma1P },
            { label: '3A', p: b.h3aP },
            { label: '5A', p: b.h5aP },
            { label: '10A', p: b.h10aP },
          ];
          
          return (
            <div key={b.id} onClick={() => setSelected(b.id)}
              className={cn("p-5 rounded-3xl bg-[#0a0f1d] border cursor-pointer transition-all flex flex-col justify-between", selectedId === b.id ? "border-cyan-500/50 ring-1 ring-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]" : "border-slate-800/50 hover:border-slate-700")}>
              
              {/* Parte Superior: Nombre, Porcentaje y Variación */}
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-base font-bold text-white leading-tight pr-2">{b.name}</h3>
                <div className="text-right">
                  <div className={cn("text-2xl font-bold", color)}>{p}%</div>
                  <div 
                    title="Variación respecto a la semana anterior"
                    className={cn("text-[10px] font-bold flex items-center justify-end gap-1 cursor-help", b.variation >= 0 ? 'text-emerald-500' : 'text-red-500')}
                  >
                    {b.variation >= 0 ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}
                    {Math.abs(b.variation).toFixed(1)} pts
                  </div>
                </div>
              </div>

              {/* Parte Central: Gráfico de Barras Verticales */}
              <div className="flex items-end justify-between h-24 mb-6 gap-2 px-1">
                {histBars.map((bar, i) => {
                  const barP = Math.round(bar.p) || 0;
                  const barSt = getHealthStatus(barP);
                  const barColor = getStatusColorClass(barSt, 'bg');
                  
                  return (
                    <div key={i} className="flex flex-col items-center flex-1 h-full justify-end">
                      <span className="text-[9px] font-mono text-slate-400 mb-1.5">{barP}%</span>
                      {/* Contenedor de la barra que limita la altura máxima */}
                      <div className="w-full bg-slate-800/40 rounded-t flex items-end h-[60px] overflow-hidden">
                         <div 
                           className={cn("w-full transition-all rounded-t", barColor, i === 0 ? "opacity-100" : "opacity-40 hover:opacity-80")} 
                           style={{ height: `${Math.min(100, barP)}%` }} 
                         />
                      </div>
                      <span className={cn("text-[9px] font-bold uppercase mt-2", i === 0 ? "text-cyan-500" : "text-slate-500")}>
                        {bar.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Parte Inferior: Absolutos */}
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
}