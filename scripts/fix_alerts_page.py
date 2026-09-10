code = """import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { api } from '../services/api';
import { Alert as AlertType } from '../types';
import { RiskBadge } from '../components/ui/RiskBadge';

interface AlertsPageProps {
  onSelectReport: (reportId: number) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ onSelectReport }) => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionAlert, setActionAlert] = useState<AlertType | null>(null);
  const [actionType, setActionType] = useState<'ack' | 'resolve'>('ack');
  const [assignee, setAssignee] = useState('Lead HSE Officer');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, [priorityFilter, statusFilter]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await api.getAlerts({ priority: priorityFilter, status: statusFilter });
      setAlerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionAlert) return;
    setSaving(true);
    try {
      if (actionType === 'ack') {
        await api.acknowledgeAlert(actionAlert.id, assignee);
      } else {
        await api.resolveAlert(actionAlert.id, notes);
      }
      setActionAlert(null);
      await fetchAlerts();
    } catch (err) {
      console.error(err);
      alert('Alert action failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Enterprise Safety Alert Center</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time incident response management for critical SIF precursor events and engineered barrier failures.
        </p>
      </div>

      <div className="p-3 rounded-xl bg-[#0C1222] border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {['ALL', 'OPEN', 'ACKNOWLEDGED', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                statusFilter === st ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-16 text-center text-slate-400 text-xs">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="col-span-2 py-16 text-center text-slate-400 text-xs">No active alerts match the filter.</div>
        ) : (
          alerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                alt.status === 'OPEN'
                  ? 'bg-[#0C1427] border-red-800/80 shadow-lg shadow-red-950/20'
                  : 'bg-[#0C1222] border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-bold text-sky-400">{alt.alert_uid}</span>
                  <div className="flex items-center gap-1.5">
                    <RiskBadge level={alt.priority} size="sm" />
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      alt.status === 'OPEN'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                        : alt.status === 'ACKNOWLEDGED'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {alt.status}
                    </span>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-white leading-snug">{alt.title}</h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{alt.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <div>
                  <span>Assigned: <strong className="text-white">{alt.assigned_to || 'Unassigned'}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  {alt.report_id && (
                    <button
                      onClick={() => onSelectReport(alt.report_id!)}
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-sky-400 hover:text-white font-semibold flex items-center gap-1 text-[10px]"
                    >
                      <Eye className="w-3 h-3" />
                      Report
                    </button>
                  )}
                  {alt.status === 'OPEN' && (
                    <button
                      onClick={() => { setActionAlert(alt); setActionType('ack'); }}
                      className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-[10px] uppercase"
                    >
                      Acknowledge
                    </button>
                  )}
                  {alt.status !== 'RESOLVED' && (
                    <button
                      onClick={() => { setActionAlert(alt); setActionType('resolve'); }}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px] uppercase"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {actionAlert && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0C1222] border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">
              {actionType === 'ack' ? 'Acknowledge Alert' : 'Resolve Incident Alert'} ({actionAlert.alert_uid})
            </h3>
            <form onSubmit={handleAction} className="space-y-3 text-xs">
              {actionType === 'ack' ? (
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Assign Incident To</label>
                  <input
                    type="text"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">Resolution Verification Notes</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Document corrective actions taken, isolation verified, and stands down conducted..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    required
                  ></textarea>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActionAlert(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase"
                >
                  Confirm Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
"""

with open('frontend/src/pages/AlertsPage.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('Fixed AlertsPage.tsx')
