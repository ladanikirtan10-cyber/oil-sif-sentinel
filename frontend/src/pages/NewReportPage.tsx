import React, { useState } from 'react';
import { 
  Sparkles, CheckCircle2, ShieldAlert, AlertTriangle, ArrowRight, 
  Send, RefreshCw, Layers, ShieldCheck, Zap, Info 
} from 'lucide-react';
import { api } from '../services/api';
import { AnalysisResult } from '../types';
import { RiskBadge, SifBadge } from '../components/ui/RiskBadge';
import { RiskMatrix5x5 } from '../components/ui/RiskMatrix5x5';
import { ExplainabilityPanel } from '../components/ui/ExplainabilityPanel';

interface NewReportPageProps {
  onSuccess: (reportId: number) => void;
  onViewReport: (reportId: number) => void;
}

export const NewReportPage: React.FC<NewReportPageProps> = ({ onSuccess, onViewReport }) => {
  const [reportType, setReportType] = useState('Unsafe Act');
  const [siteName, setSiteName] = useState('Duliajan Central Field');
  const [departmentName, setDepartmentName] = useState('Maintenance');
  const [location, setLocation] = useState('Compressor Area 3');
  const [activity, setActivity] = useState('Maintenance');
  const [equipment, setEquipment] = useState('Centrifugal Compressor');
  const [workerRole, setWorkerRole] = useState('Mechanical Technician');
  const [shift, setShift] = useState('Morning');
  const [contractorInvolved, setContractorInvolved] = useState(false);
  const [contractorName, setContractorName] = useState('');
  const [rawDescription, setRawDescription] = useState('');

  // AI Analysis State
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdReportId, setCreatedReportId] = useState<number | null>(null);
  const [createdUid, setCreatedUid] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const loadSihBenchmark = () => {
    setReportType('Unsafe Act');
    setSiteName('Duliajan Central Field');
    setDepartmentName('Maintenance');
    setLocation('Compressor Area 3');
    setActivity('Maintenance');
    setEquipment('Centrifugal Compressor');
    setWorkerRole('Mechanical Technician');
    setShift('Morning');
    setContractorInvolved(false);
    setRawDescription(
      'During maintenance activity, a technician entered the compressor area while equipment was energized. Lockout/tagout had not been completed and another employee was standing near the rotating coupling.'
    );
  };

  const handleRunAiEvaluation = async () => {
    if (!rawDescription.trim()) {
      alert('Please enter an observation description to analyze.');
      return;
    }

    setAnalyzing(true);
    setAnalysisResult(null);

    // Realistic multi-stage UI progress animation
    setAnalysisStep('Preprocessing free-form safety narrative...');
    await new Promise((r) => setTimeout(r, 200));
    setAnalysisStep('Extracting safety entities (Hazards, Barriers, Equipment)...');
    await new Promise((r) => setTimeout(r, 200));
    setAnalysisStep('Evaluating 9 Life-Saving Rules multi-label vectors...');
    await new Promise((r) => setTimeout(r, 200));
    setAnalysisStep('Computing SIF probability & multi-variable risk score...');

    try {
      const res = await api.evaluateText({
        raw_description: rawDescription,
        activity,
        location,
        equipment,
        worker_role: workerRole,
        contractor_involved: contractorInvolved,
      });
      setAnalysisResult(res);
    } catch (err) {
      console.error(err);
      alert('Failed to evaluate text with AI.');
    } finally {
      setAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawDescription.trim()) {
      alert('Please provide a description.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createReport({
        report_type: reportType,
        site_name: siteName,
        department_name: departmentName,
        location,
        activity,
        equipment,
        worker_role: workerRole,
        shift,
        contractor_involved: contractorInvolved,
        contractor_name: contractorInvolved ? contractorName : undefined,
        raw_description: rawDescription,
      });

      setCreatedReportId(res.report_id);
      setCreatedUid(res.report_uid);
      setAnalysisResult(res.analysis);
      setNotification(`Safety Report ${res.report_uid} saved successfully! Automated AI Analysis & Precursor Audit logged.`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            New Safety Observation & Interactive AI Studio
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Submit free-form text or run real-time NLP inference to extract hazards, detect barrier failures, and classify SIF potential.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSihBenchmark}
          className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Load SIH Benchmark Scenario (Compressor LOTO)
        </button>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-200 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{notification}</span>
          </div>
          {createdReportId && (
            <button
              onClick={() => onViewReport(createdReportId)}
              className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
            >
              Open Full Investigation &rarr;
            </button>
          )}
        </div>
      )}

      {/* 2-Column Split: Form on Left (6 cols), AI Studio on Right (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Pane: Report Form */}
        <div className="lg:col-span-6 bg-[#0C1222] p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              Report Specifications
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">OIL-HSE-FORM-26</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Report Category</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Unsafe Act">Unsafe Act (UA)</option>
                  <option value="Unsafe Condition">Unsafe Condition (UC)</option>
                  <option value="Near Miss">Near Miss</option>
                  <option value="Incident">Incident</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Asset Site</label>
                <select
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Duliajan Central Field">Duliajan Central Field</option>
                  <option value="Moran Drilling Field">Moran Drilling Field</option>
                  <option value="Digboi Production Area">Digboi Production Area</option>
                  <option value="Naharkatiya Gas Station">Naharkatiya Gas Station</option>
                  <option value="Jorhat Exploration Project">Jorhat Exploration Project</option>
                  <option value="Rajasthan Basin Project">Rajasthan Basin Project</option>
                  <option value="KG Basin Offshore Terminal">KG Basin Offshore Terminal</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Activity</label>
                <select
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Maintenance">Maintenance</option>
                  <option value="Drilling">Drilling</option>
                  <option value="Mechanical Lifting">Mechanical Lifting</option>
                  <option value="Hot Work">Hot Work / Welding</option>
                  <option value="Confined Space Entry">Confined Space Entry</option>
                  <option value="Electrical Work">Electrical Work</option>
                  <option value="Transportation">Transportation</option>
                  <option value="General Operations">General Operations</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Shift</label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Morning">Morning (06:00 - 14:00)</option>
                  <option value="Evening">Evening (14:00 - 22:00)</option>
                  <option value="Night">Night (22:00 - 06:00)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Specific Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  placeholder="e.g. Compressor Area 3"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Equipment Involved</label>
                <input
                  type="text"
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  placeholder="e.g. Centrifugal Compressor"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Reporter / Worker Role</label>
                <input
                  type="text"
                  value={workerRole}
                  onChange={(e) => setWorkerRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                  placeholder="e.g. Mechanical Technician"
                />
              </div>

              <div className="flex flex-col justify-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={contractorInvolved}
                    onChange={(e) => setContractorInvolved(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-sky-600 focus:ring-0"
                  />
                  <span>Contractor Personnel Involved</span>
                </label>
                {contractorInvolved && (
                  <input
                    type="text"
                    value={contractorName}
                    onChange={(e) => setContractorName(e.target.value)}
                    placeholder="Contractor company name..."
                    className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                )}
              </div>
            </div>

            {/* Free-form Narrative */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-200">
                  Free-Form Safety Observation Narrative <span className="text-red-400">*</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {rawDescription.length} characters
                </span>
              </div>
              <textarea
                rows={5}
                value={rawDescription}
                onChange={(e) => setRawDescription(e.target.value)}
                placeholder="Describe what occurred, unsafe conditions observed, equipment status, worker positioning, and barrier failures in natural language (English or Hinglish)..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 leading-relaxed font-sans"
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleRunAiEvaluation}
                disabled={analyzing || !rawDescription.trim()}
                className="flex-1 py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 border border-sky-500/40 text-sky-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Zap className="w-4 h-4 text-sky-400" />
                {analyzing ? 'Evaluating...' : 'Analyze with AI (Real-Time)'}
              </button>

              <button
                type="submit"
                disabled={submitting || !rawDescription.trim()}
                className="flex-1 py-2.5 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-950/30 disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-slate-950" />
                {submitting ? 'Saving...' : 'Submit & Save Report'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Pane: AI Inference Results Studio */}
        <div className="lg:col-span-6 bg-[#0C1222] p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              AI Inference & Precursor Intelligence
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live NLP Pipeline
            </span>
          </div>

          {analyzing ? (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-sm font-bold text-white">{analysisStep}</div>
              <p className="text-xs text-slate-400">Extracting safety ontologies and scoring precursor risk...</p>
            </div>
          ) : !analysisResult ? (
            <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <ShieldAlert className="w-10 h-10 text-slate-600 mb-1" />
              <div className="text-sm font-semibold text-slate-300">AI Inference Engine Ready</div>
              <p className="text-xs text-slate-500 max-w-sm">
                Enter an observation or click "Load SIH Benchmark Scenario", then click "Analyze with AI" to view real-time classification, entity tagging, and explainable rationale.
              </p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-[750px] pr-1">
              {/* SIF Potential Result Card */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                analysisResult.sif_prediction 
                  ? 'bg-red-950/40 border-red-500/60 shadow-lg shadow-red-950/30'
                  : 'bg-emerald-950/30 border-emerald-500/40'
              }`}>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Model Classification
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <SifBadge 
                      isSif={analysisResult.sif_prediction} 
                      probability={analysisResult.sif_probability} 
                      size="lg" 
                    />
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Composite Risk Score
                  </div>
                  <div className="mt-1 flex items-center gap-2 justify-end">
                    <span className="text-2xl font-black text-white font-mono">
                      {analysisResult.risk_score}
                    </span>
                    <RiskBadge level={analysisResult.risk_level} size="md" />
                  </div>
                </div>
              </div>

              {/* Extracted Entities Grid */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Structured Safety Entities Extracted</span>
                  <span className="text-[10px] text-slate-400 font-mono">11 Ontologies</span>
                </h4>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-[#0C1222] border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Activity</span>
                    <div className="font-bold text-white mt-0.5">{analysisResult.entity_extraction?.activity || activity}</div>
                  </div>
                  <div className="p-2 rounded bg-[#0C1222] border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Equipment</span>
                    <div className="font-bold text-white mt-0.5">{analysisResult.entity_extraction?.equipment || equipment}</div>
                  </div>
                  <div className="p-2 rounded bg-[#0C1222] border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Identified Hazards</span>
                    <div className="font-bold text-amber-300 mt-0.5">
                      {analysisResult.entity_extraction?.hazards?.join(', ') || 'None identified'}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-[#0C1222] border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Barrier Failures</span>
                    <div className="font-bold text-red-300 mt-0.5">
                      {analysisResult.entity_extraction?.barrier_failures?.join(', ') || 'No barrier breach'}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-[#0C1222] border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Potential Consequences</span>
                    <div className="font-bold text-rose-300 mt-0.5">
                      {analysisResult.entity_extraction?.potential_consequences?.join(', ') || 'Low hazard'}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-[#0C1222] border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Worker Role</span>
                    <div className="font-bold text-slate-200 mt-0.5">{analysisResult.entity_extraction?.worker_role || workerRole}</div>
                  </div>
                </div>
              </div>

              {/* Explainable AI Panel */}
              <ExplainabilityPanel
                explainability={analysisResult.explainability}
                entities={analysisResult.entity_extraction}
                rules={analysisResult.rule_signals}
                rawText={rawDescription}
              />

              {/* 5x5 Matrix Pin */}
              <RiskMatrix5x5
                selectedLikelihood={analysisResult.likelihood_score}
                selectedSeverity={analysisResult.severity_score}
              />

              {/* Similar Reports */}
              {analysisResult.similar_reports && analysisResult.similar_reports.length > 0 && (
                <div className="p-4 rounded-xl bg-[#0C1222] border border-slate-800">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Semantically Similar Historical Incidents
                  </h4>
                  <div className="space-y-1.5">
                    {analysisResult.similar_reports.map((s, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono font-bold text-sky-400">{s.report_uid}</span>
                          <span className="text-slate-400 text-[11px] ml-2">{s.site_name} • {s.activity}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-amber-400">{s.similarity}% Match</span>
                          <RiskBadge level={s.risk_score >= 76 ? 'CRITICAL' : s.risk_score >= 56 ? 'HIGH' : 'MODERATE'} size="sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
