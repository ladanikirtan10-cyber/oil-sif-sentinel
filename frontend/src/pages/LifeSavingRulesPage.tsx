import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { LifeSavingRule } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

export const LifeSavingRulesPage: React.FC = () => {
  const { t } = useLanguage();
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
        <h2 className="text-xl font-black text-slate-900 tracking-tight">{t('rules.title')}</h2>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          {t('rules.subtitle')}
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
                  ? 'bg-blue-50/80 border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-500'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-800">
                  {r.code}
                </span>
                <span className="text-[10px] text-slate-500 uppercase font-bold">{r.category}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 leading-snug">{r.name}</h4>
              <p className="text-[11px] text-slate-600 line-clamp-2 mt-1.5 font-medium">{r.description}</p>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Total Violations: <strong className="text-slate-900 font-bold">{r.total_violations}</strong></span>
                <span className="text-rose-600 font-black">SIF: {r.sif_violations}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          {selectedRule ? (
            <>
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                    {selectedRule.rule.code}
                  </span>
                  <span className="text-xs font-black text-rose-600">
                    {selectedRule.rule.sif_correlation_rate}% SIF Correlation
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900">{selectedRule.rule.name}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">{selectedRule.rule.description}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                  Recent Correlated Safety Reports ({selectedRule.reports?.length || 0})
                </h4>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {selectedRule.reports?.map((rep: any) => (
                    <div key={rep.report_uid} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-600">{rep.report_uid}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{rep.site_name}</span>
                      </div>
                      <p className="text-slate-700 text-[11px] line-clamp-2 font-medium">{rep.raw_description}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                        <span className="font-semibold">{rep.activity}</span>
                        <span className={rep.sif_potential ? 'text-red-700 font-black' : 'text-emerald-700 font-bold'}>
                          {rep.sif_potential ? 'SIF POTENTIAL' : 'Non-SIF'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-slate-400 text-xs font-medium">Select a Life-Saving Rule to inspect.</div>
          )}
        </div>
      </div>
    </div>
  );
};
