import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Wind, 
  Thermometer, 
  Activity, 
  FileText, 
  Monitor, 
  Bed, 
  Bell, 
  Search, 
  Shield, 
  AlertTriangle, 
  HelpCircle, 
  Settings, 
  RefreshCw 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  DEFAULT_RENDER_URL,
  getResolvedPiBaseUrl, 
  setRuntimePiBaseUrl,
  clearRuntimePiBaseUrl,
  sanitizeUrl,
  getLatestPredictions 
} from '../../services/api';
import { IncubatorDetailModal } from '../../components/Modals/IncubatorDetailModal';

export interface BabyData {
  id: string;
  bedId: string;
  bedNumber: number;
  name: string;
  age: string;
  weight: string;
  birthWeight: string;
  gestationalAge: string;
  admissionDate: string;
  status: 'SAFE' | 'WARNING' | 'UNSAFE' | 'OFFLINE';
  statusLabel: string;
  riskScore: number;
  confidence: number;
  motherName: string;
  maternalHistory: string;
  deliveryType: string;
  bloodGroup: string;
  apgarScore: string;
  feedingSchedule: string;
  medications: string;
  phototherapyStatus: string;
  abnormalFlags: {
    heartRate: boolean;
    spo2: boolean;
    temp: boolean;
    respRate: boolean;
    bp: boolean;
  };
  clinicalDecision?: {
    reason: string;
    recommendation: string;
    actionToBeTaken: string[];
  };
  vitals: {
    heartRate: number;
    spo2: number;
    respRate: number;
    temp: number;
    bp: number;
  };
  trends: {
    heartRate: { dir: 'up' | 'down' | 'stable'; label: string };
    spo2: { dir: 'up' | 'down' | 'stable'; label: string };
    respRate: { dir: 'up' | 'down' | 'stable'; label: string };
    temp: { dir: 'up' | 'down' | 'stable'; label: string };
    bp: { dir: 'up' | 'down' | 'stable'; label: string };
  };
  alertBanner: {
    title: string;
    text: string;
    statusBadge: string;
    time: string;
  };
  historyLogs: Array<{
    time: string;
    hr: number;
    spo2: number;
    resp: number;
    temp: number;
    bp: number;
    status: string;
  }>;
}

