import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'critical' | 'warning' | 'cyan';
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
    default: 'border-slate-800 bg-[#0C1222]/90 hover:border-slate-700',
    critical: 'border-red-900/60 bg-gradient-to-br from-[#0C1222] to-red-950/20 hover:border-red-600/60',
    warning: 'border-amber-900/60 bg-gradient-to-br from-[#0C1222] to-amber-950/20 hover:border-amber-600/60',
    cyan: 'border-sky-900/60 bg-gradient-to-br from-[#0C1222] to-sky-950/20 hover:border-sky-600/60',
  };

  const iconColors = {
    default: 'text-slate-400 bg-slate-800/60',
    critical: 'text-red-400 bg-red-950/60 border border-red-500/30',
    warning: 'text-amber-400 bg-amber-950/60 border border-amber-500/30',
    cyan: 'text-sky-400 bg-sky-950/60 border border-sky-500/30',
  };

  return (
    <div className={`p-4 rounded-xl border transition-all duration-200 shadow-lg ${variantStyles[variant]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColors[variant]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black tracking-tight text-white">{value}</span>
        {change && (
          <span className={`text-[11px] font-bold ${isPositive ? 'text-emerald-400' : 'text-amber-400'}`}>
            {change}
          </span>
        )}
      </div>
      {subtitle && <p className="text-[11px] text-slate-400 mt-1 font-medium">{subtitle}</p>}
    </div>
  );
};
