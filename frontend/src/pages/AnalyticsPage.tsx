import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RiskBadge } from '../components/ui/RiskBadge';
import { RiskMatrix5x5 } from '../components/ui/RiskMatrix5x5';
import { useLanguage } from '../i18n/LanguageContext';

export const AnalyticsPage: React.FC = () => {
  const { t } = useLanguage();
  const [sites, setSites] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [matrixData, setMatrixData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [siteRes, actRes, matRes] = await Promise.all([
        api.getSiteAnalytics(),
        api.getActivityAnalytics(),
        api.getRiskMatrix(),
      ]);
      setSites(siteRes);
      setActivities(actRes);
      setMatrixData(matRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">{t('analytics.title')}</h2>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          {t('analytics.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-3">
          <RiskMatrix5x5 cellsData={matrixData?.cells || []} />
        </div>

        <div className="lg:col-span-6 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            {t('analytics.activityDensity')}
          </h3>
          <div className="space-y-2">
            {activities.map((act) => (
              <div key={act.activity} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs shadow-sm">
                <div>
                  <div className="font-bold text-slate-900">{act.activity}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                    {act.sif_reports} {t('dashboard.kpiSif')} / {act.total_reports}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-sm text-slate-900 px-2.5 py-0.5 rounded bg-white border border-slate-200 shadow-sm">
                    {act.sif_density}%
                  </span>
                  <RiskBadge level={act.risk_tier} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          {t('dashboard.siteRankings')}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] text-slate-500 uppercase tracking-wider bg-slate-50">
                <th className="py-2.5 px-3">{t('common.location')}</th>
                <th className="py-2.5 px-3">Region</th>
                <th className="py-2.5 px-3">Facility Type</th>
                <th className="py-2.5 px-3 text-right">{t('dashboard.kpiTotal')}</th>
                <th className="py-2.5 px-3 text-right">{t('dashboard.kpiSif')}</th>
                <th className="py-2.5 px-3 text-right">{t('dashboard.kpiRate')}</th>
                <th className="py-2.5 px-3">Dominant Hazard Driver</th>
                <th className="py-2.5 px-3 text-center">{t('common.severity')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sites.map((s) => (
                <tr key={s.site_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">{s.site_name}</td>
                  <td className="py-3 px-3 text-slate-600 font-medium">{s.region}</td>
                  <td className="py-3 px-3 text-slate-500 font-medium">{s.site_type}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-800">{s.total_reports}</td>
                  <td className="py-3 px-3 text-right font-bold text-rose-600">{s.sif_reports}</td>
                  <td className="py-3 px-3 text-right font-black font-mono text-amber-700">{s.sif_density}%</td>
                  <td className="py-3 px-3 text-slate-700 font-medium">{s.top_hazard}</td>
                  <td className="py-3 px-3 text-center">
                    <RiskBadge level={s.risk_level} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
