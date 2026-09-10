import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RiskBadge } from '../components/ui/RiskBadge';
import { RiskMatrix5x5 } from '../components/ui/RiskMatrix5x5';

export const AnalyticsPage: React.FC = () => {
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
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-bold text-white tracking-tight'>Site & Activity SIF Density Risk Analytics</h2>
        <p className='text-xs text-slate-400 mt-0.5'>
          Comparative risk profiling, 5x5 Likelihood-Severity distribution, and operational precursor concentration.
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        <div className='lg:col-span-6 space-y-3'>
          <RiskMatrix5x5 cellsData={matrixData?.cells || []} />
        </div>

        <div className='lg:col-span-6 p-5 rounded-2xl bg-[#0C1222] border border-slate-800 space-y-3'>
          <h3 className='text-sm font-bold text-white uppercase tracking-wider'>
            Activity SIF Precursor Density
          </h3>
          <div className='space-y-2'>
            {activities.map((act) => (
              <div key={act.activity} className='p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs'>
                <div>
                  <div className='font-bold text-white'>{act.activity}</div>
                  <div className='text-[11px] text-slate-400 mt-0.5'>
                    {act.sif_reports} SIF precursors out of {act.total_reports} reports
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <span className='font-mono font-bold text-sm text-white px-2 py-0.5 rounded bg-slate-800'>
                    {act.sif_density}%
                  </span>
                  <RiskBadge level={act.risk_tier} size='sm' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='p-5 rounded-2xl bg-[#0C1222] border border-slate-800'>
        <h3 className='text-sm font-bold text-white uppercase tracking-wider mb-4'>
          Oil India Limited Asset Risk Comparison
        </h3>
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-xs'>
            <thead>
              <tr className='border-b border-slate-800 text-[11px] text-slate-400 uppercase'>
                <th className='py-2.5 px-3'>Asset Site</th>
                <th className='py-2.5 px-3'>Region</th>
                <th className='py-2.5 px-3'>Facility Type</th>
                <th className='py-2.5 px-3 text-right'>Total Reports</th>
                <th className='py-2.5 px-3 text-right'>SIF Precursors</th>
                <th className='py-2.5 px-3 text-right'>Precursor Density</th>
                <th className='py-2.5 px-3'>Dominant Hazard Driver</th>
                <th className='py-2.5 px-3 text-center'>Risk Level</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-800/60'>
              {sites.map((s) => (
                <tr key={s.site_id} className='hover:bg-slate-900/50 transition-colors'>
                  <td className='py-3 px-3 font-bold text-white'>{s.site_name}</td>
                  <td className='py-3 px-3 text-slate-300'>{s.region}</td>
                  <td className='py-3 px-3 text-slate-400'>{s.site_type}</td>
                  <td className='py-3 px-3 text-right font-medium text-slate-200'>{s.total_reports}</td>
                  <td className='py-3 px-3 text-right font-bold text-rose-400'>{s.sif_reports}</td>
                  <td className='py-3 px-3 text-right font-bold font-mono text-amber-300'>{s.sif_density}%</td>
                  <td className='py-3 px-3 text-slate-300'>{s.top_hazard}</td>
                  <td className='py-3 px-3 text-center'>
                    <RiskBadge level={s.risk_level} size='sm' />
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
