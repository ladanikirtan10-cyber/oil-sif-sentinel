dashboard_page_code = """import React, { useState, useEffect } from 'react';
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
      {/* Top Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0C1427] via-[#101C38] to-[#0C1427] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
              SIH26165 Operational Console
            </span>
            <span className="text-xs text-slate-400 font-mono">Live Sync</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            OIL SIF SENTINEL — Executive Safety Intelligence
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time automated precursor detection and Life-Saving Rule compliance monitoring across all active Oil India Limited drilling rigs, compressor manifolds, and processing stations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('new-report')}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-amber-950/40"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            Analyze New Report
          </button>
          <button
            onClick={() => onNavigate('assistant')}
            className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
          >
            Ask AI Assistant
          </button>
        </div>
      </div>

      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Total Reports"
          value={kpis?.total_reports?.toLocaleString() || '120'}
          change={kpis?.trends?.total_reports_change}
          isPositive={true}
          subtitle="Observed across assets"
          icon={FileText}
        />
        <StatCard
          title="SIF Potential"
          value={kpis?.sif_reports?.toLocaleString() || '90'}
          change={kpis?.trends?.sif_rate_change}
          isPositive={false}
          subtitle="Precursors flagged by AI"
          icon={ShieldAlert}
          variant="critical"
        />
        <StatCard
          title="SIF Precursor Rate"
          value={`${kpis?.sif_rate || '75.0'}%`}
          subtitle="Ratio of high-potential events"
          icon={TrendingUp}
          variant="critical"
        />
        <StatCard
          title="Critical Reports"
          value={kpis?.critical_reports || '24'}
          change={kpis?.trends?.critical_change}
          subtitle="Immediate hazard stop"
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          title="High-Risk Sites"
          value={kpis?.high_risk_sites || '5'}
          subtitle="Assets exceeding density"
          icon={Building2}
          variant="warning"
        />
        <StatCard
          title="Emerging Patterns"
          value={kpis?.emerging_patterns || '8'}
          change={kpis?.trends?.emerging_change}
          subtitle="Rapid velocity precursors"
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
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Site / Field Asset</th>
                <th className="py-2.5 px-3">Asset Region</th>
                <th className="py-2.5 px-3 text-right">Total Reports</th>
                <th className="py-2.5 px-3 text-right">SIF Potential</th>
                <th className="py-2.5 px-3 text-right">SIF Density (%)</th>
                <th className="py-2.5 px-3 text-right">Critical Cases</th>
                <th className="py-2.5 px-3 text-center">Risk Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rankings.map((site) => (
                <tr key={site.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-400">#{site.rank}</td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-white">{site.site_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{site.code}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{site.region}</td>
                  <td className="py-3 px-3 text-right font-medium text-slate-300">{site.total_reports}</td>
                  <td className="py-3 px-3 text-right font-bold text-rose-400">{site.sif_reports}</td>
                  <td className="py-3 px-3 text-right font-bold text-white">
                    <span className="px-2 py-0.5 rounded bg-slate-800 font-mono">
                      {site.sif_density}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-amber-400">{site.critical_reports}</td>
                  <td className="py-3 px-3 text-center">
                    <RiskBadge level={site.risk_level} size="sm" />
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
"""

with open('frontend/src/pages/DashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(dashboard_page_code)
print('Created DashboardPage.tsx')
