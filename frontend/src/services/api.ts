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

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Invalid login credentials');
    return res.json();
  },

  async demoSwitch(role: string) {
    const res = await fetch(`${API_BASE}/auth/demo-switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) throw new Error('Role switch failed');
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to get profile');
    return res.json();
  },

  // Dashboard
  async getDashboardKpis() {
    const res = await fetch(`${API_BASE}/dashboard/kpis`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load KPIs');
    return res.json();
  },

  async getDashboardCharts() {
    const res = await fetch(`${API_BASE}/dashboard/charts`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load charts');
    return res.json();
  },

  async getSiteRankings() {
    const res = await fetch(`${API_BASE}/dashboard/site-rankings`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load site rankings');
    return res.json();
  },

  // Reports
  async getReports(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'ALL') {
        query.append(k, String(v));
      }
    });
    const res = await fetch(`${API_BASE}/reports?${query.toString()}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load reports');
    return res.json();
  },

  async getReport(id: number | string) {
    const res = await fetch(`${API_BASE}/reports/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load report');
    return res.json();
  },

  async createReport(data: any) {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit report');
    return res.json();
  },

  // Live AI Evaluate
  async evaluateText(data: any) {
    const res = await fetch(`${API_BASE}/analysis/evaluate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('AI analysis failed');
    return res.json();
  },

  // Precursors
  async getPrecursorPatterns(emergingOnly = false, risk = 'ALL', activity = 'ALL') {
    const query = new URLSearchParams();
    if (emergingOnly) query.append('emerging_only', 'true');
    if (risk !== 'ALL') query.append('risk_level', risk);
    if (activity !== 'ALL') query.append('activity', activity);
    const res = await fetch(`${API_BASE}/precursors?${query.toString()}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load precursors');
    return res.json();
  },

  async refreshPrecursors() {
    const res = await fetch(`${API_BASE}/precursors/refresh`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Rules
  async getRules() {
    const res = await fetch(`${API_BASE}/rules`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load rules');
    return res.json();
  },

  async getRuleDetails(code: string) {
    const res = await fetch(`${API_BASE}/rules/${code}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load rule details');
    return res.json();
  },

  // Analytics
  async getSiteAnalytics() {
    const res = await fetch(`${API_BASE}/analytics/sites`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load site analytics');
    return res.json();
  },

  async getActivityAnalytics() {
    const res = await fetch(`${API_BASE}/analytics/activities`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load activity analytics');
    return res.json();
  },

  async getRiskMatrix() {
    const res = await fetch(`${API_BASE}/analytics/risk-matrix`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load risk matrix');
    return res.json();
  },

  // Semantic Search
  async semanticSearch(query: string, topK = 15) {
    const res = await fetch(`${API_BASE}/search/semantic`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ query, top_k: topK }),
    });
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  },

  async getDuplicates() {
    const res = await fetch(`${API_BASE}/search/duplicates`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Duplicate check failed');
    return res.json();
  },

  // Assistant
  async askAssistant(query: string) {
    const res = await fetch(`${API_BASE}/assistant/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error('Assistant query failed');
    return res.json();
  },

  // Reviews
  async getReviewQueue() {
    const res = await fetch(`${API_BASE}/reviews/queue`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load review queue');
    return res.json();
  },

  async submitReview(reportId: number, data: any) {
    const res = await fetch(`${API_BASE}/reviews/${reportId}/validate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit review');
    return res.json();
  },

  // Models
  async getModelMetrics() {
    const res = await fetch(`${API_BASE}/models/metrics`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load model metrics');
    return res.json();
  },

  async retrainModel() {
    const res = await fetch(`${API_BASE}/models/retrain`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Retrain failed');
    return res.json();
  },

  // Alerts
  async getAlerts(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v && v !== 'ALL') query.append(k, String(v));
    });
    const res = await fetch(`${API_BASE}/alerts?${query.toString()}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to load alerts');
    return res.json();
  },

  async acknowledgeAlert(alertId: number, assignedTo?: string) {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ assigned_to: assignedTo }),
    });
    return res.json();
  },

  async resolveAlert(alertId: number, notes?: string) {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/resolve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ resolution_notes: notes }),
    });
    return res.json();
  },

  // Admin
  async getUsers() {
    const res = await fetch(`${API_BASE}/admin/users`, { headers: getAuthHeaders() });
    return res.json();
  },

  async getAuditLogs(action = 'ALL') {
    const query = action !== 'ALL' ? `?action=${action}` : '';
    const res = await fetch(`${API_BASE}/admin/audit-logs${query}`, { headers: getAuthHeaders() });
    return res.json();
  },

  async getSettings() {
    const res = await fetch(`${API_BASE}/admin/settings`, { headers: getAuthHeaders() });
    return res.json();
  },

  async updateSettings(data: any) {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Import
  async previewImport(formData: FormData) {
    const res = await fetch(`${API_BASE}/import/preview`, {
      method: 'POST',
      headers: {
        Authorization: localStorage.getItem('oil_sif_token') ? `Bearer ${localStorage.getItem('oil_sif_token')}` : '',
      },
      body: formData,
    });
    return res.json();
  },

  async executeImport(records: any[], columnMapping: Record<string, string>) {
    const res = await fetch(`${API_BASE}/import/execute`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ records, column_mapping: columnMapping }),
    });
    return res.json();
  },
};
