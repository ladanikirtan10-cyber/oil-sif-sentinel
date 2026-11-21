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
    default: 'border-slate-200 bg-white hover:border-slate-300 shadow-sm',
    critical: 'border-red-200 bg-gradient-to-b from-red-50/40 via-white to-white hover:border-red-300 shadow-sm glow-critical',
    warning: 'border-amber-200 bg-gradient-to-b from-amber-50/40 via-white to-white hover:border-amber-300 shadow-sm glow-warning',
    cyan: 'border-sky-200 bg-gradient-to-b from-sky-50/40 via-white to-white hover:border-sky-300 shadow-sm glow-cyan',
    emerald: 'border-emerald-200 bg-gradient-to-b from-emerald-50/40 via-white to-white hover:border-emerald-300 shadow-sm glow-emerald',
  };

  const iconColors = {
    default: 'text-slate-700 bg-slate-100 border border-slate-200',
    critical: 'text-red-600 bg-red-100 border border-red-200',
    warning: 'text-amber-700 bg-amber-100 border border-amber-200',
    cyan: 'text-sky-600 bg-sky-100 border border-sky-200',
    emerald: 'text-emerald-700 bg-emerald-100 border border-emerald-200',
  };

  const barColors = {
    default: 'bg-slate-400',
    critical: 'bg-gradient-to-r from-red-600 to-rose-500',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-500',
    cyan: 'bg-gradient-to-r from-sky-500 to-blue-500',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  };

  return (
    <div className={`p-4 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md relative overflow-hidden group ${variantStyles[variant]}`}>
      {/* Top subtle highlight */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
          {variant === 'critical' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />}
          {title}
        </span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 duration-200 ${iconColors[variant]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-black tracking-tight text-slate-900 font-mono-nums">{value}</span>
        {change && (
          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
            isPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
            {change}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] text-slate-500 mt-1 font-medium truncate">{subtitle}</p>
      )}

      {/* Mini bottom activity bar */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${barColors[variant]}`} style={{ width: variant === 'critical' ? '82%' : variant === 'warning' ? '68%' : '90%' }} />
      </div>
    </div>
  );
};
