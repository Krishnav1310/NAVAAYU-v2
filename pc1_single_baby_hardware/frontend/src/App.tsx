import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Volume2, 
  VolumeX, 
  Clock, 
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
  Wifi,
  WifiOff,
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
} from './services/api';


interface BabyData {
  id: string;
  bedId: string;
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

const BABIES_DATA: BabyData[] = [
  {
    id: "NICU_001",
    bedId: "NICU-001",
    name: "Baby of NICU-001",
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
    apgarScore: "7.0 at 1 min",
    feedingSchedule: "Expressed Breast Milk (45ml q3h)",
    medications: "Continuous cardio-respiratory observation, thermal regulation",
    phototherapyStatus: "Under review (TSB normal)",
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
  const bNum = b.id.match(/\d+/)?.[0];
  if (targetNum && bNum && parseInt(targetNum, 10) === parseInt(bNum, 10)) return true;
  return false;
}

function App() {
  const [selectedBabyId, setSelectedBabyId] = useState<string>("NICU_001");
  const [babies, setBabies] = useState<BabyData[]>(BABIES_DATA);
  const [waveformData, setWaveformData] = useState(generateWaveforms());
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

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

      const alertBanner = {
        title: `Incubator NICU-001 Alert: ${reason}`,
        text: `Patient: NICU-001 • Status: ${status === 'UNSAFE' ? 'CRITICAL' : 'AT RISK'}`,
        statusBadge: status === 'UNSAFE' ? 'CRITICAL' : 'WARNING',
        time: nowStr
      };

      setBabies(prevBabies => {
        return prevBabies.map(baby => {
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
            trends,
            alertBanner,
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
        if (typeof response.latencyMs === 'number') {
          setLatencyMs(response.latencyMs);
        }
        applyTelemetry(response.data, response.latencyMs);
      } else {
        if (!piBaseUrl.includes('onrender.com')) {
          switchToRender();
        } else {
          setConnectionStatus('EDGE SERVER OFFLINE');
        }
      }
    } catch {
      setConnectionStatus('EDGE SERVER OFFLINE');
    } finally {
      setIsManualFetching(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let timerId: any = null;
    let failCount = 0;

    // Clean up stale query params pointing to old local mock port
    if (typeof window !== 'undefined' && window.location?.search) {
      if (window.location.search.includes('localhost:8000') || window.location.search.includes('127.0.0.1:8000')) {
        const url = new URL(window.location.href);
        url.searchParams.delete('pi_url');
        url.searchParams.delete('pi');
        url.searchParams.delete('api_url');
        url.searchParams.delete('url');
        window.history.replaceState({}, document.title, url.pathname + (url.search ? url.search : ''));
      }
    }

    const poll = async () => {
      try {
        const response = await getLatestPredictions(piBaseUrl, selectedBabyId, 2500);

        if (!isMounted) return;

        if (response.ok && response.data) {
          failCount = 0;
          setConnectionStatus('CONNECTED');
          if (typeof response.latencyMs === 'number') {
            setLatencyMs(response.latencyMs);
          }
          applyTelemetry(response.data, response.latencyMs);
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
    <div style={{ minHeight: '100vh', background: 'var(--akesis-bg)', paddingBottom: '40px' }}>
      
      {/* 1. TOP HEADER BAR */}
      <header className="akesis-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', color: 'var(--akesis-text-main)' }}>
            <Menu size={22} />
          </button>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.5px', color: '#0E7490', display: 'flex', alignItems: 'center', gap: '8px' }}>
              AKESIS PROTOCOL
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--akesis-text-muted)' }}>
              Neonatal AI Monitoring System
            </div>
          </div>
        </div>

        {/* Status Badges & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Live Status Indicator */}
          {connectionStatus === 'CONNECTED' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: '#F0FDF4', borderRadius: '20px', border: '1px solid #DCFCE7', fontSize: '11px', fontWeight: 800, color: '#15803D' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px rgba(34,197,94,0.6)' }} />
              LIVE TELEMETRY
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: '#FEF2F2', borderRadius: '20px', border: '1px solid #FEE2E2', fontSize: '11px', fontWeight: 800, color: '#DC2626' }}>
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
              padding: '6px 14px', 
              background: connectionStatus === 'CONNECTED' ? '#F0FDF4' : '#FFFBEB', 
              borderRadius: '20px', 
              border: connectionStatus === 'CONNECTED' ? '1px solid #DCFCE7' : '1px solid #FEF3C7', 
              fontSize: '11px', 
              fontWeight: 800, 
              color: connectionStatus === 'CONNECTED' ? '#15803D' : '#B45309', 
              cursor: 'pointer' 
            }}
          >
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: connectionStatus === 'CONNECTED' ? '#22C55E' : '#F59E0B' }} />
            {isRenderUrl ? 'RENDER CLOUD (LIVE)' : 'EDGE SERVER'}
          </button>

          {/* Real-time Streaming Speed Toggle */}
          <button 
            onClick={togglePollingSpeed}
            title={`Continuous telemetry rate: ${pollingSpeed}ms. Click to toggle between 400ms (Instant), 800ms (Fast), and 1500ms (Standard).`}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '6px 13px', 
              background: pollingSpeed <= 500 ? '#ECFDF5' : '#F8FAFC', 
              borderRadius: '20px', 
              border: pollingSpeed <= 500 ? '1.5px solid #10B981' : '1px solid var(--akesis-border)', 
              fontSize: '11px', 
              fontWeight: 800, 
              color: pollingSpeed <= 500 ? '#065F46' : 'var(--akesis-text-main)', 
              cursor: 'pointer' 
            }}
          >
            <Activity size={13} color={pollingSpeed <= 500 ? '#059669' : '#64748B'} className={pollingSpeed <= 500 ? 'pulse-dot' : ''} />
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
              <span className="pulse-dot" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#0D9488' }} />
              <span>SYNC: {lastFetchTime}</span>
              {latencyMs !== null && (
                <span style={{ color: '#0369A1', background: '#E0F2FE', padding: '1px 6px', borderRadius: '10px', fontSize: '10px' }}>
                  {latencyMs}ms
                </span>
              )}
              {packetAgeSec !== null && packetAgeSec < 5 && (
                <span style={{ color: '#15803D', background: '#DCFCE7', padding: '1px 6px', borderRadius: '10px', fontSize: '10px' }}>
                  LIVE
                </span>
              )}
            </div>
          )}

          {/* Manual Refresh Button */}
          <button 
            onClick={triggerManualFetch}
            title="Fetch latest data from server now"
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: '#FFFFFF', borderRadius: '20px', border: '1px solid var(--akesis-border)', fontSize: '11px', fontWeight: 800, color: 'var(--akesis-text-main)', cursor: 'pointer' }}
          >
            <RefreshCw size={12} className={isManualFetching ? 'spin-anim' : ''} color="#0E7490" />
            {isManualFetching ? 'FETCHING...' : 'REFRESH'}
          </button>

          {/* Quick Switcher if not on Render Cloud or if offline */}
          {(!isRenderUrl || connectionStatus === 'EDGE SERVER OFFLINE') && (
            <button 
              onClick={switchToRender}
              title="Switch to continuous streaming from Render Cloud (pc-2-hardware.onrender.com)"
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: '#0E7490', color: '#FFFFFF', borderRadius: '20px', border: 'none', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
            >
              ☁️ Connect Render Cloud
            </button>
          )}

          {/* Configurable IP Badge / Button */}
          <button 
            onClick={() => { setCustomIpInput(piBaseUrl); setShowIpModal(true); }}
            title="Configure Server API URL"
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: '#FFFFFF', borderRadius: '20px', border: '1px solid var(--akesis-border)', fontSize: '11px', fontWeight: 800, color: 'var(--akesis-text-main)', cursor: 'pointer' }}
          >
            <Settings size={13} color="#0E7490" />
            API: {piBaseUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '')}
          </button>


          <button 
            onClick={() => setIsMuted(!isMuted)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: '#FFFFFF', borderRadius: '20px', border: '1px solid var(--akesis-border)', fontSize: '11px', fontWeight: 800, color: 'var(--akesis-text-main)', cursor: 'pointer' }}
          >
            {isMuted ? <VolumeX size={14} color="#EF4444" /> : <Volume2 size={14} color="#0D9488" />}
            ALARM VOL
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: '#FFFFFF', borderRadius: '20px', border: '1px solid var(--akesis-border)', fontSize: '12px', fontWeight: 800, color: 'var(--akesis-text-main)' }}>
            <Clock size={14} color="var(--akesis-text-muted)" />
            {currentTime || "09:22:39 PM"}
          </div>

          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 16px', background: '#FFFFFF', borderRadius: '20px', border: '1.5px solid #FCA5A5', fontSize: '11px', fontWeight: 900, color: '#DC2626', cursor: 'pointer' }}>
            LOGOUT
          </button>

        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main style={{ maxWidth: '1600px', margin: '14px auto 0', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* MAIN DASHBOARD TWO-COLUMN SECTION */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.22fr 1fr', gap: '12px', alignItems: 'start' }}>
          
          {/* LEFT COLUMN: Bed Header, 5 Vitals Cards, and Live Vital Trends Area Chart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Bed Header & Vitals Grid Card */}
            <div className="akesis-card" style={{ padding: '14px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 900, color: 'var(--akesis-text-main)' }}>
                      Bed: {activeBaby.bedId}
                    </span>

                    <span style={{ 
                      padding: '3px 8px', 
                      borderRadius: '10px', 
                      background: '#ECFEFF', 
                      border: '1px solid #CFFAFE', 
                      fontSize: '10.5px', 
                      fontWeight: 800, 
                      color: '#0891B2' 
                    }}>
                      Single Bed Monitor (Active)
                    </span>
                  </div>

                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--akesis-text-muted)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
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

            {/* LIVE VITAL TRENDS (Placed directly in left column for perfect symmetry) */}
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

      {/* 5. FOOTER */}
      <footer style={{ marginTop: '12px', textAlign: 'center', fontSize: '10.5px', color: 'var(--akesis-text-muted)', lineHeight: 1.4, padding: '0 20px' }}>
        <div>
          Disclaimer: NAVAAYU is an AI-assisted neonatal monitoring prototype and is not a substitute for professional medical judgment.
        </div>
        <div style={{ fontWeight: 700, marginTop: '2px' }}>
          © 2026 @AKESISPROTOCOL. All rights reserved.
        </div>
      </footer>

      {/* 6. CONFIGURE RASPBERRY PI IP MODAL */}
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

    </div>
  );
}

export default App;