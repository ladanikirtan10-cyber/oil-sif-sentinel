// Mock & Offline Fallback Data for OIL SIF SENTINEL
// Ensures 100% operational functionality on Vercel or when backend is unreachable
import {
  Alert,
  LifeSavingRule,
  ModelMetrics,
  PrecursorPattern,
  ReportAnalysis,
  User,
} from '../types';

export const MOCK_USERS: Record<string, User> = {
  HSE_OFFICER: {
    id: 1,
    email: 'hse@oil-demo.com',
    full_name: 'R. K. Sharma (Lead HSE Officer)',
    role: 'HSE_OFFICER',
    site: 'Duliajan Central Field',
    department: 'Health, Safety & Environment',
  },
  SITE_MANAGER: {
    id: 2,
    email: 'manager@oil-demo.com',
    full_name: 'P. K. Baruah (Asset Site Manager)',
    role: 'SITE_MANAGER',
    site: 'Moran Drilling Field',
    department: 'Operations & Production',
  },
  CORPORATE_HSE: {
    id: 3,
    email: 'corporate@oil-demo.com',
    full_name: 'Dr. Ananya Gogoi (VP Corporate HSE)',
    role: 'CORPORATE_HSE',
    site: 'All Assets (HQ)',
    department: 'Corporate HSE Governance',
  },
  ADMIN: {
    id: 4,
    email: 'admin@oil-demo.com',
    full_name: 'Kirtan Ladani (System Administrator)',
    role: 'ADMIN',
    site: 'Enterprise',
    department: 'IT & Systems',
  },
  DATA_SCIENTIST: {
    id: 5,
    email: 'ds@oil-demo.com',
    full_name: 'Vikram Sen (Lead Safety ML Engineer)',
    role: 'DATA_SCIENTIST',
    site: 'All Assets',
    department: 'AI & Safety Intelligence',
  },
};

export const MOCK_KPIS = {
  total_reports: 273,
  sif_reports: 38,
  sif_rate: 13.9,
  critical_reports: 24,
  high_risk_sites: 3,
  emerging_patterns: 5,
  open_alerts: 4,
  trends: {
    total_reports_change: '+8.4%',
    sif_rate_change: '-1.2%',
    critical_change: '-4.1%',
    emerging_change: '+2',
  },
};

export const MOCK_CHARTS = {
  reports_by_type: [
    { name: 'Unsafe Act (UA)', value: 112 },
    { name: 'Unsafe Condition (UC)', value: 88 },
    { name: 'Near-Miss', value: 54 },
    { name: 'Incident', value: 19 },
  ],
  risk_distribution: [
    { name: 'LOW', value: 135 },
    { name: 'MODERATE', value: 76 },
    { name: 'HIGH', value: 38 },
    { name: 'CRITICAL', value: 24 },
  ],
  sif_by_site: [
    { site: 'Duliajan', total: 84, sif: 14, density: 16.7, risk: 'CRITICAL' },
    { site: 'Moran', total: 62, sif: 10, density: 16.1, risk: 'HIGH' },
    { site: 'Digboi', total: 48, sif: 6, density: 12.5, risk: 'HIGH' },
    { site: 'Naharkatiya', total: 39, sif: 4, density: 10.3, risk: 'MODERATE' },
    { site: 'Jorhat', total: 24, sif: 2, density: 8.3, risk: 'LOW' },
    { site: 'Kumchai', total: 16, sif: 2, density: 12.5, risk: 'MODERATE' },
  ],
  sif_by_activity: [
    { activity: 'Maintenance & Overhaul', total: 68, sif: 16, density: 23.5 },
    { activity: 'Drilling & Well Operations', total: 54, sif: 11, density: 20.4 },
    { activity: 'Lifting & Rigging', total: 39, sif: 5, density: 12.8 },
    { activity: 'Pipe Handling & Make-up', total: 35, sif: 4, density: 11.4 },
    { activity: 'Work at Height', total: 31, sif: 4, density: 12.9 },
    { activity: 'Hot Work & Welding', total: 26, sif: 2, density: 7.7 },
  ],
  rule_violations: [
    { code: 'LSR-01', name: 'Energy Isolation (LOTO)', violations: 28, sif_violations: 14 },
    { code: 'LSR-04', name: 'Line of Fire Exposure', violations: 24, sif_violations: 11 },
    { code: 'LSR-02', name: 'Work at Height Fall Protection', violations: 19, sif_violations: 8 },
    { code: 'LSR-07', name: 'Toxic Gas & H2S Monitoring', violations: 16, sif_violations: 6 },
    { code: 'LSR-05', name: 'Lifting & Suspended Loads', violations: 14, sif_violations: 5 },
    { code: 'LSR-03', name: 'Confined Space Entry', violations: 12, sif_violations: 4 },
    { code: 'LSR-06', name: 'Hot Work Ignition Control', violations: 11, sif_violations: 3 },
  ],
  monthly_trend: [
    { month: 'Jun 2026', total: 38, sif: 5, sif_rate: 13.2 },
    { month: 'Jul 2026', total: 44, sif: 7, sif_rate: 15.9 },
    { month: 'Aug 2026', total: 49, sif: 6, sif_rate: 12.2 },
    { month: 'Sep 2026', total: 46, sif: 7, sif_rate: 15.2 },
    { month: 'Oct 2026', total: 52, sif: 8, sif_rate: 15.4 },
    { month: 'Nov 2026', total: 44, sif: 5, sif_rate: 11.4 },
  ],
};

