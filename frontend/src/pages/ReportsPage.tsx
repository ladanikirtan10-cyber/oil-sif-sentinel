import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, PlusCircle, ChevronLeft, ChevronRight, 
  Eye, ShieldAlert, AlertTriangle, CheckCircle 
} from 'lucide-react';
import { api } from '../services/api';
import { SafetyReport } from '../types';
import { RiskBadge, SifBadge } from '../components/ui/RiskBadge';

interface ReportsPageProps {
  onSelectReport: (reportId: number) => void;
  onNewReport: () => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ onSelectReport, onNewReport }) => {
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);

  // Filters
  const [search, setSearch] = useState('');
  const [site, setSite] = useState('ALL');
  const [reportType, setReportType] = useState('ALL');
  const [sifFilter, setSifFilter] = useState('ALL');
  const [severity, setSeverity] = useState('ALL');
  const [activity, setActivity] = useState('ALL');

  useEffect(() => {
    fetchReports();
  }, [page, search, site, reportType, sifFilter, severity, activity]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (search) params.search = search;
      if (site !== 'ALL') params.site = site;
      if (reportType !== 'ALL') params.report_type = reportType;
      if (sifFilter === 'SIF_ONLY') params.sif = true;
      if (sifFilter === 'NON_SIF') params.sif = false;
      if (severity !== 'ALL') params.severity = severity;
      if (activity !== 'ALL') params.activity = activity;

      const res = await api.getReports(params);
      setReports(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const jsonStr = JSON.stringify(reports, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oil_safety_reports_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Safety Observations & Incidents Repository</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Comprehensive audit register of Unsafe Acts, Unsafe Conditions, Near Misses, and Process Incidents
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export Data
          </button>
          <button
            onClick={onNewReport}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-950/30 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            New Safety Report
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-[#0C1222] border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Report ID, description, equipment, or location..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Quick Clear */}
          {(search || site !== 'ALL' || reportType !== 'ALL' || sifFilter !== 'ALL' || severity !== 'ALL' || activity !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setSite('ALL');
                setReportType('ALL');
                setSifFilter('ALL');
                setSeverity('ALL');
                setActivity('ALL');
                setPage(1);
              }}
              className="text-xs text-amber-400 hover:underline font-medium flex-shrink-0"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-1 border-t border-slate-800/80">
          <select
            value={site}
            onChange={(e) => { setSite(e.target.value); setPage(1); }}
            className="bg-slate-900 border border-slate-700/80 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Oilfield Assets</option>
            <option value="Duliajan">Duliajan Central Field</option>
            <option value="Moran">Moran Drilling Field</option>
            <option value="Digboi">Digboi Production</option>
            <option value="Naharkatiya">Naharkatiya Gas Station</option>
            <option value="Jorhat">Jorhat Exploration</option>
            <option value="Rajasthan">Rajasthan Basin</option>
            <option value="KG Basin">KG Basin Offshore</option>
          </select>

          <select
            value={reportType}
            onChange={(e) => { setReportType(e.target.value); setPage(1); }}
            className="bg-slate-900 border border-slate-700/80 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Observation Types</option>
            <option value="Unsafe Act">Unsafe Act (UA)</option>
            <option value="Unsafe Condition">Unsafe Condition (UC)</option>
            <option value="Near Miss">Near Miss</option>
            <option value="Incident">Incident</option>
          </select>

          <select
            value={sifFilter}
            onChange={(e) => { setSifFilter(e.target.value); setPage(1); }}
            className="bg-slate-900 border border-slate-700/80 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">SIF Status: All</option>
            <option value="SIF_ONLY">SIF Potential Only (Alerts)</option>
            <option value="NON_SIF">Non-SIF Potential Only</option>
          </select>

          <select
            value={severity}
            onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
            className="bg-slate-900 border border-slate-700/80 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="CRITICAL">Critical (76-100)</option>
            <option value="HIGH">High (56-75)</option>
            <option value="MODERATE">Moderate (31-55)</option>
            <option value="LOW">Low (0-30)</option>
          </select>

          <select
            value={activity}
            onChange={(e) => { setActivity(e.target.value); setPage(1); }}
            className="bg-slate-900 border border-slate-700/80 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Activities</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Drilling">Drilling</option>
            <option value="Mechanical Lifting">Mechanical Lifting</option>
            <option value="Hot Work">Hot Work / Welding</option>
            <option value="Confined Space Entry">Confined Space</option>
            <option value="Electrical Work">Electrical Work</option>
            <option value="Transportation">Transportation</option>
          </select>
        </div>
      </div>

      {/* Reports Data Table */}
      <div className="p-4 rounded-xl bg-[#0C1222] border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Report ID & Date</th>
                <th className="py-3 px-3">Asset & Location</th>
                <th className="py-3 px-3">Activity & Equipment</th>
                <th className="py-3 px-3">Observation Description</th>
                <th className="py-3 px-3 text-center">SIF Classification</th>
                <th className="py-3 px-3 text-center">Risk Tier</th>
                <th className="py-3 px-3 text-center">Review Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Querying safety repository...</span>
                    </div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No safety reports matched the selected criteria.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-900/50 transition-colors group">
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-sky-400 group-hover:underline">
                        {report.report_uid}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(report.date_time).toLocaleDateString()} • {report.shift}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{report.site_name}</div>
                      <div className="text-[10px] text-slate-400">{report.location}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-200">{report.activity}</div>
                      <div className="text-[10px] text-slate-400">{report.equipment}</div>
                    </td>

                    <td className="py-3 px-3 max-w-xs">
                      <p className="text-slate-300 line-clamp-2 leading-relaxed">
                        {report.raw_description}
                      </p>
                      {report.contractor_involved && (
                        <span className="inline-block mt-1 text-[9px] px-1 py-0.2 rounded bg-amber-950/60 text-amber-400 border border-amber-500/30">
                          Contractor: {report.contractor_name || 'Third-Party'}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <SifBadge isSif={report.sif_potential} probability={report.sif_probability} size="sm" />
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex flex-col items-center gap-0.5">
                        <RiskBadge level={report.severity} size="sm" />
                        <span className="text-[10px] text-slate-400 font-mono">Score: {report.risk_score}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        report.status === 'Validated'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {report.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectReport(report.id)}
                        className="px-2.5 py-1 rounded bg-slate-900 hover:bg-sky-600 text-slate-300 hover:text-white border border-slate-700 hover:border-sky-500 text-xs font-semibold transition-all inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Investigate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-800 text-xs text-slate-400">
          <div>
            Showing <span className="text-white font-bold">{reports.length}</span> of{' '}
            <span className="text-white font-bold">{total}</span> recorded reports
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="p-1.5 rounded bg-slate-900 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-slate-300">Page {page}</span>
            <button
              disabled={page * limit >= total}
              onClick={() => setPage(p => p + 1)}
              className="p-1.5 rounded bg-slate-900 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
