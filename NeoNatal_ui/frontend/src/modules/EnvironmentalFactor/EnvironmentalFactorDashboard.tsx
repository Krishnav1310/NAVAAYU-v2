import React from 'react';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Volume2, 
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { WardAmbientTemperatureModal } from '../../components/Modals/WardAmbientTemperatureModal';
import { useWardAmbient } from '../../context/WardAmbientContext';

export function EnvironmentalFactorDashboard() {
  const {
    wardAverage,
    wardAverageFormatted,
    differenceFormatted,
    babies,
    openAmbientModal
  } = useWardAmbient();

  return (
    <main style={{ maxWidth: '1440px', margin: '24px auto 0', padding: '0 28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. HEADER TITLE & STATUS BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0E7490', margin: 0, letterSpacing: '-0.5px' }}>
            Environmental Safety & Microclimate
          </h2>
          <p style={{ color: '#5C7A68', fontSize: '13px', fontWeight: 600, margin: '5px 0 0 0' }}>
            Continuous ward microclimate monitoring and dynamic infant neutral thermal zone adaptation
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={openAmbientModal}
            style={{ 
              fontSize: '11.5px', 
              fontWeight: 800, 
              padding: '7px 16px', 
              background: '#FFF7ED', 
              color: '#EA580C', 
              borderRadius: '9px', 
              border: '1.5px solid #FFEDD5', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
              boxShadow: '0 2px 6px rgba(234, 88, 12, 0.08)'
            }}
          >
            <Thermometer size={14} color="#EA580C" />
            Ward Ambient: {wardAverageFormatted} ({babies.length} Babies Live)
          </button>
          <span style={{ fontSize: '11.5px', fontWeight: 800, padding: '6px 14px', background: '#F0FDF4', color: '#15803D', borderRadius: '9px', border: '1px solid #DCFCE7', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22C55E' }} />
            All Parameters Normal
          </span>
        </div>
      </div>

      {/* 2. PROPERLY FITTED 4 ESSENTIAL MICROCLIMATE CARDS (SPACIOUS 2x2 SCREEN-FITTING GRID) */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', 
          gap: '22px',
          alignItems: 'stretch'
        }}
      >
        
        {/* CARD 1: WARD AMBIENT TEMPERATURE (DYNAMIC LIVE ADAPTATION) */}
        <div 
          onClick={openAmbientModal}
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '2px solid #FED7AA',
            padding: '26px 28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(234, 88, 12, 0.09)',
            minHeight: '230px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative'
          }}
          title="Click to open compact live breakdown and temperature history"
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div 
                style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: '#FFF7ED', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '1.5px solid #FFEDD5'
                }}
              >
                <Thermometer size={26} color="#EA580C" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, background: '#FFF7ED', color: '#EA580C', padding: '4px 10px', borderRadius: '8px', border: '1px solid #FFEDD5', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {babies.length} BABIES <ArrowUpRight size={12} />
                </span>
                <span style={{ fontSize: '11px', fontWeight: 900, background: '#F0FDF4', color: '#15803D', padding: '4px 10px', borderRadius: '8px', border: '1px solid #DCFCE7', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E' }} />
                  LIVE ADAPTATION
                </span>
              </div>
            </div>

            <div style={{ marginTop: '18px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#5C7A68', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Ward Ambient Temperature
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
                <span 
                  style={{ 
                    fontSize: '42px', 
                    fontWeight: 900, 
                    color: '#133926', 
                    letterSpacing: '-1.5px', 
                    lineHeight: 1,
                    transition: 'color 0.3s ease'
                  }}
                >
                  {wardAverage.toFixed(1)}
                </span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#5C7A68' }}>
                  °C
                </span>
                <span style={{ fontSize: '12px', color: '#0E7490', fontWeight: 700, marginLeft: '8px', background: '#ECFEFF', padding: '2px 8px', borderRadius: '6px' }}>
                  Based on {babies.length} babies
                </span>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#64748B', lineHeight: 1.4, fontWeight: 600 }}>
                Dynamic neutral thermal zone calculation automatically adjusting to individual infant body temperatures.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '14px', marginTop: '16px', fontSize: '12px' }}>
            <span style={{ color: '#0E7490', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
              🔍 Click for Live 5-Baby Grid & History
            </span>
            <span style={{ color: '#EA580C', fontWeight: 900, background: '#FFF7ED', padding: '3px 10px', borderRadius: '6px', border: '1px solid #FFEDD5' }}>
              Req: {wardAverageFormatted} (Diff: {differenceFormatted})
            </span>
          </div>
        </div>

        {/* CARD 2: RELATIVE HUMIDITY */}
        <div 
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1.5px solid #E2EFE6',
            padding: '26px 28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 18px rgba(16, 100, 60, 0.04)',
            minHeight: '230px'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div 
                style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: '#F0FDFA', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '1.5px solid #CCFBF1'
                }}
              >
                <Droplets size={26} color="#0D9488" />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 900, background: '#DCFCE7', color: '#15803D', padding: '4px 10px', borderRadius: '8px' }}>
                OPTIMAL
              </span>
            </div>

            <div style={{ marginTop: '18px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#5C7A68', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Relative Humidity
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
                <span style={{ fontSize: '42px', fontWeight: 900, color: '#133926', letterSpacing: '-1.5px', lineHeight: 1 }}>
                  52
                </span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#5C7A68' }}>
                  %
                </span>
                <span style={{ fontSize: '12px', color: '#0D9488', fontWeight: 700, marginLeft: '8px', background: '#F0FDFA', padding: '2px 8px', borderRadius: '6px' }}>
                  Target: 40 - 60%
                </span>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#64748B', lineHeight: 1.4, fontWeight: 600 }}>
                Prevents transepidermal water loss and protects immature stratum corneum skin barriers in premature neonates.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '14px', marginTop: '16px', fontSize: '12px' }}>
            <span style={{ color: '#5C7A68', fontWeight: 700 }}>Hygrometer Status: Active</span>
            <span style={{ color: '#0D9488', fontWeight: 800 }}>Safe Range: 40 - 60 %</span>
          </div>
        </div>

        {/* CARD 3: AIR CLEANLINESS (AQI) */}
        <div 
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1.5px solid #E2EFE6',
            padding: '26px 28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 18px rgba(16, 100, 60, 0.04)',
            minHeight: '230px'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div 
                style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: '#F0FDF4', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '1.5px solid #DCFCE7'
                }}
              >
                <Wind size={26} color="#16A34A" />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 900, background: '#DCFCE7', color: '#15803D', padding: '4px 10px', borderRadius: '8px' }}>
                HEPA ACTIVE
              </span>
            </div>

            <div style={{ marginTop: '18px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#5C7A68', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Air Cleanliness (AQI)
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
                <span style={{ fontSize: '42px', fontWeight: 900, color: '#133926', letterSpacing: '-1.5px', lineHeight: 1 }}>
                  22
                </span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#5C7A68' }}>
                  AQI
                </span>
                <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: 700, marginLeft: '8px', background: '#F0FDF4', padding: '2px 8px', borderRadius: '6px' }}>
                  PM2.5 Clean
                </span>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#64748B', lineHeight: 1.4, fontWeight: 600 }}>
                Continuous positive-pressure laminar filtration eliminating fine airborne particulate matter and allergens.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '14px', marginTop: '16px', fontSize: '12px' }}>
            <span style={{ color: '#5C7A68', fontWeight: 700 }}>Filtration: 99.97% HEPA</span>
            <span style={{ color: '#16A34A', fontWeight: 800 }}>Safe Range: 0 - 50 AQI</span>
          </div>
        </div>

        {/* CARD 4: ACOUSTIC NOISE LEVEL */}
        <div 
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1.5px solid #E2EFE6',
            padding: '26px 28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 18px rgba(16, 100, 60, 0.04)',
            minHeight: '230px'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div 
                style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: '#ECFEFF', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '1.5px solid #CFFAFE'
                }}
              >
                <Volume2 size={26} color="#0891B2" />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 900, background: '#DCFCE7', color: '#15803D', padding: '4px 10px', borderRadius: '8px' }}>
                CALM
              </span>
            </div>

            <div style={{ marginTop: '18px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#5C7A68', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Acoustic Noise Level
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
                <span style={{ fontSize: '42px', fontWeight: 900, color: '#133926', letterSpacing: '-1.5px', lineHeight: 1 }}>
                  42
                </span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#5C7A68' }}>
                  dB
                </span>
                <span style={{ fontSize: '12px', color: '#0891B2', fontWeight: 700, marginLeft: '8px', background: '#ECFEFF', padding: '2px 8px', borderRadius: '6px' }}>
                  AAP Compliant
                </span>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#64748B', lineHeight: 1.4, fontWeight: 600 }}>
                Maintains acoustic ward levels below AAP thresholds to safeguard fragile infant neurological sleep architecture.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '14px', marginTop: '16px', fontSize: '12px' }}>
            <span style={{ color: '#5C7A68', fontWeight: 700 }}>Peak Sound: 44 dB</span>
            <span style={{ color: '#0891B2', fontWeight: 800 }}>Safe Target: &lt; 45 dB</span>
          </div>
        </div>

      </div>

      {/* COMPACT 5-BABY WARD AMBIENT TEMPERATURE MODAL */}
      <WardAmbientTemperatureModal />
    </main>
  );
}