export const MOCK_SITE_RANKINGS = [
  { site_name: 'Duliajan Central Field', total_reports: 84, sif_reports: 14, sif_density: 16.7, critical_count: 9, risk_level: 'CRITICAL', trend: 'Increasing' },
  { site_name: 'Moran Drilling Field', total_reports: 62, sif_reports: 10, sif_density: 16.1, critical_count: 7, risk_level: 'HIGH', trend: 'Stable' },
  { site_name: 'Digboi Oilfield', total_reports: 48, sif_reports: 6, sif_density: 12.5, critical_count: 4, risk_level: 'HIGH', trend: 'Decreasing' },
  { site_name: 'Naharkatiya Production Asset', total_reports: 39, sif_reports: 4, sif_density: 10.3, critical_count: 2, risk_level: 'MODERATE', trend: 'Stable' },
  { site_name: 'Kumchai Gas Field', total_reports: 24, sif_reports: 2, sif_density: 8.3, critical_count: 1, risk_level: 'MODERATE', trend: 'Stable' },
  { site_name: 'Jorhat Terminal', total_reports: 16, sif_reports: 2, sif_density: 12.5, critical_count: 1, risk_level: 'LOW', trend: 'Decreasing' },
];

export const MOCK_REPORTS = [
  {
    id: 1,
    report_uid: 'OIL-2026-1042',
    report_type: 'Near Miss',
    site_name: 'Duliajan Central Field',
    department_name: 'Drilling & Workover',
    date_time: '2026-11-20T14:30:00Z',
    location: 'Rig 04 Main Substructure',
    activity: 'Centrifugal Compressor Maintenance',
    equipment: 'Natural Gas Booster Compressor #2',
    worker_role: 'Mechanical Maintenance Lead',
    shift: 'Morning (06:00 - 14:00)',
    contractor_involved: true,
    contractor_name: 'Apex Drilling Services Ltd.',
    raw_description: 'During scheduled seal replacement on the compressor, a contractor entered the skid while the suction line bypass remained under 42 bar pressure. Lockout/tagout locks had not been physically applied to the secondary isolation valve.',
    status: 'Analyzed',
    severity: 'CRITICAL' as const,
    risk_score: 92.4,
    sif_potential: true,
    sif_probability: 0.94,
    created_at: '2026-11-20T15:10:00Z',
  },
  {
    id: 2,
    report_uid: 'OIL-2026-1041',
    report_type: 'Unsafe Condition',
    site_name: 'Moran Drilling Field',
    department_name: 'Production Operations',
    date_time: '2026-11-19T09:15:00Z',
    location: 'Wellhead Christmas Tree Cluster B',
    activity: 'High-Pressure Well Testing',
    equipment: 'Choke Manifold 10k PSI',
    worker_role: 'Production Supervisor',
    shift: 'Morning',
    contractor_involved: false,
    raw_description: 'Vibration observed on high-pressure flowline adjacent to separator. Ultrasonic wall thickness survey showed localized internal erosion below critical threshold with pinhole gas seep detected.',
    status: 'Investigated',
    severity: 'HIGH' as const,
    risk_score: 84.1,
    sif_potential: true,
    sif_probability: 0.88,
    created_at: '2026-11-19T10:00:00Z',
  },
  {
    id: 3,
    report_uid: 'OIL-CAM-2026-1353',
    report_type: 'Camera AI Safety Violation',
    site_name: 'Moran Gas Field',
    department_name: 'Operations & Drilling',
    date_time: '2026-11-22T01:05:00Z',
    location: 'Gas Compression Bay 02',
    activity: 'Automated Visual PPE Surveillance',
    equipment: 'Compressor House Sector B (CAM-02)',
    worker_role: 'Field Technician / Contractor',
    shift: 'Morning',
    contractor_involved: true,
    contractor_name: 'Active Contractor Field Team',
    raw_description: 'Automated AI Camera Surveillance Alert on Compressor House Sector B (CAM-02). Location: Gas Compression Bay 02. Detected worker with safety helmet missing in active high-pressure manifold zone.',
    status: 'Analyzed',
    severity: 'HIGH' as const,
    risk_score: 86.5,
    sif_potential: true,
    sif_probability: 0.89,
    created_at: '2026-11-22T01:06:00Z',
  },
  {
    id: 4,
    report_uid: 'OIL-2026-1039',
    report_type: 'Unsafe Act',
    site_name: 'Digboi Oilfield',
    department_name: 'Civil & Rig Maintenance',
    date_time: '2026-11-18T16:20:00Z',
    location: 'Derrick Mast Platform 40ft',
    activity: 'Crown Block Sheave Inspection',
    equipment: 'Traveling Block & Hook Assembly',
    worker_role: 'Derrickman',
    shift: 'Afternoon',
    contractor_involved: false,
    raw_description: 'Worker observed transitioning across monkey board without dual lanyards attached to safety wireline during high-wind condition.',
    status: 'Reviewed',
    severity: 'HIGH' as const,
    risk_score: 79.5,
    sif_potential: true,
    sif_probability: 0.81,
    created_at: '2026-11-18T17:00:00Z',
  },
  {
    id: 5,
    report_uid: 'OIL-2026-1038',
    report_type: 'Near Miss',
    site_name: 'Naharkatiya Production Asset',
    department_name: 'Pipeline & Transport',
    date_time: '2026-11-17T11:45:00Z',
    location: 'Crude Dispatch Manifold Area',
    activity: 'Heavy Pipe Transport & Offloading',
    equipment: 'Hydraulic Mobile Crane 50T',
    worker_role: 'Rigger / Crane Operator',
    shift: 'Morning',
    contractor_involved: true,
    contractor_name: 'Brahmaputra Heavy Logistics',
    raw_description: 'Nylon sling showed severe abrasion along edge while lifting 8-inch seamless line pipe bundle. Lift suspended immediately before failure.',
    status: 'Closed',
    severity: 'MODERATE' as const,
    risk_score: 62.0,
    sif_potential: false,
    sif_probability: 0.32,
    created_at: '2026-11-17T12:30:00Z',
  },
];

