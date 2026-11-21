import React, { useState, useEffect } from 'react';
import { CheckSquare, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge, SifBadge } from '../components/ui/RiskBadge';
import { useLanguage } from '../i18n/LanguageContext';

interface ReviewQueuePageProps {
  onSelectReport: (reportId: number) => void;
}

export const ReviewQueuePage: React.FC<ReviewQueuePageProps> = ({ onSelectReport }) => {
  const { t } = useLanguage();
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [confirmSif, setConfirmSif] = useState(true);
  const [reviewedRisk, setReviewedRisk] = useState('CRITICAL');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await api.getReviewQueue();
      setQueue(res.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (item: any) => {
    setSelectedItem(item);
    setConfirmSif(item.ai_sif_prediction);
    setReviewedRisk(item.risk_level);
    setComment('');
  };

  const handleSubmitValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setSubmitting(true);
    try {
      await api.submitReview(selectedItem.report_id, {
        report_id: selectedItem.report_id,
        reviewed_sif: confirmSif,
        reviewed_risk: reviewedRisk,
        review_comment: comment,
        status: confirmSif === selectedItem.ai_sif_prediction ? 'APPROVED' : 'MODIFIED',
      });
      setSelectedItem(null);
      await fetchQueue();
    } catch (err) {
      console.error(err);
      alert('Review action failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">{t('reviewQueue.title')}</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {t('reviewQueue.subtitle')}
          </p>
        </div>
        <button
          onClick={fetchQueue}
          className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          {t('reviewQueue.refresh')} ({queue.length})
        </button>
      </div>

      <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] text-slate-500 uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-3">Report ID</th>
                <th className="py-3 px-3">{t('common.location')} / {t('common.activity')}</th>
                <th className="py-3 px-3">Narrative Snippet</th>
                <th className="py-3 px-3 text-center">AI SIF Prediction</th>
                <th className="py-3 px-3 text-center">Confidence</th>
                <th className="py-3 px-3 text-center">{t('common.severity')}</th>
                <th className="py-3 px-3 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">{t('common.loading')}</td>
                </tr>
              ) : queue.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                    No safety reports currently pending human review.
                  </td>
                </tr>
              ) : (
                queue.map((item) => (
                  <tr key={item.report_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <button
                        onClick={() => onSelectReport(item.report_id)}
                        className="font-mono font-bold text-blue-600 hover:underline"
                      >
                        {item.report_uid}
                      </button>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{item.site_name}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{item.activity}</div>
                    </td>
                    <td className="py-3 px-3 max-w-sm">
                      <p className="text-slate-700 line-clamp-2 leading-relaxed font-medium">{item.raw_description}</p>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <SifBadge isSif={item.ai_sif_prediction} probability={item.sif_probability} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                      {Math.round(item.confidence * 100)}%
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <RiskBadge level={item.risk_level} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenReview(item)}
                        className="px-3 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs transition-all inline-flex items-center gap-1 shadow-sm"
                      >
                        <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
                        Validate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-amber-600" />
                  Validate Report {selectedItem.report_uid}
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">{selectedItem.site_name} • {selectedItem.activity}</span>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed max-h-32 overflow-y-auto font-medium">
              {selectedItem.raw_description}
            </div>

            <form onSubmit={handleSubmitValidation} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Human Decision</label>
                  <select
                    value={confirmSif ? 'CONFIRM' : 'REJECT'}
                    onChange={(e) => setConfirmSif(e.target.value === 'CONFIRM')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="CONFIRM">Confirm SIF Potential</option>
                    <option value="REJECT">Reject (Non-SIF Potential)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Risk Severity</label>
                  <select
                    value={reviewedRisk}
                    onChange={(e) => setReviewedRisk(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="CRITICAL">Critical (76-100)</option>
                    <option value="HIGH">High (56-75)</option>
                    <option value="MODERATE">Moderate (31-55)</option>
                    <option value="LOW">Low (0-30)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">HSE Officer Remarks</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="State operational rationale for verification or correction..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-sm"
                >
                  {submitting ? 'Recording...' : 'Submit Human Validation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
