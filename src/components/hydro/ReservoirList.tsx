// import React from 'react';
// import { useHydroStore } from '@/store/hydroStore';
// import { cn, getHealthStatus, getStatusColorClass } from '@/lib/utils';

// export function ReservoirList() {
//   const { reservoirs, filterBasinId, basins, sortOrder, setSortOrder } = useHydroStore() as any;
  
//   const list = React.useMemo(() => {
//     let f = filterBasinId ? reservoirs.filter((r:any) => r.basin === basins.find((b:any)=>b.id===filterBasinId)?.name) : reservoirs;
//     return f.sort((a:any, b:any) => sortOrder === 'capacity' ? b.capacity - a.capacity : (b.current/b.capacity) - (a.current/a.capacity));
//   }, [reservoirs, filterBasinId, sortOrder, basins]);

//   return (
//     <div className="flex flex-col h-full border-r border-slate-800/40 bg-[#020617]">
//       <div className="p-4 border-b border-slate-800/40 bg-slate-950/50">
//         <div className="flex bg-black p-0.5 rounded-lg border border-slate-800">
//           <button onClick={()=>setSortOrder('percentage')} className={cn("flex-1 py-1.5 text-[9px] font-bold rounded transition-colors", sortOrder==='percentage'?"bg-cyan-500 text-black":"text-slate-500 hover:text-slate-300")}>% LLENADO</button>
//           <button onClick={()=>setSortOrder('capacity')} className={cn("flex-1 py-1.5 text-[9px] font-bold rounded transition-colors", sortOrder==='capacity'?"bg-cyan-500 text-black":"text-slate-500 hover:text-slate-300")}>CAPACIDAD</button>
//         </div>
//       </div>
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//           {list.map((r:any) => {
//             const p = Math.round((r.current/(r.capacity||1))*100);
//             const pAvg = Math.round(r.avg10yP);
//             const st = getHealthStatus(p);
//             return (
//               <div key={r.id} className="p-4 rounded-2xl bg-[#0a0f1d] border border-slate-800/40">
//                 <div className="flex justify-between items-start mb-2">
//                   <span className="text-[11px] font-bold text-white truncate pr-2" title={r.name}>{r.name}</span>
//                   <span className={cn("text-xs font-bold", getStatusColorClass(st, 'text'))}>{p}%</span>
//                 </div>
//                 <div className="flex justify-between text-[9px] font-mono text-slate-500 mb-2">
//                   <span>{r.current.toLocaleString('es-ES', {maximumFractionDigits:1})} / {r.capacity.toLocaleString('es-ES', {maximumFractionDigits:1})} hm³</span>
//                     <span 
//                       title="Variación respecto a la semana anterior"
//                       className={cn("cursor-help", r.variation >= 0 ? 'text-emerald-500' : 'text-red-500')}
//                     >
//                       {r.variation >= 0 ? '▲' : '▼'} {Math.abs(r.variation).toFixed(1)} pts
//                     </span>                </div>
//                 <div className="space-y-1.5">
//                   <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden">
//                     <div className={cn("h-full", getStatusColorClass(st, 'bg'))} style={{ width: `${p}%` }} />
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <div className="h-2 flex-1 bg-slate-800/20 rounded-full overflow-hidden">
//                       <div className="h-full bg-slate-600/30" style={{ width: `${pAvg}%` }} />
//                     </div>
//                     <span className="text-[8px] font-mono text-slate-600">{pAvg}%</span>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//       </div>
//     </div>
//   );
// }

