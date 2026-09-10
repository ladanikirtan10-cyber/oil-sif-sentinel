content = """import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, ArrowRight, Database, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export const DataImportPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  // Column Mapping State
  const [mapping, setMapping] = useState({
    description: 'raw_description',
    site: 'site_name',
    report_type: 'report_type',
    activity: 'activity',
    location: 'location',
    equipment: 'equipment',
    worker_role: 'worker_role'
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selected = e.target.files[0];
    setFile(selected);
    setResult(null);

    const formData = new FormData();
    formData.append('file', selected);

    setLoading(true);
    try {
      const res = await api.previewImport(formData);
      setPreviewData(res.preview_records || []);
      setHeaders(res.headers || []);

      // Auto-detect mappings
      const autoMap = { ...mapping };
      res.headers.forEach((h: string) => {
        const hLow = h.toLowerCase();
        if (hLow.includes('desc') || hLow.includes('narrative') || hLow.includes('text')) autoMap.description = h;
        if (hLow.includes('site') || hLow.includes('field') || hLow.includes('asset')) autoMap.site = h;
        if (hLow.includes('type') || hLow.includes('category')) autoMap.report_type = h;
        if (hLow.includes('activity') || hLow.includes('task')) autoMap.activity = h;
        if (hLow.includes('loc')) autoMap.location = h;
        if (hLow.includes('equip')) autoMap.equipment = h;
        if (hLow.includes('role') || hLow.includes('worker')) autoMap.worker_role = h;
      });
      setMapping(autoMap);
    } catch (err) {
      console.error(err);
      alert('Failed to preview uploaded file.');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!previewData || previewData.length === 0) return;
    setImporting(true);
    try {
      const res = await api.executeImport(previewData, mapping);
      setResult(res);
      setFile(null);
      setPreviewData(null);
    } catch (err) {
      console.error(err);
      alert('Import execution failed.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Data Management & Batch Import Wizard</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Ingest historical safety observation registers (CSV, Excel, JSON), map enterprise columns, and execute automated AI precursor analysis.
        </p>
      </div>

      {result && (
        <div className="p-5 rounded-2xl bg-emerald-950/70 border border-emerald-500/60 space-y-2">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Batch Safety Data Import Completed Successfully!</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-lg bg-emerald-900/40 border border-emerald-500/30">
              <span className="text-[10px] uppercase font-bold text-emerald-300">Imported Reports</span>
              <div className="text-xl font-black text-white font-mono">{result.imported_count}</div>
            </div>
            <div className="p-3 rounded-lg bg-emerald-900/40 border border-emerald-500/30">
              <span className="text-[10px] uppercase font-bold text-emerald-300">SIF Precursors Flagged</span>
              <div className="text-xl font-black text-rose-300 font-mono">{result.sif_detected_count}</div>
            </div>
            <div className="p-3 rounded-lg bg-emerald-900/40 border border-emerald-500/30">
              <span className="text-[10px] uppercase font-bold text-emerald-300">Validation Errors</span>
              <div className="text-xl font-black text-slate-200 font-mono">{result.errors?.length || 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* 5-Step Import Wizard Card */}
      <div className="p-6 rounded-2xl bg-[#0C1222] border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-sky-400" />
            Upload File & Column Mapping
          </h3>
          <span className="text-xs text-slate-400 font-mono">Supported formats: .CSV, .JSON</span>
        </div>

        {/* Step 1: Upload Box */}
        <div className="border-2 border-dashed border-slate-700 hover:border-sky-500/80 rounded-2xl p-8 text-center transition-all bg-slate-900/40">
          <input
            type="file"
            id="fileInput"
            accept=".csv,.json"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-sky-600/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-white">
              {file ? file.name : 'Click to select CSV / JSON Safety Register'}
            </div>
            <p className="text-[11px] text-slate-400">
              Files are parsed, validated, and automatically categorized by the SIF intelligence engine.
            </p>
          </label>
        </div>

        {/* Step 2 & 3: Preview & Mapping (Only if file loaded) */}
        {previewData && (
          <div className="space-y-6 pt-4 border-t border-slate-800">
            {/* Column Mapping Grid */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Map Uploaded Headers to SIF Sentinel Ontologies
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-400 font-semibold mb-1">Narrative / Description *</label>
                  <select
                    value={mapping.description}
                    onChange={(e) => setMapping({ ...mapping, description: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 font-semibold mb-1">Asset Site</label>
                  <select
                    value={mapping.site}
                    onChange={(e) => setMapping({ ...mapping, site: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 font-semibold mb-1">Report Category</label>
                  <select
                    value={mapping.report_type}
                    onChange={(e) => setMapping({ ...mapping, report_type: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 font-semibold mb-1">Activity</label>
                  <select
                    value={mapping.activity}
                    onChange={(e) => setMapping({ ...mapping, activity: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Preview Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Sample Record Preview (First 5 Rows)
              </h4>
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase">
                    <tr>
                      {headers.map((h) => (
                        <th key={h} className="p-2 border-b border-slate-800">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {previewData.slice(0, 5).map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        {headers.map((h) => (
                          <td key={h} className="p-2 max-w-xs truncate text-[11px] text-slate-300">
                            {String(row[h] || '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Execute Button */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewData(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={importing}
                onClick={handleExecuteImport}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-950/40 flex items-center gap-2"
              >
                {importing ? 'Processing Batch with AI...' : 'Validate & Execute AI Ingestion'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CLI Demo Generator Info Banner */}
      <div className="p-5 rounded-2xl bg-[#0C1222] border border-slate-800 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            High-Volume Synthetic Data Generator CLI
          </h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Need 10,000+ realistic Oil India Limited safety observations for stress testing or jury demonstrations? You can run the included Python script directly:
          </p>
          <div className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300 flex items-center justify-between">
            <code>python scripts/generate_demo_data.py --count 10000</code>
          </div>
        </div>
      </div>
    </div>
  );
};
"""

with open('frontend/src/pages/DataImportPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Created DataImportPage.tsx')
