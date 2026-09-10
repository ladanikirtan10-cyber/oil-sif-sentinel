types_ts = """export type UserRole = 'ADMIN' | 'CORPORATE_HSE' | 'HSE_OFFICER' | 'SITE_MANAGER' | 'DATA_SCIENTIST';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  site: string;
  department: string;
}

export interface SafetyReport {
  id: number;
  report_uid: string;
  report_type: string;
  site_name: string;
  department_name: string;
  date_time: string;
  location: string;
  activity: string;
  equipment: string;
  worker_role: string;
  shift: string;
  contractor_involved: boolean;
  contractor_name?: string;
  raw_description: string;
  status: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  risk_score: number;
  sif_potential: boolean;
  sif_probability: number;
  created_at: string;
}

export interface RuleSignal {
  rule_code: string;
  rule_name: string;
  category: string;
  icon: string;
  confidence: number;
  matched_keywords: string[];
  description: string;
}

export interface TextSpan {
  start: number;
  end: number;
  text: string;
  label: string;
}

export interface EntityExtraction {
  activity: string;
  location: string;
  equipment: string;
  hazards: string[];
  barrier_failures: string[];
  potential_consequences: string[];
  worker_role: string;
  contractor_involved: boolean;
  shift: string;
  department: string;
  highlight_spans: TextSpan[];
}

export interface Explainability {
  summary: string;
  risk_factors: string[];
  top_tokens: { token: string; weight: number }[];
  sif_probability: number;
  is_sif: boolean;
  primary_barrier_impact: string;
  consequence_potential: string[];
}

export interface SimilarReport {
  report_uid: string;
  date: string;
  site_name: string;
  activity: string;
  sif_potential: boolean;
  risk_score: number;
  similarity: number;
  raw_description: string;
}

export interface ReportAnalysis {
  id?: number;
  sif_prediction: boolean;
  sif_probability: number;
  confidence: number;
  risk_score: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  likelihood_score: number;
  severity_score: number;
  model_version: string;
  rule_signals: RuleSignal[];
  entity_extraction: EntityExtraction;
  explainability: Explainability;
  similar_reports: SimilarReport[];
  analyzed_at?: string;
}

export interface PrecursorPattern {
  id: number;
  pattern_key: string;
  activity: string;
  hazard: string;
  barrier_failure: string;
  equipment: string;
  location: string;
  occurrence_count: number;
  sif_count: number;
  sif_association_rate: number;
  risk_level: string;
  trend: string;
  affected_sites: string[];
  last_detected_at: string;
}

export interface LifeSavingRule {
  id: number;
  code: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  criticality_weight: number;
  total_violations: number;
  sif_violations: number;
}

export interface Alert {
  id: number;
  alert_uid: string;
  title: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  report_id?: number;
  site_name: string;
  activity: string;
  hazard: string;
  sif_probability: number;
  assigned_to?: string;
  resolution_notes?: string;
  created_at: string;
  resolved_at?: string;
}

export interface ModelMetrics {
  version_tag: string;
  model_type: string;
  trained_at: string;
  sample_count: number;
  human_feedback_samples: number;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    pr_auc: number;
    roc_auc: number;
    false_negative_rate: number;
  };
  confusion_matrix: {
    true_positives: number;
    false_positives: number;
    true_negatives: number;
    false_negatives: number;
  };
  status: string;
}
"""

with open('frontend/src/types/index.ts', 'w', encoding='utf-8') as f:
    f.write(types_ts)
print('Created types/index.ts')
