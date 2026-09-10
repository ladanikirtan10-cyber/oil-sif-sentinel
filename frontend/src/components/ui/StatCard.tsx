import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'critical' | 'warning' | 'cyan' | 'emerald';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive,
  subtitle,
  icon: Icon,
  variant = 'default',
}) => {
  const variantStyles = {
    default: 'border-slate-800/80 bg-gradient-to-b from-[#0F172A]/90 to-[#0B1120]/95 hover:border-slate-700 shadow-slate-950/50',
    critical: 'border-red-500/40 bg-gradient-to-b from-red-950/30 via-[#0F172A]/80 to-[#0B1120]/95 hover:border-red-500/70 shadow-red-950/30 glow-critical',
    warning: 'border-amber-500/40 bg-gradient-to-b from-amber-950/30 via-[#0F172A]/80 to-[#0B1120]/95 hover:border-amber-500/70 shadow-amber-950/30 glow-warning',
    cyan: 'border-sky-500/40 bg-gradient-to-b from-sky-950/30 via-[#0F172A]/80 to-[#0B1120]/95 hover:border-sky-500/70 shadow-sky-950/30 glow-cyan',
    emerald: 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/30 via-[#0F172A]/80 to-[#0B1120]/95 hover:border-emerald-500/70 shadow-emerald-950/30 glow-emerald',
  };

  const iconColors = {
    default: 'text-slate-300 bg-slate-800/80 border border-slate-700/60 shadow-inner',
    critical: 'text-red-400 bg-red-950/80 border border-red-500/40 shadow-red-900/30',
    warning: 'text-amber-400 bg-amber-950/80 border border-amber-500/40 shadow-amber-900/30',
    cyan: 'text-sky-400 bg-sky-950/80 border border-sky-500/40 shadow-sky-900/30',
    emerald: 'text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 shadow-emerald-900/30',
  };

  const barColors = {
    default: 'bg-slate-700',
    critical: 'bg-gradient-to-r from-red-600 to-rose-400',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-400',
    cyan: 'bg-gradient-to-r from-sky-500 to-cyan-300',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-300',
  };

  return (
    <div className={`p-4 rounded-xl border transition-all duration-200 shadow-lg hover:-translate-y-0.5 hover:shadow-xl relative overflow-hidden group ${variantStyles[variant]}`}>
      {/* Top subtle highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
          {variant === 'critical' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />}
          {title}
        </span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 duration-200 ${iconColors[variant]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-extrabold tracking-tight text-white font-mono-nums">{value}</span>
        {change && (
          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
            isPositive ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30' : 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
          }`}>
            {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
            {change}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] text-slate-400 mt-1 font-medium truncate">{subtitle}</p>
      )}

      {/* Mini bottom activity bar */}
      <div className="w-full bg-slate-800/60 h-1 rounded-full mt-3 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${barColors[variant]}`} style={{ width: variant === 'critical' ? '82%' : variant === 'warning' ? '68%' : '90%' }} />
      </div>
    </div>
  );
};
