import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, ArrowRight, Database } from 'lucide-react';
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
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Data Management & Batch Import Wizard</h2>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          Ingest historical safety observation registers (CSV, Excel, JSON), map enterprise columns, and execute automated AI precursor analysis.
        </p>
      </div>

      {result && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Batch Safety Data Import Completed Successfully!</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-emerald-700">Imported Reports</span>
              <div className="text-xl font-black text-slate-900 font-mono">{result.imported_count}</div>
            </div>
            <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-emerald-700">SIF Precursors Flagged</span>
              <div className="text-xl font-black text-rose-600 font-mono">{result.sif_detected_count}</div>
            </div>
            <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-emerald-700">Validation Errors</span>
              <div className="text-xl font-black text-slate-700 font-mono">{result.errors?.length || 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* 5-Step Import Wizard Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-blue-600" />
            Upload File & Column Mapping
          </h3>
          <span className="text-xs text-slate-500 font-mono font-semibold">Supported formats: .CSV, .JSON</span>
        </div>

        {/* Step 1: Upload Box */}
        <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 text-center transition-all bg-slate-50/60">
          <input
            type="file"
            id="fileInput"
            accept=".csv,.json"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shadow-sm">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-slate-900">
              {file ? file.name : 'Click to select CSV / JSON Safety Register'}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Files are parsed, validated, and automatically categorized by the SIF intelligence engine.
            </p>
          </label>
        </div>

        {/* Step 2 & 3: Preview & Mapping (Only if file loaded) */}
        {previewData && (
          <div className="space-y-6 pt-4 border-t border-slate-100">
            {/* Column Mapping Grid */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Map Uploaded Headers to SIF Sentinel Ontologies
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-600 font-bold mb-1">Narrative / Description *</label>
                  <select
                    value={mapping.description}
                    onChange={(e) => setMapping({ ...mapping, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 font-bold mb-1">Asset Site</label>
                  <select
                    value={mapping.site}
                    onChange={(e) => setMapping({ ...mapping, site: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 font-bold mb-1">Report Category</label>
                  <select
                    value={mapping.report_type}
                    onChange={(e) => setMapping({ ...mapping, report_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 font-bold mb-1">Activity</label>
                  <select
                    value={mapping.activity}
                    onChange={(e) => setMapping({ ...mapping, activity: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Preview Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Sample Record Preview (First 5 Rows)
              </h4>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase font-bold">
                    <tr>
                      {headers.map((h) => (
                        <th key={h} className="p-2.5 border-b border-slate-200">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.slice(0, 5).map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        {headers.map((h) => (
                          <td key={h} className="p-2.5 max-w-xs truncate text-[11px] text-slate-700 font-medium">
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
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPreviewData(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={importing}
                onClick={handleExecuteImport}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-500/25 flex items-center gap-2"
              >
                {importing ? 'Processing Batch with AI...' : 'Validate & Execute AI Ingestion'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CLI Demo Generator Info Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 border border-amber-300 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            High-Volume Synthetic Data Generator CLI
          </h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
            Need 10,000+ realistic Oil India Limited safety observations for stress testing or jury demonstrations? You can run the included Python script directly:
          </p>
          <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-amber-800 font-bold flex items-center justify-between shadow-inner">
            <code>python scripts/generate_demo_data.py --count 10000</code>
          </div>
        </div>
      </div>
    </div>
  );
};
