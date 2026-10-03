import React, { useEffect, useState } from 'react';
import { 
  X, 
  Heart, 
  Zap, 
  Thermometer, 
  Wind, 
  Activity, 
  AlertTriangle, 
  ArrowRight 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis 
} from 'recharts';

export interface IncubatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  baby: {
    id: string;
    bedId: string;
    bedNumber: number;
    name: string;
    age: string;
    weight: string;
    birthWeight?: string;
    gestationalAge?: string;
    status: 'NORMAL' | 'SAFE' | 'MODERATE' | 'WARNING' | 'CRITICAL' | 'UNSAFE' | 'OFFLINE';
    statusLabel?: string;
    confidence: number;
    vitals: {
      heartRate: number;
      spo2: number;
      temp: number;
      respRate: number;
      bp: number;
    };
    abnormalFlags?: {
      heartRate?: boolean;
      spo2?: boolean;
      temp?: boolean;
      respRate?: boolean;
      bp?: boolean;
    };
    reasonsForAttention?: string[];
    possibleConditions?: string[];
    actionsToBeTaken?: string[];
    clinicalDecision?: {
      reason?: string;
      recommendation?: string;
      actionToBeTaken?: string[];
    };
  } | null;
}

// Generates an ECG heartbeat waveform pattern with realistic P-Q-R-S-T complexes
const generateEcgPoints = (length = 40) => {
  const points = [];
  for (let i = 0; i < length; i++) {
    const cyclePos = i % 10;
    let ecgVal = 50 + Math.sin(i * 0.2) * 2;
    if (cyclePos === 3) ecgVal = 48;       // Q dip
    else if (cyclePos === 4) ecgVal = 95;  // R peak
    else if (cyclePos === 5) ecgVal = 35;  // S dip
    else if (cyclePos === 7) ecgVal = 58;  // T wave
    points.push({ time: i, val: ecgVal });
  }
  return points;
};

