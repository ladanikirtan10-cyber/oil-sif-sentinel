import {
  Alert,
  LifeSavingRule,
  ModelMetrics,
  PrecursorPattern,
  ReportAnalysis,
  SafetyReport,
  User,
} from '../types';
import {
  MOCK_USERS,
  MOCK_KPIS,
  MOCK_CHARTS,
  MOCK_SITE_RANKINGS,
  MOCK_REPORTS,
  MOCK_RULES,
  MOCK_PRECURSORS,
  MOCK_ALERTS,
  MOCK_CAMERAS,
  mockEvaluateText,
  mockAssistantQuery,
} from './mockData';

const API_BASE = '/api/v1';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('oil_sif_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Local in-memory / localStorage cache for reports and alerts on static deployments (Vercel)
function getStoredReports(): SafetyReport[] {
  try {
    const custom = JSON.parse(localStorage.getItem('oil_custom_reports') || '[]');
    return [...custom, ...MOCK_REPORTS];
  } catch {
    return MOCK_REPORTS;
  }
}

function storeNewReport(report: any) {
  try {
    const current = JSON.parse(localStorage.getItem('oil_custom_reports') || '[]');
    current.unshift(report);
    localStorage.setItem('oil_custom_reports', JSON.stringify(current));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

async function safeFetch<T>(
  url: string,
  options: RequestInit = {},
  fallback: () => T | Promise<T>
): Promise<T> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch (err) {
    // Network unreachable or offline
  }
  return typeof fallback === 'function' ? await fallback() : fallback;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ access_token: string; token_type: string; user: User }> {
    return safeFetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }, () => {
      let matched: User = MOCK_USERS.HSE_OFFICER;
      for (const k of Object.keys(MOCK_USERS)) {
        if (MOCK_USERS[k].email.toLowerCase() === email.toLowerCase()) {
          matched = MOCK_USERS[k];
          break;
        }
      }
      return {
        access_token: `demo-token-${matched.role.toLowerCase()}-${Date.now()}`,
        token_type: 'bearer',
        user: matched,
      };
    });
  },

  async demoSwitch(role: string): Promise<{ access_token: string; token_type: string; user: User }> {
    return safeFetch(`${API_BASE}/auth/demo-switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    }, () => {
      const roleKey = (role || 'HSE_OFFICER').toUpperCase();
      const user = MOCK_USERS[roleKey] || MOCK_USERS.HSE_OFFICER;
      return {
        access_token: `demo-token-${user.role.toLowerCase()}-${Date.now()}`,
        token_type: 'bearer',
        user,
      };
    });
  },

  async getMe(): Promise<User> {
    return safeFetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    }, () => {
      return MOCK_USERS.HSE_OFFICER;
    });
  },

  // Dashboard
  async getDashboardKpis() {
    return safeFetch(`${API_BASE}/dashboard/kpis`, { headers: getAuthHeaders() }, () => {
      const reports = getStoredReports();
      const sifReports = reports.filter((r) => r.sif_potential);
      const critReports = reports.filter((r) => r.severity === 'CRITICAL');
      return {
        ...MOCK_KPIS,
        total_reports: reports.length,
        sif_reports: sifReports.length,
        sif_rate: reports.length > 0 ? Math.round((sifReports.length / reports.length) * 1000) / 10 : 13.9,
        critical_reports: critReports.length,
      };
    });
  },

  async getDashboardCharts() {
    return safeFetch(`${API_BASE}/dashboard/charts`, { headers: getAuthHeaders() }, () => MOCK_CHARTS);
  },

  async getSiteRankings() {
    return safeFetch(`${API_BASE}/dashboard/site-rankings`, { headers: getAuthHeaders() }, () => MOCK_SITE_RANKINGS);
  },

  // Reports
  async getReports(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'ALL') {
        query.append(k, String(v));
      }
    });

    return safeFetch(`${API_BASE}/reports?${query.toString()}`, { headers: getAuthHeaders() }, () => {
      let filtered = getStoredReports();
      if (params.site && params.site !== 'ALL') {
        filtered = filtered.filter((r) => r.site_name.toLowerCase().includes(String(params.site).toLowerCase()));
      }
      if (params.severity && params.severity !== 'ALL') {
        filtered = filtered.filter((r) => r.severity === params.severity);
      }
      if (params.sif_only === 'true' || params.sif_only === true) {
        filtered = filtered.filter((r) => r.sif_potential);
      }
      return {
        items: filtered,
        total: filtered.length,
        page: 1,
        page_size: 50,
      };
    });
  },

  async getReport(id: number | string): Promise<any> {
    return safeFetch(`${API_BASE}/reports/${id}`, { headers: getAuthHeaders() }, () => {
      const all = getStoredReports();
      let match: any = all.find((r) => String(r.id) === String(id) || r.report_uid === String(id));
      if (!match) match = all[0];
      if (!match.analysis) {
        match = { ...match, analysis: mockEvaluateText(match) };
      }
      return match;
    });
  },

  async createReport(data: any): Promise<{
    report_id: number;
    report_uid: string;
    report: SafetyReport;
    analysis: ReportAnalysis;
    status: string;
    message: string;
  }> {
    return safeFetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }, () => {
      const newId = Date.now();
      const reportUid = `OIL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const analysis = mockEvaluateText(data);
      const created: SafetyReport = {
        id: newId,
        report_uid: reportUid,
        report_type: data.report_type || 'Near Miss',
        site_name: data.site_name || 'Duliajan Central Field',
        department_name: data.department_name || 'Operations',
        date_time: new Date().toISOString(),
        location: data.location || 'General Operational Area',
        activity: data.activity || 'Field Inspection',
        equipment: data.equipment || 'Standard Asset',
        worker_role: data.worker_role || 'Field Operator',
        shift: data.shift || 'Morning',
        contractor_involved: Boolean(data.contractor_involved),
        contractor_name: data.contractor_name || '',
        raw_description: data.raw_description || '',
        status: 'Submitted',
        severity: analysis.risk_level,
        risk_score: analysis.risk_score,
        sif_potential: analysis.sif_prediction,
        sif_probability: analysis.sif_probability,
        created_at: new Date().toISOString(),
      };
      storeNewReport({ ...created, analysis });
      return {
        report_id: newId,
        report_uid: reportUid,
        report: created,
        analysis,
        status: 'success',
        message: 'Safety Report saved and analyzed successfully.',
      };
    });
  },

  // Live AI Evaluate
  async evaluateText(data: any): Promise<ReportAnalysis> {
    return safeFetch(`${API_BASE}/analysis/evaluate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }, () => {
      return mockEvaluateText(data);
    });
  },

  // Precursors
  async getPrecursorPatterns(emergingOnly = false, risk = 'ALL', activity = 'ALL'): Promise<PrecursorPattern[]> {
    const query = new URLSearchParams();
    if (emergingOnly) query.append('emerging_only', 'true');
    if (risk !== 'ALL') query.append('risk_level', risk);
    if (activity !== 'ALL') query.append('activity', activity);

    return safeFetch(`${API_BASE}/precursors?${query.toString()}`, { headers: getAuthHeaders() }, () => {
      let list = [...MOCK_PRECURSORS];
      if (emergingOnly) {
        list = list.filter((p) => p.trend === 'Increasing');
      }
      if (risk !== 'ALL') {
        list = list.filter((p) => p.risk_level === risk);
      }
      if (activity !== 'ALL') {
        list = list.filter((p) => p.activity.toLowerCase().includes(activity.toLowerCase()));
      }
      return list;
    });
  },

  async refreshPrecursors(): Promise<{ status: string; discovered_count: number; patterns: PrecursorPattern[] }> {
    return safeFetch(`${API_BASE}/precursors/refresh`, {
      method: 'POST',
      headers: getAuthHeaders(),
    }, () => ({
      status: 'success',
      discovered_count: MOCK_PRECURSORS.length,
      patterns: MOCK_PRECURSORS,
    }));
  },

  // Rules
  async getRules(): Promise<LifeSavingRule[]> {
    return safeFetch(`${API_BASE}/rules`, { headers: getAuthHeaders() }, () => MOCK_RULES);
  },

  async getRuleDetails(code: string): Promise<any> {
    return safeFetch(`${API_BASE}/rules/${code}`, { headers: getAuthHeaders() }, () => {
      const r = MOCK_RULES.find((x) => x.code === code) || MOCK_RULES[0];
      return {
        ...r,
        description: 'Comprehensive compliance guidelines and physical isolation verification under Oil India Limited safety policy.',
        critical_barriers: [
          'Physical lock applied on all primary and secondary energy sources',
          'Bleed and depressurize downstream accumulator lines',
          'Zero energy verification test witnessed by authorized supervisor',
        ],
        linked_reports: getStoredReports().slice(0, 3),
      };
    });
  },

  // Analytics
  async getSiteAnalytics() {
    return safeFetch(`${API_BASE}/analytics/sites`, { headers: getAuthHeaders() }, () => MOCK_SITE_RANKINGS);
  },

  async getActivityAnalytics() {
    return safeFetch(`${API_BASE}/analytics/activities`, { headers: getAuthHeaders() }, () => MOCK_CHARTS.sif_by_activity);
  },

  async getRiskMatrix() {
    return safeFetch(`${API_BASE}/analytics/risk-matrix`, { headers: getAuthHeaders() }, () => {
      const matrix: Record<string, number> = {};
      for (let l = 1; l <= 5; l++) {
        for (let s = 1; s <= 5; s++) {
          const key = `L${l}-S${s}`;
          matrix[key] = Math.floor(Math.random() * 8) + 1;
        }
      }
      matrix['L4-S5'] = 14;
      matrix['L5-S5'] = 8;
      return matrix;
    });
  },

  // Semantic Search
  async semanticSearch(query: string, topK = 15) {
    return safeFetch(`${API_BASE}/search/semantic`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ query, top_k: topK }),
    }, () => {
      const q = (query || '').toLowerCase();
      const all = getStoredReports();
      const matches = all.map((r) => {
        let sim = 0.65;
        if (r.raw_description.toLowerCase().includes(q)) sim = 0.94;
        else if (r.activity.toLowerCase().includes(q) || r.equipment.toLowerCase().includes(q)) sim = 0.82;
        return {
          report_uid: r.report_uid,
          date: r.date_time.slice(0, 10),
          site_name: r.site_name,
          activity: r.activity,
          sif_potential: r.sif_potential,
          risk_score: r.risk_score,
          similarity: sim,
          raw_description: r.raw_description,
        };
      });
      matches.sort((a, b) => b.similarity - a.similarity);
      return {
        query,
        count: matches.slice(0, topK).length,
        results: matches.slice(0, topK),
      };
    });
  },

  async getDuplicates() {
    return safeFetch(`${API_BASE}/search/duplicates`, { headers: getAuthHeaders() }, () => ({
      duplicates_count: 2,
      duplicate_pairs: [
        {
          original: 'OIL-2026-1042',
          duplicate: 'OIL-2026-1043',
          similarity: 0.97,
          reason: 'Identical narrative regarding compressor bypass valve unisolated on Rig 04.',
        },
      ],
    }));
  },

  // Assistant
  async askAssistant(query: string): Promise<{
    answer: string;
    cited_reports: string[];
    source_reports: string[];
    data_points?: string[];
    confidence: number;
    suggested_actions: string[];
  }> {
    return safeFetch(`${API_BASE}/assistant/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ query }),
    }, () => {
      return mockAssistantQuery(query);
    });
  },

  // Reviews
  async getReviewQueue(): Promise<{ items: any[]; total: number }> {
    return safeFetch(`${API_BASE}/reviews/queue`, { headers: getAuthHeaders() }, () => {
      const all = getStoredReports();
      const items = all.slice(0, 4).map((r) => ({
        report_id: r.id,
        report_uid: r.report_uid,
        date: r.date_time || r.created_at,
        site_name: r.site_name,
        activity: r.activity,
        raw_description: r.raw_description,
        ai_sif_prediction: r.sif_potential,
        sif_probability: r.sif_probability,
        risk_level: r.severity,
        confidence: 0.92,
        created_at: r.created_at,
      }));
      return {
        items,
        total: items.length,
      };
    });
  },

  async submitReview(reportId: number, data: any) {
    return safeFetch(`${API_BASE}/reviews/${reportId}/validate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }, () => ({
      status: 'validated',
      report_id: reportId,
      human_verdict: data.human_verdict || 'CONFIRMED_SIF',
      message: 'HSE validation recorded. Continual learning feedback logged.',
    }));
  },

  // Models
  async getModelMetrics(): Promise<ModelMetrics> {
    return safeFetch(`${API_BASE}/models/metrics`, { headers: getAuthHeaders() }, () => ({
      version_tag: 'sif-sentinel-v1.5-calibrated',
      model_type: 'Hybrid RoBERTa-Large + Gradient Boosted SIF Classifier',
      trained_at: '2026-11-20T18:00:00Z',
      sample_count: 1218,
      human_feedback_samples: 42,
      metrics: {
        accuracy: 95.8,
        precision: 92.1,
        recall: 96.5,
        f1_score: 94.2,
        pr_auc: 94.8,
        roc_auc: 97.1,
        false_negative_rate: 3.5,
      },
      confusion_matrix: {
        true_positives: 98,
        false_positives: 8,
        true_negatives: 164,
        false_negatives: 3,
      },
      status: 'ACTIVE_IN_PRODUCTION',
    }));
  },

  async retrainModel(): Promise<{ status: string; new_version: string; delta_recall: string; promoted: boolean }> {
    return safeFetch(`${API_BASE}/models/retrain`, {
      method: 'POST',
      headers: getAuthHeaders(),
    }, () => ({
      status: 'retrained',
      new_version: 'sif-sentinel-v1.6-continual',
      delta_recall: '+0.8%',
      promoted: true,
    }));
  },

  // Alerts
  async getAlerts(params: Record<string, any> = {}): Promise<Alert[]> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v && v !== 'ALL') query.append(k, String(v));
    });

    return safeFetch(`${API_BASE}/alerts?${query.toString()}`, { headers: getAuthHeaders() }, () => {
      let alerts = [...MOCK_ALERTS];
      if (params.priority && params.priority !== 'ALL') {
        alerts = alerts.filter((a) => a.priority === params.priority);
      }
      return alerts;
    });
  },

  async acknowledgeAlert(alertId: number, assignedTo?: string) {
    return safeFetch(`${API_BASE}/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ assigned_to: assignedTo }),
    }, () => ({
      status: 'ACKNOWLEDGED',
      id: alertId,
      assigned_to: assignedTo || 'R. K. Sharma',
    }));
  },

  async resolveAlert(alertId: number, notes?: string) {
    return safeFetch(`${API_BASE}/alerts/${alertId}/resolve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ resolution_notes: notes }),
    }, () => ({
      status: 'RESOLVED',
      id: alertId,
      notes: notes || 'Resolution confirmed by Lead HSE Officer.',
    }));
  },

  // Admin
  async getUsers(): Promise<User[]> {
    return safeFetch(`${API_BASE}/admin/users`, { headers: getAuthHeaders() }, () => Object.values(MOCK_USERS));
  },

  async getAuditLogs(action = 'ALL') {
    const query = action !== 'ALL' ? `?action=${action}` : '';
    return safeFetch(`${API_BASE}/admin/audit-logs${query}`, { headers: getAuthHeaders() }, () => [
      { id: 1, action: 'LOGIN', user_email: 'hse@oil-demo.com', timestamp: '2026-11-22T01:05:00Z', details: { role: 'HSE_OFFICER' } },
      { id: 2, action: 'CAMERA_VIOLATION_DETECTED', user_email: 'camera-ai@oilindia.in', timestamp: '2026-11-22T01:06:00Z', details: { location: 'Gas Compression Bay 02' } },
      { id: 3, action: 'HUMAN_REVIEW_VALIDATE', user_email: 'hse@oil-demo.com', timestamp: '2026-11-21T18:20:00Z', details: { verdict: 'CONFIRMED_SIF' } },
    ]);
  },

  async getSettings(): Promise<{
    sif_threshold: number;
    sif_critical_threshold: number;
    high_risk_threshold: number;
    auto_alert_critical: boolean;
    deduplication_cooldown_seconds: number;
    voice_alerts_default: boolean;
    weights: {
      sif_probability: number;
      severity: number;
      exposure: number;
      barrier_failure: number;
      recurrence: number;
    };
  }> {
    return safeFetch(`${API_BASE}/admin/settings`, { headers: getAuthHeaders() }, () => ({
      sif_threshold: 0.65,
      sif_critical_threshold: 0.85,
      high_risk_threshold: 75.0,
      auto_alert_critical: true,
      deduplication_cooldown_seconds: 30,
      voice_alerts_default: true,
      weights: {
        sif_probability: 0.35,
        severity: 0.25,
        exposure: 0.15,
        barrier_failure: 0.15,
        recurrence: 0.10,
      },
    }));
  },

  async updateSettings(data: any) {
    return safeFetch(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }, () => ({ status: 'updated', ...data }));
  },

  // Import
  async previewImport(formData: FormData): Promise<{
    headers: string[];
    preview_records: any[];
    preview_rows: string[][];
    total_rows: number;
  }> {
    return safeFetch(`${API_BASE}/import/preview`, {
      method: 'POST',
      headers: {
        Authorization: localStorage.getItem('oil_sif_token') ? `Bearer ${localStorage.getItem('oil_sif_token')}` : '',
      },
      body: formData,
    }, () => ({
      headers: ['date', 'site', 'location', 'activity', 'equipment', 'description', 'severity'],
      preview_records: [
        { date: '2026-11-20', site: 'Duliajan', location: 'Rig 04', activity: 'Maintenance', equipment: 'Compressor', description: 'Lockout/tagout locks missing on pressurized bypass line.', severity: 'CRITICAL' },
        { date: '2026-11-19', site: 'Moran', location: 'Wellhead B', activity: 'Testing', equipment: 'Choke Manifold', description: 'Ultrasonic wall thickness erosion detected.', severity: 'HIGH' },
      ],
      preview_rows: [
        ['2026-11-20', 'Duliajan', 'Rig 04', 'Maintenance', 'Compressor', 'Lockout/tagout locks missing on pressurized bypass line.', 'CRITICAL'],
        ['2026-11-19', 'Moran', 'Wellhead B', 'Testing', 'Choke Manifold', 'Ultrasonic wall thickness erosion detected.', 'HIGH'],
      ],
      total_rows: 2,
    }));
  },

  async executeImport(records: any[], columnMapping: Record<string, string>) {
    return safeFetch(`${API_BASE}/import/execute`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ records, column_mapping: columnMapping }),
    }, () => ({
      status: 'success',
      imported_count: records.length || 2,
      sif_identified_count: 1,
    }));
  },

  // AI Safety Camera
  async getCameras() {
    return safeFetch(`${API_BASE}/camera/cameras`, { headers: getAuthHeaders() }, () => MOCK_CAMERAS);
  },

  async getCameraStats() {
    return safeFetch(`${API_BASE}/camera/stats`, { headers: getAuthHeaders() }, () => ({
      active_cameras_count: MOCK_CAMERAS.length,
      total_violations_intercepted: 18,
      active_open_alerts: 2,
      system_status: 'ONLINE',
      fps_capability: '15-30 FPS Real-Time',
      vision_models: ['Adaptive Skin Chrominance YCrCb', 'Color-Space HSV PPE Filters', 'Restricted Danger Zone Perimeters'],
      supported_ppe: ['Hard Hat / Safety Helmet', 'High-Visibility Reflective Vest', 'Danger Zone Intrusion'],
    }));
  },

  async detectCameraFrame(payload: {
    image_base64: string;
    camera_id?: string;
    camera_name?: string;
    site_name?: string;
    location?: string;
    auto_record?: boolean;
    danger_zone_active?: boolean;
  }) {
    return safeFetch(`${API_BASE}/camera/detect`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }, () => {
      // In-browser mock camera detector for Vercel demo
      const isViolation = true;
      const reportUid = `OIL-CAM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const alertUid = `ALT-CAM-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      return {
        status: isViolation ? 'violation' : 'compliant',
        camera_id: payload.camera_id || 'CAM-01',
        location: payload.location || 'Drilling Rig Floor 04',
        persons_detected_count: 1,
        persons: [
          {
            person_id: 1,
            compliance_status: 'VIOLATION',
            has_helmet: false,
            helmet_detail: 'Safety Helmet (Missing)',
            has_vest: false,
            vest_detail: 'Standard Clothing (No Vest)',
            in_restricted_zone: Boolean(payload.danger_zone_active),
            box: [195, 172, 143, 214],
          },
        ],
        violations: [
          {
            type: 'helmet_missing',
            title: 'Safety Helmet Not Detected',
            severity: 'HIGH',
            confidence: 0.94,
            description: 'Field worker observed in active drilling area without protective safety helmet.',
          },
          {
            type: 'vest_missing',
            title: 'High-Visibility Vest Not Detected',
            severity: 'MODERATE',
            confidence: 0.91,
            description: 'Reflective safety vest missing on torso.',
          },
        ],
        max_severity: 'HIGH',
        incident_created: Boolean(payload.auto_record),
        cooldown_active: false,
        report_id: Date.now(),
        report_uid: reportUid,
        alert_uid: alertUid,
      };
    });
  },
};
