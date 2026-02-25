/*import React from 'react';
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
}*/

import React from 'react';
import { useHydroStore } from '@/store/hydroStore';
import { Waves, Layers, Activity, Calendar } from 'lucide-react';

export function KPIGrid() {
  const { basins, dataDate } = useHydroStore() as any;
  const totalCap = basins.reduce((a: any, b: any) => a + b.capacity, 0);
  const totalCur = basins.reduce((a: any, b: any) => a + b.current, 0);
  const p = totalCap > 0 ? Math.round((totalCur/totalCap)*100) : 0;

  // Transformamos el formato YYYY-MM-DD del JSON a DD-MM-YYYY para la UI
  const formatDataDate = (dateStr: string | null) => {
    if (!dateStr) return '--';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const kpis = [
    { label: 'Reservas', value: `${totalCur.toLocaleString('es-ES', {maximumFractionDigits:0})} hm³`, icon: Waves, color: 'text-cyan-400' },
    { label: 'Capacidad', value: `${totalCap.toLocaleString('es-ES', {maximumFractionDigits:0})} hm³`, icon: Layers, color: 'text-slate-400' },
    { label: 'Llenado', value: `${p}%`, icon: Activity, color: 'text-emerald-400' },
    { label: 'Fecha Datos', value: formatDataDate(dataDate), icon: Calendar, color: 'text-cyan-500' }
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
}