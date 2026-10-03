import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Wind, 
  Thermometer, 
  Activity, 
  FileText, 
  Bed, 
  Bell, 
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  Zap,
  Info
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
import { IncubatorDetailModal } from '../../components/Modals/IncubatorDetailModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001';

export interface BabyRecord {
  id: string;
  bedId: string;
  bedNumber: number;
  name: string;
  age: string;
  weight: string;
  birthWeight: string;
  gestationalAge: string;
  admissionDate: string;
  status: 'NORMAL' | 'MODERATE' | 'CRITICAL';
  statusBadge: string;
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
  vitals: {
    heartRate: number;
    spo2: number;
    temp: number;
    respRate: number;
    bp: number;
  };
  abnormalFlags: {
    heartRate: boolean;
    spo2: boolean;
    temp: boolean;
    respRate: boolean;
    bp: boolean;
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

const INITIAL_BABIES_DIRECTORY: BabyRecord[] = [
  {
    id: "NB-2026-001",
    bedId: "NICU-001",
    bedNumber: 1,
    name: "Aarav Sharma",
    age: "3 days old",
    weight: "3.2 kg",
    birthWeight: "3.15 kg",
    gestationalAge: "38 weeks",
    admissionDate: "Jan 21, 2026",
    status: "NORMAL",
    statusBadge: "NORMAL",
    riskScore: 12,
    confidence: 96,
    motherName: "Priya Sharma",
    maternalHistory: "G1P1, 28 y/o, uncomplicated pregnancy, GBS negative, normotensive, clear liquor",
    deliveryType: "Normal Spontaneous Vaginal Delivery",
    bloodGroup: "O+ (Rh Positive)",
    apgarScore: "9 at 1 min, 10 at 5 min",
    feedingSchedule: "Expressed Breast Milk (45ml q3h)",
    medications: "Vitamin K1 1mg IM, Erythromycin 0.5% eye ointment, Hepatitis B dose 1",
    phototherapyStatus: "None required (TSB 4.2 mg/dL - Normal)",
    vitals: {
      heartRate: 140,
      spo2: 99,
      temp: 37,
      respRate: 38,
      bp: 50
    },
    abnormalFlags: {
      heartRate: false,
      spo2: false,
      temp: false,
      respRate: false,
      bp: false
    },
    alertBanner: {
      title: "Incubator NICU-001: All vital signs verified within normal physiological bounds.",
      text: "Patient: NB-2026-001 • Status: OPTIMAL",
      statusBadge: "OPTIMAL",
      time: "09:20:15 PM"
    },
    historyLogs: [
      { time: "09:20 PM", hr: 140, spo2: 99, resp: 38, temp: 37.0, bp: 50, status: "Normal" },
      { time: "09:15 PM", hr: 139, spo2: 98, resp: 39, temp: 36.9, bp: 49, status: "Normal" },
      { time: "09:10 PM", hr: 142, spo2: 99, resp: 40, temp: 37.0, bp: 50, status: "Normal" }
    ]
  },
  {
    id: "NB-2026-002",
    bedId: "NICU-002",
    bedNumber: 2,
    name: "Kiara Patel",
    age: "5 days old",
    weight: "2.9 kg",
    birthWeight: "2.85 kg",
    gestationalAge: "37 weeks",
    admissionDate: "Jan 20, 2026",
    status: "MODERATE",
    statusBadge: "MODERATE",
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
    vitals: {
      heartRate: 190,
      spo2: 82,
      temp: 39.4,
      respRate: 77,
      bp: 72
    },
    abnormalFlags: {
      heartRate: true,   // > 160 bpm -> Red
      spo2: true,        // < 93% -> Red
      temp: true,        // > 37.5 °C -> Red
      respRate: true,    // > 60 /min -> Red
      bp: false
    },
    alertBanner: {
      title: "Incubator NICU-002 Alert: Tachycardia (190 BPM) & Desaturation (82%) with Hyperthermia (39.4°C).",
      text: "Patient: NB-2026-002 • Status: MODERATE CLINICAL WARNING",
      statusBadge: "MODERATE",
      time: "09:18:42 PM"
    },
    historyLogs: [
      { time: "09:18 PM", hr: 190, spo2: 82, resp: 77, temp: 39.4, bp: 72, status: "Moderate" },
      { time: "09:12 PM", hr: 185, spo2: 85, resp: 72, temp: 39.1, bp: 70, status: "Moderate" },
      { time: "09:06 PM", hr: 178, spo2: 88, resp: 68, temp: 38.8, bp: 68, status: "Moderate" }
    ]
  },
  {
    id: "NB-2026-003",
    bedId: "NICU-003",
    bedNumber: 3,
    name: "Aditya Rao",
    age: "2 days old",
    weight: "3.1 kg",
    birthWeight: "3.05 kg",
    gestationalAge: "39 weeks",
    admissionDate: "Jan 22, 2026",
    status: "MODERATE",
    statusBadge: "MODERATE",
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
    vitals: {
      heartRate: 149,
      spo2: 97,
      temp: 37,
      respRate: 42,
      bp: 51
    },
    abnormalFlags: {
      heartRate: false,
      spo2: false,
      temp: false,
      respRate: false,
      bp: false
    },
    alertBanner: {
      title: "Incubator NICU-003: Post-op monitoring stable, antibiotic infusion cycle in progress.",
      text: "Patient: NB-2026-003 • Status: MODERATE OBSERVATION",
      statusBadge: "MODERATE",
      time: "09:22:38 PM"
    },
    historyLogs: [
      { time: "09:22 PM", hr: 149, spo2: 97, resp: 42, temp: 37.0, bp: 51, status: "Moderate" },
      { time: "09:18 PM", hr: 151, spo2: 96, resp: 44, temp: 37.1, bp: 52, status: "Moderate" },
      { time: "09:14 PM", hr: 148, spo2: 97, resp: 41, temp: 37.0, bp: 50, status: "Moderate" }
    ]
  },
  {
    id: "NB-2026-004",
    bedId: "NICU-004",
    bedNumber: 4,
    name: "Riya Sen",
    age: "6 days old",
    weight: "3.4 kg",
    birthWeight: "3.3 kg",
    gestationalAge: "38 weeks",
    admissionDate: "Jan 19, 2026",
    status: "NORMAL",
    statusBadge: "NORMAL",
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
    vitals: {
      heartRate: 145,
      spo2: 98,
      temp: 36.9,
      respRate: 48,
      bp: 44
    },
    abnormalFlags: {
      heartRate: false,
      spo2: false,
      temp: false,
      respRate: false,
      bp: false
    },
    alertBanner: {
      title: "Incubator NICU-004: Kangaroo Mother Care completed, excellent perfusion.",
      text: "Patient: NB-2026-004 • Status: OPTIMAL",
      statusBadge: "OPTIMAL",
      time: "09:12:00 PM"
    },
    historyLogs: [
      { time: "09:12 PM", hr: 145, spo2: 98, resp: 48, temp: 36.9, bp: 44, status: "Normal" },
      { time: "09:00 PM", hr: 144, spo2: 99, resp: 47, temp: 36.9, bp: 43, status: "Normal" }
    ]
  },
  {
    id: "NB-2026-005",
    bedId: "NICU-005",
    bedNumber: 5,
    name: "Vivaan Kapoor",
    age: "4 days old",
    weight: "2.7 kg",
    birthWeight: "2.65 kg",
    gestationalAge: "36 weeks",
    admissionDate: "Jan 21, 2026",
    status: "NORMAL",
    statusBadge: "NORMAL",
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
    vitals: {
      heartRate: 144,
      spo2: 98,
      temp: 37.1,
      respRate: 52,
      bp: 39
    },
    abnormalFlags: {
      heartRate: false,
      spo2: false,
      temp: false,
      respRate: false,
      bp: false
    },
    alertBanner: {
      title: "Incubator NICU-005: Bio-Acoustic classifier identified hunger cry reflex.",
      text: "Patient: NB-2026-005 • Status: ACTIVE",
      statusBadge: "ACTIVE",
      time: "09:08:14 PM"
    },
    historyLogs: [
      { time: "09:08 PM", hr: 144, spo2: 98, resp: 52, temp: 37.1, bp: 39, status: "Normal" },
      { time: "08:55 PM", hr: 142, spo2: 98, resp: 46, temp: 37.0, bp: 40, status: "Normal" }
    ]
  }
];

const generateWaveforms = () => Array.from({ length: 30 }, (_, i) => ({
  time: i,
  heartRate: 145 + Math.sin(i * 0.3) * 6,
  spo2: 98 + Math.cos(i * 0.2) * 1,
  respRate: 42 + Math.sin(i * 0.4) * 3,
  bp: 50 + Math.cos(i * 0.3) * 2
}));

export function PatientSoftwareDashboard() {
  const [babies, setBabies] = useState<BabyRecord[]>(INITIAL_BABIES_DIRECTORY);
  const [selectedBabyId, setSelectedBabyId] = useState<string>("NB-2026-002");
  const [waveformData, setWaveformData] = useState(generateWaveforms());
  const [isDetailExpanded, setIsDetailExpanded] = useState<boolean>(true);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalBaby, setModalBaby] = useState<BabyRecord | null>(null);

  // Synchronize baby selection with PC3 backend and open clinical modal popup
  const handleSelectBaby = (id: string) => {
    setSelectedBabyId(id);
    setIsDetailExpanded(true);
    const target = babies.find(b => b.id === id);
    if (target) {
      setModalBaby(target);
    }
    setIsModalOpen(true);
    fetch(`${API_BASE_URL}/api/select_baby`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    }).catch(() => {});
  };