import React from 'react';
import { useHydroStore } from '@/store/hydroStore';
import { cn, getHealthStatus, getStatusColorClass } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function ReservoirList() {
  const { reservoirs, filterBasinId, basins, sortOrder, setSortOrder } = useHydroStore() as any;
  
  const list = React.useMemo(() => {
    let f = filterBasinId ? reservoirs.filter((r:any) => r.basin === basins.find((b:any)=>b.id===filterBasinId)?.name) : reservoirs;
    return f.sort((a:any, b:any) => sortOrder === 'capacity' ? b.capacity - a.capacity : (b.current/b.capacity) - (a.current/a.capacity));
  }, [reservoirs, filterBasinId, sortOrder, basins]);

  return (
    <div className="flex flex-col h-full border-r border-slate-800/40 bg-[#020617]">
      {/* Cabecera de controles del panel */}
      <div className="p-4 border-b border-slate-800/40 bg-slate-950/50 flex-shrink-0">
        <div className="flex bg-black p-0.5 rounded-lg border border-slate-800">
          <button onClick={()=>setSortOrder('percentage')} className={cn("flex-1 py-1.5 text-[9px] font-bold rounded transition-colors", sortOrder==='percentage'?"bg-cyan-500 text-black":"text-slate-500 hover:text-slate-300")}>% LLENADO</button>
          <button onClick={()=>setSortOrder('capacity')} className={cn("flex-1 py-1.5 text-[9px] font-bold rounded transition-colors", sortOrder==='capacity'?"bg-cyan-500 text-black":"text-slate-500 hover:text-slate-300")}>CAPACIDAD</button>
        </div>
      </div>
      
      {/* Lista de Embalses */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {list.map((r:any) => {
            const cap = r.capacity || 1; // Evitamos división por 0
            const p = Math.round((r.current / cap) * 100);
            const st = getHealthStatus(p);
            
            // Calculamos los porcentajes históricos en tiempo real para cada embalse
            const histBars = [
              { label: 'HOY', p: p },
              { label: '1M', p: Math.round((r.m1m / cap) * 100) },
              { label: '1A', p: Math.round((r.ma1 / cap) * 100) },
              { label: '3A', p: Math.round((r.h3a / cap) * 100) },
              { label: '5A', p: Math.round((r.h5a / cap) * 100) },
              { label: '10A', p: Math.round((r.h10a / cap) * 100) },
            ];

            return (
              <div key={r.id} className="p-4 rounded-2xl bg-[#0a0f1d] border border-slate-800/40 transition-colors hover:border-slate-700">
                
                {/* 1. Parte Superior: Nombre y % */}
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[11px] font-bold text-white truncate pr-2" title={r.name}>{r.name}</span>
                  <span className={cn("text-xs font-bold", getStatusColorClass(st, 'text'))}>{p}%</span>
                </div>
                
                {/* 2. Info Media: Absolutos y Variación */}
                <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 mb-5">
                  <span>{r.current.toLocaleString('es-ES', {maximumFractionDigits:1})} / {r.capacity.toLocaleString('es-ES', {maximumFractionDigits:1})} hm³</span>
                  <span 
                    title="Variación respecto a la semana anterior"
                    className={cn("flex items-center gap-0.5 cursor-help", r.variation >= 0 ? 'text-emerald-500' : 'text-red-500')}
                  >
                    {r.variation >= 0 ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}
                    {Math.abs(r.variation).toFixed(1)} pts
                  </span>
                </div>
                
                {/* 3. Gráfico Vertical Adaptado */}
                <div className="flex items-end justify-between h-[4.5rem] gap-1 px-0.5">
                  {histBars.map((bar, i) => {
                    // Controlamos que el porcentaje no sea NaN si no hay datos
                    const barP = bar.p || 0; 
                    const barSt = getHealthStatus(barP);
                    const barColor = getStatusColorClass(barSt, 'bg');
                    
                    return (
                      <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                        {/* Texto del % con un scale-90 para que no choque con el de al lado */}
                        <span className="text-[8px] font-mono text-slate-500 mb-1 scale-90">
                          {barP}%
                        </span>
                        
                        {/* Contenedor de la barra más bajito que en las cuencas (40px max) */}
                        <div className="w-full bg-slate-800/40 rounded-t flex items-end h-[40px] overflow-hidden">
                           <div 
                             className={cn("w-full transition-all rounded-t", barColor, i === 0 ? "opacity-100" : "opacity-40 group-hover:opacity-80")} 
                             style={{ height: `${Math.min(100, barP)}%` }} 
                           />
                        </div>
                        
                        {/* Etiqueta inferior */}
                        <span className={cn("text-[8px] font-bold uppercase mt-1.5 scale-90", i === 0 ? "text-cyan-500" : "text-slate-500")}>
                          {bar.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
              </div>
            );
          })}
      </div>
    </div>
  );
}