export const INITIAL_HARDWARE_BABIES: BabyData[] = [
  {
    id: "NICU_001",
    bedId: "NICU-001",
    bedNumber: 1,
    name: "Aarav Sharma",
    age: "3 days old",
    weight: "3.0 kg",
    birthWeight: "3.0 kg",
    gestationalAge: "38 weeks",
    admissionDate: "Jan 21, 2026",
    status: "WARNING",
    statusLabel: "STATUS: AT RISK (EDGE AI)",
    riskScore: 46,
    confidence: 54,
    motherName: "Priya Sharma",
    maternalHistory: "G1P1, 28 y/o, uncomplicated pregnancy, GBS negative, normotensive",
    deliveryType: "Normal Spontaneous Vaginal Delivery",
    bloodGroup: "O+ (Rh Positive)",
    apgarScore: "7.0 at 1 min, 9.0 at 5 min",
    feedingSchedule: "Expressed Breast Milk (45ml q3h)",
    medications: "Continuous cardio-respiratory observation, thermal regulation",
    phototherapyStatus: "Under review (TSB normal)",
    abnormalFlags: {
      heartRate: true,
      spo2: true,
      temp: true,
      respRate: true,
      bp: true
    },
    vitals: {
      heartRate: 181,
      spo2: 89,
      respRate: 69,
      temp: 38.9,
      bp: 64
    },
    trends: {
      heartRate: { dir: "up", label: "Tachycardic (181 BPM)" },
      spo2: { dir: "down", label: "Desaturation Dip (89%)" },
      respRate: { dir: "up", label: "Tachypneic (69 /min)" },
      temp: { dir: "up", label: "Hyperthermia (38.9 °C)" },
      bp: { dir: "up", label: "Elevated (64 mmHg)" }
    },
    alertBanner: {
      title: "Incubator NICU-001 Alert: Heart Rate: High ↑ • Oxygen Saturation: Low ↓ • Temperature: High ↑",
      text: "Patient: NICU-001 • Status: AT RISK (EDGE AI)",
      statusBadge: "WARNING",
      time: "09:20:15 PM"
    },
    clinicalDecision: {
      reason: "Heart Rate: High ↑ • Oxygen Saturation: Low ↓ • Temperature: High ↑ • Respiratory Rate: High ↑ • Systolic BP: High ↑ • Diastolic BP: High ↑",
      recommendation: "Check the incubator/radiant-warmer setting and environmental temperature. Reduce excessive external warming according to the NICU protocol. Look for other signs of illness/infection and notify the clinical team.",
      actionToBeTaken: [
        "Check the incubator/radiant-warmer setting and environmental temperature.",
        "Reduce excessive external warming according to the NICU protocol.",
        "Check oxygen-saturation sensor placement and respiratory distress signs.",
        "Recount breathing rate and observe for chest retractions or grunting.",
        "Repeat measurement and notify clinical neonatologist if vitals remain elevated."
      ]
    },
    historyLogs: [
      { time: "09:20 PM", hr: 181, spo2: 89, resp: 69, temp: 38.9, bp: 64, status: "Warning" },
      { time: "09:15 PM", hr: 178, spo2: 90, resp: 66, temp: 38.7, bp: 62, status: "Warning" },
      { time: "09:10 PM", hr: 174, spo2: 91, resp: 63, temp: 38.5, bp: 60, status: "Moderate" },
      { time: "09:05 PM", hr: 165, spo2: 92, resp: 58, temp: 38.1, bp: 55, status: "Moderate" }
    ]
  },
  {
    id: "NICU_002",
    bedId: "NICU-002",
    bedNumber: 2,
    name: "Kiara Patel",
    age: "5 days old",
    weight: "2.9 kg",
    birthWeight: "2.85 kg",
    gestationalAge: "37 weeks",
    admissionDate: "Jan 20, 2026",
    status: "WARNING",
    statusLabel: "STATUS: MODERATE WARNING",
    riskScore: 78,
    confidence: 93,
    motherName: "Neha Patel",
    maternalHistory: "G2P1, 32 y/o, history of gestational diabetes diet-controlled, repeat elective C-section",
    deliveryType: "Elective Lower Segment C-Section (37w)",
    bloodGroup: "A+ (Rh Positive)",
    apgarScore: "7 at 1 min, 9 at 5 min",
    feedingSchedule: "Donor Milk Fortified (35ml q3h via Paladai)",
    medications: "Vitamin K1 IM, Oral Vitamin D3 drops (400 IU), IV fluids at 4ml/hr",
    phototherapyStatus: "Prophylactic blue LED phototherapy under review (TSB 9.8 mg/dL)",
    abnormalFlags: {
      heartRate: true,
      spo2: true,
      temp: true,
      respRate: true,
      bp: true
    },
    vitals: {
      heartRate: 190,
      spo2: 82,
      respRate: 77,
      temp: 39.4,
      bp: 72
    },
    trends: {
      heartRate: { dir: "up", label: "Tachycardic (190 BPM)" },
      spo2: { dir: "down", label: "Critical Desat (82%)" },
      respRate: { dir: "up", label: "Tachypnea (77 /min)" },
      temp: { dir: "up", label: "High Pyrexia (39.4 °C)" },
      bp: { dir: "up", label: "Elevated BP (72 mmHg)" }
    },
    alertBanner: {
      title: "Incubator NICU-002 Alert: Tachycardia (190 BPM) & Desaturation (82%) with Hyperthermia (39.4°C)",
      text: "Patient: NICU-002 • Status: MODERATE CLINICAL WARNING",
      statusBadge: "WARNING",
      time: "09:18:42 PM"
    },
    clinicalDecision: {
      reason: "Marked tachycardia (>180 BPM), hypoxemia (SpO2 82%) and pyrexia indicate possible neonatal systemic stress or sepsis workup requirement.",
      recommendation: "Initiate immediate CPAP/oxygen support evaluation, draw blood cultures per protocol, and adjust servo-controlled incubator temperature.",
      actionToBeTaken: [
        "Immediate nasal cannula / CPAP oxygen check for desaturation recovery.",
        "Check skin probe attachment on abdominal wall; adjust warmer to 36.5°C servo target.",
        "Evaluate capillary refill time and initiate arterial blood gas (ABG) sampling.",
        "Notify senior neonatologist and prepare broad-spectrum antibiotic coverage if indicated."
      ]
    },
    historyLogs: [
      { time: "09:18 PM", hr: 190, spo2: 82, resp: 77, temp: 39.4, bp: 72, status: "Moderate" },
      { time: "09:12 PM", hr: 185, spo2: 85, resp: 72, temp: 39.1, bp: 70, status: "Moderate" },
      { time: "09:06 PM", hr: 178, spo2: 88, resp: 68, temp: 38.8, bp: 68, status: "Moderate" }
    ]
  },
  {
    id: "NICU_003",
    bedId: "NICU-003",
    bedNumber: 3,
    name: "Aditya Rao",
    age: "2 days old",
    weight: "3.1 kg",
    birthWeight: "3.05 kg",
    gestationalAge: "39 weeks",
    admissionDate: "Jan 22, 2026",
    status: "WARNING",
    statusLabel: "STATUS: MODERATE OBSERVATION",
    riskScore: 64,
    confidence: 89,
    motherName: "Ananya Rao",
    maternalHistory: "G1P0, 26 y/o, emergency C-section with PROM (>18h), intrapartum fever managed",
    deliveryType: "Emergency Lower Segment C-Section",
    bloodGroup: "B+ (Rh Positive)",
    apgarScore: "5 at 1 min, 7 at 5 min",
    feedingSchedule: "NPO / IV 10% Dextrose & Maintenance TPN (8ml/hr)",
    medications: "Caffeine Citrate 20mg/kg IV, Ampicillin & Gentamicin IV, D10W Infusion",
    phototherapyStatus: "Under review (TSB 8.4 mg/dL)",
    abnormalFlags: {
      heartRate: false,
      spo2: false,
      temp: false,
      respRate: false,
      bp: false
    },
    vitals: {
      heartRate: 149,
      spo2: 97,
      respRate: 42,
      temp: 37.0,
      bp: 51
    },
    trends: {
      heartRate: { dir: "stable", label: "Normal (149 BPM)" },
      spo2: { dir: "stable", label: "Optimal (97%)" },
      respRate: { dir: "stable", label: "Regular (42 /min)" },
      temp: { dir: "stable", label: "Euthermic (37.0 °C)" },
      bp: { dir: "stable", label: "Target (51 mmHg)" }
    },
    alertBanner: {
      title: "Incubator NICU-003: Post-op monitoring stable, antibiotic infusion cycle in progress.",
      text: "Patient: NICU-003 • Status: MODERATE OBSERVATION",
      statusBadge: "MODERATE",
      time: "09:22:38 PM"
    },
    clinicalDecision: {
      reason: "Post-operative stable profile following emergency C-section with prolonged rupture of membranes (>18h).",
      recommendation: "Continue prophylactic broad-spectrum IV antibiotic regimen; monitor serial inflammatory markers (CRP/CBC).",
      actionToBeTaken: [
        "Maintain IV infusion rate and track urine output (target > 2 ml/kg/hr).",
        "Perform scheduled 12-hour CRP and sepsis screen evaluation.",
        "Ensure quiet incubator environment to minimize stimulation.",
        "Review maternal blood cultures and adjust antibiotic sensitivity."
      ]
    },
    historyLogs: [
      { time: "09:22 PM", hr: 149, spo2: 97, resp: 42, temp: 37.0, bp: 51, status: "Moderate" },
      { time: "09:18 PM", hr: 151, spo2: 96, resp: 44, temp: 37.1, bp: 52, status: "Moderate" },
      { time: "09:14 PM", hr: 148, spo2: 97, resp: 41, temp: 37.0, bp: 50, status: "Moderate" }
    ]
  },
  {
    id: "NICU_004",
    bedId: "NICU-004",
    bedNumber: 4,
    name: "Riya Sen",
    age: "6 days old",
    weight: "3.4 kg",
    birthWeight: "3.3 kg",
    gestationalAge: "38 weeks",
    admissionDate: "Jan 19, 2026",
    status: "SAFE",
    statusLabel: "STATUS: MONITORING (OPTIMAL)",
    riskScore: 8,
    confidence: 98,
    motherName: "Sunita Sen",
    maternalHistory: "G3P2, 30 y/o, previous normal deliveries, negative serologies, uncomplicated course",
    deliveryType: "Normal Spontaneous Vaginal Delivery",
    bloodGroup: "AB+ (Rh Positive)",
    apgarScore: "9 at 1 min, 9 at 5 min",
    feedingSchedule: "Direct Breastfeeding on Demand + 50ml Top-up",
    medications: "Routine neonatal prophylaxis completed (Vitamin K1, BCG, OPV)",
    phototherapyStatus: "Not indicated (TSB 3.8 mg/dL)",
    abnormalFlags: {
      heartRate: false,
      spo2: false,
      temp: false,
      respRate: false,
      bp: false
    },
    vitals: {
      heartRate: 145,
      spo2: 98,
      respRate: 48,
      temp: 36.9,
      bp: 44
    },
    trends: {
      heartRate: { dir: "stable", label: "Stable (145 BPM)" },
      spo2: { dir: "stable", label: "Optimal (98%)" },
      respRate: { dir: "stable", label: "Regular (48 /min)" },
      temp: { dir: "stable", label: "Normal (36.9 °C)" },
      bp: { dir: "stable", label: "Normal (44 mmHg)" }
    },
    alertBanner: {
      title: "Incubator NICU-004: Kangaroo Mother Care completed, excellent perfusion.",
      text: "Patient: NICU-004 • Status: OPTIMAL",
      statusBadge: "OPTIMAL",
      time: "09:12:00 PM"
    },
    clinicalDecision: {
      reason: "All neonatal physiological markers within ideal gestational percentiles. No distress indicators.",
      recommendation: "Continue rooming-in preparation, supportive lactation counseling, and scheduled step-down evaluation.",
      actionToBeTaken: [
        "Continue demand breastfeeding schedule and daily weight assessment.",
        "Perform pre-discharge hearing screen and pulse oximetry screen.",
        "Provide maternal lactation and cord-care counseling.",
        "Finalize step-down to maternity ward transfer papers."
      ]
    },
    historyLogs: [
      { time: "09:12 PM", hr: 145, spo2: 98, resp: 48, temp: 36.9, bp: 44, status: "Normal" },
      { time: "09:00 PM", hr: 144, spo2: 99, resp: 47, temp: 36.9, bp: 43, status: "Normal" }
    ]
  },
  {
    id: "NICU_005",
    bedId: "NICU-005",
    bedNumber: 5,
    name: "Vivaan Kapoor",
    age: "4 days old",
    weight: "2.7 kg",
    birthWeight: "2.65 kg",
    gestationalAge: "36 weeks",
    admissionDate: "Jan 21, 2026",
    status: "SAFE",
    statusLabel: "STATUS: ACTIVE MONITORING",
    riskScore: 22,
    confidence: 93,
    motherName: "Kavita Kapoor",
    maternalHistory: "G2P1, 29 y/o, mild PIH managed with Labetalol, delivered late preterm",
    deliveryType: "Late Preterm Normal Delivery (36w)",
    bloodGroup: "O- (Rh Negative)",
    apgarScore: "8 at 1 min, 9 at 5 min",
    feedingSchedule: "Expressed Breast Milk via Gavage Tube (35ml q3h)",
    medications: "Elemental Iron drops (2mg/kg), Multivitamin pediatric drops",
    phototherapyStatus: "Single-surface LED phototherapy completed (TSB 7.1 mg/dL)",
    abnormalFlags: {
      heartRate: false,
      spo2: false,
      temp: false,
      respRate: false,
      bp: false
    },
    vitals: {
      heartRate: 144,
      spo2: 98,
      respRate: 52,
      temp: 37.1,
      bp: 39
    },
    trends: {
      heartRate: { dir: "stable", label: "Stable (144 BPM)" },
      spo2: { dir: "stable", label: "Optimal (98%)" },
      respRate: { dir: "stable", label: "Regular (52 /min)" },
      temp: { dir: "stable", label: "Normal (37.1 °C)" },
      bp: { dir: "stable", label: "Target (39 mmHg)" }
    },
    alertBanner: {
      title: "Incubator NICU-005: Bio-Acoustic classifier identified hunger cry reflex.",
      text: "Patient: NICU-005 • Status: ACTIVE",
      statusBadge: "ACTIVE",
      time: "09:08:14 PM"
    },
    clinicalDecision: {
      reason: "Late preterm infant transitioning well from gavage feeding to bottle/breast feeds.",
      recommendation: "Maintain thermal neutral environment in incubator; advance gavage feeding volume by 5ml/feed daily as tolerated.",
      actionToBeTaken: [
        "Assess oral feeding cues prior to scheduled gavage tube feeds.",
        "Monitor pre-feed gastric residuals and abdominal girth.",
        "Maintain incubator air temp at 31.5°C to conserve caloric expenditure.",
        "Repeat transcutaneous bilirubin (TcB) check in 24 hours."
      ]
    },
    historyLogs: [
      { time: "09:08 PM", hr: 144, spo2: 98, resp: 52, temp: 37.1, bp: 39, status: "Normal" },
      { time: "08:55 PM", hr: 142, spo2: 98, resp: 46, temp: 37.0, bp: 40, status: "Normal" }
    ]
  }
];