  // PC3 Vision & Bio-Acoustic backend polling
  useEffect(() => {
    let isMounted = true;
    const pollBackend = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/dashboard`, { cache: 'no-store' });
        if (res.ok && isMounted) {
          setIsBackendConnected(true);
          const json = await res.json();
          if (json.babies && Array.isArray(json.babies)) {
            setBabies(prev => prev.map(b => {
              const remote = json.babies.find((rb: any) => rb.id === b.id || rb.id === b.bedId);
              if (!remote) return b;
              return {
                ...b,
                status: remote.status === 'UNSAFE' ? 'CRITICAL' : (remote.status === 'WARNING' ? 'MODERATE' : 'NORMAL'),
                vitals: {
                  ...b.vitals,
                  heartRate: remote.vitals?.heartRate || b.vitals.heartRate,
                  spo2: remote.vitals?.spo2 || b.vitals.spo2,
                  respRate: remote.vitals?.respRate || b.vitals.respRate,
                  temp: remote.vitals?.temp || b.vitals.temp
                }
              };
            }));
          }
        } else if (isMounted) {
          setIsBackendConnected(false);
        }
      } catch {
        if (isMounted) setIsBackendConnected(false);
      }
    };

    pollBackend();
    const pollInterval = setInterval(pollBackend, 2500);
    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, []);

  // Live real-time waveform updates
  useEffect(() => {
    const active = babies.find(b => b.id === selectedBabyId) || babies[0];
    const interval = setInterval(() => {
      setWaveformData(prev => {
        const newEntry = {
          time: prev.length,
          heartRate: active.vitals.heartRate + (Math.random() > 0.6 ? (Math.random() > 0.5 ? 1 : -1) : 0),
          spo2: active.vitals.spo2 + (Math.random() > 0.8 ? (Math.random() > 0.5 ? 0.2 : -0.2) : 0),
          respRate: active.vitals.respRate + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0),
          bp: active.vitals.bp
        };
        return [...prev.slice(-29), newEntry];
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [selectedBabyId, babies]);

  const activeBaby = babies.find(b => b.id === selectedBabyId) || babies[0];

  return (
    <main style={{ maxWidth: '1440px', margin: '24px auto 0', padding: '0 28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. DIRECTORY HEADER TITLE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0E7490', margin: 0, letterSpacing: '-0.5px' }}>
            Incubator Beds Directory
          </h2>
          <p style={{ color: '#5C7A68', fontSize: '12px', fontWeight: 600, margin: '4px 0 0 0' }}>
            Overview of all monitored neonatal incubator beds in the ward
          </p>
        </div>

        {/* Status Counter Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 12px', background: '#F0FDF4', color: '#15803D', borderRadius: '8px', border: '1px solid #DCFCE7' }}>
            3 Normal
          </span>
          <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 12px', background: '#FEF3C7', color: '#D97706', borderRadius: '8px', border: '1px solid #FDE68A' }}>
            2 Moderate
          </span>
          <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 12px', background: '#ECFEFF', color: '#0E7490', borderRadius: '8px', border: '1px solid #CFFAFE' }}>
            5 Active Bays
          </span>
        </div>
      </div>

      {/* 2. INCUBATOR BEDS DIRECTORY GRID (EXACT 5 BEDS AS IN VERCEL) */}
      <section 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', 
          gap: '24px', 
          alignItems: 'stretch' 
        }}
      >
        {babies.map((baby) => {
          const isSelected = baby.id === selectedBabyId;
          const isModerate = baby.status === 'MODERATE';
          const isCritical = baby.status === 'CRITICAL';
          
          // Moderate beds get highlighted orange border & subtle warm glow
          const borderColor = isSelected 
            ? '#0E7490' 
            : isModerate 
              ? '#EA580C' 
              : isCritical 
                ? '#EF4444' 
                : '#E2EFE6';

          const accentColor = isModerate 
            ? '#EA580C' 
            : isCritical 
              ? '#EF4444' 
              : '#10B981';

          const cardShadow = isSelected
            ? '0 8px 30px rgba(14, 116, 144, 0.18)'
            : isModerate 
              ? '0 6px 24px rgba(234, 88, 12, 0.14)' 
              : '0 4px 16px rgba(16, 100, 60, 0.04)';

          return (
            <div 
              key={baby.id}
              onClick={() => handleSelectBaby(baby.id)}
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                border: isSelected ? `2.5px solid ${borderColor}` : `2px solid ${borderColor}`,
                padding: '24px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.25s ease',
                boxShadow: cardShadow,
                boxSizing: 'border-box'
              }}
            >
              {/* Top Row: Status Dot / Warning Icon + Bed ID & Status Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                
                {/* Left: Bed Identifier */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isModerate ? (
                    <AlertTriangle size={18} color="#EA580C" style={{ flexShrink: 0 }} />
                  ) : isCritical ? (
                    <span style={{ fontSize: '16px' }}>🚨</span>
                  ) : (
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                  )}
                  <span style={{ fontSize: '16px', fontWeight: 900, color: '#133926', letterSpacing: '-0.3px' }}>
                    {baby.bedId}
                  </span>
                  {isSelected && (
                    <span style={{ fontSize: '9px', fontWeight: 900, background: '#0E7490', color: 'white', padding: '1px 6px', borderRadius: '6px' }}>
                      SELECTED
                    </span>
                  )}
                </div>

                {/* Right: Status Badge (NORMAL or MODERATE) */}
                <span 
                  style={{
                    fontSize: '11px',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    background: isModerate ? '#D97706' : (isCritical ? '#DC2626' : '#0D9488'),
                    padding: '4px 14px',
                    borderRadius: '8px',
                    letterSpacing: '0.6px',
                    textTransform: 'uppercase'
                  }}
                >
                  {baby.status}
                </span>
              </div>

              {/* Center: Circle with Number + Subtitle */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', justifyContent: 'center', margin: '4px 0' }}>
                <div 
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(44, 105, 117, 0.04)',
                    border: `2px solid ${accentColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#133926',
                    fontWeight: 900,
                    fontSize: '22px'
                  }}
                >
                  {baby.bedNumber}
                </div>
                <div style={{ fontSize: '12px', color: '#5C7A68', fontWeight: 800 }}>
                  Baby ID: {baby.id} • {baby.age}
                </div>
              </div>

              {/* Bottom: Vitals Grid (2-column layout) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                
                {/* 1. HEART RATE */}
                <div 
                  style={{
                    background: 'rgba(104, 178, 160, 0.04)',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: '1px solid #E2EFE6',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}
                >
                  <span style={{ color: '#5C7A68', fontSize: '9px', fontWeight: 800, letterSpacing: '0.5px' }}>
                    HEART RATE
                  </span>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: baby.abnormalFlags.heartRate ? '#DC2626' : '#133926', fontVariantNumeric: 'tabular-nums' }}>
                    {baby.vitals.heartRate}
                    <span style={{ fontSize: '9.5px', color: '#5C7A68', marginLeft: '3px', fontWeight: 700 }}>
                      bpm
                    </span>
                  </div>
                </div>

