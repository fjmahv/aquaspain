// import React from 'react';
// import { BasinGrid } from '@/components/hydro/BasinGrid';
// import { ReservoirList } from '@/components/hydro/ReservoirList';
// import { KPIGrid } from '@/components/hydro/KPIGrid';
// import { useHydroSync } from '@/hooks/use-hydro-sync';
// import { Droplet } from 'lucide-react';

// export function HomePage() {
//   const { isInitialLoading } = useHydroSync();

//   if (isInitialLoading) return <div className="h-screen bg-[#020617] flex flex-col items-center justify-center text-cyan-500 font-mono gap-4"><Droplet className="animate-bounce w-8 h-8" /><div>SINCRONIZANDO DATOS...</div></div>;

//   return (
//     <div className="h-screen w-full bg-[#020617] text-slate-200 flex flex-col overflow-hidden">
//       <header className="py-4 border-b border-slate-800/50 flex flex-col xl:flex-row gap-4 xl:gap-8 items-center px-6 justify-between flex-shrink-0 bg-[#020617] z-10 w-full">
//         <div className="flex items-center gap-4">
//           <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center"><Droplet className="text-white fill-current" /></div>
//           <h1 className="text-xl font-black tracking-tighter uppercase hidden md:block">AQUA<span className="text-cyan-500">ESPAÑA</span></h1>
//         </div>
//         <div className="flex-1 w-full px-4 md:px-10"><KPIGrid /></div>
//       </header>
      
//       <main className="flex-1 flex overflow-hidden relative">
//         <aside className="w-72 lg:w-80 flex-shrink-0 hidden md:block"><ReservoirList /></aside>
//         <section className="flex-1 p-4 md:p-6 overflow-hidden"><BasinGrid /></section>
//       </main>
      
//       <footer className="h-10 border-t border-slate-800/40 px-6 flex items-center justify-between text-[10px] font-mono text-slate-500 flex-shrink-0 bg-[#020617]">
//         <span>FUENTE: MINISTERIO DE TRANSICIÓN ECOLÓGICA</span>
//         <span>VERSIÓN OPTIMIZADA (STATIC)</span>
//       </footer>
//     </div>
//   );
// }

import React from 'react';
import { BasinGrid } from '@/components/hydro/BasinGrid';
import { ReservoirList } from '@/components/hydro/ReservoirList';
import { KPIGrid } from '@/components/hydro/KPIGrid';
import { useHydroSync } from '@/hooks/use-hydro-sync';
import { useHydroStore } from '@/store/hydroStore';
import { Droplet } from 'lucide-react';

export function HomePage() {
  const { isInitialLoading } = useHydroSync();
  const { dataDate } = useHydroStore() as any;

  // Función para formatear la fecha (YYYY-MM-DD -> día XX de Mes de YYYY)
  const formatFooterDate = (dateStr: string) => {
    if (!dateStr) return 'Buscando fecha de actualización...';
    
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr; // Por si el formato no es el esperado
    
    const [year, month, day] = parts;
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    // Usamos parseInt para quitar el '0' delante de los días (ej. 02 -> 2)
    return `Datos correspondientes al día ${parseInt(day, 10)} de ${months[parseInt(month, 10) - 1]} de ${year}`;
  };

  if (isInitialLoading) {
    return (
      <div className="h-screen bg-[#020617] flex flex-col items-center justify-center text-cyan-500 font-mono gap-4">
        <Droplet className="animate-bounce w-8 h-8" />
        <div>SINCRONIZANDO DATOS...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#020617] text-slate-200 flex flex-col overflow-hidden">
      
      {/* Cabecera ajustada (width 100% y responsive) */}
      <header className="py-4 border-b border-slate-800/50 flex flex-col xl:flex-row gap-4 xl:gap-8 items-center px-6 justify-between flex-shrink-0 bg-[#020617] z-10 w-full">
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center">
            <Droplet className="text-white fill-current" />
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase hidden md:block">
            AQUA<span className="text-cyan-500">ESPAÑA</span>
          </h1>
        </div>
        <div className="flex-1 w-full px-4 md:px-10">
          <KPIGrid />
        </div>
      </header>
      
      {/* Paneles de datos central y lateral */}
      <main className="flex-1 flex overflow-hidden relative">
        <aside className="w-72 lg:w-80 flex-shrink-0 hidden md:block">
          <ReservoirList />
        </aside>
        <section className="flex-1 p-4 md:p-6 overflow-hidden">
          <BasinGrid />
        </section>
      </main>
      
      {/* Pie de página con la fecha formateada en la parte derecha */}
      <footer className="h-10 border-t border-slate-800/40 px-6 flex items-center justify-between text-[10px] font-mono text-slate-500 flex-shrink-0 bg-[#020617]">
        <span>FUENTE: MINISTERIO DE TRANSICIÓN ECOLÓGICA</span>
        <span>{formatFooterDate(dataDate)}</span>
      </footer>
      
    </div>
  );
}