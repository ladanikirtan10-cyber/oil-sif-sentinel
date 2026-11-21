import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, CheckCircle2, ArrowRight, 
  Send, Layers, Zap, Mic, MicOff, Volume2, VolumeX
} from 'lucide-react';
import { api } from '../services/api';
import { AnalysisResult } from '../types';
import { RiskBadge, SifBadge } from '../components/ui/RiskBadge';
import { RiskMatrix5x5 } from '../components/ui/RiskMatrix5x5';
import { ExplainabilityPanel } from '../components/ui/ExplainabilityPanel';
import { VoiceWaveVisualizer } from '../components/ui/VoiceWaveVisualizer';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  voiceSpeaker, 
  createSpeechRecognizer, 
  generateAiVerdictSpeech, 
  SpeechRecognitionController 
} from '../utils/voiceAssistant';

interface NewReportPageProps {
  onSuccess: (reportId: number) => void;
  onViewReport: (reportId: number) => void;
}

export const NewReportPage: React.FC<NewReportPageProps> = ({ onSuccess, onViewReport }) => {
  const { t } = useLanguage();
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

  // Voice Assistance State
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingVerdict, setIsSpeakingVerdict] = useState(false);
  const recognizerRef = useRef<SpeechRecognitionController | null>(null);

  useEffect(() => {
    return () => {
      // Clean up any active speech or mic when leaving page
      voiceSpeaker.stop();
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const recognizer = createSpeechRecognizer({
      onStart: () => setIsListening(true),
      onResult: (transcript, isFinal) => {
        setRawDescription((prev) => {
          const trimmed = prev.trim();
          if (isFinal) {
            return trimmed ? `${trimmed} ${transcript}` : transcript;
          }
          return prev;
        });

        // Smart voice command: detect "run analysis"
        if (transcript.toLowerCase().includes('run analysis') || transcript.toLowerCase().includes('analyze')) {
          handleRunAiEvaluation();
        }
      },
      onError: (err) => {
        console.warn('Voice dictation error:', err);
        setIsListening(false);
        alert(err || 'Microphone error. Please check permissions.');
      },
      onEnd: () => setIsListening(false),
    });

    recognizerRef.current = recognizer;
    recognizer.start();
  };

  const toggleSpeakVerdict = () => {
    if (isSpeakingVerdict) {
      voiceSpeaker.stop();
      setIsSpeakingVerdict(false);
      return;
    }

    if (!analysisResult) return;

    const speechText = generateAiVerdictSpeech(analysisResult, { activity, site: siteName, equipment });
    setIsSpeakingVerdict(true);

    voiceSpeaker.speak(speechText, {
      onStart: () => setIsSpeakingVerdict(true),
      onEnd: () => setIsSpeakingVerdict(false),
      onError: () => setIsSpeakingVerdict(false),
    });
  };

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

  const loadConfinedSpace = () => {
    setReportType('Unsafe Act');
    setSiteName('Moran Drilling Field');
    setDepartmentName('Production');
    setLocation('Separator Train B');
    setActivity('Confined Space Entry');
    setEquipment('Pressure Vessel / Separator');
    setWorkerRole('Process Operator');
    setShift('Evening');
    setContractorInvolved(false);
    setRawDescription(
      'Technician entered secondary separator vessel without atmospheric gas testing and without confined space permit. Standby person was absent from manway.'
    );
  };

  const loadFallRisk = () => {
    setReportType('Unsafe Condition');
    setSiteName('Naharkatiya Gas Station');
    setDepartmentName('Maintenance');
    setLocation('Derrick Mast');
    setActivity('Maintenance');
    setEquipment('Scaffolding / Working Platform');
    setWorkerRole('Contract Worker');
    setShift('Morning');
    setContractorInvolved(true);
    setContractorName('Pioneer Industrial Scaffolders');
    setRawDescription(
      'Contractor scaffolding crew dismantled working platform at 8 meters elevation without wearing fall arrest harness and safety lifeline was unanchored.'
    );
  };

  const loadHotWork = () => {
    setReportType('Near Miss');
    setSiteName('KG Basin Offshore Terminal');
    setDepartmentName('Production');
    setLocation('Well Pad 14');
    setActivity('Hot Work');
    setEquipment('Piping & Manifold');
    setWorkerRole('Welder / Fabricator');
    setShift('Night');
    setContractorInvolved(true);
    setContractorName('Apex Oilfield Engineering');
    setRawDescription(
      'Hot work welding initiated on crude manifold line without gas testing. Hydrocarbon traces detected immediately after sparks were produced; work stopped.'
    );
  };

  const handleRunAiEvaluation = async () => {
    if (!rawDescription.trim()) {
      alert('Please enter an observation description to analyze.');
      return;
    }

    setAnalyzing(true);
    setAnalysisResult(null);

    // Multi-stage UI progress animation
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
      if (onSuccess) onSuccess(res.report_id);
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
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t('newReport.title', 'New Safety Observation & Interactive AI Studio')}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
              Voice Enabled
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {t('newReport.subtitle', 'Submit free-form text via keyboard or hands-free voice dictation to extract hazards, detect barrier failures, and classify SIF potential.')}
          </p>
        </div>

        <button
          type="button"
          onClick={loadSihBenchmark}
          className="px-3.5 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Load SIH Benchmark Scenario (Compressor LOTO)
        </button>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{notification}</span>
          </div>
          {createdReportId && (
            <button
              onClick={() => onViewReport(createdReportId)}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              Open Full Investigation &rarr;
            </button>
          )}
        </div>
      )}

      {/* 2-Column Split: Form on Left (6 cols), AI Studio on Right (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Pane: Report Form */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              {t('common.details', 'Report Specifications')}
            </h3>
            <span className="text-[10px] text-slate-400 font-mono font-semibold">OIL-HSE-FORM-26</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">{t('newReport.reportType', 'Report Category')}</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="Unsafe Act">Unsafe Act (UA)</option>
                  <option value="Unsafe Condition">Unsafe Condition (UC)</option>
                  <option value="Near Miss">Near Miss</option>
                  <option value="Incident">Incident</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">{t('newReport.assetField', 'Asset Field')}</label>
                <select
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
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
                <label className="block text-[11px] font-bold text-slate-700 mb-1">{t('newReport.activity', 'Activity')}</label>
                <select
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
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
                <label className="block text-[11px] font-bold text-slate-700 mb-1">{t('newReport.shift', 'Shift')}</label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="Morning">Morning (06:00 - 14:00)</option>
                  <option value="Evening">Evening (14:00 - 22:00)</option>
                  <option value="Night">Night (22:00 - 06:00)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">{t('newReport.location', 'Specific Location')}</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                  placeholder="e.g. Compressor Area 3"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">{t('newReport.equipment', 'Equipment Involved')}</label>
                <input
                  type="text"
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                  placeholder="e.g. Centrifugal Compressor"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">{t('newReport.workerRole', 'Reporter / Worker Role')}</label>
                <input
                  type="text"
                  value={workerRole}
                  onChange={(e) => setWorkerRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                  placeholder="e.g. Mechanical Technician"
                />
              </div>

              <div className="flex flex-col justify-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={contractorInvolved}
                    onChange={(e) => setContractorInvolved(e.target.checked)}
                    className="rounded bg-slate-100 border-slate-300 text-blue-600 focus:ring-0"
                  />
                  <span>{t('newReport.contractor', 'Contractor Personnel Involved')}</span>
                </label>
                {contractorInvolved && (
                  <input
                    type="text"
                    value={contractorName}
                    onChange={(e) => setContractorName(e.target.value)}
                    placeholder={t('newReport.contractorName', 'Contractor company name...')}
                    className="mt-2 w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                )}
              </div>
            </div>

            {/* Free-form Narrative with Voice Dictation & Quick Scenario Chips */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  {t('newReport.narrativeLabel', 'Free-Form Safety Narrative')} <span className="text-red-500">*</span>
                </label>
                
                <div className="flex items-center gap-2">
                  {/* Voice Dictate Button */}
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse border border-red-600'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                    title={isListening ? 'Stop Voice Dictation' : 'Click to Speak Observation'}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-amber-600" />}
                    <span>{isListening ? t('newReport.listening', 'Listening...') : t('newReport.voiceDictate', 'Voice Dictate')}</span>
                  </button>

                  <span className="text-[10px] text-slate-500 font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {rawDescription.length} chars
                  </span>
                </div>
              </div>

              {/* Live Audio Equalizer Waveform while Dictating */}
              {isListening && (
                <div className="mb-2.5">
                  <VoiceWaveVisualizer
                    mode="listening"
                    label={t('newReport.listening', 'Listening to field observation...')}
                    onStop={toggleListening}
                  />
                </div>
              )}

              {/* 4 Quick Realistic Safety Scenario Chips */}
              <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
                <span className="text-[10px] font-bold text-slate-500 uppercase mr-1">Quick Scenarios:</span>
                <button
                  type="button"
                  onClick={loadSihBenchmark}
                  className="px-2 py-1 rounded-md text-[10px] font-bold bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100 transition-all flex items-center gap-1 shadow-sm"
                >
                  <span>⚡ SIH Compressor LOTO</span>
                </button>
                <button
                  type="button"
                  onClick={loadConfinedSpace}
                  className="px-2 py-1 rounded-md text-[10px] font-bold bg-sky-50 border border-sky-300 text-sky-800 hover:bg-sky-100 transition-all flex items-center gap-1 shadow-sm"
                >
                  <span>🛢️ Vessel Confined Space</span>
                </button>
                <button
                  type="button"
                  onClick={loadFallRisk}
                  className="px-2 py-1 rounded-md text-[10px] font-bold bg-rose-50 border border-rose-300 text-rose-800 hover:bg-rose-100 transition-all flex items-center gap-1 shadow-sm"
                >
                  <span>🪜 Derrick Fall Risk</span>
                </button>
                <button
                  type="button"
                  onClick={loadHotWork}
                  className="px-2 py-1 rounded-md text-[10px] font-bold bg-orange-50 border border-orange-300 text-orange-800 hover:bg-orange-100 transition-all flex items-center gap-1 shadow-sm"
                >
                  <span>🔥 Manifold Hot Work</span>
                </button>
              </div>

              <textarea
                rows={5}
                value={rawDescription}
                onChange={(e) => setRawDescription(e.target.value)}
                placeholder={t('newReport.narrativePlaceholder', 'Enter or dictate field observation narrative (e.g. equipment state, missing barriers, worker positioning, energy isolation, confined space, or high-risk line of fire)...')}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-100 leading-relaxed font-sans shadow-inner transition-all font-medium"
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleRunAiEvaluation}
                disabled={analyzing || !rawDescription.trim()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 hover:text-blue-700 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
              >
                <Zap className="w-4 h-4 text-blue-600" />
                {analyzing ? t('newReport.evaluating', 'Evaluating...') : t('newReport.runEvaluation', 'Analyze with AI (Real-Time)')}
              </button>

              <button
                type="submit"
                disabled={submitting || !rawDescription.trim()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/25 disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-white" />
                {submitting ? t('common.loading', 'Saving...') : t('newReport.submitReport', 'Submit & Save Report')}
              </button>
            </div>
          </form>
        </div>

        {/* Right Pane: AI Inference Results Studio with Voice Briefing */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              {t('newReport.verdictTitle', 'AI Inference & Precursor Intelligence')}
            </h3>

            <div className="flex items-center gap-2">
              {analysisResult && (
                <button
                  type="button"
                  onClick={toggleSpeakVerdict}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                    isSpeakingVerdict
                      ? 'bg-blue-600 text-white animate-pulse'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                  }`}
                  title={isSpeakingVerdict ? 'Stop Audio Verdict' : 'Play Audio Verdict'}
                >
                  {isSpeakingVerdict ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isSpeakingVerdict ? t('reportDetail.stopBriefing', 'Speaking...') : t('newReport.listenVerdict', 'Listen to Verdict')}</span>
                </button>
              )}

              <span className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live NLP Pipeline
              </span>
            </div>
          </div>

          {/* Voice Speaking Visualizer */}
          {isSpeakingVerdict && (
            <VoiceWaveVisualizer
              mode="speaking"
              label="Executive Safety Verdict Spoken Briefing"
              onStop={toggleSpeakVerdict}
            />
          )}

          {analyzing ? (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-sm font-bold text-slate-900">{analysisStep}</div>
              <p className="text-xs text-slate-500 font-medium">Extracting safety ontologies and scoring precursor risk...</p>
            </div>
          ) : !analysisResult ? (
            <div className="py-10 px-4 text-center text-slate-500 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-100 via-sky-100 to-indigo-100 border border-amber-300 flex items-center justify-center shadow-md">
                  <Sparkles className="w-8 h-8 text-amber-600 animate-pulse" />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>

              <div>
                <div className="text-sm font-black text-slate-900 tracking-wider uppercase flex items-center justify-center gap-2">
                  <span>AI Neural Inference Core</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono font-bold">STANDBY</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed font-medium">
                  Select any quick scenario on the left or speak/write a custom observation, then click <strong className="text-amber-700">"Analyze with AI"</strong> to execute multi-stage NLP inference.
                </p>
              </div>

              {/* 3 AI Capabilities Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full mt-2 text-left">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
                  <div className="text-[10px] font-black text-amber-700 uppercase">1. SIF Precursor</div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">Calibrated ML</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-medium">97.2% Recall classifier trained on oilfield corpus</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
                  <div className="text-[10px] font-black text-blue-700 uppercase">2. Entity Ontologies</div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">11 Facet Spans</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-medium">Hazards, barrier failures & equipment extraction</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
                  <div className="text-[10px] font-black text-rose-700 uppercase">3. IOGP Rules</div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">9 Life-Saving Rules</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-medium">Energy Isolation, Line of Fire, Confined Space detection</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-[750px] pr-1">
              {/* SIF Potential Result Card */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                analysisResult.sif_prediction 
                  ? 'bg-red-50 border-red-300 shadow-sm'
                  : 'bg-emerald-50 border-emerald-300 shadow-sm'
              }`}>
                <div>
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
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
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Composite Risk Score
                  </div>
                  <div className="mt-1 flex items-center gap-2 justify-end">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      {analysisResult.risk_score}
                    </span>
                    <RiskBadge level={analysisResult.risk_level} size="md" />
                  </div>
                </div>
              </div>

              {/* Extracted Entities Grid */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 shadow-sm">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                  <span>Structured Safety Entities Extracted</span>
                  <span className="text-[10px] text-slate-500 font-mono font-bold">11 Ontologies</span>
                </h4>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Activity</span>
                    <div className="font-bold text-slate-900 mt-0.5">{analysisResult.entity_extraction?.activity || activity}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Equipment</span>
                    <div className="font-bold text-slate-900 mt-0.5">{analysisResult.entity_extraction?.equipment || equipment}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Identified Hazards</span>
                    <div className="font-bold text-amber-700 mt-0.5">
                      {analysisResult.entity_extraction?.hazards?.join(', ') || 'None identified'}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Barrier Failures</span>
                    <div className="font-bold text-red-700 mt-0.5">
                      {analysisResult.entity_extraction?.barrier_failures?.join(', ') || 'No barrier breach'}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Potential Consequences</span>
                    <div className="font-bold text-rose-700 mt-0.5">
                      {analysisResult.entity_extraction?.potential_consequences?.join(', ') || 'Low hazard'}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Worker Role</span>
                    <div className="font-bold text-slate-800 mt-0.5">{analysisResult.entity_extraction?.worker_role || workerRole}</div>
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
                <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Semantically Similar Historical Incidents
                  </h4>
                  <div className="space-y-1.5">
                    {analysisResult.similar_reports.map((s, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono font-bold text-blue-600">{s.report_uid}</span>
                          <span className="text-slate-500 text-[11px] ml-2 font-medium">{s.site_name} • {s.activity}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-amber-700">{s.similarity}% Match</span>
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
