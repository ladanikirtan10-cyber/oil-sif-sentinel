import React from 'react';

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
    if (s === 5 || score >= 15) return 'bg-red-500 border-red-400 text-white font-black shadow-sm';
    if (score >= 10) return 'bg-amber-500 border-amber-400 text-white font-bold shadow-sm';
    if (score >= 6) return 'bg-yellow-400 border-yellow-300 text-yellow-950 font-bold';
    return 'bg-emerald-500 border-emerald-400 text-white font-bold';
  };

  const getCount = (l: number, s: number) => {
    const found = cellsData.find((c) => c.likelihood === l && c.severity === s);
    return found ? found.count : 0;
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">5x5 Risk Assessment Matrix</h4>
        <span className="text-[11px] text-slate-500 font-mono font-semibold">Likelihood vs Severity</span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[320px]">
          {/* Top Header for Severity */}
          <div className="grid grid-cols-6 gap-1.5 mb-1.5 text-[10px] text-slate-500 font-bold text-center">
            <div className="text-left pl-1">L \ S</div>
            {severityLabels.map((lbl, idx) => (
              <div key={lbl} className="truncate" title={`S${idx + 1}: ${lbl}`}>
                S{idx + 1}
              </div>
            ))}
          </div>

          {/* Matrix Rows (Likelihood 5 to 1 from top to bottom) */}
          {[5, 4, 3, 2, 1].map((l) => (
            <div key={l} className="grid grid-cols-6 gap-1.5 mb-1.5 items-center">
              {/* Likelihood Label */}
              <div className="text-[10px] text-slate-600 font-bold truncate pr-1">
                L{l} ({likelihoodLabels[l - 1].slice(0, 4)})
              </div>

              {/* 5 Severity Columns */}
              {[1, 2, 3, 4, 5].map((s) => {
                const isTarget = selectedLikelihood === l && selectedSeverity === s;
                const cellCount = getCount(l, s);
                return (
                  <div
                    key={`${l}-${s}`}
                    className={`h-9 rounded-lg flex flex-col items-center justify-center border text-[11px] font-bold transition-all ${getCellColor(
                      l,
                      s
                    )} ${isTarget ? 'ring-2 ring-slate-900 scale-105 shadow-md z-10' : 'opacity-90 hover:opacity-100'}`}
                    title={`Likelihood ${l} (${likelihoodLabels[l - 1]}), Severity ${s} (${severityLabels[s - 1]}) - ${cellCount} incidents`}
                  >
                    {isTarget ? (
                      <span className="bg-slate-900 text-white px-1.5 py-0.2 rounded text-[9px] font-black tracking-wide">★ HERE</span>
                    ) : cellCount > 0 ? (
                      <span className="text-xs font-bold">{cellCount}</span>
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

      <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mt-3 pt-2.5 border-t border-slate-100">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Low (1-5)</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-yellow-400"></span> Medium (6-9)</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500"></span> High (10-14)</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-500"></span> Critical (15-25)</span>
      </div>
    </div>
  );
};
