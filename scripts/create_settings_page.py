content = """import React, { useState, useEffect } from 'react';
import { Settings, Sliders, CheckCircle2, Save, Info, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const [sifThreshold, setSifThreshold] = useState(0.50);
  const [sifCriticalThreshold, setSifCriticalThreshold] = useState(0.75);
  const [weightSif, setWeightSif] = useState(0.35);
  const [weightSeverity, setWeightSeverity] = useState(0.25);
  const [weightExposure, setWeightExposure] = useState(0.15);
  const [weightBarrier, setWeightBarrier] = useState(0.15);
  const [weightRecurrence, setWeightRecurrence] = useState(0.10);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      if (data.sif_threshold !== undefined) setSifThreshold(data.sif_threshold);
      if (data.sif_critical_threshold !== undefined) setSifCriticalThreshold(data.sif_critical_threshold);
      if (data.weights) {
        setWeightSif(data.weights.sif_probability || 0.35);
        setWeightSeverity(data.weights.severity || 0.25);
        setWeightExposure(data.weights.exposure || 0.15);
        setWeightBarrier(data.weights.barrier_failure || 0.15);
        setWeightRecurrence(data.weights.recurrence || 0.10);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await api.updateSettings({
        sif_threshold: sifThreshold,
        sif_critical_threshold: sifCriticalThreshold,
        weight_sif_prob: weightSif,
        weight_severity: weightSeverity,
        weight_exposure: weightExposure,
        weight_barrier: weightBarrier,
        weight_recurrence: weightRecurrence,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const totalWeights = (weightSif + weightSeverity + weightExposure + weightBarrier + weightRecurrence).toFixed(2);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Enterprise Safety & Risk Engine Settings</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Tune algorithmic SIF classification thresholds and customize multi-variable risk scoring parameters.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>System risk configuration parameters updated and applied across live models.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* SIF Threshold Card */}
        <div className="p-5 rounded-2xl bg-[#0C1222] border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            SIF Binary Classification Thresholds
          </h3>
          <p className="text-xs text-slate-400">
            Probability cutoffs determining whether an observation is flagged as SIF Potential or Critical Alert.
          </p>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-semibold">SIF Potential Alert Threshold</span>
                <span className="font-mono font-bold text-sky-400">{Math.round(sifThreshold * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.30"
                max="0.80"
                step="0.05"
                value={sifThreshold}
                onChange={(e) => setSifThreshold(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-semibold">Critical Stop-Work Alert Threshold</span>
                <span className="font-mono font-bold text-red-400">{Math.round(sifCriticalThreshold * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.60"
                max="0.95"
                step="0.05"
                value={sifCriticalThreshold}
                onChange={(e) => setSifCriticalThreshold(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>
          </div>
        </div>

        {/* Multi-Variable Weighting Card */}
        <div className="p-5 rounded-2xl bg-[#0C1222] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Configurable Multi-Factor Risk Scoring Weights
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Composite Risk Score = (SIF Prob * w1) + (Severity * w2) + (Exposure * w3) + (Barrier Failure * w4) + (Recurrence * w5)
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
              totalWeights === '1.00' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-amber-950 text-amber-300 border border-amber-500/40'
            }`}>
              Weight Sum: {totalWeights}
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">SIF Probability Weight (w1)</span>
                <span className="font-mono font-bold text-amber-400">{(weightSif * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.60"
                step="0.05"
                value={weightSif}
                onChange={(e) => setWeightSif(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Consequence Severity Weight (w2)</span>
                <span className="font-mono font-bold text-amber-400">{(weightSeverity * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.50"
                step="0.05"
                value={weightSeverity}
                onChange={(e) => setWeightSeverity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Task Exposure Frequency Weight (w3)</span>
                <span className="font-mono font-bold text-amber-400">{(weightExposure * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.05"
                value={weightExposure}
                onChange={(e) => setWeightExposure(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Barrier Failure Criticality Weight (w4)</span>
                <span className="font-mono font-bold text-amber-400">{(weightBarrier * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.05"
                value={weightBarrier}
                onChange={(e) => setWeightBarrier(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Recurrence & Rule Criticality Weight (w5)</span>
                <span className="font-mono font-bold text-amber-400">{(weightRecurrence * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.30"
                step="0.05"
                value={weightRecurrence}
                onChange={(e) => setWeightRecurrence(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-sky-950/40 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Updating Parameters...' : 'Apply Risk Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};
"""

with open('frontend/src/pages/SettingsPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Created SettingsPage.tsx')
