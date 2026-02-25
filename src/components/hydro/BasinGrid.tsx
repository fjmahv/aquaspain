import React from 'react';
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
}