                {/* 2. OXYGEN (SpO₂) */}
                <div 
                  style={{
                    background: 'rgba(104, 178, 160, 0.04)',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: '1px solid #E2EFE6',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}
                >
                  <span style={{ color: '#5C7A68', fontSize: '9px', fontWeight: 800, letterSpacing: '0.5px' }}>
                    OXYGEN (SpO₂)
                  </span>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: baby.abnormalFlags.spo2 ? '#DC2626' : '#133926', fontVariantNumeric: 'tabular-nums' }}>
                    {baby.vitals.spo2}
                    <span style={{ fontSize: '9.5px', color: '#5C7A68', marginLeft: '3px', fontWeight: 700 }}>
                      %
                    </span>
                  </div>
                </div>

                {/* 3. TEMPERATURE */}
                <div 
                  style={{
                    background: 'rgba(104, 178, 160, 0.04)',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: '1px solid #E2EFE6',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}
                >
                  <span style={{ color: '#5C7A68', fontSize: '9px', fontWeight: 800, letterSpacing: '0.5px' }}>
                    TEMPERATURE
                  </span>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: baby.abnormalFlags.temp ? '#DC2626' : '#133926', fontVariantNumeric: 'tabular-nums' }}>
                    {baby.vitals.temp}
                    <span style={{ fontSize: '9.5px', color: '#5C7A68', marginLeft: '3px', fontWeight: 700 }}>
                      °C
                    </span>
                  </div>
                </div>

                {/* 4. RESPIRATORY */}
                <div 
                  style={{
                    background: 'rgba(104, 178, 160, 0.04)',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: '1px solid #E2EFE6',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}
                >
                  <span style={{ color: '#5C7A68', fontSize: '9px', fontWeight: 800, letterSpacing: '0.5px' }}>
                    RESPIRATORY
                  </span>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: baby.abnormalFlags.respRate ? '#DC2626' : '#133926', fontVariantNumeric: 'tabular-nums' }}>
                    {baby.vitals.respRate}
                    <span style={{ fontSize: '9.5px', color: '#5C7A68', marginLeft: '3px', fontWeight: 700 }}>
                      /min
                    </span>
                  </div>
                </div>

                {/* 5. BLOOD PRESSURE (Span across or left box) */}
                <div 
                  style={{
                    background: 'rgba(104, 178, 160, 0.04)',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: '1px solid #E2EFE6',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}
                >
                  <span style={{ color: '#5C7A68', fontSize: '9px', fontWeight: 800, letterSpacing: '0.5px' }}>
                    BLOOD PRESSURE
                  </span>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#133926', fontVariantNumeric: 'tabular-nums' }}>
                    {baby.vitals.bp}
                    <span style={{ fontSize: '9.5px', color: '#5C7A68', marginLeft: '3px', fontWeight: 700 }}>
                      mmHg
                    </span>
                  </div>
                </div>

              </div>

            </div>
          );
        })}
      </section>

      {/* 3. FOCUSED CLINICAL TELEMETRY & MEDICAL RECORD (EXPANDABLE DETAIL SECTION) */}
      <div 
        style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1.5px solid #E2EFE6',
          padding: '24px 28px',
          boxShadow: '0 4px 16px rgba(16, 100, 60, 0.04)',
          marginTop: '12px'
        }}
      >
        {/* Header Toggle */}
        <div 
          onClick={() => setIsDetailExpanded(!isDetailExpanded)}
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            cursor: 'pointer',
            paddingBottom: isDetailExpanded ? '18px' : '0',
            borderBottom: isDetailExpanded ? '1px solid #E2EFE6' : 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={20} color="#0E7490" />
            <div>
              <span style={{ fontSize: '16px', fontWeight: 900, color: '#133926' }}>
                Detailed Telemetry & Clinical Record: {activeBaby.bedId} ({activeBaby.name})
              </span>
              <span style={{ fontSize: '11px', color: '#5C7A68', display: 'block', fontWeight: 700 }}>
                {activeBaby.id} • {activeBaby.gestationalAge} • Birth Weight: {activeBaby.birthWeight}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#0E7490' }}>
              {isDetailExpanded ? 'Collapse Details' : 'Expand Details'}
            </span>
            {isDetailExpanded ? <ChevronUp size={18} color="#0E7490" /> : <ChevronDown size={18} color="#0E7490" />}
          </div>
        </div>

        {isDetailExpanded && (
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
            
            {/* Two-Column Telemetry & Medical Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '20px' }}>
              
              {/* Left Column: Live Alert & Medical History */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Alert Banner */}
                <div 
                  style={{
                    padding: '16px 20px',
                    borderRadius: '14px',
                    background: activeBaby.status === 'MODERATE' ? '#FEF3C7' : '#F0FDF4',
                    border: `1.5px solid ${activeBaby.status === 'MODERATE' ? '#FDE68A' : '#DCFCE7'}`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}
                >
                  <AlertTriangle size={20} color={activeBaby.status === 'MODERATE' ? '#D97706' : '#15803D'} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 900, color: activeBaby.status === 'MODERATE' ? '#92400E' : '#166534', lineHeight: 1.3 }}>
                      {activeBaby.alertBanner.title}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: activeBaby.status === 'MODERATE' ? '#B45309' : '#15803D', marginTop: '4px' }}>
                      {activeBaby.alertBanner.text} • {activeBaby.alertBanner.time}
                    </div>
                  </div>
                </div>

                {/* Patient Medical History Box */}
                <div 
                  style={{
                    padding: '18px 20px',
                    borderRadius: '14px',
                    background: '#F8FAFC',
                    border: '1px solid #E2EFE6',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#133926', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} color="#0E7490" /> Patient Medical History & Maternal Record
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11.5px' }}>
                    <div>
                      <span style={{ color: '#5C7A68', fontWeight: 700 }}>Mother's Name:</span>{' '}
                      <strong style={{ color: '#133926' }}>{activeBaby.motherName}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#5C7A68', fontWeight: 700 }}>Delivery Type:</span>{' '}
                      <strong style={{ color: '#133926' }}>{activeBaby.deliveryType}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#5C7A68', fontWeight: 700 }}>Blood Group:</span>{' '}
                      <strong style={{ color: '#133926' }}>{activeBaby.bloodGroup}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#5C7A68', fontWeight: 700 }}>APGAR Score:</span>{' '}
                      <strong style={{ color: '#133926' }}>{activeBaby.apgarScore}</strong>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: '#5C7A68', fontWeight: 700 }}>Maternal History:</span>{' '}
                      <span style={{ color: '#133926', fontWeight: 600 }}>{activeBaby.maternalHistory}</span>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: '#5C7A68', fontWeight: 700 }}>Feeding Protocol:</span>{' '}
                      <span style={{ color: '#133926', fontWeight: 600 }}>{activeBaby.feedingSchedule}</span>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: '#5C7A68', fontWeight: 700 }}>Current Medications:</span>{' '}
                      <span style={{ color: '#133926', fontWeight: 600 }}>{activeBaby.medications}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: AI Risk Prediction & Assessment */}
              <div 
                style={{
                  padding: '18px 20px',
                  borderRadius: '14px',
                  background: '#F8FAFC',
                  border: '1px solid #E2EFE6',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#133926', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={16} color="#0E7490" /> AI Risk Assessment Model
                  </div>
                  <div style={{ fontSize: '11px', color: '#5C7A68', marginTop: '2px', fontWeight: 600 }}>
                    Random Forest Multi-parameter Clinical Classifier
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2EFE6' }}>
                  <div>
                    <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#5C7A68' }}>RISK SCORE</div>
                    <div style={{ fontSize: '26px', fontWeight: 900, color: activeBaby.status === 'MODERATE' ? '#D97706' : '#15803D' }}>
                      {activeBaby.riskScore}%
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#5C7A68' }}>MODEL CONFIDENCE</div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#0E7490' }}>
                      {activeBaby.confidence}%
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: '#5C7A68', lineHeight: 1.5, background: '#FFFFFF', padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2EFE6' }}>
                  <strong style={{ color: '#133926' }}>Clinical Decision Support:</strong> Continuously correlates Heart Rate ({activeBaby.vitals.heartRate} bpm), SpO₂ ({activeBaby.vitals.spo2}%), and Respiratory Rate ({activeBaby.vitals.respRate} /min) against gestational normative tables.
                </div>
              </div>

            </div>

            {/* Continuous Real-time Vital Trends AreaChart */}
            <div 
              style={{
                padding: '20px 24px',
                borderRadius: '16px',
                background: '#FFFFFF',
                border: '1.5px solid #E2EFE6',
                boxShadow: '0 2px 10px rgba(16, 100, 60, 0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ fontSize: '13px', fontWeight: 900, color: '#133926', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Real-Time Vital Waveform Telemetry ({activeBaby.bedId})
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px', fontWeight: 800 }}>
                  <span style={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} /> Heart Rate
                  </span>
                  <span style={{ color: '#0D9488', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0D9488' }} /> SpO₂
                  </span>
                  <span style={{ color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }} /> Resp Rate
                  </span>
                </div>
              </div>

              <div style={{ width: '100%', height: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={waveformData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="spo2Grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0D9488" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#64748B' }} />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '10px', 
                        border: '1px solid #E2EFE6', 
                        boxShadow: '0 8px 20px rgba(0,0,0,0.06)', 
                        background: '#FFFFFF', 
                        fontSize: '11px', 
                        fontWeight: 700 
                      }} 
                    />
                    <Area type="monotone" dataKey="heartRate" stroke="#EF4444" strokeWidth={2.5} fill="url(#hrGrad)" isAnimationActive={false} />
                    <Area type="monotone" dataKey="spo2" stroke="#0D9488" strokeWidth={2} fill="url(#spo2Grad)" isAnimationActive={false} />
                    <Area type="monotone" dataKey="respRate" stroke="#3B82F6" strokeWidth={1.5} fill="transparent" strokeDasharray="3 3" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* CLINICAL MODAL DIALOG ON CARD CLICK */}
      <IncubatorDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        baby={babies.find(b => b.id === (modalBaby?.id || selectedBabyId)) || modalBaby || activeBaby}
      />
    </main>
  );
}