export const MOCK_RULES: LifeSavingRule[] = [
  { id: 1, code: 'LSR-01', name: 'Energy Isolation (LOTO)', total_violations: 28, sif_violations: 14, icon: 'Zap', category: 'Electrical & Mechanical', description: 'Zero energy verification and physical locking of all primary/secondary energy vectors.', criticality_weight: 1.0 },
  { id: 2, code: 'LSR-02', name: 'Work at Height', total_violations: 19, sif_violations: 8, icon: 'ArrowUp', category: 'Fall Protection', description: '100% tie-off with certified harnesses when working above 1.8m elevation.', criticality_weight: 0.9 },
  { id: 3, code: 'LSR-03', name: 'Confined Space Entry', total_violations: 12, sif_violations: 4, icon: 'Box', category: 'Atmospheric Safety', description: 'Continuous atmospheric gas testing, ventilation, and dedicated standby sentry.', criticality_weight: 0.95 },
  { id: 4, code: 'LSR-04', name: 'Line of Fire', total_violations: 24, sif_violations: 11, icon: 'Crosshair', category: 'Mechanical & Pressure', description: 'Positioning outside kinetic, stored pressure, or swinging heavy load trajectories.', criticality_weight: 0.85 },
  { id: 5, code: 'LSR-05', name: 'Lifting & Rigging', total_violations: 14, sif_violations: 5, icon: 'Anchor', category: 'Heavy Loads', description: 'Barricaded drop zone and verified sling/shackle SWL certifications.', criticality_weight: 0.8 },
  { id: 6, code: 'LSR-06', name: 'Hot Work Control', total_violations: 11, sif_violations: 3, icon: 'Flame', category: 'Fire & Explosion', description: 'Explosive LEL testing and continuous fire watch for welding/cutting.', criticality_weight: 0.85 },
  { id: 7, code: 'LSR-07', name: 'Toxic Gas & H2S', total_violations: 16, sif_violations: 6, icon: 'Wind', category: 'Hazardous Chemicals', description: 'Calibrated personal H2S detectors and accessible escape breathing apparatus.', criticality_weight: 0.95 },
  { id: 8, code: 'LSR-08', name: 'Bypassing Safety Controls', total_violations: 9, sif_violations: 3, icon: 'AlertTriangle', category: 'Process Safety', description: 'Formal management of change (MOC) override authorization required.', criticality_weight: 0.9 },
  { id: 9, code: 'LSR-09', name: 'Safe Driving & Journey', total_violations: 8, sif_violations: 2, icon: 'Truck', category: 'Transport', description: 'Mandatory seatbelt compliance, IVMS journey management, speed governance.', criticality_weight: 0.75 },
];

