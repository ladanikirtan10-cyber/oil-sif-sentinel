import React from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle, ShieldAlert, Zap } from 'lucide-react';

interface RiskBadgeProps {
  level: string;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, size = 'md' }) => {
  const normalized = (level || 'MODERATE').toUpperCase();
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm font-bold gap-2',
  };

  if (normalized === 'CRITICAL') {
    return (
      <span className={`inline-flex items-center rounded-md font-extrabold tracking-wider bg-red-950/80 text-red-300 border border-red-500/70 shadow-sm shadow-red-950/60 ${sizeClasses[size]}`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
        <span>CRITICAL</span>
        {score !== undefined && <span className="text-red-400/80 font-mono text-[10px]">({Math.round(score)})</span>}
      </span>
    );
  }
  if (normalized === 'HIGH') {
    return (
      <span className={`inline-flex items-center rounded-md font-bold tracking-wider bg-amber-950/80 text-amber-300 border border-amber-500/70 shadow-sm shadow-amber-950/60 ${sizeClasses[size]}`}>
        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        <span>HIGH</span>
        {score !== undefined && <span className="text-amber-400/80 font-mono text-[10px]">({Math.round(score)})</span>}
      </span>
    );
  }
  if (normalized === 'MODERATE') {
    return (
      <span className={`inline-flex items-center rounded-md font-semibold tracking-wider bg-yellow-950/60 text-yellow-300 border border-yellow-500/50 ${sizeClasses[size]}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
        <ShieldAlert className="w-3.5 h-3.5 text-yellow-300" />
        <span>MODERATE</span>
        {score !== undefined && <span className="text-yellow-300/80 font-mono text-[10px]">({Math.round(score)})</span>}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center rounded-md font-semibold tracking-wider bg-emerald-950/70 text-emerald-300 border border-emerald-500/50 ${sizeClasses[size]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
      <span>LOW RISK</span>
      {score !== undefined && <span className="text-emerald-400/80 font-mono text-[10px]">({Math.round(score)})</span>}
    </span>
  );
};

export const SifBadge: React.FC<{ isSif: boolean; probability?: number; size?: 'sm' | 'md' | 'lg' }> = ({
  isSif,
  probability,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs font-bold gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm font-extrabold gap-2',
  };

  if (isSif) {
    return (
      <span className={`inline-flex items-center rounded-md bg-gradient-to-r from-red-600/25 via-rose-600/20 to-red-600/25 text-rose-300 border border-red-500/70 shadow-md shadow-red-950/50 ${sizeClasses[size]}`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
        <Zap className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
        <span className="tracking-wide uppercase">SIF Precursor</span>
        {probability !== undefined && (
          <span className="font-mono bg-red-900/60 px-1 py-0.2 rounded text-[10px] text-red-200 border border-red-700/50">
            {Math.round(probability * 100)}%
          </span>
        )}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center rounded-md bg-slate-900/90 text-slate-300 border border-slate-700/80 ${sizeClasses[size]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
      <span className="tracking-wide uppercase text-slate-400">Non-SIF</span>
      {probability !== undefined && (
        <span className="font-mono text-[10px] text-slate-400">({Math.round(probability * 100)}%)</span>
      )}
    </span>
  );
};
