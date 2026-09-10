risk_badge_code = """import React from 'react';
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
"""

stat_card_code = """import React from 'react';
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
"""

risk_matrix_code = """import React from 'react';

interface RiskMatrixProps {
  selectedLikelihood?: number;
  selectedSeverity?: number;
  cellsData?: { likelihood: number; severity: number; count: number }[];
}

export const RiskMatrix5x5: React.FC<RiskMatrixProps> = ({
  selectedLikelihood,
  selectedSeverity,
  cellsData = [],
}) => {
  const likelihoodLabels = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Frequent'];
  const severityLabels = ['Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic'];

  // 5x5 colors based on risk severity
  const getCellColor = (l: number, s: number) => {
    const score = l * s;
    if (s === 5 || score >= 15) return 'bg-red-600/80 border-red-500 text-white';
    if (score >= 10) return 'bg-amber-600/80 border-amber-500 text-white';
    if (score >= 6) return 'bg-yellow-600/60 border-yellow-500 text-yellow-100';
    return 'bg-emerald-600/50 border-emerald-500 text-emerald-100';
  };

  const getCount = (l: number, s: number) => {
    const found = cellsData.find((c) => c.likelihood === l && c.severity === s);
    return found ? found.count : 0;
  };

  return (
    <div className="bg-[#0C1222] p-4 rounded-xl border border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">5x5 Risk Assessment Matrix</h4>
        <span className="text-[11px] text-slate-400 font-mono">Likelihood vs Severity</span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[320px]">
          {/* Top Header for Severity */}
          <div className="grid grid-cols-6 gap-1 mb-1 text-[10px] text-slate-400 font-semibold text-center">
            <div className="text-left pl-1">L \\ S</div>
            {severityLabels.map((lbl, idx) => (
              <div key={lbl} className="truncate" title={`S${idx + 1}: ${lbl}`}>
                S{idx + 1}
              </div>
            ))}
          </div>

          {/* Matrix Rows (Likelihood 5 to 1 from top to bottom) */}
          {[5, 4, 3, 2, 1].map((l) => (
            <div key={l} className="grid grid-cols-6 gap-1 mb-1 items-center">
              {/* Likelihood Label */}
              <div className="text-[10px] text-slate-400 font-semibold truncate pr-1">
                L{l} ({likelihoodLabels[l - 1].slice(0, 4)})
              </div>

              {/* 5 Severity Columns */}
              {[1, 2, 3, 4, 5].map((s) => {
                const isTarget = selectedLikelihood === l && selectedSeverity === s;
                const cellCount = getCount(l, s);
                return (
                  <div
                    key={`${l}-${s}`}
                    className={`h-9 rounded flex flex-col items-center justify-center border text-[11px] font-bold transition-all ${getCellColor(
                      l,
                      s
                    )} ${isTarget ? 'ring-2 ring-white scale-105 shadow-lg z-10' : 'opacity-85 hover:opacity-100'}`}
                    title={`Likelihood ${l} (${likelihoodLabels[l - 1]}), Severity ${s} (${severityLabels[s - 1]}) - ${cellCount} incidents`}
                  >
                    {isTarget ? (
                      <span className="bg-white text-slate-900 px-1 py-0.2 rounded text-[10px] font-black">★ HERE</span>
                    ) : cellCount > 0 ? (
                      <span className="text-xs">{cellCount}</span>
                    ) : (
                      <span className="text-[9px] opacity-40">-</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-800">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500/70"></span> Low (1-5)</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-yellow-500/70"></span> Medium (6-9)</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500/80"></span> High (10-14)</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-600"></span> Critical (15-25)</span>
      </div>
    </div>
  );
};
"""

explain_panel_code = """import React from 'react';
import { Explainability, EntityExtraction, RuleSignal } from '../../types';
import { ShieldAlert, AlertTriangle, CheckCircle2, ChevronRight, Activity } from 'lucide-react';

interface ExplainPanelProps {
  explainability: Explainability;
  entities: EntityExtraction;
  rules: RuleSignal[];
  rawText: string;
}

export const ExplainabilityPanel: React.FC<ExplainPanelProps> = ({
  explainability,
  entities,
  rules,
  rawText,
}) => {
  return (
    <div className="space-y-4">
      {/* Rationale Banner */}
      <div className={`p-4 rounded-xl border ${
        explainability.is_sif 
          ? 'bg-red-950/30 border-red-800/60 text-red-200'
          : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
      }`}>
        <div className="flex items-start gap-3">
          {explainability.is_sif ? (
            <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <h4 className="font-bold text-sm text-white mb-1">
              Why was this classified as {explainability.is_sif ? 'SIF POTENTIAL' : 'Non-SIF'}?
            </h4>
            <p className="text-xs leading-relaxed text-slate-300">
              {explainability.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Safety Risk Factors */}
      {explainability.risk_factors && explainability.risk_factors.length > 0 && (
        <div className="p-4 rounded-xl bg-[#0C1222] border border-slate-800">
          <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Identified Causal & Precursor Risk Factors
          </h5>
          <div className="space-y-1.5">
            {explainability.risk_factors.map((factor, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Token Attribution Weights */}
      {explainability.top_tokens && explainability.top_tokens.length > 0 && (
        <div className="p-4 rounded-xl bg-[#0C1222] border border-slate-800">
          <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Top NLP Model Feature Attributions (Driving Probability)
          </h5>
          <div className="flex flex-wrap gap-2 pt-1">
            {explainability.top_tokens.map((token, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-slate-900 border border-slate-700/80 text-sky-300 flex items-center gap-1.5"
              >
                <span>{token.token}</span>
                <span className="text-[10px] text-emerald-400 font-bold">+{token.weight}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Matched Life-Saving Rules Chips */}
      {rules && rules.length > 0 && (
        <div className="p-4 rounded-xl bg-[#0C1222] border border-slate-800">
          <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
            Active Life-Saving Rules Triggered
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {rules.map((r, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-700/80 flex items-start gap-2.5">
                <div className="w-7 h-7 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                  {r.rule_code.split('-')[1]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs text-white">{r.rule_name}</div>
                    <span className="text-[10px] font-bold text-amber-400">{Math.round(r.confidence * 100)}% Conf</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{r.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
"""

with open('frontend/src/components/ui/RiskBadge.tsx', 'w', encoding='utf-8') as f:
    f.write(risk_badge_code)
with open('frontend/src/components/ui/StatCard.tsx', 'w', encoding='utf-8') as f:
    f.write(stat_card_code)
with open('frontend/src/components/ui/RiskMatrix5x5.tsx', 'w', encoding='utf-8') as f:
    f.write(risk_matrix_code)
with open('frontend/src/components/ui/ExplainabilityPanel.tsx', 'w', encoding='utf-8') as f:
    f.write(explain_panel_code)
print('Created UI widgets: RiskBadge, StatCard, RiskMatrix5x5, ExplainabilityPanel.')
