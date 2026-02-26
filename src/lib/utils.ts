import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function getHealthStatus(p: number) {
  if (p < 15) return 'emergency';
  if (p < 30) return 'warning';
  if (p < 50) return 'alert';
  return 'healthy';
}

export function getStatusColorClass(status: string, type: 'text' | 'bg' | 'border' = 'text') {
  const maps: any = {
    text: { emergency: 'text-red-500', warning: 'text-orange-500', alert: 'text-yellow-500', healthy: 'text-emerald-500' },
    bg: { emergency: 'bg-red-500', warning: 'bg-orange-500', alert: 'bg-yellow-500', healthy: 'bg-emerald-500' },
    border: { emergency: 'border-red-500', warning: 'border-orange-500', alert: 'border-yellow-500', healthy: 'border-emerald-500' }
  };
  return maps[type][status] || 'text-slate-500';
}