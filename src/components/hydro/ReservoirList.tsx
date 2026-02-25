import React from 'react';
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
}