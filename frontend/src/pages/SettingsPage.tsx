import React, { useState, useEffect } from 'react';
import { Sliders, CheckCircle2, Save, Globe, Check } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';
import { SupportedLanguage } from '../i18n/types';

export const SettingsPage: React.FC = () => {
  const { language, setLanguage, languages, t } = useLanguage();

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
        <h2 className="text-xl font-black text-slate-900 tracking-tight">{t('settings.title')}</h2>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          {t('settings.subtitle')}
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 font-medium shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{t('settings.successMsg')}</span>
        </div>
      )}

      {/* Language & Regional Localization Card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shadow-sm">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {t('settings.language')}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {t('settings.languageDesc')}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold font-mono">
            {language.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {languages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code as SupportedLanguage)}
                className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between h-24 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-500/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{lang.flag}</span>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{lang.nativeName}</div>
                  <div className="text-[11px] text-slate-500 font-medium">{lang.label}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SIF Threshold Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            {t('settings.sifThresholds')}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {t('settings.thresholdsDesc')}
          </p>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-bold">{t('settings.potentialThreshold')}</span>
                <span className="font-mono font-bold text-blue-600">{Math.round(sifThreshold * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.30"
                max="0.80"
                step="0.05"
                value={sifThreshold}
                onChange={(e) => setSifThreshold(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-bold">{t('settings.criticalThreshold')}</span>
                <span className="font-mono font-bold text-red-600">{Math.round(sifCriticalThreshold * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.60"
                max="0.95"
                step="0.05"
                value={sifCriticalThreshold}
                onChange={(e) => setSifCriticalThreshold(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>
          </div>
        </div>

        {/* Multi-Variable Weighting Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {t('settings.weightsTitle')}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {t('settings.weightsDesc')}
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
              totalWeights === '1.00' ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-amber-50 text-amber-800 border border-amber-300'
            }`}>
              {t('settings.weightSum')} {totalWeights}
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-bold">{t('settings.probWeight')}</span>
                <span className="font-mono font-bold text-amber-700">{(weightSif * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.60"
                step="0.05"
                value={weightSif}
                onChange={(e) => setWeightSif(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-bold">{t('settings.severityWeight')}</span>
                <span className="font-mono font-bold text-amber-700">{(weightSeverity * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.50"
                step="0.05"
                value={weightSeverity}
                onChange={(e) => setWeightSeverity(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-bold">{t('settings.exposureWeight')}</span>
                <span className="font-mono font-bold text-amber-700">{(weightExposure * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.05"
                value={weightExposure}
                onChange={(e) => setWeightExposure(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-bold">{t('settings.barrierWeight')}</span>
                <span className="font-mono font-bold text-amber-700">{(weightBarrier * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.05"
                value={weightBarrier}
                onChange={(e) => setWeightBarrier(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-bold">{t('settings.recurrenceWeight')}</span>
                <span className="font-mono font-bold text-amber-700">{(weightRecurrence * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.30"
                step="0.05"
                value={weightRecurrence}
                onChange={(e) => setWeightRecurrence(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-500/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? t('settings.updating') : t('settings.applyButton')}
          </button>
        </div>
      </form>
    </div>
  );
};
