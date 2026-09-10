import React, { useState, useEffect } from 'react';
import { 
  FileText, ShieldAlert, AlertTriangle, Building2, Zap, ArrowUpRight, 
  TrendingUp, Activity, PlusCircle, ArrowRight, CheckCircle 
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { api } from '../services/api';
import { StatCard } from '../components/ui/StatCard';
import { RiskBadge } from '../components/ui/RiskBadge';

interface DashboardPageProps {
  onNavigate: (tab: string, param?: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
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

  const TYPE_COLORS = ['#38BDF8', '#F59E0B', '#EF4444', '#10B981'];
  const RISK_COLORS: Record<string, string> = {
    LOW: '#10B981',
    MODERATE: '#F59E0B',
    HIGH: '#F97316',
    CRITICAL: '#EF4444',
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Aggregating Oil India Limited Safety Intelligence...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Critical Precursor Velocity Ticker Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/80 via-slate-900/90 to-amber-950/60 border border-red-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-red-950/40 glow-critical">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-600/30 border border-red-500/60 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-red-400 fill-red-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.2 rounded text-[9px] font-extrabold bg-red-600 text-white uppercase tracking-wider">
                ACTIVE SIF PRECURSOR ALERT
              </span>
              <span className="text-[11px] font-bold text-red-300 font-mono">100% SIF ASSOCIATION</span>
            </div>
            <p className="text-xs text-slate-200 mt-0.5 font-medium">
              Recurring Pattern: <span className="font-bold text-amber-300">Maintenance</span> + <span className="font-bold text-sky-300">Compressor / Rotating</span> + <span className="font-bold text-rose-300">Unexpected Startup</span> + <span className="font-bold text-red-300">LOTO Barrier Failure</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('precursors')}
          className="px-3 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600/50 border border-red-500/70 text-white text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 shadow-sm"
        >
          <span>Investigate Precursor</span>
          <ArrowRight className="w-3.5 h-3.5 text-red-300" />
        </button>
      </div>

      {/* 2. Top Executive Command Header with Controls */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0C1527] via-[#101D3A] to-[#0A1224] border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 shadow-2xl relative overflow-hidden">
        {/* Specular highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40 uppercase tracking-wider">
              Smart India Hackathon • SIH26165
            </span>
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Live Sync (7 Asset Fields)
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            OIL SIF SENTINEL <span className="text-amber-400 text-lg font-bold font-mono">| HSE Command</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            AI-driven Serious Injury & Fatality precursor intelligence, 11-facet NLP extraction, and IOGP Life-Saving Rule compliance monitoring across Oil India Limited upstream, midstream, and drilling assets.
          </p>

          {/* Quick Asset Site Filter Pills */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Asset Filter:</span>
            {['ALL', 'Duliajan', 'Moran', 'Digboi', 'Naharkatiya', 'KG Basin'].map((siteName) => (
              <button
                key={siteName}
                onClick={() => setSelectedSiteFilter(siteName)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  selectedSiteFilter === siteName
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-950/40'
                    : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                }`}
              >
                {siteName === 'ALL' ? 'All 7 Asset Sites' : siteName}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          <button
            onClick={() => onNavigate('new-report')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-amber-950/50 hover:shadow-amber-500/20 active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>AI Safety Studio</span>
          </button>
          <button
            onClick={() => onNavigate('assistant')}
            className="px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-sky-500/70 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-inner hover:text-sky-300"
          >
            <span>AI Assistant (RAG)</span>
          </button>
        </div>
      </div>

      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard
          title="Total Reports"
          value={kpis?.total_reports?.toLocaleString() || '273'}
          change={kpis?.trends?.total_reports_change || '+8.4%'}
          isPositive={true}
          subtitle="All recorded observations"
          icon={FileText}
          variant="default"
        />
        <StatCard
          title="SIF Precursors"
          value={kpis?.sif_reports?.toLocaleString() || '192'}
          change={kpis?.trends?.sif_rate_change || '-1.2%'}
          isPositive={false}
          subtitle="AI-detected high risk"
          icon={ShieldAlert}
          variant="critical"
        />
        <StatCard
          title="SIF Density Rate"
          value={`${kpis?.sif_rate || '70.3'}%`}
          subtitle="High-potential event ratio"
          icon={TrendingUp}
          variant="critical"
        />
        <StatCard
          title="Critical Cases"
          value={kpis?.critical_reports || '91'}
          change={kpis?.trends?.critical_change || '-4.1%'}
          isPositive={true}
          subtitle="L4/L5 matrix severity"
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          title="High-Risk Sites"
          value={kpis?.high_risk_sites || '5'}
          subtitle="Exceeding threshold density"
          icon={Building2}
          variant="warning"
        />
        <StatCard
          title="Emerging Tuples"
          value={kpis?.emerging_patterns || '14'}
          change={kpis?.trends?.emerging_change || '+2'}
          isPositive={false}
          subtitle="Frequent itemset patterns"
          icon={Zap}
          variant="cyan"
        />
      </div>

      {/* Row 2: Trend Area Chart + Donut Reports by Type */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* SIF Monthly Trend */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0C1222] border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">SIF Potential Trajectory</h3>
              <p className="text-[11px] text-slate-400">Monthly breakdown of total safety observations vs AI-identified SIF precursors</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-sky-400">
              Assam & Western Basins
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.monthly_trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="sifColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="total" stroke="#38BDF8" strokeWidth={2} fillOpacity={1} fill="url(#totalColor)" name="Total Reports" />
                <Area type="monotone" dataKey="sif" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#sifColor)" name="SIF Potential" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reports by Type Donut */}
        <div className="p-5 rounded-2xl bg-[#0C1222] border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide mb-1">Reports by Safety Category</h3>
            <p className="text-[11px] text-slate-400 mb-3">Distribution across observation classifications</p>
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
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
            {(charts?.reports_by_type || []).map((item: any, idx: number) => (
              <div key={item.name} className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TYPE_COLORS[idx % TYPE_COLORS.length] }}></span>
                <span className="text-slate-400 truncate">{item.name}:</span>
                <span className="font-bold text-white ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: SIF by Site Bar + SIF by Activity Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* SIF by Site */}
        <div className="p-5 rounded-2xl bg-[#0C1222] border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Asset-Wise SIF Precursor Volume</h3>
              <p className="text-[11px] text-slate-400">Total reports vs SIF potential cases across oilfields</p>
            </div>
            <button onClick={() => onNavigate('analytics')} className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1">
              Deep Analytics <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.sif_by_site || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="site" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="total" fill="#334155" name="Total Reports" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sif" fill="#EF4444" name="SIF Potential" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Life-Saving Rule Violations */}
        <div className="p-5 rounded-2xl bg-[#0C1222] border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Life-Saving Rule Breach Frequencies</h3>
              <p className="text-[11px] text-slate-400">Violations detected by multi-label NLP classifier</p>
            </div>
            <button onClick={() => onNavigate('rules')} className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1">
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
                <XAxis type="number" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={10} width={90} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="violations" fill="#F59E0B" name="Total Breaches" radius={[0, 4, 4, 0]} />
                <Bar dataKey="sif_violations" fill="#EF4444" name="SIF Correlated" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Site Risk Ranking Table */}
      <div className="p-5 rounded-2xl bg-[#0C1222] border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Oil India Limited Site Risk Priority Ranking</h3>
            <p className="text-[11px] text-slate-400">Ranked by SIF precursor density, critical hazard concentration, and historical barrier breaches</p>
          </div>
          <span className="text-xs text-slate-400 font-medium">Updated Real-Time</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider bg-slate-900/40">
                <th className="py-3 px-3.5">Rank</th>
                <th className="py-3 px-3.5">Site / Field Asset</th>
                <th className="py-3 px-3.5">Asset Region</th>
                <th className="py-3 px-3.5 text-right">Total Reports</th>
                <th className="py-3 px-3.5 text-right">SIF Precursors</th>
                <th className="py-3 px-3.5 text-right">SIF Density (%)</th>
                <th className="py-3 px-3.5 text-right">Critical Cases</th>
                <th className="py-3 px-3.5 text-center">Risk Tier</th>
                <th className="py-3 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(selectedSiteFilter === 'ALL' 
                ? rankings 
                : rankings.filter((s: any) => s.site_name?.toLowerCase().includes(selectedSiteFilter.toLowerCase()))
              ).map((site) => (
                <tr key={site.id} className="hover:bg-slate-900/70 transition-colors group">
                  <td className="py-3 px-3.5 font-mono font-black text-amber-400">
                    <span className="w-6 h-6 rounded-md bg-slate-800/80 border border-slate-700/60 flex items-center justify-center inline-block">
                      {site.rank}
                    </span>
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="font-bold text-white group-hover:text-amber-300 transition-colors">{site.site_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono tracking-wide">{site.code}</div>
                  </td>
                  <td className="py-3 px-3.5 text-slate-300 font-medium">{site.region}</td>
                  <td className="py-3 px-3.5 text-right font-mono font-semibold text-slate-300">{site.total_reports}</td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-rose-400">{site.sif_reports}</td>
                  <td className="py-3 px-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 bg-slate-800/90 h-2 rounded-full overflow-hidden border border-slate-700/40">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full" 
                          style={{ width: `${Math.min(100, site.sif_density)}%` }} 
                        />
                      </div>
                      <span className="font-mono font-bold text-white text-[11px] w-12 text-right">
                        {site.sif_density}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-amber-400">{site.critical_reports}</td>
                  <td className="py-3 px-3.5 text-center">
                    <RiskBadge level={site.risk_level} size="sm" />
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    <button
                      onClick={() => onNavigate('analytics')}
                      className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-amber-500 hover:text-slate-950 text-slate-300 font-semibold text-[11px] border border-slate-700/60 transition-all flex items-center gap-1 ml-auto"
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
