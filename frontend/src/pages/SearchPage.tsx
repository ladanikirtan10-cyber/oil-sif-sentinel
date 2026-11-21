import React, { useState } from 'react';
import { Search, Eye } from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge, SifBadge } from '../components/ui/RiskBadge';
import { useLanguage } from '../i18n/LanguageContext';

interface SearchPageProps {
  onSelectReport: (reportId: number) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onSelectReport }) => {
  const { t } = useLanguage();
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
        <h2 className="text-xl font-black text-slate-900 tracking-tight">{t('search.title')}</h2>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          {t('search.subtitle')}
        </p>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('semantic')}
          className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
            activeTab === 'semantic' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Natural Language Semantic Search
        </button>
        <button
          onClick={() => {
            setActiveTab('duplicates');
            if (duplicates.length === 0) loadDuplicates();
          }}
          className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
            activeTab === 'duplicates' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Duplicate & Near-Duplicate Detection
        </button>
      </div>

      {activeTab === 'semantic' ? (
        <div className="space-y-5">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Scaffolding dismantled without fall arrest harness in Moran field..."
                className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/20"
            >
              {loading ? 'Searching...' : 'Run Semantic Match'}
            </button>
          </form>

          {/* Quick Example Prompts */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span className="font-bold text-slate-700">Try:</span>
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
                className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-blue-400 text-[11px] text-slate-700 font-medium hover:text-blue-600 transition-all shadow-sm"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>
                {hasSearched ? `Found ${results.length} semantically relevant safety incidents` : 'Ready to search'}
              </span>
            </div>

            {results.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-md transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectReport(r.id)}
                      className="font-mono text-xs font-bold text-blue-600 hover:underline"
                    >
                      {r.report_uid}
                    </button>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {r.site_name} • {r.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-amber-800 px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
                      {r.similarity}% Similarity
                    </span>
                    <RiskBadge level={r.severity} size="sm" />
                    <SifBadge isSif={r.sif_potential} probability={r.sif_probability} size="sm" />
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">{r.raw_description}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <div>
                    <span>Activity: <strong className="text-slate-900 font-bold">{r.activity}</strong></span>
                    <span className="ml-3">Equipment: <strong className="text-slate-900 font-bold">{r.equipment}</strong></span>
                  </div>
                  <button
                    onClick={() => onSelectReport(r.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
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
            <p className="text-xs text-slate-500 font-medium">
              Identified duplicate or near-duplicate safety observations flagged for consolidation.
            </p>
            <button
              onClick={loadDuplicates}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
            >
              Scan for Duplicates
            </button>
          </div>

          {loadingDuplicates ? (
            <div className="py-16 text-center text-slate-500 text-xs font-medium">Scanning repository for redundant records...</div>
          ) : duplicates.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs font-medium">No duplicate records detected.</div>
          ) : (
            <div className="space-y-3">
              {duplicates.map((dup, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white border border-amber-300 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                        {dup.match_type}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900">{dup.similarity}% Overlap</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-700">
                      Recommended: <strong className="text-blue-600">{dup.recommendation}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                      <div className="font-mono font-bold text-blue-600">{dup.report_a.report_uid}</div>
                      <p className="text-slate-700 line-clamp-3 font-medium">{dup.report_a.raw_description}</p>
                      <div className="text-[10px] text-slate-500 font-medium">{dup.report_a.site_name} • {dup.report_a.activity}</div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                      <div className="font-mono font-bold text-blue-600">{dup.report_b.report_uid}</div>
                      <p className="text-slate-700 line-clamp-3 font-medium">{dup.report_b.raw_description}</p>
                      <div className="text-[10px] text-slate-500 font-medium">{dup.report_b.site_name} • {dup.report_b.activity}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => alert(`Ignored duplicate pair: ${dup.report_a.report_uid} & ${dup.report_b.report_uid}`)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                    >
                      Ignore Match
                    </button>
                    <button
                      onClick={() => alert(`Consolidation review opened for ${dup.report_a.report_uid}`)}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase shadow-sm"
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
