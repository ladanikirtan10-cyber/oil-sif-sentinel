import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, CheckCircle2, CheckSquare, Share2, Volume2, VolumeX, Mic, MicOff, Play, Square
} from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge, SifBadge } from '../components/ui/RiskBadge';
import { RiskMatrix5x5 } from '../components/ui/RiskMatrix5x5';
import { ExplainabilityPanel } from '../components/ui/ExplainabilityPanel';
import { VoiceWaveVisualizer } from '../components/ui/VoiceWaveVisualizer';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  voiceSpeaker, 
  createSpeechRecognizer, 
  generateReportAudioBriefing, 
  SpeechRecognitionController 
} from '../utils/voiceAssistant';

interface ReportDetailPageProps {
  reportId: number;
  onBack: () => void;
}

export const ReportDetailPage: React.FC<ReportDetailPageProps> = ({ reportId, onBack }) => {
  const { t } = useLanguage();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Voice Briefing & Dictation states
  const [isPlayingBriefing, setIsPlayingBriefing] = useState(false);
  const [isPlayingNarrative, setIsPlayingNarrative] = useState(false);
  const [isListeningReview, setIsListeningReview] = useState(false);
  const reviewRecognizerRef = useRef<SpeechRecognitionController | null>(null);

  // Review Form state
  const [reviewedSif, setReviewedSif] = useState<boolean>(true);
  const [reviewedRisk, setReviewedRisk] = useState<string>('CRITICAL');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      voiceSpeaker.stop();
      if (reviewRecognizerRef.current) {
        reviewRecognizerRef.current.stop();
      }
    };
  }, []);

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

  const togglePlayBriefing = () => {
    if (isPlayingBriefing) {
      voiceSpeaker.stop();
      setIsPlayingBriefing(false);
      return;
    }

    if (!report) return;
    setIsPlayingNarrative(false);
    setIsPlayingBriefing(true);

    const speechText = generateReportAudioBriefing(report);
    voiceSpeaker.speak(speechText, {
      onEnd: () => setIsPlayingBriefing(false),
      onError: () => setIsPlayingBriefing(false),
    });
  };

  const togglePlayNarrative = () => {
    if (isPlayingNarrative) {
      voiceSpeaker.stop();
      setIsPlayingNarrative(false);
      return;
    }

    if (!report?.raw_description) return;
    setIsPlayingBriefing(false);
    setIsPlayingNarrative(true);

    const text = `Incident observation for report ${report.report_uid}: ${report.raw_description}`;
    voiceSpeaker.speak(text, {
      onEnd: () => setIsPlayingNarrative(false),
      onError: () => setIsPlayingNarrative(false),
    });
  };

  const toggleListeningReview = () => {
    if (isListeningReview) {
      if (reviewRecognizerRef.current) {
        reviewRecognizerRef.current.stop();
      }
      setIsListeningReview(false);
      return;
    }

    const recognizer = createSpeechRecognizer({
      onStart: () => setIsListeningReview(true),
      onResult: (transcript, isFinal) => {
        setReviewComment((prev) => {
          const trimmed = prev.trim();
          if (isFinal) {
            return trimmed ? `${trimmed} ${transcript}` : transcript;
          }
          return prev;
        });
      },
      onError: (err) => {
        console.warn('Review dictation error:', err);
        setIsListeningReview(false);
        alert(err || 'Microphone error.');
      },
      onEnd: () => setIsListeningReview(false),
    });

    reviewRecognizerRef.current = recognizer;
    recognizer.start();
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
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-500">Loading Incident Investigation File...</p>
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
            title="Back to Reports"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-black text-blue-600">{report.report_uid}</span>
              <RiskBadge level={report.severity} size="md" />
              <SifBadge isSif={report.sif_potential} probability={report.sif_probability} size="md" />
            </div>
            <div className="text-xs text-slate-500 mt-0.5 font-medium">
              Logged on {new Date(report.date_time).toLocaleString()} • {report.report_type} • Status:{' '}
              <span className="font-bold text-slate-900">{report.status}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={togglePlayBriefing}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all ${
              isPlayingBriefing
                ? 'bg-blue-600 text-white shadow-blue-500/25 ring-2 ring-blue-300 animate-pulse'
                : 'bg-white border border-blue-200 text-blue-700 hover:bg-blue-50'
            }`}
            title="Listen to full executive audio briefing of this incident"
          >
            {isPlayingBriefing ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            {isPlayingBriefing ? t('reportDetail.stopBriefing', 'Stop Audio Briefing') : t('reportDetail.voiceBriefing', 'Voice Incident Briefing')}
          </button>
          <button
            onClick={() => alert(`Report ${report.report_uid} link copied to clipboard!`)}
            className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            {t('reportDetail.share', 'Share Investigation')}
          </button>
        </div>
      </div>

      {/* Active Audio Briefing Visualizer Banner */}
      {(isPlayingBriefing || isPlayingNarrative) && (
        <VoiceWaveVisualizer
          mode="speaking"
          label={
            isPlayingBriefing
              ? `AI Incident Audio Briefing: ${report.report_uid} (${report.site_name})`
              : `Narrating Incident Observation: ${report.report_uid}`
          }
          onStop={() => {
            voiceSpeaker.stop();
            setIsPlayingBriefing(false);
            setIsPlayingNarrative(false);
          }}
        />
      )}

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Summary, Narrative, Risk Matrix, Entities (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Metadata Specs */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Asset Field</span>
              <div className="font-bold text-slate-900 mt-0.5">{report.site_name}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Specific Location</span>
              <div className="font-bold text-slate-900 mt-0.5">{report.location}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Activity</span>
              <div className="font-bold text-slate-900 mt-0.5">{report.activity}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Equipment</span>
              <div className="font-bold text-slate-900 mt-0.5">{report.equipment}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Worker Role / Shift</span>
              <div className="font-bold text-slate-900 mt-0.5">{report.worker_role} ({report.shift})</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Contractor Involvement</span>
              <div className="font-bold text-amber-700 mt-0.5">
                {report.contractor_involved ? report.contractor_name || 'Yes (Contractor)' : 'No (Departmental)'}
              </div>
            </div>
          </div>

          {/* Original Free-Form Safety Narrative */}
          <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Original Safety Observation Narrative
              </h4>
              <button
                type="button"
                onClick={togglePlayNarrative}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all shadow-sm ${
                  isPlayingNarrative
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300 animate-pulse'
                    : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200'
                }`}
                title="Listen to original observation speech readout"
              >
                {isPlayingNarrative ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-blue-600" />}
                {isPlayingNarrative ? 'Stop Audio' : 'Listen to Narrative'}
              </button>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans font-medium">
              {report.raw_description}
            </div>
          </div>

          {/* 5x5 Risk Matrix Position */}
          <RiskMatrix5x5
            selectedLikelihood={analysis?.likelihood_score || 3}
            selectedSeverity={analysis?.severity_score || 4}
          />

          {/* Structured Safety Facets */}
          <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              NLP Extracted Safety Dimensions
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Hazards Detected</span>
                <div className="font-bold text-amber-700 mt-1">
                  {entities.hazards?.join(', ') || 'General Operational Hazard'}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Barrier Failures</span>
                <div className="font-bold text-red-700 mt-1">
                  {entities.barrier_failures?.join(', ') || 'Inadequate Barrier'}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Consequences</span>
                <div className="font-bold text-rose-700 mt-1">
                  {entities.potential_consequences?.join(', ') || 'Injury'}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Life-Saving Rules Triggered</span>
                <div className="font-bold text-blue-600 mt-1">
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
            <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Similar Historical Precursor Cases
              </h4>
              <div className="space-y-2">
                {analysis.similar_reports.map((sim: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-blue-600">{sim.report_uid}</span>
                      <span className="text-[10px] font-bold text-amber-700">{sim.similarity}% Similarity</span>
                    </div>
                    <p className="text-[11px] text-slate-700 line-clamp-2 font-medium">{sim.raw_description}</p>
                    <div className="text-[10px] text-slate-500">{sim.site_name} • {sim.activity}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Human Review / Decision Console */}
          <div className="p-5 rounded-xl bg-white border border-amber-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-amber-600" />
                {t('reportDetail.humanReview', 'HSE Human Review & Validation')}
              </h4>
              <span className="text-[10px] text-slate-500 font-mono font-semibold">Continual Learning Feed</span>
            </div>

            {reviewSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Decision validated and saved to ML retraining dataset.</span>
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-700 mb-1 font-bold">{t('risk.sifPrecursor', 'SIF Validation')}</label>
                  <select
                    value={reviewedSif ? 'YES' : 'NO'}
                    onChange={(e) => setReviewedSif(e.target.value === 'YES')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="YES">{t('reportDetail.validateSif', 'Confirm SIF Potential')}</option>
                    <option value="NO">{t('reportDetail.rejectSif', 'Reject (Non-SIF)')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-700 mb-1 font-bold">{t('common.severity', 'Validated Severity')}</label>
                  <select
                    value={reviewedRisk}
                    onChange={(e) => setReviewedRisk(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="CRITICAL">{t('risk.critical', 'Critical')}</option>
                    <option value="HIGH">{t('risk.high', 'High')}</option>
                    <option value="MODERATE">{t('risk.moderate', 'Moderate')}</option>
                    <option value="LOW">{t('risk.low', 'Low')}</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-slate-700 font-bold">{t('reportDetail.reviewNotes', 'Reviewer Notes & Action')}</label>
                  <button
                    type="button"
                    onClick={toggleListeningReview}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all shadow-sm ${
                      isListeningReview
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 ring-2 ring-amber-200 animate-pulse'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                    title="Dictate reviewer comments using microphone"
                  >
                    {isListeningReview ? <MicOff className="w-3 h-3 text-amber-700" /> : <Mic className="w-3 h-3 text-slate-600" />}
                    {isListeningReview ? t('newReport.listening', 'Listening...') : t('newReport.voiceDictate', 'Voice Dictate')}
                  </button>
                </div>
                {isListeningReview && (
                  <div className="mb-2">
                    <VoiceWaveVisualizer
                      mode="listening"
                      compact
                      label={t('newReport.listening', 'Dictating Reviewer Comments...')}
                      onStop={toggleListeningReview}
                    />
                  </div>
                )}
                <textarea
                  rows={2}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="e.g. Confirmed LOTO barrier failure. Stand-down conducted with technician team..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-sm"
              >
                {submittingReview ? t('common.loading', 'Saving...') : t('reportDetail.approveButton', 'Approve & Validate SIF Classification')}
              </button>
            </form>

            {/* Past Review Audit Trail */}
            {report.reviews && report.reviews.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Prior Human Reviews</span>
                {report.reviews.map((rev: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-bold text-slate-800">{rev.reviewer_name}</span>
                      <span>{new Date(rev.reviewed_at).toLocaleDateString()}</span>
                    </div>
                    <div className="text-slate-900 font-semibold">
                      SIF: {rev.reviewed_sif ? 'Confirmed' : 'Rejected'} • Severity: {rev.reviewed_risk}
                    </div>
                    {rev.review_comment && (
                      <div className="text-slate-600 italic font-medium">"{rev.review_comment}"</div>
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