export const MOCK_PRECURSORS: PrecursorPattern[] = [
  {
    id: 1,
    pattern_key: 'PRE-01-COMP-LOTO',
    activity: 'Maintenance',
    hazard: 'Rotating machinery & Stored Pressure',
    barrier_failure: 'Lockout/Tagout not completed',
    equipment: 'Centrifugal Compressor',
    location: 'Rig 04 Main Substructure',
    occurrence_count: 14,
    sif_count: 12,
    sif_association_rate: 85.7,
    risk_level: 'CRITICAL',
    trend: 'Increasing',
    affected_sites: ['Duliajan Central Field', 'Moran Gas Field'],
    last_detected_at: '2026-11-20T14:30:00Z',
  },
  {
    id: 2,
    pattern_key: 'PRE-02-ROUGH-ZONE',
    activity: 'Drilling Operations',
    hazard: 'Pinch points & Stored Hydraulic Energy',
    barrier_failure: 'Inadequate exclusion zone',
    equipment: 'Iron Roughneck',
    location: 'Rig Floor 02',
    occurrence_count: 11,
    sif_count: 9,
    sif_association_rate: 81.8,
    risk_level: 'HIGH',
    trend: 'Increasing',
    affected_sites: ['Moran Drilling Field'],
    last_detected_at: '2026-11-19T10:00:00Z',
  },
  {
    id: 3,
    pattern_key: 'PRE-03-HEIGHT-TIEOFF',
    activity: 'Work at Height',
    hazard: 'Gravity / Height elevation',
    barrier_failure: 'Inadequate 100% tie-off',
    equipment: 'Derrick Mast / Monkey Board',
    location: 'Derrick Mast Platform 40ft',
    occurrence_count: 9,
    sif_count: 7,
    sif_association_rate: 77.8,
    risk_level: 'HIGH',
    trend: 'Stable',
    affected_sites: ['Digboi Oilfield'],
    last_detected_at: '2026-11-18T16:20:00Z',
  },
  {
    id: 4,
    pattern_key: 'PRE-04-LIFT-SLING',
    activity: 'Lifting & Rigging',
    hazard: 'Suspended Load Drop',
    barrier_failure: 'Damaged wire rope / sling',
    equipment: 'Hydraulic Mobile Crane',
    location: 'Crude Dispatch Manifold Area',
    occurrence_count: 8,
    sif_count: 5,
    sif_association_rate: 62.5,
    risk_level: 'MODERATE',
    trend: 'Decreasing',
    affected_sites: ['Naharkatiya Production Asset'],
    last_detected_at: '2026-11-17T11:45:00Z',
  },
];

