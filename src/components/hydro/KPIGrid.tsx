import React from 'react';
import { useHydroStore } from '@/store/hydroStore';
import { TrendingUp, TrendingDown, Database } from 'lucide-react';
import { cn, getHealthStatus, getStatusColorClass } from '@/lib/utils';

export function KPIGrid() {
  const { basins, reservoirs } = useHydroStore() as any;
  
  // 1. Cálculos de totales actuales
  const totalCap = basins.reduce((a: any, b: any) => a + b.capacity, 0);
  const totalCur = basins.reduce((a: any, b: any) => a + b.current, 0);
  const totalPrev = basins.reduce((sum: any, b: any) => sum + (b.current - (b.variation * b.capacity / 100)), 0);
  
  const p = totalCap > 0 ? (totalCur / totalCap) * 100 : 0;
  const prevP = totalCap > 0 ? (totalPrev / totalCap) * 100 : 0;
  const variation = p - prevP;
  
  const currentSt = getHealthStatus(p);
  const currentColorBg = getStatusColorClass(currentSt, 'bg');
  const currentColorText = getStatusColorClass(currentSt, 'text');

  // 2. Cálculos históricos nacionales
  const sumHist = (field: string) => reservoirs.reduce((acc: number, r: any) => acc + (r[field] || 0), 0);
  const getHist = (field: string) => {
    const pHist = totalCap > 0 ? (sumHist(field) / totalCap) * 100 : 0;
    return { p: pHist, hm3: sumHist(field) };
  };

  const histBars = [
    { label: '1M', ...getHist('m1m') },
    { label: '1A', ...getHist('ma1') },
    { label: '3A', ...getHist('h3a') },
    { label: '5A', ...getHist('h5a') },
    { label: '10A', ...getHist('h10a') },
  ];

  return (
    <div className="w-full flex flex-col gap-6 pt-2 pb-4">
      
      {/* --- BLOQUE SUPERIOR: LOS GRANDES NÚMEROS --- */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-6">
        
        {/* Izquierda: Volúmenes */}
        <div className="flex flex-col gap-3 flex-shrink-0">
          <div className="flex gap-4 text-slate-400 font-mono">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Embalsada</div>
              <div className="text-xl text-slate-200">{totalCur.toLocaleString('es-ES', {maximumFractionDigits:0})} <span className="text-sm opacity-50">hm³</span></div>
            </div>
            <div className="w-px bg-slate-800"></div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 mb-0.5">Capacidad Total</div>
              <div className="text-xl text-slate-500">{totalCap.toLocaleString('es-ES', {maximumFractionDigits:0})} <span className="text-sm opacity-50">hm³</span></div>
            </div>
          </div>
        </div>

        {/* Derecha: El GRAN Porcentaje y Variación */}
        <div className="flex items-baseline gap-4 text-right">
          <div 
            title="Variación intersemanal"
            className={cn("flex items-center gap-1.5 text-lg font-bold cursor-help mb-2", variation >= 0 ? 'text-emerald-500' : 'text-red-500')}
          >
            {variation >= 0 ? <TrendingUp className="w-5 h-5"/> : <TrendingDown className="w-5 h-5"/>}
            {Math.abs(variation).toFixed(1)} <span className="text-xs opacity-70">pts</span>
          </div>
          <div className={cn("text-5xl md:text-5xl font-black tracking-tighter", currentColorText)}>
            {Math.round(p)}%
          </div>
        </div>
      </div>

      {/* --- BLOQUE CENTRAL: LA GRAN BARRA DE PROGRESO --- */}
      <div className="relative w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800 shadow-inner">
        <div 
          className={cn("absolute top-0 left-0 h-full transition-all duration-1000 ease-out", currentColorBg)}
          style={{ width: `${p}%` }}
        />
        <div 
          title={`Año Pasado: ${Math.round(histBars[1].p)}%`}
          className="absolute top-0 h-full w-0.5 bg-white/50 z-10 cursor-help"
          style={{ left: `${histBars[1].p}%` }}
        />
      </div>

      {/* --- BLOQUE INFERIOR: HISTÓRICOS ALINEADOS --- */}
      <div className="flex justify-between md:justify-end gap-2 md:gap-8 items-end h-[4.5rem]">
        <div className="hidden md:flex items-center gap-2 text-slate-500 mr-auto pb-2">
          <Database className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Perspectiva Histórica</span>
        </div>
        
        {histBars.map((bar, i) => {
          const barSt = getHealthStatus(bar.p);
          const barColor = getStatusColorClass(barSt, 'bg');
          
          return (
            <div 
              key={bar.label} 
              className="flex flex-col items-center flex-1 md:flex-none md:w-16 h-full justify-end group cursor-help"
              title={`${bar.hm3.toLocaleString('es-ES', {maximumFractionDigits:0})} hm³`}
            >
              <span className="text-[10px] font-mono text-slate-400 mb-1.5">{Math.round(bar.p)}%</span>
              <div className="w-full bg-slate-800/40 rounded-t flex items-end h-[40px] overflow-hidden">
                  <div 
                    className={cn("w-full transition-all rounded-t opacity-40 group-hover:opacity-100", barColor)} 
                    style={{ height: `${Math.min(100, bar.p)}%` }} 
                  />
              </div>
              <span className="text-[10px] font-bold uppercase mt-2 text-slate-500 group-hover:text-slate-300 transition-colors">
                {bar.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// import React from 'react';
// import { useHydroStore } from '@/store/hydroStore';
// import { Layers, Waves, Activity, TrendingUp, TrendingDown, Calendar, History } from 'lucide-react';
// import { cn } from '@/lib/utils';

// export function KPIGrid() {
//   const { basins, reservoirs, dataDate } = useHydroStore() as any;
  
//   // 1. Cálculos de totales actuales
//   const totalCap = basins.reduce((a: any, b: any) => a + b.capacity, 0);
//   const totalCur = basins.reduce((a: any, b: any) => a + b.current, 0);
//   const totalPrev = basins.reduce((sum: any, b: any) => sum + (b.current - (b.variation * b.capacity / 100)), 0);
  
//   const p = totalCap > 0 ? (totalCur / totalCap) * 100 : 0;
//   const prevP = totalCap > 0 ? (totalPrev / totalCap) * 100 : 0;
//   const variation = p - prevP;

//   // 2. Cálculos históricos nacionales
//   const sumHist = (field: string) => reservoirs.reduce((acc: number, r: any) => acc + (r[field] || 0), 0);
//   const getHist = (field: string) => ({
//     hm3: sumHist(field),
//     p: totalCap > 0 ? (sumHist(field) / totalCap) * 100 : 0
//   });

//   const historyStats = [
//     { label: '1 Mes', ...getHist('m1m') },
//     { label: '1 Año', ...getHist('ma1') },
//     { label: '3 Años', ...getHist('h3a') },
//     { label: '5 Años', ...getHist('h5a') },
//     { label: '10 Años', ...getHist('h10a') },
//   ];

//   const kpis = [
//     { label: 'Fecha Datos', value: dataDate || '--', icon: Calendar, color: 'text-cyan-500' },
//     { label: 'Capacidad', value: `${totalCap.toLocaleString('es-ES', {maximumFractionDigits:0})} hm³`, icon: Layers, color: 'text-slate-400' },
//     { label: 'Embalsada', value: `${totalCur.toLocaleString('es-ES', {maximumFractionDigits:0})} hm³`, icon: Waves, color: 'text-cyan-400' },
//     { label: 'Porcentaje', value: `${Math.round(p)}%`, icon: Activity, color: 'text-emerald-400' },
//     { 
//       label: 'Variación', value: `${Math.abs(variation).toFixed(1)} pts`, 
//       icon: variation >= 0 ? TrendingUp : TrendingDown, 
//       color: variation >= 0 ? 'text-emerald-500' : 'text-red-500', isVariation: true 
//     }
//   ];

//   return (
//     <div className="flex flex-col gap-3 w-full">
//       {/* Fila principal de KPIs */}
//       <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
//         {kpis.map(k => (
//           <div 
//             key={k.label} 
//             className={cn("bg-slate-900/40 border border-slate-800/60 p-3 rounded-xl flex items-center gap-3 overflow-hidden", k.isVariation && "cursor-help")}
//             title={k.isVariation ? "Variación respecto a la semana anterior" : undefined}
//           >
//             <k.icon className={`${k.color} w-4 h-4 flex-shrink-0`} />
//             <div className="min-w-0">
//               <div className="text-[9px] font-bold text-slate-500 uppercase truncate">{k.label}</div>
//               <div className={cn("text-sm font-mono font-bold truncate", k.isVariation ? k.color : "text-slate-100")}>
//                 {k.isVariation && (variation >= 0 ? '+' : '-')}
//                 {k.value}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Fila secundaria: Históricos */}
//       <div className="flex items-center bg-[#0a0f1d] border border-slate-800/40 p-2.5 rounded-xl justify-between px-4 overflow-hidden">
//         <div className="hidden md:flex items-center gap-2 text-slate-500 mr-4 flex-shrink-0">
//           <History className="w-4 h-4" />
//           <span className="text-[10px] font-bold uppercase tracking-wider">Históricos</span>
//         </div>
//         <div className="flex items-center justify-evenly flex-1 overflow-x-auto gap-4 scrollbar-hide">
//           {historyStats.map(st => (
//             <div 
//               key={st.label} 
//               className="flex flex-col items-center min-w-[55px] cursor-help transition-opacity hover:opacity-80"
//               title={`${st.hm3.toLocaleString('es-ES', {maximumFractionDigits:0})} hm³`}
//             >
//               <span className="text-[9px] font-bold text-slate-500/80 uppercase mb-0.5">{st.label}</span>
//               <span className="text-xs font-mono font-bold text-slate-300">{Math.round(st.p)}%</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }