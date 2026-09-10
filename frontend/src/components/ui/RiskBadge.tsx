import React from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

interface RiskBadgeProps {
  level: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md' }) => {
  const normalized = (level || 'MODERATE').toUpperCase();
  
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm font-bold',
  };

  if (normalized === 'CRITICAL') {
    return (
      <span className={`inline-flex items-center gap-1 rounded font-bold bg-red-950/80 text-red-400 border border-red-500/50 ${sizeClasses[size]}`}>
        <AlertOctagon className="w-3 h-3 text-red-400 animate-pulse" />
        CRITICAL
      </span>
    );
  }
  if (normalized === 'HIGH') {
    return (
      <span className={`inline-flex items-center gap-1 rounded font-bold bg-amber-950/80 text-amber-400 border border-amber-500/50 ${sizeClasses[size]}`}>
        <AlertTriangle className="w-3 h-3 text-amber-400" />
        HIGH
      </span>
    );
  }
  if (normalized === 'MODERATE') {
    return (
      <span className={`inline-flex items-center gap-1 rounded font-medium bg-yellow-950/60 text-yellow-300 border border-yellow-500/40 ${sizeClasses[size]}`}>
        <ShieldAlert className="w-3 h-3 text-yellow-300" />
        MODERATE
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 ${sizeClasses[size]}`}>
      <CheckCircle className="w-3 h-3 text-emerald-400" />
      LOW RISK
    </span>
  );
};

export const SifBadge: React.FC<{ isSif: boolean; probability?: number; size?: 'sm' | 'md' | 'lg' }> = ({
  isSif,
  probability,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2.5 py-0.5 text-xs font-bold',
    lg: 'px-3.5 py-1.5 text-sm font-extrabold',
  };

  if (isSif) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-red-600/30 to-rose-600/30 text-rose-300 border border-red-500/60 shadow-md shadow-red-950/40 ${sizeClasses[size]}`}>
        <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
        SIF POTENTIAL {probability !== undefined && `(${Math.round(probability * 100)}%)`}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700 ${sizeClasses[size]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
      Non-SIF {probability !== undefined && `(${Math.round(probability * 100)}%)`}
    </span>
  );
};