export const MOCK_ALERTS: Alert[] = [
  {
    id: 1,
    alert_uid: 'ALT-CAM-2026-1148',
    title: 'CAMERA AI ALERT: Safety Helmet Not Detected at Gas Compression Bay 02',
    description: 'Automated Computer Vision surveillance detected field worker entering high-pressure compressor bay without industrial safety helmet.',
    priority: 'HIGH',
    status: 'OPEN',
    report_id: 3,
    site_name: 'Moran Gas Field',
    activity: 'Automated Visual Surveillance',
    hazard: 'PPE Violation',
    sif_probability: 0.89,
    assigned_to: 'R. K. Sharma (Lead HSE Officer)',
    created_at: '2026-11-22T01:06:00Z',
  },
  {
    id: 2,
    alert_uid: 'ALT-2026-1147',
    title: 'CRITICAL PRECURSOR: Energy Isolation Defect on Compressor #2',
    description: 'High-pressure bypass valve unisolated during mechanical seal maintenance. Potential gas release or uncommanded rotation.',
    priority: 'CRITICAL',
    status: 'OPEN',
    report_id: 1,
    site_name: 'Duliajan Central Field',
    activity: 'Maintenance',
    hazard: 'Stored Energy',
    sif_probability: 0.94,
    assigned_to: 'P. K. Baruah (Asset Site Manager)',
    created_at: '2026-11-20T15:15:00Z',
  },
  {
    id: 3,
    alert_uid: 'ALT-2026-1146',
    title: 'HIGH RISK: Uninspected Lifting Rigging on Moran Drilling Pad',
    description: 'Slings with missing load rating tags utilized during subsea blowout preventer transport test.',
    priority: 'HIGH',
    status: 'OPEN',
    report_id: 4,
    site_name: 'Moran Drilling Field',
    activity: 'Lifting & Rigging',
    hazard: 'Dropped Object',
    sif_probability: 0.78,
    assigned_to: 'Lead HSE Officer',
    created_at: '2026-11-18T18:00:00Z',
  },
];

export const MOCK_CAMERAS = [
  { id: 'CAM-01', name: 'Rig 04 Main Drill Floor', site: 'Duliajan Central Field', zone: 'High-Risk Drilling Zone' },
  { id: 'CAM-02', name: 'Compressor House Sector B', site: 'Moran Gas Field', zone: 'Gas Compression Bay 02' },
  { id: 'CAM-03', name: 'Wellhead Manifold Area', site: 'Digboi Oilfield', zone: 'Cellar Pit Zone 1' },
  { id: 'CAM-04', name: 'Refinery Maintenance Bay', site: 'Numaligarh Terminal', zone: 'Bay 3 Safe Workshop' },
];

