import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp } from 'lucide-react';
import { api } from '../services/api';
import { PrecursorPattern } from '../types';
import { RiskBadge } from '../components/ui/RiskBadge';
import { useLanguage } from '../i18n/LanguageContext';

export const PrecursorPage: React.FC = () => {
  const { t } = useLanguage();
  const [patterns, setPatterns] = useState<PrecursorPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [emergingOnly, setEmergingOnly] = useState(false);
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [mining, setMining] = useState(false);

  useEffect(() => {
    loadPatterns();
  }, [emergingOnly, riskFilter]);

  const loadPatterns = async () => {
    setLoading(true);
    try {
      const data = await api.getPrecursorPatterns(emergingOnly, riskFilter);
      setPatterns(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshMining = async () => {
    setMining(true);
    try {
      await api.refreshPrecursors();
      await loadPatterns();
    } catch (err) {
      console.error(err);
    } finally {
      setMining(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">{t('precursor.title')}</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {t('precursor.subtitle')}
          </p>
        </div>

        <button
          onClick={handleRefreshMining}
          disabled={mining}
          className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${mining ? 'animate-spin' : ''}`} />
          {mining ? t('precursor.mining') : t('precursor.runMining')}
        </button>
      </div>

      <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEmergingOnly(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              !emergingOnly ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {t('common.all')} ({patterns.length})
          </button>
          <button
            onClick={() => setEmergingOnly(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              emergingOnly ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-amber-800 hover:bg-amber-50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Emerging High-Velocity Precursors
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">{t('common.severity')}:</span>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 font-medium rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="ALL">{t('alerts.allPriorities')}</option>
            <option value="CRITICAL">{t('risk.critical')}</option>
            <option value="HIGH">{t('risk.high')}</option>
            <option value="MODERATE">{t('risk.moderate')}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 py-16 text-center text-slate-500 font-medium">Discovering precursor tuples...</div>
        ) : patterns.length === 0 ? (
          <div className="col-span-3 py-16 text-center text-slate-500 font-medium">No recurring patterns found matching criteria.</div>
        ) : (
          patterns.map((p) => (
            <div
              key={p.id}
              className={`p-4 rounded-xl bg-white border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                p.sif_association_rate >= 75
                  ? 'border-red-300 shadow-sm'
                  : 'border-slate-200/90 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-black text-slate-900">{p.activity}</span>
                <RiskBadge level={p.risk_level} size="sm" />
              </div>

              <div className="text-[11px] text-amber-700 font-bold mb-1">
                Equipment: {p.equipment}
              </div>

              <div className="space-y-1 my-3 text-xs">
                <div className="flex items-center justify-between text-slate-500 font-medium">
                  <span>Hazard:</span>
                  <span className="text-slate-800 font-bold">{p.hazard}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500 font-medium">
                  <span>Barrier Failure:</span>
                  <span className="text-red-700 font-bold">{p.barrier_failure}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs mb-3">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Total Observed</div>
                  <div className="text-sm font-black text-slate-900 font-mono">{p.occurrence_count}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">SIF Correlated</div>
                  <div className="text-sm font-black text-rose-600 font-mono">{p.sif_count}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">SIF Association</div>
                  <div className="text-sm font-black text-amber-700 font-mono">{p.sif_association_rate}%</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1 font-bold text-slate-700">
                  <TrendingUp className="w-3 h-3 text-blue-600" />
                  Trend: {p.trend}
                </span>
                <span className="truncate max-w-[150px] font-mono text-[10px] text-slate-500 font-medium">
                  {p.affected_sites?.slice(0, 2).join(', ')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