const generateWaveforms = () => Array.from({ length: 30 }, (_, i) => ({
  time: i,
  heartRate: 150 + Math.sin(i * 0.3) * 6,
  spo2: 92 + Math.cos(i * 0.2) * 1.5,
  respRate: 53 + Math.sin(i * 0.4) * 4,
  bp: 34 + Math.cos(i * 0.3) * 2
}));

function matchesBaby(b: BabyData, targetId: string): boolean {
  if (!targetId) return false;
  const cleanTarget = String(targetId).toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanId = b.id.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanBed = b.bedId.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (cleanId === cleanTarget || cleanBed === cleanTarget) return true;
  const targetNum = String(targetId).match(/\d+/)?.[0];
  const bNum = b.id.match(/\d+/)?.[0] || b.bedId.match(/\d+/)?.[0];
  if (targetNum && bNum && parseInt(targetNum, 10) === parseInt(bNum, 10)) return true;
  return false;
}

export function PatientHardwareDashboard() {
  const [selectedBabyId, setSelectedBabyId] = useState<string>("NICU_001");
  const [babies, setBabies] = useState<BabyData[]>(INITIAL_HARDWARE_BABIES);
  const [waveformData, setWaveformData] = useState(generateWaveforms());
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalBaby, setModalBaby] = useState<BabyData | null>(null);

  // Configurable Edge AI / Render Cloud Connection State
  const [piBaseUrl, setPiBaseUrl] = useState<string>(getResolvedPiBaseUrl());
  const [connectionStatus, setConnectionStatus] = useState<'CONNECTED' | 'CONNECTING' | 'EDGE SERVER OFFLINE'>('CONNECTING');
  const [lastFetchTime, setLastFetchTime] = useState<string>('');
  const [showIpModal, setShowIpModal] = useState<boolean>(false);
  const [customIpInput, setCustomIpInput] = useState<string>(piBaseUrl);
  const [isManualFetching, setIsManualFetching] = useState<boolean>(false);

  // Real-time Low-Latency Streaming State
  const [pollingSpeed, setPollingSpeed] = useState<number>(400); // 400ms = instant continuous, 800ms = fast, 1500ms = standard
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [packetAgeSec, setPacketAgeSec] = useState<number | null>(null);
  const [isPulsing, setIsPulsing] = useState<boolean>(false);

  const togglePollingSpeed = () => {
    setPollingSpeed(current => {
      if (current === 400) return 800;
      if (current === 800) return 1500;
      return 400;
    });
  };

  const isRenderUrl = piBaseUrl.includes('onrender.com');

  const switchToRender = () => {
    clearRuntimePiBaseUrl();
    setRuntimePiBaseUrl(DEFAULT_RENDER_URL);
    setPiBaseUrl(DEFAULT_RENDER_URL);
    setCustomIpInput(DEFAULT_RENDER_URL);
    setConnectionStatus('CONNECTING');
    if (typeof window !== 'undefined' && window.location?.search) {
      const url = new URL(window.location.href);
      url.searchParams.delete('pi_url');
      url.searchParams.delete('pi');
      url.searchParams.delete('api_url');
      url.searchParams.delete('url');
      window.history.replaceState({}, document.title, url.pathname + (url.search ? url.search : ''));
    }
  };

  const applyTelemetry = (payload: any, latency?: number) => {
    const nowStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    setLastFetchTime(nowStr);
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 250);

    let rawResults: any[] = [];
    if (Array.isArray(payload.results)) {
      rawResults = payload.results;
    } else if (Array.isArray(payload)) {
      rawResults = payload;
    } else if (payload.result && typeof payload.result === 'object') {
      rawResults = [payload.result];
    } else if (payload.baby_id || payload.id || payload.vitals) {
      rawResults = [payload];
    }

    if (rawResults.length > 0) {
      const match = rawResults[0];
      if (match.timestamp) {
        const serverTime = new Date(match.timestamp).getTime();
        if (!isNaN(serverTime)) {
          const age = Math.max(0, (Date.now() - serverTime) / 1000);
          setPacketAgeSec(Number(age.toFixed(1)));
        }
      }

      const v = match.vitals || match.telemetry || {};

      const hr = Number(v.heart_rate_bpm ?? v.heart_rate ?? v.heartRate ?? v.hr ?? 181);
      const spo2 = Number(v.oxygen_saturation ?? v.spo2 ?? v.spO2 ?? v.oxygen ?? 89);
      const resp = Number(v.respiratory_rate_bpm ?? v.respiratory_rate ?? v.respRate ?? v.resp_rate ?? v.rr ?? 69);
      const temp = Number(v.temperature_c ?? v.temperature ?? v.temp ?? v.skin_temp ?? 38.9);

      let bp = 64;
      if (v.diastolic_bp !== undefined && v.systolic_bp !== undefined) {
        bp = Math.round(Number(v.diastolic_bp) + (Number(v.systolic_bp) - Number(v.diastolic_bp)) / 3);
      } else if (v.blood_pressure ?? v.bp ?? v.mean_bp) {
        bp = Number(v.blood_pressure ?? v.bp ?? v.mean_bp);
      }

      const rawStatus = String(match.status || match.prediction || match.predicted_label || '').toUpperCase();
      let status: 'SAFE' | 'WARNING' | 'UNSAFE' = 'WARNING';
      let statusLabel = 'STATUS: AT RISK (EDGE AI)';
      if (rawStatus === 'CRITICAL' || rawStatus === 'UNSAFE' || rawStatus === 'HIGH_RISK') {
        status = 'UNSAFE';
        statusLabel = 'STATUS: CRITICAL ALERT';
      } else if (rawStatus === 'AT_RISK' || rawStatus === 'WARNING' || rawStatus === 'MODERATE' || rawStatus === 'RISK') {
        status = 'WARNING';
        statusLabel = rawStatus === 'MODERATE' ? 'STATUS: AT RISK (MODERATE)' : 'STATUS: AT RISK (EDGE AI)';
      } else {
        status = 'SAFE';
        statusLabel = 'STATUS: MONITORING (OPTIMAL)';
      }

      let riskScore = 46;
      if (typeof match.at_risk_probability === 'number') {
        riskScore = Math.round(match.at_risk_probability <= 1.0 ? match.at_risk_probability * 100 : match.at_risk_probability);
      } else if (typeof match.prediction_score === 'number') {
        riskScore = Math.round(match.prediction_score <= 1.0 ? match.prediction_score * 100 : match.prediction_score);
      } else if (typeof match.risk_score === 'number' || typeof match.riskScore === 'number') {
        riskScore = Math.round(match.risk_score ?? match.riskScore);
      }

      let confidence = 54;
      if (typeof match.confidence === 'number') {
        confidence = Math.round(match.confidence <= 1.0 ? match.confidence * 100 : match.confidence);
      } else if (typeof match.normal_probability === 'number' && typeof match.at_risk_probability === 'number') {
        confidence = Math.round(Math.max(match.normal_probability, match.at_risk_probability) * 100);
      }

      let reason = '';
      if (Array.isArray(match.reasons) && match.reasons.length > 0) {
        reason = match.reasons.join(' • ');
      } else if (typeof match.reason === 'string') {
        reason = match.reason;
      } else {
        reason = `Vital signs: HR ${hr} BPM, SpO₂ ${spo2}%, RR ${resp} /min, Temp ${temp} °C`;
      }

      let recommendation = '';
      if (typeof match.recommendation === 'string' && match.recommendation.trim().length > 0) {
        recommendation = match.recommendation;
      } else if (Array.isArray(match.possible_conditions) && match.possible_conditions.length > 0) {
        recommendation = `Indicators flagged: ${match.possible_conditions.join(', ')}`;
      } else {
        recommendation = 'Check the incubator setting and environmental temperature per NICU protocol.';
      }

      let actionToBeTaken: string[] = [];
      if (Array.isArray(match.recommended_actions) && match.recommended_actions.length > 0) {
        actionToBeTaken = match.recommended_actions.flatMap((act: string) => act.split('\n').filter((s: string) => s.trim().length > 0));
      } else if (Array.isArray(match.actionToBeTaken) && match.actionToBeTaken.length > 0) {
        actionToBeTaken = match.actionToBeTaken;
      } else {
        actionToBeTaken = [
          'Check incubator / radiant-warmer settings.',
          'Check oxygen-saturation sensor placement.',
          'Notify neonatal care team if parameters remain outside normal limits.'
        ];
      }

      const updatedVitals = { heartRate: hr, spo2, respRate: resp, temp, bp };

      const trends = {
        heartRate: {
          dir: hr > 160 ? ('up' as const) : (hr < 110 ? ('down' as const) : ('stable' as const)),
          label: hr > 160 ? `Tachycardic (${hr} BPM)` : (hr < 110 ? `Bradycardic (${hr} BPM)` : `Normal (${hr} BPM)`)
        },
        spo2: {
          dir: spo2 < 93 ? ('down' as const) : ('stable' as const),
          label: spo2 < 93 ? `Desaturation Dip (${spo2}%)` : `Optimal (${spo2}%)`
        },
        respRate: {
          dir: resp > 60 ? ('up' as const) : (resp < 30 ? ('down' as const) : ('stable' as const)),
          label: resp > 60 ? `Tachypnea (${resp} /min)` : (resp < 30 ? `Bradypnea (${resp} /min)` : `Regular (${resp} /min)`)
        },
        temp: {
          dir: temp > 37.5 ? ('up' as const) : (temp < 36.5 ? ('down' as const) : ('stable' as const)),
          label: temp > 37.5 ? `Hyperthermia (${temp.toFixed(1)} °C)` : (temp < 36.5 ? `Hypothermia (${temp.toFixed(1)} °C)` : `Normothermic (${temp.toFixed(1)} °C)`)
        },
        bp: {
          dir: bp < 35 ? ('down' as const) : (bp > 55 ? ('up' as const) : ('stable' as const)),
          label: bp > 55 ? `Elevated (${bp} mmHg)` : (bp < 35 ? `Borderline (${bp} mmHg)` : `Target (${bp} mmHg)`)
        }
      };

      setBabies(prevBabies => {
        const serverTargetId = match.baby_id || match.id;
        return prevBabies.map(baby => {
          // Only update the baby that actually matches the telemetry packet from the edge/cloud
          const isTarget = serverTargetId 
            ? matchesBaby(baby, serverTargetId)
            : (baby.id === "NICU_001" || baby.bedId === "NICU-001");

          if (!isTarget) {
            return baby;
          }

          const lastLog = baby.historyLogs?.[0];
          const vitalsChanged = !lastLog ||
            Math.abs(lastLog.hr - hr) >= 1 ||
            Math.abs(lastLog.spo2 - spo2) >= 0.5 ||
            Math.abs(lastLog.resp - resp) >= 1 ||
            Math.abs(lastLog.temp - temp) >= 0.1 ||
            Math.abs(lastLog.bp - bp) >= 1;

          const updatedLogs = vitalsChanged
            ? [
                {
                  time: nowStr.replace(/:\d{2}\s/, ' '),
                  hr: Math.round(hr),
                  spo2: Math.round(spo2),
                  resp: Math.round(resp),
                  temp: Number(temp.toFixed(1)),
                  bp: Math.round(bp),
                  status: status === 'UNSAFE' ? 'Critical' : (status === 'WARNING' ? 'Warning' : 'Normal')
                },
                ...(baby.historyLogs || []).slice(0, 9)
              ]
            : (baby.historyLogs || []);

          return {
            ...baby,
            weight: v.weight_kg ? `${Number(v.weight_kg).toFixed(1)} kg` : baby.weight,
            apgarScore: v.apgar_score !== undefined ? `${v.apgar_score} at 1 min` : baby.apgarScore,
            status,
            statusLabel,
            riskScore,
            confidence,
            vitals: updatedVitals,
            abnormalFlags: {
              heartRate: hr > 160 || hr < 100,
              spo2: spo2 < 93,
              temp: temp > 37.5 || temp < 36.5,
              respRate: resp > 60 || resp < 30,
              bp: bp < 35 || bp > 55
            },
            trends,
            alertBanner: {
              title: `Incubator ${baby.bedId} Alert: ${reason}`,
              text: `Patient: ${baby.bedId} • Status: ${status === 'UNSAFE' ? 'CRITICAL' : (status === 'WARNING' ? 'AT RISK' : 'OPTIMAL')}`,
              statusBadge: status === 'UNSAFE' ? 'CRITICAL' : (status === 'WARNING' ? 'WARNING' : 'NORMAL'),
              time: nowStr
            },
            clinicalDecision: {
              reason,
              recommendation,
              actionToBeTaken
            },
            historyLogs: updatedLogs
          };
        });
      });
    }
  };

  // High-frequency continuous waveform generator (150ms real-time stream)
  useEffect(() => {
    const waveInterval = setInterval(() => {
      setWaveformData(prev => {
        const last = prev[prev.length - 1];
        const nextTime = (last?.time ?? 0) + 1;
        const active = babies.find(b => b.id === selectedBabyId) || babies[0];
        const v = active.vitals;

        // Realistic neonatal physiological oscillations synchronized to live vitals
        const hrPhase = nextTime * 0.45;
        const spo2Phase = nextTime * 0.22;
        const respPhase = nextTime * 0.32;

        const hrOsc = Math.sin(hrPhase) * 2.2 + (Math.sin(hrPhase * 2.8) > 0.65 ? 3.5 : 0);
        const spo2Osc = Math.cos(spo2Phase) * 0.4;
        const respOsc = Math.sin(respPhase) * 1.8;
        const bpOsc = Math.cos(nextTime * 0.28) * 1.2;

        const newPoint = {
          time: nextTime,
          heartRate: Math.round(v.heartRate + hrOsc),
          spo2: Math.min(100, Math.max(70, Number((v.spo2 + spo2Osc).toFixed(1)))),
          respRate: Math.round(Math.max(10, v.respRate + respOsc)),
          bp: Math.round(v.bp + bpOsc)
        };
        return [...prev.slice(-34), newPoint];
      });
    }, 150);

    return () => clearInterval(waveInterval);
  }, [selectedBabyId, babies]);

  const triggerManualFetch = async () => {
    setIsManualFetching(true);
    try {
      const response = await getLatestPredictions(piBaseUrl, selectedBabyId, 2500);
      if (response.ok && response.data) {
        setConnectionStatus('CONNECTED');
        if (response.latencyMs) setLatencyMs(response.latencyMs);
        applyTelemetry(response.data, response.latencyMs);
      } else {
        setConnectionStatus('EDGE SERVER OFFLINE');
      }
    } catch {
      setConnectionStatus('EDGE SERVER OFFLINE');
    } finally {
      setIsManualFetching(false);
    }
  };

  // Live Auto-Polling Loop
  useEffect(() => {
    let isMounted = true;
    let timerId: any = null;
    let failCount = 0;

    const poll = async () => {
      if (!isMounted) return;
      try {
        const start = performance.now();
        const response = await getLatestPredictions(piBaseUrl, selectedBabyId, 3000);
        const roundTrip = Math.round(performance.now() - start);

        if (!isMounted) return;

        if (response.ok && response.data) {
          failCount = 0;
          setConnectionStatus('CONNECTED');
          setLatencyMs(response.latencyMs || roundTrip);
          applyTelemetry(response.data, response.latencyMs || roundTrip);
        } else {
          failCount++;
          if (failCount >= 3 && !piBaseUrl.includes('onrender.com')) {
            console.warn('[NAVAAYU Polling] Custom target failed. Auto-switching to Render Cloud.');
            switchToRender();
            return;
          }
          setConnectionStatus('EDGE SERVER OFFLINE');
        }
      } catch (err) {
        if (!isMounted) return;
        failCount++;
        if (failCount >= 3 && !piBaseUrl.includes('onrender.com')) {
          console.warn('[NAVAAYU Polling] Custom target error. Auto-switching to Render Cloud.');
          switchToRender();
          return;
        }
        setConnectionStatus('EDGE SERVER OFFLINE');
      } finally {
        if (isMounted) {
          timerId = setTimeout(poll, pollingSpeed);
        }
      }
    };

    poll();

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [piBaseUrl, selectedBabyId, pollingSpeed]);

  const activeBaby = babies.find(b => b.id === selectedBabyId) || babies[0];
  const totalBeds = babies.length;
  const moderateCases = babies.filter(b => b.status === 'WARNING').length;
  const criticalCases = babies.filter(b => b.status === 'UNSAFE').length;

  return (
    <div>
      {/* HARDWARE INTEGRATION STATUS & CONTROL HUD */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid var(--akesis-border)", padding: "10px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: '#ECFEFF', borderRadius: '8px', border: '1px solid #CFFAFE' }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#0284C7" }} className="pulse-dot" />
              <span style={{ fontSize: "12px", fontWeight: 900, color: "#0369A1" }}>PATIENT HARDWARE STREAM</span>
            </div>
            <span style={{ fontSize: "11px", color: "var(--akesis-text-muted)", fontWeight: 700 }}>Raspberry Pi 5 Edge AI (FastAPI :8000)</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {/* Live Status Indicator */}
            {connectionStatus === 'CONNECTED' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: '#F0FDF4', borderRadius: '20px', border: '1px solid #DCFCE7', fontSize: '11px', fontWeight: 800, color: '#15803D' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px rgba(34,197,94,0.6)' }} />
                LIVE TELEMETRY
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: '#FEF2F2', borderRadius: '20px', border: '1px solid #FEE2E2', fontSize: '11px', fontWeight: 800, color: '#DC2626' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#EF4444' }} />
                {connectionStatus === 'CONNECTING' ? 'CONNECTING...' : 'SERVER OFFLINE'}
              </div>
            )}

            {/* Raspberry Pi Edge AI / Render Cloud Connection Badge */}
            <button 
              onClick={() => { setCustomIpInput(piBaseUrl); setShowIpModal(true); }}
              title={`Telemetry endpoint: ${piBaseUrl} • Click to configure`}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                padding: '5px 12px', 
                background: connectionStatus === 'CONNECTED' ? '#F0FDF4' : '#FFFBEB', 
                borderRadius: '20px', 
                border: connectionStatus === 'CONNECTED' ? '1px solid #DCFCE7' : '1px solid #FEF3C7', 
                fontSize: '11px', 
                fontWeight: 800, 
                color: connectionStatus === 'CONNECTED' ? '#15803D' : '#B45309', 
                cursor: 'pointer' 
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: connectionStatus === 'CONNECTED' ? '#22C55E' : '#F59E0B' }} />
              {isRenderUrl ? 'RENDER CLOUD (LIVE)' : 'EDGE SERVER'}
            </button>

            {/* Real-time Streaming Speed Toggle */}
            <button 
              onClick={togglePollingSpeed}
              title={`Continuous telemetry rate: ${pollingSpeed}ms. Click to toggle between 400ms (Instant), 800ms (Fast), and 1500ms (Standard).`}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '5px', 
                padding: '5px 12px', 
                background: pollingSpeed <= 500 ? '#ECFDF5' : '#F8FAFC', 
                borderRadius: '20px', 
                border: pollingSpeed <= 500 ? '1.5px solid #10B981' : '1px solid var(--akesis-border)', 
                fontSize: '11px', 
                fontWeight: 800, 
                color: pollingSpeed <= 500 ? '#065F46' : 'var(--akesis-text-main)', 
                cursor: 'pointer' 
              }}
            >
              <Activity size={12} color={pollingSpeed <= 500 ? '#059669' : '#64748B'} className={pollingSpeed <= 500 ? 'pulse-dot' : ''} />
              <span>{pollingSpeed <= 500 ? '⚡ INSTANT' : (pollingSpeed <= 1000 ? '🩺 FAST' : '⏱️ NORMAL')}</span>
              <span style={{ fontSize: '10px', opacity: 0.8 }}>({pollingSpeed}ms)</span>
            </button>

            {/* Sync & Real-time Metrics Badge */}
            {lastFetchTime && (
              <div 
                className={isPulsing ? 'stream-pulse' : ''}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  padding: '5px 12px', 
                  background: '#F0FDFA', 
                  borderRadius: '20px', 
                  border: '1px solid #CCFBF1', 
                  fontSize: '11px', 
                  fontWeight: 800, 
                  color: '#0F766E' 
                }}
              >
                <span className="pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0D9488' }} />
                <span>SYNC: {lastFetchTime}</span>
                {latencyMs !== null && (
                  <span style={{ color: '#0369A1', background: '#E0F2FE', padding: '1px 5px', borderRadius: '8px', fontSize: '10px' }}>
                    {latencyMs}ms
                  </span>
                )}
                {packetAgeSec !== null && packetAgeSec < 5 && (
                  <span style={{ color: '#15803D', background: '#DCFCE7', padding: '1px 5px', borderRadius: '8px', fontSize: '10px' }}>
                    LIVE
                  </span>
                )}
              </div>
            )}

            {/* Manual Refresh Button */}
            <button 
              onClick={triggerManualFetch}
              title="Fetch latest data from server now"
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', background: '#FFFFFF', borderRadius: '20px', border: '1px solid var(--akesis-border)', fontSize: '11px', fontWeight: 800, color: 'var(--akesis-text-main)', cursor: 'pointer' }}
            >
              <RefreshCw size={12} className={isManualFetching ? 'spin-anim' : ''} color="#0E7490" />
              {isManualFetching ? 'FETCHING...' : 'REFRESH'}
            </button>

            {/* Quick Switcher if not on Render Cloud or if offline */}
            {(!isRenderUrl || connectionStatus === 'EDGE SERVER OFFLINE') && (
              <button 
                onClick={switchToRender}
                title="Switch to continuous streaming from Render Cloud (pc-2-hardware.onrender.com)"
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', background: '#0E7490', color: '#FFFFFF', borderRadius: '20px', border: 'none', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
              >
                ☁️ Connect Render Cloud
              </button>
            )}

            {/* Configurable IP Badge / Button */}
            <button 
              onClick={() => { setCustomIpInput(piBaseUrl); setShowIpModal(true); }}
              title="Configure Server API URL"
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', background: '#FFFFFF', borderRadius: '20px', border: '1px solid var(--akesis-border)', fontSize: '11px', fontWeight: 800, color: 'var(--akesis-text-main)', cursor: 'pointer' }}
            >
              <Settings size={12} color="#0E7490" />
              API: {piBaseUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '')}
            </button>
          </div>
        </div>
      </div>

      {/* MAIN HARDWARE TELEMETRY AREA (SINGLE BABY DEDICATED MONITOR) */}
      <main style={{ maxWidth: '1600px', margin: '14px auto 0', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* MAIN DASHBOARD TWO-COLUMN SECTION (EXACT SINGLE BABY TELEMETRY & CLINICAL SUITE) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.22fr 1fr', gap: '12px', alignItems: 'start' }}>
          
          {/* LEFT COLUMN: Bed Header, 5 Vitals Cards, and Live Vital Trends Area Chart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Bed Header & Vitals Grid Card */}
            <div className="akesis-card" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '22px', fontWeight: 900, color: 'var(--akesis-text-main)', letterSpacing: '-0.3px' }}>
                      Bed: {activeBaby.bedId}
                    </span>

                    <span style={{ 
                      padding: '3px 9px', 
                      borderRadius: '10px', 
                      background: '#ECFEFF', 
                      border: '1px solid #CFFAFE', 
                      fontSize: '11px', 
                      fontWeight: 800, 
                      color: '#0891B2' 
                    }}>
                      Single Bed Monitor (Active)
                    </span>
                  </div>

                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--akesis-text-muted)', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    AGE: {activeBaby.age} • WEIGHT: {activeBaby.weight} • GESTATION: {activeBaby.gestationalAge}
                  </div>
                </div>

                {/* Status Badge on Right */}
                <div style={{ 
                  padding: '6px 14px', 
                  borderRadius: '8px', 
                  fontSize: '11px', 
                  fontWeight: 900, 
                  background: activeBaby.status === 'WARNING' ? '#D97706' : (activeBaby.status === 'UNSAFE' ? '#DC2626' : '#16A34A'), 
                  color: 'white',
                  letterSpacing: '0.4px'
                }}>
                  {activeBaby.statusLabel}
                </div>
              </div>

              {/* Vitals Grid (2 Columns, 5 cards) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                
                {/* 1. HEART RATE */}
                <div className="vital-box">
                  <div className="vital-box-title">
                    <Heart size={13} color="#EF4444" /> HEART RATE
                  </div>
                  <div className="vital-box-value" style={{ color: (activeBaby.vitals.heartRate > 160 || activeBaby.vitals.heartRate < 100) ? '#DC2626' : 'var(--akesis-text-main)' }}>
                    {activeBaby.vitals.heartRate} <span className="vital-box-unit">BPM</span>
                  </div>
                  <div className="vital-box-normal">
                    {activeBaby.vitals.heartRate > 160 ? 'Normal: 110-160 BPM • Tachycardia' : (activeBaby.vitals.heartRate < 100 ? 'Normal: 110-160 BPM • Bradycardia' : 'Normal: 110-160 BPM')}
                  </div>
                </div>

                {/* 2. OXYGEN SATURATION */}
                <div className="vital-box">
                  <div className="vital-box-title">
                    <Activity size={13} color="#0D9488" /> OXYGEN SATURATION (SpO₂)
                  </div>
                  <div className="vital-box-value" style={{ color: activeBaby.vitals.spo2 < 93 ? '#DC2626' : 'var(--akesis-text-main)' }}>
                    {activeBaby.vitals.spo2} <span className="vital-box-unit">%</span>
                  </div>
                  <div className="vital-box-normal">
                    {activeBaby.vitals.spo2 < 93 ? 'Normal: 92-98% • Desaturation Dip' : 'Normal: 92-98% (Term Target)'}
                  </div>
                </div>

                {/* 3. RESPIRATORY RATE */}
                <div className="vital-box">
                  <div className="vital-box-title">
                    <Wind size={13} color="#EF4444" /> RESPIRATORY RATE
                  </div>
                  <div className="vital-box-value" style={{ color: (activeBaby.vitals.respRate > 60 || activeBaby.vitals.respRate < 30) ? '#DC2626' : 'var(--akesis-text-main)' }}>
                    {activeBaby.vitals.respRate} <span className="vital-box-unit">/min</span>
                  </div>
                  <div className="vital-box-normal">
                    {activeBaby.vitals.respRate > 60 ? 'Normal: 30-60 /min • Tachypnea' : (activeBaby.vitals.respRate < 30 ? 'Normal: 30-60 /min • Bradypnea' : 'Normal: 30-60 /min')}
                  </div>
                </div>

                {/* 4. SKIN TEMPERATURE */}
                <div className="vital-box">
                  <div className="vital-box-title">
                    <Thermometer size={13} color="#EF4444" /> SKIN TEMPERATURE
                  </div>
                  <div className="vital-box-value" style={{ color: (activeBaby.vitals.temp > 37.5 || activeBaby.vitals.temp < 36.5) ? '#DC2626' : 'var(--akesis-text-main)' }}>
                    {activeBaby.vitals.temp} <span className="vital-box-unit">°C</span>
                  </div>
                  <div className="vital-box-normal">
                    {activeBaby.vitals.temp > 37.5 ? 'Normal: 36.5-37.5 °C • Hyperthermia' : (activeBaby.vitals.temp < 36.5 ? 'Normal: 36.5-37.5 °C • Hypothermia' : 'Normal: 36.5-37.5 °C')}
                  </div>
                </div>

                {/* 5. BLOOD PRESSURE (Mean BP) */}
                <div className="vital-box" style={{ gridColumn: 'span 2' }}>
                  <div className="vital-box-title">
                    <span style={{ color: '#DC2626' }}>🩸</span> BLOOD PRESSURE (Mean BP)
                  </div>
                  <div className="vital-box-value" style={{ color: (activeBaby.vitals.bp < 35 || activeBaby.vitals.bp > 55) ? '#DC2626' : 'var(--akesis-text-main)' }}>
                    {activeBaby.vitals.bp} <span className="vital-box-unit">mmHg</span>
                  </div>
                  <div className="vital-box-normal">
                    {activeBaby.vitals.bp > 55 ? 'Normal Target: 35-55 mmHg • Elevated' : (activeBaby.vitals.bp < 35 ? 'Normal Target: 35-55 mmHg • Hypotension' : 'Normal Target: 35-55 mmHg')}
                  </div>
                </div>

              </div>
            </div>

            {/* LIVE VITAL TRENDS */}
            <div className="akesis-card" style={{ padding: '14px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 900, color: 'var(--akesis-text-main)', margin: 0 }}>
                  Live Vital Trends
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669' }}>
                    Continuous Stream (150ms)
                  </span>
                </div>
              </div>

              <div style={{ height: '140px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={waveformData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2EFE6" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid var(--akesis-border)', padding: '6px 10px', fontSize: '11px' }} />
                    <Area type="monotone" dataKey="heartRate" name="Heart Rate (BPM)" stroke="#EF4444" fill="rgba(239, 68, 68, 0.1)" strokeWidth={2} isAnimationActive={false} />
                    <Area type="monotone" dataKey="spo2" name="Oxygen (SpO₂ %)" stroke="#0D9488" fill="rgba(13, 148, 136, 0.1)" strokeWidth={2} isAnimationActive={false} />
                    <Area type="monotone" dataKey="respRate" name="Resp Rate (/min)" stroke="#3B82F6" fill="transparent" strokeWidth={1.5} strokeDasharray="3 3" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: AI Risk Assessment, Clinical Alerts & Patient Medical History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            {/* 1. AI RISK ASSESSMENT CARD */}
            <div className="akesis-card" style={{ padding: '12px 16px', borderLeft: '4px solid #F59E0B' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.6px', color: 'var(--akesis-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                AI RISK ASSESSMENT
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--akesis-text-muted)', textTransform: 'uppercase' }}>
                    CURRENT STATUS
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#D97706', marginTop: '1px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    🟡 {activeBaby.status}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--akesis-text-muted)', textTransform: 'uppercase' }}>
                    RISK SCORE
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: '#D97706', lineHeight: 1 }}>
                    {activeBaby.riskScore}%
                  </div>
                </div>
              </div>

              <div style={{ padding: '6px 10px', background: '#F8FDF9', borderRadius: '8px', border: '1px solid var(--akesis-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--akesis-text-main)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Search size={12} color="#0D9488" /> Confidence: {activeBaby.confidence}%
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--akesis-text-muted)', fontWeight: 600 }}>
                  Edge AI Model
                </div>
              </div>
            </div>

            {/* 2. CLINICAL ALERTS STREAM & PROTOCOL CARD */}
            <div className="akesis-card" style={{ padding: '12px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ fontSize: '13px', fontWeight: 900, color: 'var(--akesis-text-main)' }}>
                  Clinical Alerts & Decision Protocol
                </div>
                <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--akesis-text-muted)' }}>
                  Patient: {activeBaby.id}
                </span>
              </div>

              {/* Alert Banner Box */}
              <div style={{ 
                padding: '8px 12px', 
                background: '#FFFBEB', 
                border: '1.5px solid #FDE68A', 
                borderLeft: '4px solid #D97706', 
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#92400E', lineHeight: 1.3 }}>
                  {activeBaby.alertBanner.title}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#B45309', fontWeight: 700 }}>
                  <span>{activeBaby.alertBanner.text}</span>
                  <span>{activeBaby.alertBanner.time}</span>
                </div>
              </div>

              {/* Clinical Protocol: Reason, Recommendation, Action to be Taken */}
              {activeBaby.clinicalDecision && (
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  
                  {/* 1. REASON */}
                  <div style={{ 
                    padding: '6px 10px', 
                    background: '#F8FAFC', 
                    border: '1px solid #E2E8F0', 
                    borderLeft: '3.5px solid #0284C7', 
                    borderRadius: '8px' 
                  }}>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#0369A1', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                      <HelpCircle size={12} color="#0284C7" /> Reason / Clinical Cause
                    </div>
                    <div style={{ fontSize: '11px', color: '#1E293B', fontWeight: 600, lineHeight: 1.35 }}>
                      {activeBaby.clinicalDecision.reason}
                    </div>
                  </div>

                  {/* 2. RECOMMENDATION */}
                  <div style={{ 
                    padding: '6px 10px', 
                    background: '#F0FDF4', 
                    border: '1px solid #DCFCE7', 
                    borderLeft: '3.5px solid #16A34A', 
                    borderRadius: '8px' 
                  }}>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#15803D', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                      <Shield size={12} color="#16A34A" /> Recommendation
                    </div>
                    <div style={{ fontSize: '11px', color: '#14532D', fontWeight: 600, lineHeight: 1.35 }}>
                      {activeBaby.clinicalDecision.recommendation}
                    </div>
                  </div>

                  {/* 3. ACTION TO BE TAKEN */}
                  <div style={{ 
                    padding: '6px 10px', 
                    background: activeBaby.status === 'SAFE' ? '#F8FDF9' : '#FEF2F2', 
                    border: activeBaby.status === 'SAFE' ? '1px solid #E2EFE6' : '1px solid #FEE2E2', 
                    borderLeft: `3.5px solid ${activeBaby.status === 'SAFE' ? '#10B981' : '#DC2626'}`, 
                    borderRadius: '8px' 
                  }}>
                    <div style={{ 
                      fontSize: '10px', 
                      fontWeight: 800, 
                      color: activeBaby.status === 'SAFE' ? '#047857' : '#991B1B', 
                      textTransform: 'uppercase', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px', 
                      marginBottom: '3px' 
                    }}>
                      <AlertTriangle size={12} color={activeBaby.status === 'SAFE' ? '#10B981' : '#DC2626'} /> Action to be Taken
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '14px', fontSize: '11px', color: activeBaby.status === 'SAFE' ? '#064E3B' : '#7F1D1D', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {activeBaby.clinicalDecision.actionToBeTaken.slice(0, 3).map((act, idx) => (
                        <li key={idx} style={{ lineHeight: 1.3 }}>{act}</li>
                      ))}
                    </ul>
                  </div>

                </div>
              )}
            </div>

            {/* 3. PATIENT MEDICAL HISTORY CARD (Compact 2-Column Grid) */}
            <div className="akesis-card" style={{ padding: '12px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '13px', fontWeight: 900, color: 'var(--akesis-text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={15} color="#0D9488" /> Patient Medical History
                </div>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#0D9488', background: '#E0F2FE', padding: '2px 8px', borderRadius: '6px' }}>
                  APGAR: {activeBaby.apgarScore}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px' }}>
                <div style={{ padding: '6px 8px', background: '#F8FDF9', borderRadius: '6px', border: '1px solid var(--akesis-border)' }}>
                  <span style={{ color: 'var(--akesis-text-muted)', fontWeight: 700, display: 'block', fontSize: '10px' }}>Mother:</span>
                  <span style={{ fontWeight: 800, color: 'var(--akesis-text-main)' }}>{activeBaby.motherName}</span>
                </div>

                <div style={{ padding: '6px 8px', background: '#F8FDF9', borderRadius: '6px', border: '1px solid var(--akesis-border)' }}>
                  <span style={{ color: 'var(--akesis-text-muted)', fontWeight: 700, display: 'block', fontSize: '10px' }}>Delivery:</span>
                  <span style={{ fontWeight: 800, color: 'var(--akesis-text-main)' }}>{activeBaby.deliveryType}</span>
                </div>

                <div style={{ padding: '6px 8px', background: '#F8FDF9', borderRadius: '6px', border: '1px solid var(--akesis-border)' }}>
                  <span style={{ color: 'var(--akesis-text-muted)', fontWeight: 700, display: 'block', fontSize: '10px' }}>Blood Group:</span>
                  <span style={{ fontWeight: 800, color: 'var(--akesis-text-main)' }}>{activeBaby.bloodGroup}</span>
                </div>

                <div style={{ padding: '6px 8px', background: '#F8FDF9', borderRadius: '6px', border: '1px solid var(--akesis-border)' }}>
                  <span style={{ color: 'var(--akesis-text-muted)', fontWeight: 700, display: 'block', fontSize: '10px' }}>Feeding:</span>
                  <span style={{ fontWeight: 800, color: 'var(--akesis-text-main)' }}>{activeBaby.feedingSchedule}</span>
                </div>

                <div style={{ gridColumn: 'span 2', padding: '6px 8px', background: '#F8FDF9', borderRadius: '6px', border: '1px solid var(--akesis-border)' }}>
                  <span style={{ color: 'var(--akesis-text-muted)', fontWeight: 700, display: 'block', fontSize: '10px' }}>Maternal History & Care:</span>
                  <span style={{ fontWeight: 700, color: 'var(--akesis-text-main)' }}>{activeBaby.maternalHistory} • {activeBaby.medications}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* CONFIGURE RASPBERRY PI IP MODAL */}
      {showIpModal && (
        <div 
          onClick={() => setShowIpModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              width: '90%',
              maxWidth: '460px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid var(--akesis-border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: 'var(--akesis-text-main)' }}>
                Configure PC2 AI Server API URL
              </h3>
            </div>
            
            <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--akesis-text-muted)', lineHeight: 1.5 }}>
              Choose a cloud or local edge source for continuous live neonatal telemetry.
            </p>

            {/* Quick Presets */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <button
                type="button"
                onClick={() => setCustomIpInput(DEFAULT_RENDER_URL)}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: customIpInput === DEFAULT_RENDER_URL ? '2px solid #0E7490' : '1px solid var(--akesis-border)',
                  background: customIpInput === DEFAULT_RENDER_URL ? '#E0F2FE' : '#F8FAFC',
                  color: customIpInput === DEFAULT_RENDER_URL ? '#0369A1' : 'var(--akesis-text-main)',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                ☁️ Render Cloud (Live)
              </button>
              <button
                type="button"
                onClick={() => setCustomIpInput('http://192.168.43.50:8000')}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: customIpInput.includes('192.168.') ? '2px solid #0E7490' : '1px solid var(--akesis-border)',
                  background: customIpInput.includes('192.168.') ? '#E0F2FE' : '#F8FAFC',
                  color: customIpInput.includes('192.168.') ? '#0369A1' : 'var(--akesis-text-main)',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                📱 Hotspot Pi (PC2)
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--akesis-text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Server API Base URL:
              </label>
              <input 
                type="text"
                value={customIpInput}
                onChange={(e) => setCustomIpInput(e.target.value)}
                placeholder="https://pc-2-hardware.onrender.com"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--akesis-border)',
                  fontSize: '13px',
                  fontWeight: 700,
                  boxSizing: 'border-box',
                  color: 'var(--akesis-text-main)'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--akesis-text-muted)' }}>
                {lastFetchTime ? `Last response: ${lastFetchTime}` : 'No responses received yet'}
              </span>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setShowIpModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--akesis-border)',
                    background: '#F8FAFC',
                    color: 'var(--akesis-text-main)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const clean = sanitizeUrl(customIpInput);
                    setRuntimePiBaseUrl(clean);
                    setPiBaseUrl(clean);
                    setConnectionStatus('CONNECTING');
                    setShowIpModal(false);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#0E7490',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Save & Connect
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* RENDER MODAL POPUP DIALOG ON CARD CLICK */}
      <IncubatorDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        baby={modalBaby || activeBaby}
      />
    </div>
  );
}
