import React, { useState, useEffect } from 'react';
import { Zap, RefreshCw, TrendingUp } from 'lucide-react';
import { api } from '../services/api';
import { PrecursorPattern } from '../types';
import { RiskBadge } from '../components/ui/RiskBadge';

export const PrecursorPage: React.FC = () => {
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
          <h2 className="text-xl font-bold text-white tracking-tight">SIF Precursor Pattern Discovery</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical & ML clustering discovering high-correlation combinations of Activity + Equipment + Hazard + Barrier Breakdown.
          </p>
        </div>

        <button
          onClick={handleRefreshMining}
          disabled={mining}
          className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-sky-900/30"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${mining ? 'animate-spin' : ''}`} />
          {mining ? 'Mining Live Patterns...' : 'Run Pattern Discovery Mining'}
        </button>
      </div>

      <div className="p-3 rounded-xl bg-[#0C1222] border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEmergingOnly(false)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              !emergingOnly ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Identified Patterns ({patterns.length})
          </button>
          <button
            onClick={() => setEmergingOnly(true)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              emergingOnly ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Emerging High-Velocity Precursors
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Risk Tier:</span>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MODERATE">Moderate</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 py-16 text-center text-slate-400">Discovering precursor tuples...</div>
        ) : patterns.length === 0 ? (
          <div className="col-span-3 py-16 text-center text-slate-400">No recurring patterns found matching criteria.</div>
        ) : (
          patterns.map((p) => (
            <div
              key={p.id}
              className={`p-4 rounded-xl bg-[#0C1222] border transition-all duration-200 hover:scale-[1.01] ${
                p.sif_association_rate >= 75
                  ? 'border-red-900/60 shadow-lg shadow-red-950/20'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-black text-white">{p.activity}</span>
                <RiskBadge level={p.risk_level} size="sm" />
              </div>

              <div className="text-[11px] text-amber-300 font-bold mb-1">
                Equipment: {p.equipment}
              </div>

              <div className="space-y-1 my-3 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Hazard:</span>
                  <span className="text-slate-200 font-semibold">{p.hazard}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Barrier Failure:</span>
                  <span className="text-red-400 font-semibold">{p.barrier_failure}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs mb-3">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Observed</div>
                  <div className="text-sm font-black text-white font-mono">{p.occurrence_count}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">SIF Correlated</div>
                  <div className="text-sm font-black text-rose-400 font-mono">{p.sif_count}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">SIF Association</div>
                  <div className="text-sm font-black text-amber-400 font-mono">{p.sif_association_rate}%</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <span className="flex items-center gap-1 font-semibold text-slate-300">
                  <TrendingUp className="w-3 h-3 text-sky-400" />
                  Trend: {p.trend}
                </span>
                <span className="truncate max-w-[150px] font-mono text-[10px]">
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
