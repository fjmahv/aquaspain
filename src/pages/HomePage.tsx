import React from 'react';
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
}