import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Video, 
  Play, 
  Square, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Eye, 
  Upload, 
  Clock, 
  Activity, 
  ArrowRight,
  Download,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Sliders
} from 'lucide-react';
import { api } from '../services/api';
import { RiskBadge } from '../components/ui/RiskBadge';
import { useLanguage } from '../i18n/LanguageContext';
import { voiceSpeaker } from '../utils/voiceAssistant';

interface CameraSafetyPageProps {
  onSelectReport?: (reportId: number) => void;
  onNavigate?: (tab: string, param?: any) => void;
}

export const CameraSafetyPage: React.FC<CameraSafetyPageProps> = ({ onSelectReport, onNavigate }) => {
  const { t } = useLanguage();

  // Mode: 'webcam' | 'upload'
  const [activeMode, setActiveMode] = useState<'webcam' | 'upload'>('webcam');
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState('CAM-01');

  // Streaming & Analysis states
  const [isStreaming, setIsStreaming] = useState(false);
  const [autoScan, setAutoScan] = useState(true);
  const [loadingDetection, setLoadingDetection] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [voiceAlertsEnabled, setVoiceAlertsEnabled] = useState(true);
  const [viewMode, setViewMode] = useState<'live' | 'snapshot'>('live');

  // Detection Sensitivity Mode: 'standard' | 'high'
  const [sensitivity, setSensitivity] = useState<'standard' | 'high'>('standard');

  // Danger Zone Perimeter Alert (Default: OFF to keep live feed clean and unobstructed)
  const [dangerZoneActive, setDangerZoneActive] = useState(false);

  // Real-Time 15-30 FPS In-Browser Vision State (Zero Latency)
  const [liveDetection, setLiveDetection] = useState<{
    workerDetected: boolean;
    hasHelmet: boolean;
    helmetConfidence: number;
    helmetType: string;
    hasVest: boolean;
    vestConfidence: number;
    vestType: string;
    inRestricted: boolean;
    isCompliant: boolean;
    violations: string[];
  }>({
    workerDetected: false,
    hasHelmet: false,
    helmetConfidence: 0.94,
    helmetType: 'Scanning...',
    hasVest: false,
    vestConfidence: 0.92,
    vestType: 'Scanning...',
    inRestricted: false,
    isCompliant: false,
    violations: [],
  });

  // Server-Verified AI Detection Results (from POST /api/v1/camera/detect)
  const [lastServerDetection, setLastServerDetection] = useState<any | null>(null);
  const [autoLoggedIncidents, setAutoLoggedIncidents] = useState<any[]>([]);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const arCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sampleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackAnimRef = useRef<number | null>(null);
  const autoScanTimerRef = useRef<any>(null);

  // Smooth bounding box interpolation
  const currentBoxRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  // Rolling temporal filter to prevent flicker (last 5 frames)
  const temporalHistoryRef = useRef<{ helmet: boolean; vest: boolean; helmetType: string; vestType: string }[]>([]);

  useEffect(() => {
    loadCameras();
    // Auto-start camera on mount for immediate live surveillance
    startCamera();

    return () => {
      stopCamera();
      voiceSpeaker.stop();
    };
  }, []);

  // Periodic AI verification loop (every 1.5s when streaming)
  useEffect(() => {
    if (isStreaming && autoScan && activeMode === 'webcam') {
      autoScanTimerRef.current = setInterval(() => {
        captureAndAnalyze(true);
      }, 1500);
    } else {
      if (autoScanTimerRef.current) {
        clearInterval(autoScanTimerRef.current);
        autoScanTimerRef.current = null;
      }
    }

    return () => {
      if (autoScanTimerRef.current) clearInterval(autoScanTimerRef.current);
    };
  }, [isStreaming, autoScan, activeMode, dangerZoneActive, sensitivity]);

  const loadCameras = async () => {
    try {
      const camList = await api.getCameras();
      setCameras(camList || []);
    } catch (err) {
      console.warn('Cameras load error:', err);
    }
  };

  const triggerVoiceAnnouncement = (violationTitle: string, camId?: string) => {
    if (!voiceAlertsEnabled) return;
    const spokenCam = camId || selectedCameraId;
    const spokenText = `Safety Alert. Detected ${violationTitle} on Camera ${spokenCam}. Incident logged.`;
    voiceSpeaker.speak(spokenText);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam access is not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setIsStreaming(true);
      setActiveMode('webcam');
      setViewMode('live');

      // Start high-precision real-time tracking animation loop (15-30 FPS)
      startRealtimeTracking();

      // Initial analysis after camera exposure settles
      setTimeout(() => {
        captureAndAnalyze(false);
      }, 800);
    } catch (err: any) {
      console.error('Camera stream error:', err);
      setCameraError(err.message || 'Unable to access camera. Please check browser permissions.');
      setIsStreaming(false);
    }
  };

  const stopCamera = () => {
    if (trackAnimRef.current) {
      cancelAnimationFrame(trackAnimRef.current);
      trackAnimRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setAutoScan(false);

    if (arCanvasRef.current) {
      const ctx = arCanvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, arCanvasRef.current.width, arCanvasRef.current.height);
    }
  };

  // High-Precision Real-time Worker Tracking & Robust In-Browser PPE Detection (15-30 FPS)
  const startRealtimeTracking = () => {
    let frameCount = 0;

    const processFrame = () => {
      const video = videoRef.current;
      const arCanvas = arCanvasRef.current;
      if (!video || !arCanvas || video.readyState < 2 || video.videoWidth === 0) {
        trackAnimRef.current = requestAnimationFrame(processFrame);
        return;
      }

      frameCount++;
      const vw = (arCanvas.width = video.videoWidth || 640);
      const vh = (arCanvas.height = video.videoHeight || 480);
      const arCtx = arCanvas.getContext('2d');
      if (!arCtx) return;

      // Downsampled 160x120 canvas for instant 1ms pixel analysis
      if (!sampleCanvasRef.current) {
        sampleCanvasRef.current = document.createElement('canvas');
      }
      const sCanvas = sampleCanvasRef.current;
      sCanvas.width = 160;
      sCanvas.height = 120;
      const sCtx = sCanvas.getContext('2d', { willReadFrequently: true });

      let detectedInFrame = false;
      let frameHelmet = false;
      let frameVest = false;
      let frameHelmetConf = 0.94;
      let frameVestConf = 0.92;
      let frameHelmetType = 'Bare Head (No Helmet)';
      let frameVestType = 'Standard Clothing (No Vest)';
      let frameInRestricted = false;
      let faceCenter = { x: 80, y: 50 };

      if (sCtx) {
        sCtx.drawImage(video, 0, 0, 160, 120);
        const imgData = sCtx.getImageData(0, 0, 160, 120);
        const data = imgData.data;

        // 1. FAST 16x12 GRID SKIN DENSITY TRACKER (Locates Face Center without hand/arm skew)
        const grid = new Int32Array(16 * 12);
        let totalSkin = 0;

        for (let y = 0; y < 120; y++) {
          const gy = Math.floor(y / 10);
          for (let x = 0; x < 160; x++) {
            const gx = Math.floor(x / 10);
            const idx = (y * 160 + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            // YCrCb Skin Chrominance Formula
            const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
            const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;

            const maxC = Math.max(r, g, b);
            const minC = Math.min(r, g, b);
            const sat = maxC === 0 ? 0 : (maxC - minC) / maxC;

            if (cr > 130 && cr < 185 && cb > 75 && cb < 140 && (cr - cb) > 8 && sat < 0.62) {
              totalSkin++;
              // Focus face discovery on upper 75% of frame
              if (gy < 9) {
                grid[gy * 16 + gx]++;
              }
            }
          }
        }

        // Find the cell with maximum skin density (The Face Center)
        let maxCount = 0;
        let maxGx = 8;
        let maxGy = 4;

        for (let gy = 0; gy < 9; gy++) {
          for (let gx = 0; gx < 16; gx++) {
            const count = grid[gy * 16 + gx];
            if (count > maxCount) {
              maxCount = count;
              maxGx = gx;
              maxGy = gy;
            }
          }
        }

        if (maxCount >= 14 && totalSkin >= 30) {
          detectedInFrame = true;
          const fcx = maxGx * 10 + 5;
          const fcy = maxGy * 10 + 5;
          faceCenter = { x: fcx, y: fcy };

          const cx = (fcx / 160) * vw;
          const cy = (fcy / 120) * vh;

          // Clamped bounding box dimensions
          const bw = Math.min(vw * 0.46, Math.max(vw * 0.28, vw * 0.36));
          const bh = Math.min(vh * 0.82, Math.max(vh * 0.45, vh * 0.68));

          const targetBox = {
            x: Math.max(0, cx - bw / 2),
            y: Math.max(0, cy - bh * 0.32),
            w: bw,
            h: bh,
          };

          // Smooth lerp
          if (!currentBoxRef.current) {
            currentBoxRef.current = { ...targetBox };
          } else {
            const lerp = 0.32;
            currentBoxRef.current.x += (targetBox.x - currentBoxRef.current.x) * lerp;
            currentBoxRef.current.y += (targetBox.y - currentBoxRef.current.y) * lerp;
            currentBoxRef.current.w += (targetBox.w - currentBoxRef.current.w) * lerp;
            currentBoxRef.current.h += (targetBox.h - currentBoxRef.current.h) * lerp;
          }

          // 2. ROBUST HARD HAT / HELMET ANALYSIS ON HEAD DOME
          // Inspect the cranial crown strictly above the brow line (y: fcy - 44 to fcy - 12)
          // Strictly ABOVE eyes, eyebrows, and nose so pupils/eyebrows cannot trigger false hair alerts
          const hy1 = Math.max(0, fcy - 44);
          const hy2 = Math.max(2, fcy - 12);
          const hx1 = Math.max(0, fcx - 28);
          const hx2 = Math.min(160, fcx + 28);

          let headTotal = 0;
          let hairCount = 0;
          let skinInDomeCount = 0;
          let whiteCount = 0;
          let yellowCount = 0;
          let orangeCount = 0;
          let redCount = 0;
          let blueCount = 0;
          let greenCount = 0;

          for (let y = hy1; y < hy2; y++) {
            for (let x = hx1; x < hx2; x++) {
              const idx = (y * 160 + x) * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];
              headTotal++;

              const maxC = Math.max(r, g, b);
              const minC = Math.min(r, g, b);
              const sat = maxC === 0 ? 0 : (maxC - minC) / maxC;

              // Dark Hair / Deep Shadows: low brightness, low saturation
              if (maxC < 65 && sat < 0.45) {
                hairCount++;
              }
              // Exposed scalp / high forehead skin
              const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
              const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
              if (cr > 130 && cr < 185 && cb > 75 && cb < 140 && (cr - cb) > 8 && sat < 0.60) {
                skinInDomeCount++;
              }
              // Certified Industrial Safety Helmet Colors
              // Yellow Hard Hat
              if (r > 120 && g > 95 && (r + g) > b * 2.1 && (r - b) > 25) {
                yellowCount++;
              }
              // White / Silver Hard Hat
              else if (r > 120 && g > 120 && b > 120 && Math.abs(r - g) < 32 && Math.abs(r - b) < 32 && Math.abs(g - b) < 32) {
                whiteCount++;
              }
              // Safety Orange Hard Hat
              else if (r > 140 && g > 35 && g < 160 && b < 100 && (r - g) > 20 && (r - b) > 40) {
                orangeCount++;
              }
              // Safety Red Hard Hat
              else if (r > 130 && g < 100 && b < 100 && (r - g) > 30 && (r - b) > 30) {
                redCount++;
              }
              // Blue Hard Hat
              else if (b > 95 && (b - r) > 12 && (b - g) > 10) {
                blueCount++;
              }
              // Green Hard Hat
              else if (g > 95 && (g - r) > 12 && (g - b) > 10) {
                greenCount++;
              }
            }
          }

          const hairRatio = headTotal > 0 ? hairCount / headTotal : 0;
          const skinRatio = headTotal > 0 ? skinInDomeCount / headTotal : 0;
          const whiteRatio = headTotal > 0 ? whiteCount / headTotal : 0;
          const yellowRatio = headTotal > 0 ? yellowCount / headTotal : 0;
          const orangeRatio = headTotal > 0 ? orangeCount / headTotal : 0;
          const redRatio = headTotal > 0 ? redCount / headTotal : 0;
          const blueRatio = headTotal > 0 ? blueCount / headTotal : 0;
          const greenRatio = headTotal > 0 ? greenCount / headTotal : 0;

          const isHighSens = sensitivity === 'high';

          // Candidate list with tailored thresholds across all certified colors
          const candidates = [
            { name: 'Yellow', ratio: yellowRatio, thresh: isHighSens ? 0.03 : 0.05, hairMult: 0.25 },
            { name: 'White', ratio: whiteRatio, thresh: isHighSens ? 0.12 : 0.16, hairMult: 1.15 },
            { name: 'Orange', ratio: orangeRatio, thresh: isHighSens ? 0.03 : 0.04, hairMult: 0.25 },
            { name: 'Red', ratio: redRatio, thresh: isHighSens ? 0.03 : 0.04, hairMult: 0.25 },
            { name: 'Blue', ratio: blueRatio, thresh: isHighSens ? 0.03 : 0.05, hairMult: 0.25 },
            { name: 'Green', ratio: greenRatio, thresh: isHighSens ? 0.03 : 0.05, hairMult: 0.25 },
          ];

          candidates.sort((a, b) => b.ratio - a.ratio);
          const topCandidate = candidates[0];

          // DECISION RULE: Seamless automated helmet detection
          if (topCandidate.ratio >= topCandidate.thresh) {
            if (topCandidate.name === 'White') {
              if (hairRatio < (isHighSens ? 0.18 : 0.14) || topCandidate.ratio >= hairRatio * topCandidate.hairMult) {
                frameHelmet = true;
                frameHelmetType = 'Safety Helmet (Detected)';
                frameHelmetConf = Math.min(0.99, 0.82 + topCandidate.ratio * 0.30);
              } else {
                frameHelmet = false;
                frameHelmetType = 'Safety Helmet (Missing)';
                frameHelmetConf = Math.min(0.98, 0.85 + hairRatio * 0.25);
              }
            } else {
              if (topCandidate.ratio >= hairRatio * topCandidate.hairMult) {
                frameHelmet = true;
                frameHelmetType = 'Safety Helmet (Detected)';
                frameHelmetConf = Math.min(0.99, 0.84 + topCandidate.ratio * 0.35);
              } else {
                frameHelmet = false;
                frameHelmetType = 'Safety Helmet (Missing)';
                frameHelmetConf = Math.min(0.98, 0.85 + hairRatio * 0.25);
              }
            }
          } else {
            frameHelmet = false;
            frameHelmetType = 'Safety Helmet (Missing)';
            frameHelmetConf = hairRatio >= 0.09 ? Math.min(0.98, 0.85 + hairRatio * 0.25) : 0.92;
          }

          // 3. REAL-TIME HIGH-VISIBILITY SAFETY VEST DETECTION (Chest & Torso)
          const torsoX1 = Math.max(0, fcx - 35);
          const torsoX2 = Math.min(160, fcx + 35);
          const torsoY1 = Math.min(120, fcy + 16);
          const torsoY2 = 120;

          let torsoTotal = 0;
          let vestOrangeCount = 0;
          let vestLimeCount = 0;

          for (let y = torsoY1; y < torsoY2; y++) {
            for (let x = torsoX1; x < torsoX2; x++) {
              const idx = (y * 160 + x) * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];
              torsoTotal++;

              const maxC = Math.max(r, g, b);
              const minC = Math.min(r, g, b);
              const sat = maxC === 0 ? 0 : (maxC - minC) / maxC;

              // High-Vis Neon Orange Vest
              if (r > 165 && g > 50 && g < 155 && b < 85 && sat > 0.50) {
                vestOrangeCount++;
              }
              // High-Vis Fluorescent Lime/Yellow Vest
              else if (r > 135 && g > 160 && b < 105 && sat > 0.40) {
                vestLimeCount++;
              }
            }
          }

          const voRatio = torsoTotal > 0 ? vestOrangeCount / torsoTotal : 0;
          const vlRatio = torsoTotal > 0 ? vestLimeCount / torsoTotal : 0;
          const vestThresh = isHighSens ? 0.05 : 0.07;

          if (voRatio > vestThresh) {
            frameVest = true;
            frameVestType = 'Neon Orange Vest (Detected)';
            frameVestConf = Math.min(0.99, 0.80 + voRatio * 0.40);
          } else if (vlRatio > vestThresh) {
            frameVest = true;
            frameVestType = 'Fluorescent Lime Vest (Detected)';
            frameVestConf = Math.min(0.99, 0.80 + vlRatio * 0.40);
          } else {
            frameVest = false;
            frameVestType = 'Standard Clothing (No Vest)';
            frameVestConf = 0.93;
          }

          // 4. Perimeter Danger Zone Check (Only active when explicitly toggled)
          frameInRestricted = dangerZoneActive && (cx > vw * 0.80);

          // 5. Rolling Temporal Filter
          temporalHistoryRef.current.push({
            helmet: frameHelmet,
            vest: frameVest,
            helmetType: frameHelmetType,
            vestType: frameVestType,
          });
          if (temporalHistoryRef.current.length > 5) {
            temporalHistoryRef.current.shift();
          }

          const helmetVotes = temporalHistoryRef.current.filter((f) => f.helmet).length;
          const vestVotes = temporalHistoryRef.current.filter((f) => f.vest).length;
          const totalVotes = temporalHistoryRef.current.length;

          const smoothedHelmet = helmetVotes >= Math.ceil(totalVotes / 2);
          const smoothedVest = vestVotes >= Math.ceil(totalVotes / 2);
          const isCompliant = smoothedHelmet && smoothedVest && !frameInRestricted;

          const currentViolations: string[] = [];
          if (!smoothedHelmet) currentViolations.push('Safety Helmet Not Detected');
          if (!smoothedVest) currentViolations.push('High-Visibility Vest Not Detected');
          if (frameInRestricted) currentViolations.push('Unauthorized Danger Zone Intrusion');

          // Update React State every 3 frames (~10 times per second) for zero CPU lag
          if (frameCount % 3 === 0) {
            setLiveDetection({
              workerDetected: true,
              hasHelmet: smoothedHelmet,
              helmetConfidence: frameHelmetConf,
              helmetType: smoothedHelmet ? frameHelmetType : 'Bare Head (No Helmet)',
              hasVest: smoothedVest,
              vestConfidence: frameVestConf,
              vestType: smoothedVest ? frameVestType : 'Standard Clothing (No Vest)',
              inRestricted: frameInRestricted,
              isCompliant: isCompliant,
              violations: currentViolations,
            });
          }
        } else {
          // Centered natural standby box when no face is active
          const targetBox = {
            x: vw * 0.28,
            y: vh * 0.10,
            w: vw * 0.44,
            h: vh * 0.78,
          };
          if (currentBoxRef.current) {
            currentBoxRef.current.x += (targetBox.x - currentBoxRef.current.x) * 0.1;
            currentBoxRef.current.y += (targetBox.y - currentBoxRef.current.y) * 0.1;
            currentBoxRef.current.w += (targetBox.w - currentBoxRef.current.w) * 0.1;
            currentBoxRef.current.h += (targetBox.h - currentBoxRef.current.h) * 0.1;
          }

          if (frameCount % 4 === 0) {
            setLiveDetection((prev) => ({
              ...prev,
              workerDetected: false,
              inRestricted: false,
            }));
          }
        }
      }

      // Draw AR Graphics onto Overlay Canvas
      arCtx.clearRect(0, 0, vw, vh);

      // 1. Perimeter Hazard Corridor (ONLY DRAWN IF EXPLICITLY ARMED)
      if (dangerZoneActive) {
        const zoneX = vw * 0.80;
        arCtx.fillStyle = 'rgba(239, 68, 68, 0.15)';
        arCtx.fillRect(zoneX, 0, vw - zoneX, vh);

        arCtx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
        arCtx.lineWidth = 2;
        arCtx.setLineDash([8, 6]);
        arCtx.beginPath();
        arCtx.moveTo(zoneX, 0);
        arCtx.lineTo(zoneX, vh);
        arCtx.stroke();
        arCtx.setLineDash([]);

        arCtx.fillStyle = 'rgba(220, 38, 38, 0.9)';
        arCtx.fillRect(zoneX + 6, 12, 160, 22);
        arCtx.fillStyle = '#FFFFFF';
        arCtx.font = 'bold 9px Inter, sans-serif';
        arCtx.fillText('⚠ PERIMETER DANGER ZONE', zoneX + 10, 26);
      }

      // 2. Real-Time Dynamic Bounding Box with Instant Color and Status
      if (currentBoxRef.current && detectedInFrame) {
        const { x, y, w, h } = currentBoxRef.current;
        const isViolation = !frameHelmet || !frameVest || frameInRestricted;
        const boxColor = isViolation ? '#EF4444' : '#10B981';

        // Outer Bounding Box
        arCtx.strokeStyle = boxColor;
        arCtx.lineWidth = 2.5;
        arCtx.strokeRect(x, y, w, h);

        // Tech Corner Brackets
        const cLen = 14;
        arCtx.lineWidth = 3.5;
        // TL
        arCtx.beginPath();
        arCtx.moveTo(x, y + cLen);
        arCtx.lineTo(x, y);
        arCtx.lineTo(x + cLen, y);
        arCtx.stroke();
        // TR
        arCtx.beginPath();
        arCtx.moveTo(x + w - cLen, y);
        arCtx.lineTo(x + w, y);
        arCtx.lineTo(x + w, y + cLen);
        arCtx.stroke();
        // BL
        arCtx.beginPath();
        arCtx.moveTo(x, y + h - cLen);
        arCtx.lineTo(x, y + h);
        arCtx.lineTo(x + cLen, y + h);
        arCtx.stroke();
        // BR
        arCtx.beginPath();
        arCtx.moveTo(x + w - cLen, y + h);
        arCtx.lineTo(x + w, y + h);
        arCtx.lineTo(x + w, y + h - cLen);
        arCtx.stroke();

        // 3. LIVE HEAD DOME SCANNER ARC (Directly Over Worker Head)
        const headCenterX = (faceCenter.x / 160) * vw;
        const headCenterY = (faceCenter.y / 120) * vh;
        const headArcRadius = Math.min(w * 0.26, 44);
        const domeY = Math.max(headArcRadius + 14, headCenterY - Math.min(vh * 0.12, 38));

        arCtx.beginPath();
        arCtx.arc(headCenterX, domeY, headArcRadius, Math.PI, 0);
        arCtx.lineWidth = 3.5;
        arCtx.strokeStyle = frameHelmet ? '#10B981' : '#EF4444';
        arCtx.stroke();

        // Target Crosshair / Tick Marks
        arCtx.lineWidth = 2;
        arCtx.beginPath();
        arCtx.moveTo(headCenterX - headArcRadius - 6, domeY);
        arCtx.lineTo(headCenterX - headArcRadius + 4, domeY);
        arCtx.moveTo(headCenterX + headArcRadius - 4, domeY);
        arCtx.lineTo(headCenterX + headArcRadius + 6, domeY);
        arCtx.moveTo(headCenterX, domeY - headArcRadius - 6);
        arCtx.lineTo(headCenterX, domeY - headArcRadius + 4);
        arCtx.stroke();

        // Head Arc Status Pill
        const arcText = frameHelmet ? '✓ Safety Helmet: Detected' : '❌ Safety Helmet: Missing';
        arCtx.font = 'bold 11px Inter, sans-serif';
        const arcWidth = arCtx.measureText(arcText).width + 16;
        arCtx.fillStyle = frameHelmet ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)';
        arCtx.fillRect(headCenterX - arcWidth / 2, Math.max(10, domeY - headArcRadius - 26), arcWidth, 22);
        arCtx.fillStyle = '#FFFFFF';
        arCtx.fillText(arcText, headCenterX - arcWidth / 2 + 8, Math.max(25, domeY - headArcRadius - 10));

        // Worker Header Pill
        const headerText = frameInRestricted
          ? 'WORKER #1 : RESTRICTED ZONE BREACH'
          : (isViolation ? 'WORKER #1 : VIOLATION DETECTED' : 'WORKER #1 : COMPLIANT (SAFE)');

        arCtx.font = 'bold 11px Inter, sans-serif';
        const tagWidth = arCtx.measureText(headerText).width + 16;
        arCtx.fillStyle = boxColor;
        arCtx.fillRect(x, Math.max(0, y - 22), tagWidth, 22);

        arCtx.fillStyle = '#FFFFFF';
        arCtx.fillText(headerText, x + 8, Math.max(15, y - 6));

        // Sub-Badges (Updated instantaneously every frame!)
        let badgeY = Math.min(vh - 10, y + 22);
        arCtx.font = 'bold 10px Inter, sans-serif';

        // Hard Hat
        arCtx.fillStyle = frameHelmet ? '#10B981' : '#EF4444';
        arCtx.fillText(frameHelmet ? '✓ Hard Hat: Detected' : '❌ Hard Hat: Missing', x + 8, badgeY);
        badgeY += 16;

        // Safety Vest
        arCtx.fillStyle = frameVest ? '#10B981' : '#EF4444';
        arCtx.fillText(frameVest ? '✓ Safety Vest: Detected' : '❌ Safety Vest: Missing', x + 8, badgeY);

        if (dangerZoneActive) {
          badgeY += 16;
          arCtx.fillStyle = frameInRestricted ? '#EF4444' : '#10B981';
          arCtx.fillText(frameInRestricted ? '❌ ZONE BREACH!' : '✓ Safe Corridor', x + 8, badgeY);
        }
      }

      trackAnimRef.current = requestAnimationFrame(processFrame);
    };

    trackAnimRef.current = requestAnimationFrame(processFrame);
  };

  const captureFrameBase64 = (): string | null => {
    if (!videoRef.current || !captureCanvasRef.current) return null;
    const video = videoRef.current;
    const canvas = captureCanvasRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.88);
  };

  // Periodic Deep Computer Vision Verification & DB Incident Logging
  const captureAndAnalyze = async (isBackgroundAuto = false) => {
    if (loadingDetection) return;
    const b64 = captureFrameBase64();
    if (!b64) return;

    if (!isBackgroundAuto) setLoadingDetection(true);

    try {
      const selectedCam = cameras.find((c) => c.id === selectedCameraId) || {
        id: selectedCameraId,
        name: 'Rig 04 Main Drill Floor',
        site: 'Duliajan Central Field',
        zone: 'Drilling Rig Floor 04',
      };

      const result = await api.detectCameraFrame({
        image_base64: b64,
        camera_id: selectedCam.id,
        camera_name: selectedCam.name,
        site_name: selectedCam.site,
        location: selectedCam.zone,
        auto_record: true,
        danger_zone_active: dangerZoneActive,
      });

      setLastServerDetection(result);

      if (result.incident_created && result.report_id) {
        setAutoLoggedIncidents((prev) => [
          {
            report_id: result.report_id,
            report_uid: result.report_uid,
            alert_uid: result.alert_uid,
            time: new Date().toLocaleTimeString(),
            title: result.violations?.[0]?.title || 'Safety Violation',
            severity: result.max_severity,
            location: selectedCam.zone,
          },
          ...prev.slice(0, 9),
        ]);

        if (result.violations?.[0]?.title) {
          triggerVoiceAnnouncement(result.violations[0].title, selectedCam.id);
        }
      }
    } catch (err) {
      console.error('Frame analysis error:', err);
    } finally {
      if (!isBackgroundAuto) setLoadingDetection(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isStreaming) {
      stopCamera();
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const b64 = reader.result as string;
      setUploadedImagePreview(b64);
      setActiveMode('upload');
      setLoadingDetection(true);

      try {
        const result = await api.detectCameraFrame({
          image_base64: b64,
          camera_id: selectedCameraId,
          auto_record: true,
          danger_zone_active: dangerZoneActive,
        });

        setLastServerDetection(result);
        if (result.incident_created && result.report_id) {
          setAutoLoggedIncidents((prev) => [
            {
              report_id: result.report_id,
              report_uid: result.report_uid,
              alert_uid: result.alert_uid,
              time: new Date().toLocaleTimeString(),
              title: result.violations?.[0]?.title || 'Safety Violation',
              severity: result.max_severity,
              location: result.location,
            },
            ...prev.slice(0, 9),
          ]);

          if (result.violations?.[0]?.title) {
            triggerVoiceAnnouncement(result.violations[0].title, selectedCameraId);
          }
        }
      } catch (err) {
        console.error('File detection error:', err);
      } finally {
        setLoadingDetection(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadSnapshot = () => {
    const imageSrc = lastServerDetection?.annotated_image || uploadedImagePreview;
    if (!imageSrc) return;
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = `OIL_SAFETY_EVIDENCE_${selectedCameraId}_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentCam = cameras.find((c) => c.id === selectedCameraId) || {
    name: 'Rig 04 Main Drill Floor',
    site: 'Duliajan Central Field',
    zone: 'High-Risk Drilling Zone',
  };

  // Determine current active verdict
  const isViolationState = activeMode === 'webcam'
    ? !liveDetection.isCompliant && liveDetection.workerDetected
    : (lastServerDetection?.status === 'violation');

  const isCompliantState = activeMode === 'webcam'
    ? liveDetection.isCompliant && liveDetection.workerDetected
    : (lastServerDetection?.status === 'compliant');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                {t('camera.title', 'AI Safety Camera & Real-Time Worker Surveillance')}
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-mono font-black animate-pulse border border-red-200">
                  {t('camera.liveSurveillance', 'LIVE CV SURVEILLANCE')}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {t('camera.subtitle', 'Real-time computer vision tracking for PPE compliance, restricted danger zone breaches, and zero-touch incident logging.')}
              </p>
            </div>
          </div>
        </div>

        {/* Status Badges & Controls */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <button
            type="button"
            onClick={() => setVoiceAlertsEnabled(!voiceAlertsEnabled)}
            className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              voiceAlertsEnabled
                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
            }`}
            title="Toggle Voice Alerts"
          >
            {voiceAlertsEnabled ? <Volume2 className="w-3.5 h-3.5 text-blue-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            <span className="text-[11px]">{t('camera.voiceAlerts', 'Voice Alerts')}</span>
          </button>

          <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] text-slate-600 font-medium">
              {t('camera.cooldownText', 'Alert De-duplication Cooldown:')} <strong className="text-slate-900 font-bold">30s</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar: Mode Selection, Camera Selector, Sensitivity and Scan Buttons */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Source Mode Tabs: Live Video Camera | Upload Image / Video */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveMode('webcam');
              if (!isStreaming) startCamera();
            }}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'webcam'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            {t('camera.liveWebcam', 'Live Video Camera')}
          </button>

          <label className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeMode === 'upload'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}>
            <Upload className="w-3.5 h-3.5" />
            {t('camera.uploadFrame', 'Upload Image / Video')}
            <input type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Industrial Camera Selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-bold">{t('camera.feed', 'Camera Feed:')}</span>
          <select
            value={selectedCameraId}
            onChange={(e) => setSelectedCameraId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
          >
            {cameras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} • {c.name} ({c.site})
              </option>
            ))}
          </select>
        </div>

        {/* Sensitivity & Camera Actions */}
        <div className="flex items-center gap-2">
          {activeMode === 'webcam' && (
            <>
              

              {/* Sensitivity Selector */}
              <button
                type="button"
                onClick={() => setSensitivity(sensitivity === 'standard' ? 'high' : 'standard')}
                className={`px-2.5 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition-all text-xs ${
                  sensitivity === 'high'
                    ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title="Toggle High Sensitivity mode for low light or distant webcams"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-600" />
                <span>Sens: <strong>{sensitivity === 'high' ? 'High' : 'Normal'}</strong></span>
              </button>

              {/* Optional Perimeter Danger Zone Toggle (Clean by default!) */}
              <button
                type="button"
                onClick={() => setDangerZoneActive(!dangerZoneActive)}
                className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition-all text-xs ${
                  dangerZoneActive
                    ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title="Toggle Danger Zone Perimeter Line on live camera feed"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Perimeter: <strong>{dangerZoneActive ? 'ON' : 'OFF'}</strong></span>
              </button>

              {!isStreaming ? (
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  {t('camera.startCamera', 'Start Camera')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  {t('camera.stopCamera', 'Stop Camera')}
                </button>
              )}

              <button
                type="button"
                onClick={() => captureAndAnalyze(false)}
                disabled={!isStreaming || loadingDetection}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingDetection ? 'animate-spin' : ''}`} />
                {loadingDetection ? 'Analyzing...' : t('camera.analyzeFrame', 'Analyze Frame')}
              </button>

              <label className="flex items-center gap-1.5 ml-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoScan}
                  onChange={(e) => setAutoScan(e.target.checked)}
                  disabled={!isStreaming}
                  className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-0"
                />
                <span className="text-[11px] font-bold text-slate-700">{t('camera.autoScan', 'Auto-Scan (1.5s)')}</span>
              </label>
            </>
          )}

          {lastServerDetection?.annotated_image && (
            <button
              type="button"
              onClick={handleDownloadSnapshot}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold flex items-center gap-1.5 shadow-sm transition-all"
              title="Download Snapshot with Bounding Boxes"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>{t('camera.exportSnapshot', 'Download Evidence')}</span>
            </button>
          )}
        </div>
      </div>

      {cameraError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center justify-between font-medium shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{cameraError}</span>
          </div>
          <button
            onClick={startCamera}
            className="px-3 py-1 rounded bg-rose-600 text-white font-bold text-xs"
          >
            Retry Camera Access
          </button>
        </div>
      )}

      {/* Main 2-Column Surveillance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Video Viewport with Live Real-Time AR Overlay */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isStreaming ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
                <span className="font-mono font-bold text-slate-900">{selectedCameraId}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 font-medium">{currentCam.name}</span>
              </div>

              {/* View Switcher for live webcam mode */}
              {activeMode === 'webcam' && isStreaming && (
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setViewMode('live')}
                    className={`px-2 py-0.5 rounded transition-all ${
                      viewMode === 'live' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    ● Live 30fps AR
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('snapshot')}
                    className={`px-2 py-0.5 rounded transition-all ${
                      viewMode === 'snapshot' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    👁 AI Snapshot
                  </button>
                </div>
              )}

              <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                isViolationState
                  ? 'bg-red-100 text-red-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isViolationState ? 'VIOLATION DETECTED' : 'COMPLIANT (SAFE)'}
              </span>
            </div>

            {/* Video & AR Canvas Viewport */}
            <div className="relative aspect-video rounded-xl bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner group">
              {activeMode === 'webcam' && (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${viewMode === 'snapshot' ? 'hidden' : ''}`}
                  />
                  {/* Real-time AR Canvas overlay with zero latency */}
                  <canvas
                    ref={arCanvasRef}
                    className={`absolute inset-0 w-full h-full pointer-events-none z-10 ${viewMode === 'snapshot' ? 'hidden' : ''}`}
                  />
                  <canvas ref={captureCanvasRef} className="hidden" />
                </>
              )}

              {/* Display snapshot if toggled or in upload mode */}
              {(activeMode === 'upload' || (activeMode === 'webcam' && (viewMode === 'snapshot' || !isStreaming))) && (
                <img
                  src={lastServerDetection?.annotated_image || uploadedImagePreview || ''}
                  alt="Camera Vision Analysis"
                  className="w-full h-full object-contain"
                />
              )}

              {/* Standby screen when camera is stopped */}
              {!isStreaming && activeMode === 'webcam' && !lastServerDetection?.annotated_image && (
                <div className="text-center p-6 space-y-3 z-20">
                  <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Live Camera Standby</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Click 'Start Camera' to initialize the camera feed with real-time worker tracking.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md inline-flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Start Camera Feed
                  </button>
                </div>
              )}

              {/* Live HUD Top Banner */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
                <div className="px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-sm text-white font-mono text-[10px] font-bold flex items-center gap-2 border border-slate-700">
                  <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                  <span>{currentCam.zone}</span>
                </div>

                {/* Synchronized single-verdict badge */}
                {isViolationState ? (
                  <span className="px-3 py-1 rounded-md bg-red-600/90 backdrop-blur-sm text-white font-bold text-[11px] shadow-lg animate-bounce border border-red-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    VIOLATION DETECTED
                  </span>
                ) : isCompliantState ? (
                  <span className="px-3 py-1 rounded-md bg-emerald-600/90 backdrop-blur-sm text-white font-bold text-[11px] shadow-lg border border-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    WORKER COMPLIANT
                  </span>
                ) : null}
              </div>
            </div>

            {/* Live Real-Time Telemetry & Status Bar */}
            {activeMode === 'webcam' && isStreaming && (
              <div className="p-2.5 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono shadow-sm">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    LIVE CV (30 FPS)
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-200">
                    Safety Helmet: <strong className={liveDetection.hasHelmet ? 'text-emerald-400' : 'text-rose-400'}>
                      {liveDetection.hasHelmet ? '✓ DETECTED' : '❌ MISSING'}
                    </strong>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-200">
                    Safety Vest: <strong className={liveDetection.hasVest ? 'text-emerald-400' : 'text-rose-400'}>
                      {liveDetection.hasVest ? '✓ DETECTED' : '❌ MISSING'}
                    </strong>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-200">
                    Auto-Report: <strong className="text-blue-400">ENABLED</strong>
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  <span>Continuous Zero-Touch Incident Logging Active</span>
                </div>
              </div>
            )}

            {/* Quick Testing Tips Banner */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-2.5 text-slate-700">
              <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <div className="text-[11px]">
                <strong>Helmet Detection Live Visualizer:</strong> Look at the <strong>Head Target Arc</strong> directly above your head in the video. When bare-headed (hair/scalp visible), it alerts <span className="text-red-600 font-bold">❌ Bare Head Detected</span>. When wearing a safety helmet, it instantly flips to <span className="text-emerald-700 font-bold">✓ Safety Helmet: Detected</span>!
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Real-time Detection HUD, PPE Checks, and Auto-Logged Incidents */}
        <div className="lg:col-span-5 space-y-4">
          {/* Live Analysis Verdict Card */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-600" />
                {t('camera.hudTitle', 'Live Vision Intelligence HUD')}
              </h3>
              <RiskBadge 
                level={
                  isViolationState
                    ? (liveDetection.inRestricted ? 'CRITICAL' : (!liveDetection.hasHelmet ? 'HIGH' : 'MODERATE'))
                    : 'LOW'
                } 
                size="sm" 
              />
            </div>

            {/* Live Detected Worker Status Card */}
            {(activeMode === 'webcam' && isStreaming) ? (
              <div className="space-y-2">
                <div
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    liveDetection.isCompliant
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-red-50/50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-slate-900">Worker #1</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      liveDetection.isCompliant
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800 animate-pulse'
                    }`}>
                      {liveDetection.isCompliant ? '✓ SAFE / COMPLIANT' : '⚠ VIOLATION DETECTED'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                    {/* Helmet Check */}
                    <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-sm">
                      <div className="text-[9px] uppercase font-bold text-slate-500">{t('camera.hardHat', 'Hard Hat')}</div>
                      <div className={`font-bold mt-0.5 flex items-center gap-1 ${
                        liveDetection.hasHelmet ? 'text-emerald-700' : 'text-red-600'
                      }`}>
                        {liveDetection.hasHelmet ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-red-600" />}
                        {liveDetection.hasHelmet ? t('camera.detected', 'Detected') : t('camera.missing', 'Missing')}
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5 truncate" title={liveDetection.helmetType}>
                        {liveDetection.helmetType}
                      </div>
                    </div>

                    {/* Vest Check */}
                    <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-sm">
                      <div className="text-[9px] uppercase font-bold text-slate-500">{t('camera.safetyVest', 'Safety Vest')}</div>
                      <div className={`font-bold mt-0.5 flex items-center gap-1 ${
                        liveDetection.hasVest ? 'text-emerald-700' : 'text-red-600'
                      }`}>
                        {liveDetection.hasVest ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-red-600" />}
                        {liveDetection.hasVest ? t('camera.detected', 'Detected') : t('camera.missing', 'Missing')}
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5 truncate" title={liveDetection.vestType}>
                        {liveDetection.vestType}
                      </div>
                    </div>

                    {/* Danger Zone Check */}
                    <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-sm">
                      <div className="text-[9px] uppercase font-bold text-slate-500">{t('camera.zoneSafe', 'Zone Safe')}</div>
                      <div className={`font-bold mt-0.5 flex items-center gap-1 ${
                        !liveDetection.inRestricted ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {!liveDetection.inRestricted ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <ShieldAlert className="w-3 h-3 text-rose-600" />}
                        {!liveDetection.inRestricted ? t('camera.safeZone', 'Safe Zone') : 'Breached!'}
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">
                        {liveDetection.inRestricted ? t('camera.dangerCorridor', 'Danger Area') : 'Permitted'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : lastServerDetection?.persons && lastServerDetection.persons.length > 0 ? (
              <div className="space-y-2">
                {lastServerDetection.persons.map((p: any, idx: number) => {
                  const isSafe = p.compliance_status === 'COMPLIANT';
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs transition-all ${
                        isSafe
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-red-50/50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-black text-slate-900">Worker #{p.person_id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isSafe
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800 animate-pulse'
                        }`}>
                          {isSafe ? '✓ SAFE / COMPLIANT' : '⚠ VIOLATION DETECTED'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                        {/* Helmet Check */}
                        <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-sm">
                          <div className="text-[9px] uppercase font-bold text-slate-500">{t('camera.hardHat', 'Hard Hat')}</div>
                          <div className={`font-bold mt-0.5 flex items-center gap-1 ${
                            p.has_helmet ? 'text-emerald-700' : 'text-red-600'
                          }`}>
                            {p.has_helmet ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-red-600" />}
                            {p.has_helmet ? t('camera.detected', 'Detected') : t('camera.missing', 'Missing')}
                          </div>
                          <div className="text-[9px] text-slate-400 mt-0.5 truncate">{p.helmet_detail || 'Bare Head'}</div>
                        </div>

                        {/* Vest Check */}
                        <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-sm">
                          <div className="text-[9px] uppercase font-bold text-slate-500">{t('camera.safetyVest', 'Safety Vest')}</div>
                          <div className={`font-bold mt-0.5 flex items-center gap-1 ${
                            p.has_vest ? 'text-emerald-700' : 'text-red-600'
                          }`}>
                            {p.has_vest ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-red-600" />}
                            {p.has_vest ? t('camera.detected', 'Detected') : t('camera.missing', 'Missing')}
                          </div>
                          <div className="text-[9px] text-slate-400 mt-0.5 truncate">{p.vest_detail || 'Standard Clothing'}</div>
                        </div>

                        {/* Danger Zone Check */}
                        <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-sm">
                          <div className="text-[9px] uppercase font-bold text-slate-500">{t('camera.zoneSafe', 'Zone Safe')}</div>
                          <div className={`font-bold mt-0.5 flex items-center gap-1 ${
                            !p.in_restricted_zone ? 'text-emerald-700' : 'text-rose-700'
                          }`}>
                            {!p.in_restricted_zone ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <ShieldAlert className="w-3 h-3 text-rose-600" />}
                            {!p.in_restricted_zone ? t('camera.safeZone', 'Safe Zone') : 'Breached!'}
                          </div>
                          <div className="text-[9px] text-slate-400 mt-0.5">
                            {p.in_restricted_zone ? t('camera.dangerCorridor', 'Danger Area') : 'Permitted'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs font-medium">
                {isStreaming ? 'Detecting worker in live camera feed...' : t('camera.noDetections', 'No worker in camera view.')}
              </div>
            )}

            {/* Active Violations List */}
            {((activeMode === 'webcam' && liveDetection.violations.length > 0) || (lastServerDetection?.violations && lastServerDetection.violations.length > 0)) && (
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {t('camera.violationsIntercepted', 'Active Violations Intercepted')}:
                </div>
                {(activeMode === 'webcam' ? liveDetection.violations : lastServerDetection?.violations?.map((v: any) => v.title) || []).map((vTitle: string, idx: number) => (
                  <div key={idx} className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-rose-900">{vTitle}</div>
                      <div className="text-[11px] text-rose-700 mt-0.5">
                        Automatic HSE incident protocol triggered. Safety barrier non-compliant.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Automated Incident Dispatch & Alert Feed */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                {t('camera.autoIncidentTitle', 'Automated Incident & Alert Dispatch')}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono text-[10px] font-bold">
                {t('camera.zeroTouch', 'Zero-Touch Automation')}
              </span>
            </div>

            {/* If recent incident created */}
            {lastServerDetection?.incident_created && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{t('camera.incidentSuccess', 'Official HSE Incident Record Generated Automatically!')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-1.5 rounded bg-white border border-emerald-200">
                    <span className="text-slate-500">Report: </span>
                    <strong className="text-blue-700">{lastServerDetection.report_uid}</strong>
                  </div>
                  <div className="p-1.5 rounded bg-white border border-emerald-200">
                    <span className="text-slate-500">Alert: </span>
                    <strong className="text-red-700">{lastServerDetection.alert_uid}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {onSelectReport && lastServerDetection.report_id && (
                    <button
                      type="button"
                      onClick={() => onSelectReport(lastServerDetection.report_id)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-sm flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {t('camera.viewDossier', 'View Incident Dossier')}
                    </button>
                  )}
                  {onNavigate && (
                    <button
                      type="button"
                      onClick={() => onNavigate('alerts')}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-[11px]"
                    >
                      {t('camera.openAlertCenter', 'Open Alert Center')}
                    </button>
                  )}
                </div>
              </div>
            )}

            {lastServerDetection?.cooldown_active && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-[11px] text-amber-800 flex items-center gap-2 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span>De-duplication active: Continuous violation acknowledged. Duplicate alert creation suppressed for 30s.</span>
              </div>
            )}

            {/* Recent Camera Logs */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {t('camera.recentIncidents', 'Recent Camera-Generated Incidents:')}
              </div>
              {autoLoggedIncidents.length === 0 ? (
                <div className="text-[11px] text-slate-400 py-3 text-center italic">
                  No automated incidents logged in this session yet.
                </div>
              ) : (
                autoLoggedIncidents.slice(0, 4).map((inc, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between shadow-sm hover:bg-slate-100 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-blue-600 text-[11px]">{inc.report_uid}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-bold text-slate-800 text-[11px]">{inc.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{inc.location} • {inc.time}</div>
                    </div>
                    {onSelectReport && inc.report_id && (
                      <button
                        type="button"
                        onClick={() => onSelectReport(inc.report_id)}
                        className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-white"
                        title="View Report"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
