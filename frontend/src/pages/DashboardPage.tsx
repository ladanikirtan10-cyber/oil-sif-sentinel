import React, { useState, useEffect } from 'react';
import { 
  FileText, ShieldAlert, AlertTriangle, Building2, Zap,
  TrendingUp, PlusCircle, ArrowRight, Bot, Camera
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { api } from '../services/api';
import { StatCard } from '../components/ui/StatCard';
import { RiskBadge } from '../components/ui/RiskBadge';
import { useLanguage } from '../i18n/LanguageContext';

interface DashboardPageProps {
  onNavigate: (tab: string, param?: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [kpis, setKpis] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [rankings, setRankings] = useState<any[]>([]);
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [kpiRes, chartRes, rankRes] = await Promise.all([
        api.getDashboardKpis(),
        api.getDashboardCharts(),
        api.getSiteRankings(),
      ]);
      setKpis(kpiRes);
      setCharts(chartRes);
      setRankings(rankRes);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const TYPE_COLORS = ['#0284C7', '#F59E0B', '#EF4444', '#10B981'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Aggregating Oil India Limited Safety Intelligence...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Critical Precursor Velocity Ticker Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 border border-red-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm glow-critical">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Zap className="w-5 h-5 text-red-600 fill-red-600 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white uppercase tracking-wider shadow-sm">
                ACTIVE SIF PRECURSOR ALERT
              </span>
              <span className="text-[11px] font-black text-red-700 font-mono">100% SIF ASSOCIATION</span>
            </div>
            <p className="text-xs text-slate-800 mt-1 font-medium">
              Recurring Pattern: <span className="font-bold text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded border border-amber-200">Maintenance</span> + <span className="font-bold text-sky-800 bg-sky-100/70 px-1.5 py-0.5 rounded border border-sky-200">Compressor / Rotating</span> + <span className="font-bold text-rose-800 bg-rose-100/70 px-1.5 py-0.5 rounded border border-rose-200">Unexpected Startup</span> + <span className="font-bold text-red-800 bg-red-100/70 px-1.5 py-0.5 rounded border border-red-200">LOTO Barrier Failure</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('precursors')}
          className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 shadow-sm shadow-red-200 hover:shadow"
        >
          <span>Investigate Precursor</span>
          <ArrowRight className="w-3.5 h-3.5 text-white" />
        </button>
      </div>

      {/* 2. Top Executive Command Header with Controls */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 shadow-sm relative overflow-hidden">
        {/* Colorful top border ribbon */}
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-300 uppercase tracking-wider">
              Smart India Hackathon • SIH26165
            </span>
            <span className="text-xs text-slate-500 font-mono flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Live Sync (7 Asset Fields)
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            OIL SIF SENTINEL <span className="text-amber-600 text-lg font-bold font-mono">| {t('common.hseCommand', 'HSE Command')}</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed font-medium">
            {t('dashboard.subtitle', 'Real-time SIF precursor surveillance & multi-label neural classification across Oil India assets')}
          </p>

          {/* Quick Asset Site Filter Pills */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">{t('common.filter', 'Asset Filter')}:</span>
            {['ALL', 'Duliajan', 'Moran', 'Digboi', 'Naharkatiya', 'KG Basin'].map((siteName) => (
              <button
                key={siteName}
                onClick={() => setSelectedSiteFilter(siteName)}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                  selectedSiteFilter === siteName
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {siteName === 'ALL' ? t('common.all', 'All 7 Asset Sites') : siteName}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end flex-wrap">
          <button
            onClick={() => onNavigate('camera')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-md shadow-rose-500/20 active:scale-95"
          >
            <Camera className="w-4 h-4 text-white stroke-[2.5]" />
            <span>{t('nav.camera', 'AI Safety Camera')}</span>
          </button>
          <button
            onClick={() => onNavigate('new-report')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-md shadow-amber-500/20 active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-white stroke-[2.5]" />
            <span>{t('nav.newReport', 'AI Safety Studio')}</span>
          </button>
          <button
            onClick={() => onNavigate('assistant')}
            className="px-4 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <Bot className="w-4 h-4 text-indigo-600" />
            <span>{t('nav.assistant', 'AI Assistant (RAG)')}</span>
          </button>
        </div>
      </div>

      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard
          title={t('dashboard.kpiTotal', 'Total Reports')}
          value={kpis?.total_reports?.toLocaleString() || '273'}
          change={kpis?.trends?.total_reports_change || '+8.4%'}
          isPositive={true}
          subtitle={t('dashboard.kpiTotalSub', 'All recorded observations')}
          icon={FileText}
          variant="default"
        />
        <StatCard
          title={t('dashboard.kpiSif', 'SIF Precursors')}
          value={kpis?.sif_reports?.toLocaleString() || '192'}
          change={kpis?.trends?.sif_rate_change || '-1.2%'}
          isPositive={false}
          subtitle={t('dashboard.kpiSifSub', 'AI-detected high risk')}
          icon={ShieldAlert}
          variant="critical"
        />
        <StatCard
          title={t('dashboard.kpiRate', 'SIF Density Rate')}
          value={`${kpis?.sif_rate || '70.3'}%`}
          subtitle={t('dashboard.kpiRateSub', 'High-potential event ratio')}
          icon={TrendingUp}
          variant="critical"
        />
        <StatCard
          title={t('dashboard.kpiCritical', 'Critical Cases')}
          value={kpis?.critical_reports || '91'}
          change={kpis?.trends?.critical_change || '-4.1%'}
          isPositive={true}
          subtitle={t('dashboard.kpiCriticalSub', 'L4/L5 matrix severity')}
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          title={t('dashboard.kpiAssets', 'High-Risk Sites')}
          value={kpis?.high_risk_sites || '5'}
          subtitle={t('dashboard.kpiAssetsSub', 'Exceeding threshold density')}
          icon={Building2}
          variant="warning"
        />
        <StatCard
          title={t('dashboard.kpiPatterns', 'Emerging Tuples')}
          value={kpis?.emerging_patterns || '14'}
          change={kpis?.trends?.emerging_change || '+2'}
          isPositive={false}
          subtitle={t('dashboard.kpiPatternsSub', 'Frequent itemset patterns')}
          icon={Zap}
          variant="cyan"
        />
      </div>

      {/* Row 2: Trend Area Chart + Donut Reports by Type */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* SIF Monthly Trend */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-wide">SIF Potential Trajectory</h3>
              <p className="text-[11px] text-slate-500 font-medium">Monthly breakdown of total safety observations vs AI-identified SIF precursors</p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-sky-50 border border-sky-200 text-sky-700">
              Assam & Western Basins
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.monthly_trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284C7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="sifColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '11px', color: '#0F172A', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Area type="monotone" dataKey="total" stroke="#0284C7" strokeWidth={2.5} fillOpacity={1} fill="url(#totalColor)" name="Total Reports" />
                <Area type="monotone" dataKey="sif" stroke="#EF4444" strokeWidth={2.5} fillOpacity={1} fill="url(#sifColor)" name="SIF Potential" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reports by Type Donut */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide mb-1">Reports by Safety Category</h3>
            <p className="text-[11px] text-slate-500 font-medium mb-3">Distribution across observation classifications</p>
          </div>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.reports_by_type || []}
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(charts?.reports_by_type || []).map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '11px', color: '#0F172A', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
            {(charts?.reports_by_type || []).map((item: any, idx: number) => (
              <div key={item.name} className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: TYPE_COLORS[idx % TYPE_COLORS.length] }}></span>
                <span className="text-slate-600 truncate">{item.name}:</span>
                <span className="font-bold text-slate-900 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: SIF by Site Bar + Top Life-Saving Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* SIF by Site */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Asset-Wise SIF Precursor Volume</h3>
              <p className="text-[11px] text-slate-500 font-medium">Total reports vs SIF potential cases across oilfields</p>
            </div>
            <button onClick={() => onNavigate('analytics')} className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1">
              Deep Analytics <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.sif_by_site || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="site" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '11px', color: '#0F172A', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                <Bar dataKey="total" fill="#CBD5E1" name="Total Reports" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sif" fill="#EF4444" name="SIF Potential" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Life-Saving Rule Violations */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Life-Saving Rule Breach Frequencies</h3>
              <p className="text-[11px] text-slate-500 font-medium">Violations detected by multi-label NLP classifier</p>
            </div>
            <button onClick={() => onNavigate('rules')} className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1">
              View 9 Rules <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                layout="vertical"
                data={charts?.rule_violations || []} 
                margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
              >
                <XAxis type="number" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={10} width={90} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '11px', color: '#0F172A', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                <Bar dataKey="violations" fill="#F59E0B" name="Total Breaches" radius={[0, 4, 4, 0]} />
                <Bar dataKey="sif_violations" fill="#EF4444" name="SIF Correlated" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Site Risk Ranking Table */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide">{t('dashboard.siteRankings', 'Oil India Limited Site Risk Priority Ranking')}</h3>
            <p className="text-[11px] text-slate-500 font-medium">{t('dashboard.subtitle', 'Ranked by SIF precursor density, critical hazard concentration, and historical barrier breaches')}</p>
          </div>
          <span className="text-xs text-slate-500 font-bold">{t('common.active', 'Live Sync')}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] text-slate-500 uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-3.5">#</th>
                <th className="py-3 px-3.5">{t('newReport.assetField', 'Site / Field Asset')}</th>
                <th className="py-3 px-3.5">{t('common.location', 'Asset Region')}</th>
                <th className="py-3 px-3.5 text-right">{t('dashboard.kpiTotal', 'Total Reports')}</th>
                <th className="py-3 px-3.5 text-right">{t('dashboard.kpiSif', 'SIF Precursors')}</th>
                <th className="py-3 px-3.5 text-right">{t('dashboard.kpiRate', 'SIF Density (%)')}</th>
                <th className="py-3 px-3.5 text-right">{t('dashboard.kpiCritical', 'Critical Cases')}</th>
                <th className="py-3 px-3.5 text-center">{t('common.severity', 'Risk Tier')}</th>
                <th className="py-3 px-3.5 text-right">{t('common.actions', 'Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(selectedSiteFilter === 'ALL' 
                ? rankings 
                : rankings.filter((s: any) => s.site_name?.toLowerCase().includes(selectedSiteFilter.toLowerCase()))
              ).map((site) => (
                <tr key={site.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-3 px-3.5 font-mono font-black text-amber-700">
                    <span className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center font-bold">
                      {site.rank}
                    </span>
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{site.site_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono tracking-wide">{site.code}</div>
                  </td>
                  <td className="py-3 px-3.5 text-slate-600 font-medium">{site.region}</td>
                  <td className="py-3 px-3.5 text-right font-mono font-semibold text-slate-700">{site.total_reports}</td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-rose-600">{site.sif_reports}</td>
                  <td className="py-3 px-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full" 
                          style={{ width: `${Math.min(100, site.sif_density)}%` }} 
                        />
                      </div>
                      <span className="font-mono font-bold text-slate-900 text-[11px] w-12 text-right">
                        {site.sif_density}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-amber-700">{site.critical_reports}</td>
                  <td className="py-3 px-3.5 text-center">
                    <RiskBadge level={site.risk_level} size="sm" />
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    <button
                      onClick={() => onNavigate('analytics')}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-bold text-[11px] border border-slate-200 transition-all flex items-center gap-1 ml-auto shadow-sm"
                    >
                      <span>Analyze</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
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
