import React from 'react';
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
