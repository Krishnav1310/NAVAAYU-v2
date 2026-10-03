import React, { useState } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Volume2, 
  ShieldCheck, 
  CheckCircle2, 
  TrendingUp,
  Activity
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

interface EnvironmentalMetric {
  id: string;
  name: string;
  value: string;
  unit: string;
  normalRange: string;
  status: 'NORMAL' | 'WARNING';
  statusLabel: string;
  icon: 'temp' | 'hum' | 'aqi' | 'noise';
  summary: string;
}

const ESSENTIAL_METRICS: EnvironmentalMetric[] = [
  {
    id: "env-temp",
    name: "Ward Ambient Temperature",
    value: "24.8",
    unit: "°C",
    normalRange: "24.0 - 26.0 °C",
    status: "NORMAL",
    statusLabel: "OPTIMAL",
    icon: "temp",
    summary: "Maintains neonatal thermal stability and prevents cold stress."
  },
  {
    id: "env-hum",
    name: "Relative Humidity",
    value: "52",
    unit: "%",
    normalRange: "40 - 60 %",
    status: "NORMAL",
    statusLabel: "OPTIMAL",
    icon: "hum",
    summary: "Reduces transepidermal water loss and protects premature infant skin."
  },
  {
    id: "env-aqi",
    name: "Air Cleanliness (AQI)",
    value: "22",
    unit: "AQI",
    normalRange: "0 - 50 AQI",
    status: "NORMAL",
    statusLabel: "HEPA ACTIVE",
    icon: "aqi",
    summary: "Positive-pressure filtration eliminating airborne particulate matter."
  },
  {
    id: "env-noise",
    name: "Acoustic Noise Level",
    value: "42",
    unit: "dB",
    normalRange: "< 45 dB",
    status: "NORMAL",
    statusLabel: "CALM",
    icon: "noise",
    summary: "Complies with AAP guidelines to protect infant neurological sleep cycles."
  }
];

const HOURLY_TRENDS = [
  { time: '04:00', temp: 24.6, hum: 51, noise: 38 },
  { time: '08:00', temp: 24.9, hum: 53, noise: 44 },
  { time: '12:00', temp: 24.8, hum: 52, noise: 41 },
  { time: '16:00', temp: 25.0, hum: 52, noise: 43 },
  { time: '20:00', temp: 24.7, hum: 52, noise: 40 },
  { time: 'Current', temp: 24.8, hum: 52, noise: 42 }
];

export function EnvironmentalFactorDashboard() {
  const [metrics] = useState<EnvironmentalMetric[]>(ESSENTIAL_METRICS);

  return (
    <main style={{ maxWidth: '1440px', margin: '24px auto 0', padding: '0 28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* 1. HEADER TITLE & STATUS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0E7490', margin: 0, letterSpacing: '-0.5px' }}>
            Environmental Safety & Microclimate
          </h2>
          <p style={{ color: '#5C7A68', fontSize: '12px', fontWeight: 600, margin: '4px 0 0 0' }}>
            Real-time ward ambient environment and safety parameters
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 12px', background: '#F0FDF4', color: '#15803D', borderRadius: '8px', border: '1px solid #DCFCE7', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E' }} />
            All Parameters Normal
          </span>
          <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 12px', background: '#FFF7ED', color: '#C2410C', borderRadius: '8px', border: '1px solid #FFEDD5' }}>
            Simulated Prototype Data
          </span>
        </div>
      </div>

      {/* 2. FOUR ESSENTIAL METRIC CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
        {metrics.map((m) => {
          let iconElement = <Thermometer size={22} color="#EA580C" />;
          let iconBg = '#FFF7ED';
          let valColor = '#133926';

          if (m.icon === 'hum') {
            iconElement = <Droplets size={22} color="#0D9488" />;
            iconBg = '#F0FDFA';
          } else if (m.icon === 'aqi') {
            iconElement = <Wind size={22} color="#16A34A" />;
            iconBg = '#F0FDF4';
          } else if (m.icon === 'noise') {
            iconElement = <Volume2 size={22} color="#0891B2" />;
            iconBg = '#ECFEFF';
          }

          return (
            <div 
              key={m.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '18px',
                border: '1.5px solid #E2EFE6',
                padding: '22px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 16px rgba(16, 100, 60, 0.04)',
                minHeight: '170px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {iconElement}
                  </div>
                  <span style={{ fontSize: '10.5px', fontWeight: 900, background: '#DCFCE7', color: '#15803D', padding: '3px 9px', borderRadius: '6px' }}>
                    {m.statusLabel}
                  </span>
                </div>

                <div style={{ marginTop: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#5C7A68', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {m.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
                    <span style={{ fontSize: '32px', fontWeight: 900, color: valColor, letterSpacing: '-1px', lineHeight: 1 }}>
                      {m.value}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#5C7A68' }}>
                      {m.unit}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '10px', marginTop: '10px', fontSize: '11px' }}>
                <span style={{ color: '#5C7A68', fontWeight: 700 }}>Safe Target:</span>
                <span style={{ color: '#0E7490', fontWeight: 800 }}>{m.normalRange}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. 24-HOUR WARD CLIMATE TREND CHART */}
      <div 
        style={{
          background: '#FFFFFF',
          borderRadius: '18px',
          border: '1.5px solid #E2EFE6',
          padding: '22px 26px',
          boxShadow: '0 4px 16px rgba(16, 100, 60, 0.04)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#133926', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Microclimate Stability Trend (24h)
            </span>
            <span style={{ fontSize: '11px', color: '#5C7A68', display: 'block', fontWeight: 600, marginTop: '2px' }}>
              Continuous atmospheric temperature & humidity regulation
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px', fontWeight: 800 }}>
            <span style={{ color: '#EA580C', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EA580C' }} /> Temperature (°C)
            </span>
            <span style={{ color: '#0D9488', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0D9488' }} /> Humidity (%)
            </span>
          </div>
        </div>

        <div style={{ width: '100%', height: '220px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={HOURLY_TRENDS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EA580C" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#EA580C" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0D9488" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#64748B' }} />
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
              <Area type="monotone" dataKey="temp" stroke="#EA580C" strokeWidth={2.5} fill="url(#tempGrad)" name="Temperature (°C)" />
              <Area type="monotone" dataKey="hum" stroke="#0D9488" strokeWidth={2} fill="url(#humGrad)" name="Humidity (%)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </main>
  );
}