export const IncubatorDetailModal: React.FC<IncubatorModalProps> = ({ isOpen, onClose, baby }) => {
  const [ecgData, setEcgData] = useState(generateEcgPoints(45));

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Dynamic continuous ECG live stream
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setEcgData(prev => {
        const last = prev[prev.length - 1];
        const nextTime = (last?.time ?? 0) + 1;
        const cyclePos = nextTime % 10;
        let ecgVal = 50 + (Math.random() - 0.5) * 3;
        if (cyclePos === 3) ecgVal = 47;
        else if (cyclePos === 4) ecgVal = 96 + (Math.random() - 0.5) * 4;
        else if (cyclePos === 5) ecgVal = 34;
        else if (cyclePos === 7) ecgVal = 59;
        
        return [...prev.slice(-44), { time: nextTime, val: ecgVal }];
      });
    }, 120);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !baby) return null;

  const isModerateOrWarning = baby.status === 'MODERATE' || baby.status === 'WARNING';
  const isCritical = baby.status === 'CRITICAL' || baby.status === 'UNSAFE';
  const isNormal = !isModerateOrWarning && !isCritical;

  const statusClassification = isCritical 
    ? 'CRITICAL' 
    : (isModerateOrWarning ? 'MODERATE' : 'NORMAL');

  const statusColor = isCritical 
    ? '#DC2626' 
    : (isModerateOrWarning ? '#D97706' : '#16A34A');

  const circleBg = isCritical
    ? '#DC2626'
    : (isModerateOrWarning ? '#D97706' : '#0D9488');

  // Reasons for attention
  const defaultReasons = isModerateOrWarning || isCritical ? [
    '• Heart Rate: High ↑',
    '• Oxygen Saturation: Low ↓',
    '• Temperature: High ↑',
    '• Respiratory Rate: High ↑',
    '• Systolic BP: High ↑',
    '• Diastolic BP: High ↑'
  ] : [
    '• Heart Rate: Normal (Normative range)',
    '• Oxygen Saturation: Optimal (≥98%)',
    '• Temperature: Euthermic (36.5–37.5 °C)',
    '• Respiratory Rate: Regular pattern',
    '• Blood Pressure: Normotensive target'
  ];

  const reasonsList = baby.reasonsForAttention && baby.reasonsForAttention.length > 0
    ? baby.reasonsForAttention
    : (baby.clinicalDecision?.reason ? baby.clinicalDecision.reason.split(' • ').map(r => r.startsWith('•') ? r : `• ${r}`) : defaultReasons);

  // Possible Conditions
  const defaultConditions = isModerateOrWarning || isCritical ? [
    '• Multiple abnormal vital signs — baby requires further assessment.',
    '• Hyperthermia — baby is too warm.',
    '• Low oxygen level — baby may be having difficulty maintaining adequate oxygenation.',
    '• Rapid breathing — possible respiratory distress.',
    '• Tachycardia — heart rate is higher than the monitoring range.',
    '• Potentially high blood pressure.'
  ] : [
    '• Normal physiological neonatal status.',
    '• Appropriate thermal regulation maintained in incubator.',
    '• Stable cardio-respiratory baseline.'
  ];

  const conditionsList = baby.possibleConditions && baby.possibleConditions.length > 0
    ? baby.possibleConditions
    : defaultConditions;

  // Actions To Be Taken
  const defaultActions = isModerateOrWarning || isCritical ? [
    '➔ Check the incubator/radiant-warmer setting and environmental temperature. Reduce excessive external warming according to the NICU protocol. Look for other signs of illness/infection and notify the clinical team.',
    '➔ Check the oxygen-saturation sensor placement. Check breathing pattern and respiratory rate. Check whether the baby is showing signs of respiratory distress.',
    '➔ Recount the breathing rate. Observe for signs such as chest retractions, grunting or abnormal breathing. Check oxygen saturation. Respiratory support may be considered by the clinical team if required.',
    '➔ Check oxygen saturation and breathing. Check whether the baby is distressed or agitated. Check temperature.',
    '➔ Repeat the measurement and notify the clinical team if it remains elevated.',
    '➔ Because multiple parameters are outside the personalized monitoring range, prompt clinical assessment is recommended.'
  ] : [
    '➔ Maintain current servo-controlled incubator thermal target.',
    '➔ Continue scheduled clinical vital sign checks per ward protocol.',
    '➔ Support routine maternal kangaroo care and scheduled feeding.'
  ];

  const actionsList = baby.actionsToBeTaken && baby.actionsToBeTaken.length > 0
    ? baby.actionsToBeTaken
    : (baby.clinicalDecision?.actionToBeTaken ? baby.clinicalDecision.actionToBeTaken.map(a => a.startsWith('➔') ? a : `➔ ${a}`) : defaultActions);

  // Vital Abnormal checks
  const isHrAbnormal = baby.abnormalFlags?.heartRate ?? (baby.vitals.heartRate > 160 || baby.vitals.heartRate < 100);
  const isSpo2Abnormal = baby.abnormalFlags?.spo2 ?? (baby.vitals.spo2 < 93);
  const isTempAbnormal = baby.abnormalFlags?.temp ?? (baby.vitals.temp > 37.5 || baby.vitals.temp < 36.5);
  const isRespAbnormal = baby.abnormalFlags?.respRate ?? (baby.vitals.respRate > 60 || baby.vitals.respRate < 30);
  const isBpAbnormal = baby.abnormalFlags?.bp ?? (baby.vitals.bp > 55 || baby.vitals.bp < 35);

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '16px'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '1040px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.25)',
          padding: '28px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          position: 'relative',
          border: '1px solid #E2E8F0',
          boxSizing: 'border-box'
        }}
      >
        {/* 1. TOP HEADER ROW */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px' }}>
          
          {/* Left: Circle Badge + Title & Subtitle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div 
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: circleBg,
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 900,
                flexShrink: 0,
                boxShadow: `0 4px 12px ${circleBg}40`
              }}
            >
              {baby.bedNumber}
            </div>

            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.4px', lineHeight: 1.2 }}>
                Incubator {baby.bedId}
              </h2>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', marginTop: '2px' }}>
                Baby ID: {baby.id} • {baby.age} • {baby.weight}
              </div>
            </div>
          </div>

          {/* Right: Close (X) Button */}
          <button 
            onClick={onClose}
            title="Close modal"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: '#F1F5F9',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. MAIN TWO-COLUMN BODY */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          
          {/* LEFT COLUMN: AI Classification, Vitals 2x2 + 1, Reasons For Attention */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* AI Classification & Confidence Box */}
            <div 
              style={{
                background: '#F8FAFC',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '14px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                  AI CLASSIFICATION
                </div>
                <div style={{ fontSize: '16px', fontWeight: 900, color: statusColor, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {isModerateOrWarning ? '⚠️ MODERATE' : (isCritical ? '🚨 CRITICAL' : '🟢 NORMAL')}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                  AI CONFIDENCE
                </div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>
                  {baby.confidence}%
                </div>
              </div>
            </div>

            {/* Vital Signs Grid (2 Columns, 4 boxes) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              
              {/* 1. HEART RATE */}
              <div 
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: isHrAbnormal ? '1.5px solid #FCA5A5' : '1px solid #E2E8F0',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.5px' }}>
                  <Heart size={12} color="#EF4444" /> HEART RATE
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: isHrAbnormal ? '#DC2626' : '#0F172A', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.5px' }}>
                    {baby.vitals.heartRate} <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>bpm</span>
                  </div>
                  <span style={{ color: '#0D9488', fontSize: '16px', fontWeight: 900 }}>→</span>
                </div>
              </div>

              {/* 2. OXYGEN SATURATION */}
              <div 
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: isSpo2Abnormal ? '1.5px solid #FCA5A5' : '1px solid #E2E8F0',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.5px' }}>
                  <Zap size={12} color="#0284C7" /> OXYGEN SATURATION
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: isSpo2Abnormal ? '#DC2626' : '#0F172A', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.5px' }}>
                    {baby.vitals.spo2}<span style={{ fontSize: '14px', fontWeight: 800 }}>%</span>
                  </div>
                  <span style={{ color: '#0D9488', fontSize: '16px', fontWeight: 900 }}>→</span>
                </div>
              </div>

              {/* 3. TEMPERATURE */}
              <div 
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: isTempAbnormal ? '1.5px solid #FCA5A5' : '1px solid #E2E8F0',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.5px' }}>
                  <Thermometer size={12} color="#EF4444" /> TEMPERATURE
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: isTempAbnormal ? '#DC2626' : '#0F172A', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.5px' }}>
                    {baby.vitals.temp}<span style={{ fontSize: '14px', fontWeight: 800 }}>°C</span>
                  </div>
                  <span style={{ color: '#0D9488', fontSize: '16px', fontWeight: 900 }}>→</span>
                </div>
              </div>

              {/* 4. RESPIRATORY RATE */}
              <div 
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: isRespAbnormal ? '1.5px solid #FCA5A5' : '1px solid #E2E8F0',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.5px' }}>
                  <Wind size={12} color="#0284C7" /> RESPIRATORY RATE
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: isRespAbnormal ? '#DC2626' : '#0F172A', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.5px' }}>
                    {baby.vitals.respRate} <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>/min</span>
                  </div>
                  <span style={{ color: '#0D9488', fontSize: '16px', fontWeight: 900 }}>→</span>
                </div>
              </div>

            </div>

            {/* 5. BLOOD PRESSURE (MEAN MAP) - Full Width Box */}
            <div 
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: isBpAbnormal ? '1.5px solid #FCA5A5' : '1px solid #E2E8F0',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: 800, color: '#64748B', letterSpacing: '0.5px' }}>
                  <Activity size={12} color="#EF4444" /> BLOOD PRESSURE (MEAN MAP)
                </div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: isBpAbnormal ? '#DC2626' : '#0F172A', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
                  {baby.vitals.bp} <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>mmHg</span>
                </div>
              </div>
              <span style={{ color: '#0D9488', fontSize: '18px', fontWeight: 900 }}>→</span>
            </div>

            {/* REASONS FOR ATTENTION (Orange bordered box) */}
            <div 
              style={{
                border: '1.5px solid #F59E0B',
                borderRadius: '14px',
                padding: '16px 18px',
                background: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 900, color: '#D97706', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                REASONS FOR ATTENTION
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#1E293B', fontWeight: 700, lineHeight: 1.45 }}>
                {reasonsList.map((reason, idx) => (
                  <div key={idx} style={{ color: '#0F172A' }}>
                    {reason}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Possible Conditions & Actions To Be Taken */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* POSSIBLE CONDITIONS (Soft grey box) */}
            <div 
              style={{
                background: '#F8FAFC',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 900, color: '#0F172A', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                POSSIBLE CONDITIONS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', color: '#1E293B', fontWeight: 700, lineHeight: 1.45 }}>
                {conditionsList.map((cond, idx) => (
                  <div key={idx}>
                    {cond}
                  </div>
                ))}
              </div>
            </div>

            {/* ACTIONS TO BE TAKEN (Orange bordered box) */}
            <div 
              style={{
                border: '1.5px solid #F59E0B',
                borderRadius: '14px',
                padding: '16px 18px',
                background: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 900, color: '#D97706', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                ACTIONS TO BE TAKEN
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11.5px', color: '#1E293B', fontWeight: 700, lineHeight: 1.4 }}>
                {actionsList.map((act, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <span style={{ color: '#D97706', fontWeight: 900, flexShrink: 0 }}>➔</span>
                    <span>{act.replace(/^➔\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* 3. BOTTOM FULL-WIDTH LIVE BEDSIDE WAVEFORM (ECG BEATING RHYTHM) */}
        <div 
          style={{
            background: '#F8FAFC',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '14px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A', letterSpacing: '0.3px' }}>
            Live Bedside Waveform (ECG Beating Rhythm)
          </div>

          <div style={{ height: '70px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ecgData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="time" hide />
                <YAxis hide domain={[20, 110]} />
                <Area 
                  type="monotone" 
                  dataKey="val" 
                  stroke={isModerateOrWarning ? '#D97706' : (isCritical ? '#DC2626' : '#0D9488')} 
                  strokeWidth={2} 
                  fill="transparent" 
                  isAnimationActive={false} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
