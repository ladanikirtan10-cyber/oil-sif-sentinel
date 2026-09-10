code = """import React, { useState } from 'react';
import { Search, Copy, ArrowRight, Eye, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge, SifBadge } from '../components/ui/RiskBadge';

interface SearchPageProps {
  onSelectReport: (reportId: number) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onSelectReport }) => {
  const [activeTab, setActiveTab] = useState<'semantic' | 'duplicates'>('semantic');
  const [query, setQuery] = useState('Show incidents involving energy isolation failures during maintenance.');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Duplicates state
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [loadingDuplicates, setLoadingDuplicates] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await api.semanticSearch(query);
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDuplicates = async () => {
    setLoadingDuplicates(true);
    try {
      const data = await api.getDuplicates();
      setDuplicates(data.duplicate_pairs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDuplicates(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Semantic Search & Duplicate Incident Intelligence</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Vector similarity search across unstructured safety narratives and automated redundant observation clustering.
        </p>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('semantic')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            activeTab === 'semantic' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Natural Language Semantic Search
        </button>
        <button
          onClick={() => {
            setActiveTab('duplicates');
            if (duplicates.length === 0) loadDuplicates();
          }}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            activeTab === 'duplicates' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Duplicate & Near-Duplicate Detection
        </button>
      </div>

      {activeTab === 'semantic' ? (
        <div className="space-y-5">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Scaffolding dismantled without fall arrest harness in Moran field..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-sky-950/40"
            >
              {loading ? 'Searching...' : 'Run Semantic Match'}
            </button>
          </form>

          {/* Quick Example Prompts */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
            <span className="font-semibold text-slate-500">Try:</span>
            {[
              'Energy isolation failure on energized compressor',
              'Worker standing under suspended load during lifting',
              'Entering vessel without gas testing and permit',
              'H2S toxic gas alarm ignored near cellar pit',
            ].map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(prompt);
                }}
                className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-600 text-[11px] text-slate-300 transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>
                {hasSearched ? `Found ${results.length} semantically relevant safety incidents` : 'Ready to search'}
              </span>
            </div>

            {results.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-xl bg-[#0C1222] border border-slate-800 hover:border-slate-700 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectReport(r.id)}
                      className="font-mono text-xs font-bold text-sky-400 hover:underline"
                    >
                      {r.report_uid}
                    </button>
                    <span className="text-[11px] text-slate-400">
                      {r.site_name} • {r.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-amber-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {r.similarity}% Similarity
                    </span>
                    <RiskBadge level={r.severity} size="sm" />
                    <SifBadge isSif={r.sif_potential} probability={r.sif_probability} size="sm" />
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-sans">{r.raw_description}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                  <div>
                    <span>Activity: <strong className="text-white">{r.activity}</strong></span>
                    <span className="ml-3">Equipment: <strong className="text-white">{r.equipment}</strong></span>
                  </div>
                  <button
                    onClick={() => onSelectReport(r.id)}
                    className="text-xs text-sky-400 hover:text-white font-semibold flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    Open Investigation File
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Duplicates Tab */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Identified duplicate or near-duplicate safety observations flagged for consolidation.
            </p>
            <button
              onClick={loadDuplicates}
              className="px-3 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white"
            >
              Scan for Duplicates
            </button>
          </div>

          {loadingDuplicates ? (
            <div className="py-16 text-center text-slate-400 text-xs">Scanning repository for redundant records...</div>
          ) : duplicates.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">No duplicate records detected.</div>
          ) : (
            <div className="space-y-3">
              {duplicates.map((dup, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#0C1222] border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {dup.match_type}
                      </span>
                      <span className="text-xs font-mono font-bold text-white">{dup.similarity}% Overlap</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-300">
                      Recommended: <strong className="text-sky-400">{dup.recommendation}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                      <div className="font-mono font-bold text-sky-400">{dup.report_a.report_uid}</div>
                      <p className="text-slate-300 line-clamp-3">{dup.report_a.raw_description}</p>
                      <div className="text-[10px] text-slate-400">{dup.report_a.site_name} • {dup.report_a.activity}</div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                      <div className="font-mono font-bold text-sky-400">{dup.report_b.report_uid}</div>
                      <p className="text-slate-300 line-clamp-3">{dup.report_b.raw_description}</p>
                      <div className="text-[10px] text-slate-400">{dup.report_b.site_name} • {dup.report_b.activity}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => alert(`Ignored duplicate pair: ${dup.report_a.report_uid} & ${dup.report_b.report_uid}`)}
                      className="px-3 py-1 rounded bg-slate-800 text-slate-300 text-xs hover:text-white"
                    >
                      Ignore Match
                    </button>
                    <button
                      onClick={() => alert(`Consolidation review opened for ${dup.report_a.report_uid}`)}
                      className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs uppercase"
                    >
                      Merge & Consolidate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
"""

with open('frontend/src/pages/SearchPage.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('Fixed SearchPage.tsx')