export function mockEvaluateText(data: {
  raw_description?: string;
  site_name?: string;
  activity?: string;
  equipment?: string;
  location?: string;
  worker_role?: string;
  contractor_involved?: boolean;
}): ReportAnalysis {
  const text = (data.raw_description || '').toLowerCase();

  const isLoto = text.includes('loto') || text.includes('isolation') || text.includes('energized') || text.includes('lockout');
  const isHeight = text.includes('height') || text.includes('fall') || text.includes('harness') || text.includes('scaffold') || text.includes('mast');
  const isGas = text.includes('gas') || text.includes('h2s') || text.includes('leak') || text.includes('pressure') || text.includes('confined');
  const isLifting = text.includes('crane') || text.includes('lift') || text.includes('sling') || text.includes('rigging') || text.includes('suspended');
  const isLineOfFire = text.includes('rotating') || text.includes('coupling') || text.includes('pinch') || text.includes('line of fire') || isLoto;

  const isSif = isLoto || isHeight || isGas || text.includes('critical') || text.includes('fatal') || text.includes('severe');
  const sifProb = isSif ? 0.92 : 0.28;
  const riskScore = isSif ? 88.5 : 35.0;
  const riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = isSif ? 'CRITICAL' : 'MODERATE';

  const ruleSignals: any[] = [];
  if (isLoto) {
    ruleSignals.push({
      rule_code: 'LSR-01',
      rule_name: 'Energy Isolation (LOTO)',
      category: 'Electrical & Mechanical',
      icon: 'Zap',
      confidence: 0.94,
      matched_keywords: ['energized', 'lockout', 'isolation'],
      description: 'Zero energy state verification barrier bypassed.',
    });
  }
  if (isLineOfFire) {
    ruleSignals.push({
      rule_code: 'LSR-04',
      rule_name: 'Line of Fire Exposure',
      category: 'Mechanical',
      icon: 'Crosshair',
      confidence: 0.88,
      matched_keywords: ['rotating', 'equipment', 'proximity'],
      description: 'Worker positioned inside uncontrolled stored energy path.',
    });
  }
  if (isHeight) {
    ruleSignals.push({
      rule_code: 'LSR-02',
      rule_name: 'Work at Height',
      category: 'Fall Protection',
      icon: 'ArrowUp',
      confidence: 0.91,
      matched_keywords: ['height', 'fall protection'],
      description: 'Elevated work without confirmed 100% tie-off.',
    });
  }

  return {
    sif_prediction: isSif,
    sif_probability: sifProb,
    confidence: 0.93,
    risk_score: riskScore,
    risk_level: riskLevel,
    likelihood_score: isSif ? 4 : 2,
    severity_score: isSif ? 5 : 2,
    model_version: 'sif-sentinel-v1.5-calibrated',
    rule_signals: ruleSignals.length > 0 ? ruleSignals : [
      {
        rule_code: 'LSR-08',
        rule_name: 'Bypassing Safety Controls',
        category: 'Process Safety',
        icon: 'AlertTriangle',
        confidence: 0.72,
        matched_keywords: ['procedure', 'compliance'],
        description: 'Standard operational protocol deviation noted.',
      },
    ],
    entity_extraction: {
      activity: data.activity || (isLoto ? 'Equipment Overhaul & Maintenance' : 'Field Operations'),
      location: data.location || data.site_name || 'Duliajan Central Field',
      equipment: data.equipment || (isLoto ? 'Centrifugal Compressor Skid' : 'Drilling Rig Equipment'),
      hazards: isSif ? ['Stored Hazardous Energy', 'Rotating Machinery', 'Uncontrolled Line of Fire'] : ['Operational Hazard'],
      barrier_failures: isSif ? ['Lockout/Tagout isolation not verified', 'Exclusion perimeter breach'] : ['Administrative barrier'],
      potential_consequences: isSif ? ['High-velocity projectile impact', 'Crush injury / Severe Traumatic SIF'] : ['Minor laceration'],
      worker_role: data.worker_role || 'Mechanical Maintenance Lead',
      contractor_involved: Boolean(data.contractor_involved),
      shift: 'Morning',
      department: 'Drilling & Workover',
      highlight_spans: [
        { start: 0, end: Math.min(25, text.length), text: text.slice(0, 25), label: 'CRITICAL_HAZARD' },
      ],
    },
    explainability: {
      summary: isSif
        ? 'High SIF probability driven by presence of uncontrolled mechanical energy and absence of verified physical isolation barriers.'
        : 'Routine operational variance without uncontrolled catastrophic energy vectors.',
      risk_factors: [
        'Unverified energy barrier isolation',
        'Direct line-of-fire worker proximity',
        'Contractor personnel involved in complex maintenance',
      ],
      top_tokens: [
        { token: 'energized', weight: 0.054 },
        { token: 'rotating', weight: 0.048 },
        { token: 'lockout', weight: 0.045 },
        { token: 'compressor', weight: 0.038 },
      ],
      sif_probability: sifProb,
      is_sif: isSif,
      primary_barrier_impact: 'CRITICAL ISOLATION FAILURE',
      consequence_potential: ['Fatal crushing injury', 'High-pressure kinetic discharge'],
    },
    similar_reports: [
      {
        report_uid: 'OIL-2026-1042',
        date: '2026-11-20',
        site_name: 'Duliajan Central Field',
        activity: 'Centrifugal Compressor Maintenance',
        sif_potential: true,
        risk_score: 92.4,
        similarity: 0.94,
        raw_description: 'Contractor entered compressor skid while bypass line remained pressurized without LOTO locks.',
      },
      {
        report_uid: 'OIL-2026-1021',
        date: '2026-10-14',
        site_name: 'Moran Drilling Field',
        activity: 'Mud Pump Repair',
        sif_potential: true,
        risk_score: 87.1,
        similarity: 0.86,
        raw_description: 'Hydraulic accumulator discharged during valve pack replacement due to incomplete bleed-off.',
      },
    ],
  };
}

