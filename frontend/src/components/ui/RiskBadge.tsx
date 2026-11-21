import React from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle, ShieldAlert, Zap } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface RiskBadgeProps {
  level: string;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, size = 'md' }) => {
  const { t } = useLanguage();
  const normalized = (level || 'MODERATE').toUpperCase();
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm font-bold gap-2',
  };

  if (normalized === 'CRITICAL') {
    return (
      <span className={`inline-flex items-center rounded-md font-extrabold tracking-wider bg-red-50 text-red-700 border border-red-300 shadow-sm shadow-red-100 ${sizeClasses[size]}`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
        </span>
        <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
        <span>{t('risk.critical', 'CRITICAL')}</span>
        {score !== undefined && <span className="text-red-700/80 font-mono text-[10px] font-bold">({Math.round(score)})</span>}
      </span>
    );
  }
  if (normalized === 'HIGH') {
    return (
      <span className={`inline-flex items-center rounded-md font-bold tracking-wider bg-amber-50 text-amber-800 border border-amber-300 shadow-sm shadow-amber-100 ${sizeClasses[size]}`}>
        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        <span>{t('risk.high', 'HIGH')}</span>
        {score !== undefined && <span className="text-amber-800/80 font-mono text-[10px] font-bold">({Math.round(score)})</span>}
      </span>
    );
  }
  if (normalized === 'MODERATE') {
    return (
      <span className={`inline-flex items-center rounded-md font-semibold tracking-wider bg-yellow-50 text-yellow-800 border border-yellow-300 shadow-sm shadow-yellow-100 ${sizeClasses[size]}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
        <ShieldAlert className="w-3.5 h-3.5 text-yellow-700" />
        <span>{t('risk.moderate', 'MODERATE')}</span>
        {score !== undefined && <span className="text-yellow-800/80 font-mono text-[10px]">({Math.round(score)})</span>}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center rounded-md font-semibold tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-sm shadow-emerald-100 ${sizeClasses[size]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
      <span>{t('risk.low', 'LOW RISK')}</span>
      {score !== undefined && <span className="text-emerald-800/80 font-mono text-[10px]">({Math.round(score)})</span>}
    </span>
  );
};

export const SifBadge: React.FC<{ isSif: boolean; probability?: number; size?: 'sm' | 'md' | 'lg' }> = ({
  isSif,
  probability,
  size = 'md',
}) => {
  const { t } = useLanguage();
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs font-bold gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm font-extrabold gap-2',
  };

  if (isSif) {
    return (
      <span className={`inline-flex items-center rounded-md bg-gradient-to-r from-red-50 via-rose-50 to-red-50 text-rose-700 border border-rose-300 shadow-sm shadow-red-100 ${sizeClasses[size]}`}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
        </span>
        <Zap className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
        <span className="tracking-wide uppercase font-extrabold">{t('risk.sifPrecursor', 'SIF Precursor')}</span>
        {probability !== undefined && (
          <span className="font-mono bg-rose-100 px-1 py-0.2 rounded text-[10px] text-rose-800 font-bold border border-rose-200">
            {Math.round(probability * 100)}%
          </span>
        )}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center rounded-md bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses[size]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
      <span className="tracking-wide uppercase text-slate-600 font-semibold">{t('risk.nonSif', 'Non-SIF')}</span>
      {probability !== undefined && (
        <span className="font-mono text-[10px] text-slate-500 font-semibold">({Math.round(probability * 100)}%)</span>
      )}
    </span>
  );
};
