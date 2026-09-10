code = """import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { api } from '../services/api';
import { LifeSavingRule } from '../types';

export const LifeSavingRulesPage: React.FC = () => {
  const [rules, setRules] = useState<LifeSavingRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      const data = await api.getRules();
      setRules(data);
      if (data.length > 0) {
        loadRuleDetails(data[0].code);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRuleDetails = async (code: string) => {
    try {
      const data = await api.getRuleDetails(code);
      setSelectedRule(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">IOGP & Oil India Limited 9 Life-Saving Rules</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Multi-label NLP compliance monitoring across operational safety standards and critical barrier verifications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-3">
          {rules.map((r) => (
            <button
              key={r.code}
              onClick={() => loadRuleDetails(r.code)}
              className={`p-4 rounded-xl text-left border transition-all duration-150 ${
                selectedRule?.rule?.code === r.code
                  ? 'bg-[#101C38] border-sky-500 shadow-lg shadow-sky-950/40'
                  : 'bg-[#0C1222] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-400">
                  {r.code}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">{r.category}</span>
              </div>
              <h4 className="text-sm font-bold text-white leading-snug">{r.name}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-2 mt-1.5">{r.description}</p>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Violations: <strong className="text-white">{r.total_violations}</strong></span>
                <span className="text-rose-400 font-bold">SIF: {r.sif_violations}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-5 bg-[#0C1222] p-5 rounded-2xl border border-slate-800 space-y-4">
          {selectedRule ? (
            <>
              <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {selectedRule.rule.code}
                  </span>
                  <span className="text-xs font-bold text-rose-400">
                    {selectedRule.rule.sif_correlation_rate}% SIF Correlation
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-white">{selectedRule.rule.name}</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{selectedRule.rule.description}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                  Recent Correlated Safety Reports ({selectedRule.reports?.length || 0})
                </h4>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {selectedRule.reports?.map((rep: any) => (
                    <div key={rep.report_uid} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-sky-400">{rep.report_uid}</span>
                        <span className="text-[10px] text-slate-400">{rep.site_name}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] line-clamp-2">{rep.raw_description}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>{rep.activity}</span>
                        <span className={rep.sif_potential ? 'text-red-400 font-bold' : 'text-emerald-400 font-semibold'}>
                          {rep.sif_potential ? 'SIF POTENTIAL' : 'Non-SIF'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-slate-500 text-xs">Select a Life-Saving Rule to inspect.</div>
          )}
        </div>
      </div>
    </div>
  );
};
"""

with open('frontend/src/pages/LifeSavingRulesPage.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('Fixed LifeSavingRulesPage.tsx')
