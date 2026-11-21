// Voice Assistant Utility for OIL SIF SENTINEL
// Supports Web Speech API: SpeechSynthesis (TTS) & SpeechRecognition (STT)

export interface SpeechRecognitionController {
  start: () => void;
  stop: () => void;
  isSupported: boolean;
}

// Clean markdown and technical syntax for natural executive audio readout
export function cleanTextForSpeech(text: string): string {
  if (!text) return '';
  return text
    .replace(/[#*_~`]/g, '') // remove markdown symbols
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // link text only
    .replace(/https?:\/\/\S+/g, '') // strip URLs
    .replace(/(\r\n|\n|\r)/gm, '. ') // replace newlines with period pauses
    .replace(/\s+/g, ' ') // collapse multiple spaces
    .replace(/\.{2,}/g, '.') // collapse multiple periods
    .trim();
}

// Text-to-Speech (TTS)
class VoiceSpeaker {
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public isSpeaking(): boolean {
    return this.isSupported() && window.speechSynthesis.speaking;
  }

  public stop(): void {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  public speak(
    text: string,
    callbacks?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (e: any) => void;
    }
  ): void {
    if (!this.isSupported()) {
      console.warn('Speech synthesis is not supported in this browser environment.');
      if (callbacks?.onError) callbacks.onError(new Error('Speech synthesis unsupported'));
      return;
    }

    this.stop(); // stop any prior speech

    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) return;

    const utterance = new SpeechSynthesisUtterance(cleaned);
    this.currentUtterance = utterance;

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-IN'; // Indian English standard for Oil India PSU

    // Attempt to pick an optimal English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => (v.lang === 'en-IN' || v.lang === 'en-GB' || v.lang === 'en-US') && !v.name.includes('Google')
    ) || voices.find((v) => v.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      if (callbacks?.onStart) callbacks.onStart();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (callbacks?.onEnd) callbacks.onEnd();
    };

    utterance.onerror = (err) => {
      this.currentUtterance = null;
      if (callbacks?.onError) callbacks.onError(err);
    };

    window.speechSynthesis.speak(utterance);
  }
}

export const voiceSpeaker = new VoiceSpeaker();

// Speech-to-Text (STT) Factory
export function createSpeechRecognizer(callbacks: {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
  onStart?: () => void;
  lang?: string;
}): SpeechRecognitionController {
  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  if (!isSupported) {
    return {
      start: () => {
        if (callbacks.onError) callbacks.onError('Microphone speech recognition is not supported in this browser.');
      },
      stop: () => {},
      isSupported: false,
    };
  }

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = callbacks.lang || 'en-IN'; // Indian English

  recognition.onstart = () => {
    if (callbacks.onStart) callbacks.onStart();
  };

  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    const currentText = finalTranscript || interimTranscript;
    if (currentText) {
      callbacks.onResult(currentText.trim(), !!finalTranscript);
    }
  };

  recognition.onerror = (event: any) => {
    console.warn('Speech recognition event error:', event.error);
    if (callbacks.onError) {
      callbacks.onError(event.error === 'not-allowed' ? 'Microphone permission denied.' : event.error);
    }
  };

  recognition.onend = () => {
    if (callbacks.onEnd) callbacks.onEnd();
  };

  return {
    start: () => {
      try {
        recognition.start();
      } catch (err) {
        // Recognition might already be running
        console.warn('Speech recognition start note:', err);
      }
    },
    stop: () => {
      try {
        recognition.stop();
      } catch (err) {
        console.warn('Speech recognition stop note:', err);
      }
    },
    isSupported: true,
  };
}

// Generate an executive audio briefing for AI Evaluation results
export function generateAiVerdictSpeech(
  analysis: any,
  meta?: { activity?: string; site?: string; equipment?: string }
): string {
  if (!analysis) return 'No safety evaluation results available.';

  const isSif = analysis.sif_prediction;
  const prob = Math.round((analysis.sif_probability || 0) * 100);
  const score = analysis.risk_score || 0;
  const level = analysis.risk_level || 'MODERATE';
  const hazards = analysis.entity_extraction?.hazards?.join(', ') || 'unspecified operational hazards';
  const barriers = analysis.entity_extraction?.barrier_failures?.join(', ') || 'barrier integrity alert';
  const rules = analysis.rule_signals?.map((r: any) => r.rule_name).join(', ');

  let briefing = `Attention HSE Command. Oil India AI Safety Evaluation complete. `;
  if (isSif) {
    briefing += `Classification Alert: High Potential SIF Precursor detected, with ${prob} percent statistical association. `;
    briefing += `Composite risk score is ${score}, categorised as ${level} severity. `;
    briefing += `Primary hazard drivers include: ${hazards}. Critical barrier breakdown identified: ${barriers}. `;
    if (rules) {
      briefing += `Breached Life-Saving Rules include: ${rules}. Immediate energy isolation verification and job safety stand-down recommended.`;
    }
  } else {
    briefing += `Classification: Evaluated as Non-SIF potential event, with ${prob} percent probability. `;
    briefing += `Composite risk score is ${score}, classified under ${level} operational risk tier. Routine supervisory close-out is advised.`;
  }

  return briefing;
}

// Generate an executive audio briefing for a Safety Report
export function generateReportAudioBriefing(report: any): string {
  if (!report) return 'Incident report file unavailable.';

  const isSif = report.sif_potential;
  const prob = Math.round((report.sif_probability || 0) * 100);
  const level = report.severity || 'MODERATE';

  let text = `Official Safety Report Briefing for ${report.report_uid}. `;
  text += `Recorded at ${report.site_name}, specific location: ${report.location}. `;
  text += `Activity: ${report.activity}, involving equipment: ${report.equipment}. `;
  text += `Observation Category: ${report.report_type}, observed by ${report.worker_role} during ${report.shift} shift. `;

  if (isSif) {
    text += `Alert Status: Classified as SIF Precursor with ${prob} percent confidence. Risk Level: ${level}. `;
  } else {
    text += `Alert Status: Evaluated as standard non-SIF observation. Risk Level: ${level}. `;
  }

  text += `Original observation summary: ${report.raw_description}. `;

  if (report.analysis?.entity_extraction?.barrier_failures?.length > 0) {
    text += `Key barrier failure flagged: ${report.analysis.entity_extraction.barrier_failures.join(', ')}. `;
  }

  return text;
}
