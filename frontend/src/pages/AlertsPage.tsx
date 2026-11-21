import React, { useState, useEffect } from 'react';
import { Eye, Bell, CheckCircle2, Camera } from 'lucide-react';
import { api } from '../services/api';
import { Alert as AlertType } from '../types';
import { RiskBadge } from '../components/ui/RiskBadge';
import { useLanguage } from '../i18n/LanguageContext';

interface AlertsPageProps {
  onSelectReport: (reportId: number) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ onSelectReport }) => {
  const { t } = useLanguage();
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

  const statusTabLabels: Record<string, string> = {
    ALL: t('common.all'),
    OPEN: 'OPEN',
    ACKNOWLEDGED: 'ACKNOWLEDGED',
    RESOLVED: 'RESOLVED',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">{t('alerts.title')}</h2>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          {t('alerts.subtitle')}
        </p>
      </div>

      <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {['ALL', 'OPEN', 'ACKNOWLEDGED', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                statusFilter === st ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {statusTabLabels[st] || st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-bold">{t('alerts.priority')}</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
          >
            <option value="ALL">{t('alerts.allPriorities')}</option>
            <option value="CRITICAL">{t('risk.critical')}</option>
            <option value="HIGH">{t('risk.high')}</option>
            <option value="MEDIUM">{t('risk.moderate')}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-16 text-center text-slate-500 font-medium text-xs">{t('common.loading')}</div>
        ) : alerts.length === 0 ? (
          <div className="col-span-2 py-16 text-center text-slate-500 font-medium text-xs">{t('alerts.noAlerts')}</div>
        ) : (
          alerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                alt.status === 'OPEN'
                  ? 'border-red-300 bg-gradient-to-b from-red-50/30 via-white to-white'
                  : 'border-slate-200/90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-bold text-blue-600">{alt.alert_uid}</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {alt.title.toUpperCase().includes('CAMERA') && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                        <Camera className="w-3 h-3 text-purple-600" />
                        AI Camera
                      </span>
                    )}
                    <RiskBadge level={alt.priority} size="sm" />
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      alt.status === 'OPEN'
                        ? 'bg-red-50 text-red-700 border border-red-300 animate-pulse'
                        : alt.status === 'ACKNOWLEDGED'
                        ? 'bg-amber-50 text-amber-800 border border-amber-300'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    }`}>
                      {alt.status}
                    </span>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-slate-900 leading-snug">{alt.title}</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed font-medium">{alt.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div>
                  <span>Assigned: <strong className="text-slate-900 font-bold">{alt.assigned_to || 'Unassigned'}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  {alt.report_id && (
                    <button
                      onClick={() => onSelectReport(alt.report_id!)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center gap-1 transition-all"
                    >
                      <Eye className="w-3 h-3 text-slate-500" />
                      {t('common.view')}
                    </button>
                  )}
                  {alt.status === 'OPEN' && (
                    <button
                      onClick={() => {
                        setActionAlert(alt);
                        setActionType('ack');
                      }}
                      className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] shadow-sm"
                    >
                      {t('alerts.acknowledge')}
                    </button>
                  )}
                  {alt.status === 'ACKNOWLEDGED' && (
                    <button
                      onClick={() => {
                        setActionAlert(alt);
                        setActionType('resolve');
                      }}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-sm"
                    >
                      {t('alerts.resolve')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action Modal */}
      {actionAlert && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {actionType === 'ack' ? t('alerts.acknowledge') : t('alerts.resolve')}: {actionAlert.alert_uid}
            </h3>

            <form onSubmit={handleAction} className="space-y-3">
              {actionType === 'ack' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assign Responsible Officer</label>
                  <input
                    type="text"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Resolution & Corrective Actions</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Describe corrective actions taken or barrier restoration details..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionAlert(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  {saving ? t('common.loading') : t('common.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
