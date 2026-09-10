report_detail_code = """import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ShieldAlert, AlertTriangle, CheckCircle2, User, Calendar, 
  MapPin, Wrench, Shield, CheckSquare, MessageSquare, History, Activity, Share2 
} from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge, SifBadge } from '../components/ui/RiskBadge';
import { RiskMatrix5x5 } from '../components/ui/RiskMatrix5x5';
import { ExplainabilityPanel } from '../components/ui/ExplainabilityPanel';

interface ReportDetailPageProps {
  reportId: number;
  onBack: () => void;
}

export const ReportDetailPage: React.FC<ReportDetailPageProps> = ({ reportId, onBack }) => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Review Form state
  const [reviewedSif, setReviewedSif] = useState<boolean>(true);
  const [reviewedRisk, setReviewedRisk] = useState<string>('CRITICAL');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    loadReport();
  }, [reportId]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await api.getReport(reportId);
      setReport(data);
      setReviewedSif(data.sif_potential);
      setReviewedRisk(data.severity);
    } catch (err) {
      console.error('Failed to load report detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.submitReview(reportId, {
        report_id: reportId,
        reviewed_sif: reviewedSif,
        reviewed_risk: reviewedRisk,
        review_comment: reviewComment,
        status: 'APPROVED',
      });
      setReviewSuccess(true);
      await loadReport();
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert('Review submission failed.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading || !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-400">Loading Incident Investigation File...</p>
      </div>
    );
  }

  const analysis = report.analysis;
  const entities = analysis?.entity_extraction || {};
  const rules = analysis?.rule_signals || [];
  const explainability = analysis?.explainability || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Back to Reports"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-black text-sky-400">{report.report_uid}</span>
              <RiskBadge level={report.severity} size="md" />
              <SifBadge isSif={report.sif_potential} probability={report.sif_probability} size="md" />
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Logged on {new Date(report.date_time).toLocaleString()} • {report.report_type} • Status:{' '}
              <span className="font-bold text-white">{report.status}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert(`Report ${report.report_uid} link copied to clipboard!`)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share Investigation
          </button>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Summary, Narrative, Risk Matrix, Entities (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Metadata Specs */}
          <div className="p-4 rounded-xl bg-[#0C1222] border border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Asset Field</span>
              <div className="font-bold text-white mt-0.5">{report.site_name}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Specific Location</span>
              <div className="font-bold text-white mt-0.5">{report.location}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Activity</span>
              <div className="font-bold text-white mt-0.5">{report.activity}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Equipment</span>
              <div className="font-bold text-white mt-0.5">{report.equipment}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Worker Role / Shift</span>
              <div className="font-bold text-white mt-0.5">{report.worker_role} ({report.shift})</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Contractor Involvement</span>
              <div className="font-bold text-amber-400 mt-0.5">
                {report.contractor_involved ? report.contractor_name || 'Yes (Contractor)' : 'No (Departmental)'}
              </div>
            </div>
          </div>

          {/* Original Free-Form Safety Narrative */}
          <div className="p-5 rounded-xl bg-[#0C1222] border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Original Safety Observation Narrative
            </h4>
            <div className="p-4 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
              {report.raw_description}
            </div>
          </div>

          {/* 5x5 Risk Matrix Position */}
          <RiskMatrix5x5
            selectedLikelihood={analysis?.likelihood_score || 3}
            selectedSeverity={analysis?.severity_score || 4}
          />

          {/* Structured Safety Facets */}
          <div className="p-5 rounded-xl bg-[#0C1222] border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              NLP Extracted Safety Dimensions
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Hazards Detected</span>
                <div className="font-bold text-amber-400 mt-1">
                  {entities.hazards?.join(', ') || 'General Operational Hazard'}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Barrier Failures</span>
                <div className="font-bold text-red-400 mt-1">
                  {entities.barrier_failures?.join(', ') || 'Inadequate Barrier'}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Consequences</span>
                <div className="font-bold text-rose-300 mt-1">
                  {entities.potential_consequences?.join(', ') || 'Injury'}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Life-Saving Rules Triggered</span>
                <div className="font-bold text-sky-400 mt-1">
                  {rules.map((r: any) => r.rule_name).join(', ') || 'None'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Explainable AI, Similar Cases, Human Review Queue (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Explainability Engine */}
          {analysis && (
            <ExplainabilityPanel
              explainability={explainability}
              entities={entities}
              rules={rules}
              rawText={report.raw_description}
            />
          )}

          {/* Similar Incidents */}
          {analysis?.similar_reports && analysis.similar_reports.length > 0 && (
            <div className="p-5 rounded-xl bg-[#0C1222] border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Similar Historical Precursor Cases
              </h4>
              <div className="space-y-2">
                {analysis.similar_reports.map((sim: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sky-400">{sim.report_uid}</span>
                      <span className="text-[10px] font-bold text-amber-400">{sim.similarity}% Similarity</span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2">{sim.raw_description}</p>
                    <div className="text-[10px] text-slate-400">{sim.site_name} • {sim.activity}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Human Review / Decision Console */}
          <div className="p-5 rounded-xl bg-[#0C1222] border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-amber-400" />
                HSE Human Review & Validation
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">Continual Learning Feed</span>
            </div>

            {reviewSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Decision validated and saved to ML retraining dataset.</span>
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1 font-semibold">SIF Validation</label>
                  <select
                    value={reviewedSif ? 'YES' : 'NO'}
                    onChange={(e) => setReviewedSif(e.target.value === 'YES')}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                  >
                    <option value="YES">Confirm SIF Potential</option>
                    <option value="NO">Reject (Non-SIF)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1 font-semibold">Validated Severity</label>
                  <select
                    value={reviewedRisk}
                    onChange={(e) => setReviewedRisk(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1 font-semibold">Reviewer Notes & Action</label>
                <textarea
                  rows={2}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="e.g. Confirmed LOTO barrier failure. Stand-down conducted with technician team..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-950/40"
              >
                {submittingReview ? 'Saving Validation...' : 'Approve & Validate SIF Classification'}
              </button>
            </form>

            {/* Past Review Audit Trail */}
            {report.reviews && report.reviews.length > 0 && (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Prior Human Reviews</span>
                {report.reviews.map((rev: any, idx: number) => (
                  <div key={idx} className="p-2 rounded bg-slate-900 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>{rev.reviewer_name}</span>
                      <span>{new Date(rev.reviewed_at).toLocaleDateString()}</span>
                    </div>
                    <div className="text-white font-medium">
                      SIF: {rev.reviewed_sif ? 'Confirmed' : 'Rejected'} • Severity: {rev.reviewed_risk}
                    </div>
                    {rev.review_comment && (
                      <div className="text-slate-400 italic">"{rev.review_comment}"</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
"""

with open('frontend/src/pages/ReportDetailPage.tsx', 'w', encoding='utf-8') as f:
    f.write(report_detail_code)
print('Created ReportDetailPage.tsx')