export function mockAssistantQuery(query: string) {
  const q = query.toLowerCase();
  let ans = '';
  let cited = ['OIL-2026-1042', 'OIL-2026-1041', 'OIL-CAM-2026-1353'];
  let actions = ['Review open critical alerts in Alert Center', 'Verify Life-Saving Rule LSR-01 isolations'];

  if (q.includes('duliajan') || q.includes('why')) {
    ans = 'Duliajan Central Field is currently ranked as the highest-risk asset with a SIF Precursor Density of 16.7% across 84 recorded reports. The primary recurring hazard vectors involve Energy Isolation failures on compressor skids (LSR-01) and Line-of-Fire exposures during pipe make-up on Rig 04 (LSR-04). Specifically, Report OIL-2026-1042 flagged an unverified 42-bar bypass line.';
    cited = ['OIL-2026-1042', 'OIL-2026-1033', 'OIL-2026-1019'];
    actions = ['Schedule immediate LOTO stand-down on Rig 04', 'Audit contractor isolation verification logs'];
  } else if (q.includes('precursor') || q.includes('common')) {
    ans = 'The top mined SIF precursor tuple across all Oil India Limited operations is: "Maintenance • Centrifugal Compressor • Rotating machinery • Lockout/Tagout not completed", which exhibits an 85.7% correlation with SIF outcomes across 14 documented occurrences. The second highest is "Drilling Operations • Iron Roughneck • Stored Hydraulic Energy • Inadequate exclusion zone" (81.8% SIF correlation).';
    cited = ['OIL-2026-1042', 'OIL-2026-1011', 'OIL-2026-0988'];
    actions = ['Deploy physical interlocks on compressor isolation valves', 'Review exclusion zone markings'];
  } else {
    ans = `Analysis of Oil India Limited safety intelligence database indicates 273 recorded observations with an overall SIF Precursor Rate of 13.9%. Current high-priority areas include Rig 04 at Duliajan and Compressor Bay 02 at Moran. Automated computer vision surveillance is active on CAM-01 and CAM-02.`;
  }

  return {
    answer: ans,
    cited_reports: cited,
    source_reports: cited,
    data_points: ['273 Observations', '38 SIF Precursors', '16.7% Density at Duliajan'],
    confidence: 0.94,
    suggested_actions: actions,
  };
}
