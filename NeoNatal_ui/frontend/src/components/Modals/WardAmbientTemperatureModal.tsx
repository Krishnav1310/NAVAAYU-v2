import React, { useState, useEffect } from 'react';
import { 
  X, 
  Thermometer, 
  History, 
  Layers,
  Sparkles,
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
import { useWardAmbient } from '../../context/WardAmbientContext';

export interface WardAmbientTemperatureModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function WardAmbientTemperatureModal({
  isOpen: propsIsOpen,
  onClose: propsOnClose
}: WardAmbientTemperatureModalProps) {
  const {
    babies,
    wardAverageFormatted,
    currentRoomTempFormatted,
    differenceFormatted,
    history,
    isAmbientModalOpen,
    closeAmbientModal,
    triggerExampleBaby03Shift
  } = useWardAmbient();

  const [activeTab, setActiveTab] = useState<'live' | 'history'>('live');
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  const isOpen = propsIsOpen !== undefined ? propsIsOpen : isAmbientModalOpen;
  const handleClose = propsOnClose || closeAmbientModal;

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  // Format chart data (reverse history to show oldest to newest)
  const chartData = [...history].reverse().map(h => ({
    time: h.timestamp,
    wardTemp: h.wardRequiredTemperature,
    roomTemp: h.currentRoomTemperature,
    change: h.change
  }));

  const selectedHistoryEntry = history.find(h => h.id === selectedHistoryId) || history[0];

  return (
    <div
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ward-ambient-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
    >
      <style>{`
        @keyframes wardModalPopLarge {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(8px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .ward-ambient-grid-large {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 14px;
        }
        .ward-card-large-top {
          grid-column: span 2;
        }
        .ward-card-large-bottom {
          grid-column: span 3;
        }
        @media (max-width: 640px) {
          .ward-ambient-grid-large {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          .ward-card-large-top {
            grid-column: span 1;
          }
          .ward-card-large-large-bottom {
            grid-column: span 1;
          }
          .ward-card-large-bottom:last-child {
            grid-column: span 2;
          }
        }
        @media (max-width: 440px) {
          .ward-ambient-grid-large {
            grid-template-columns: 1fr;
          }
          .ward-card-large-top, .ward-card-large-bottom {
            grid-column: span 1 !important;
          }
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '2px solid #E2EFE6',
          boxShadow: '0 32px 64px -12px rgba(16, 100, 60, 0.22), 0 16px 32px -6px rgba(0, 0, 0, 0.12)',
          width: '100%',
          maxWidth: activeTab === 'history' ? '860px' : '780px',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          animation: 'wardModalPopLarge 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          boxSizing: 'border-box',
          transition: 'max-width 0.25s ease'
        }}
      >
        {/* 1. LARGE, CLEAR HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div 
                style={{ 
                  width: '34px', 
                  height: '34px', 
                  borderRadius: '10px', 
                  background: '#FFF7ED', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '1.5px solid #FFEDD5',
                  boxShadow: '0 2px 6px rgba(234, 88, 12, 0.12)'
                }}
              >
                <Thermometer size={20} color="#EA580C" />
              </div>
              <div>
                <h3 
                  id="ward-ambient-title"
                  style={{ 
                    margin: 0, 
                    fontSize: '16px', 
                    fontWeight: 900, 
                    color: '#133926', 
                    letterSpacing: '0.5px', 
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  WARD AMBIENT TEMPERATURE
                  <span style={{ fontSize: '10px', fontWeight: 900, padding: '2px 8px', background: '#F0FDF4', color: '#16A34A', borderRadius: '12px', border: '1px solid #DCFCE7', letterSpacing: '0.4px' }}>
                    ● LIVE CALCULATION
                  </span>
                </h3>
              </div>
            </div>
            <div style={{ fontSize: '12.5px', color: '#5C7A68', fontWeight: 600, marginTop: '4px' }}>
              Recommended: <span style={{ fontWeight: 900, color: '#0E7490', fontSize: '14.5px' }}>{wardAverageFormatted}</span> • Based on {babies.length} babies currently monitored
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* View Mode Toggle: Live Breakdown vs History */}
            <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <button
                onClick={() => setActiveTab('live')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  border: 'none',
                  background: activeTab === 'live' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'live' ? '#0E7490' : '#64748B',
                  boxShadow: activeTab === 'live' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Layers size={13} />
                Live ({babies.length})
              </button>

              <button
                onClick={() => setActiveTab('history')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  border: 'none',
                  background: activeTab === 'history' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'history' ? '#0E7490' : '#64748B',
                  boxShadow: activeTab === 'history' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease'
                }}
              >
                <History size={13} />
                History ({history.length})
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              aria-label="Close modal"
              style={{
                background: '#F8FAFC',
                border: '1.5px solid #E2E8F0',
                borderRadius: '10px',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748B',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FEE2E2';
                e.currentTarget.style.color = '#DC2626';
                e.currentTarget.style.borderColor = '#FCA5A5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F8FAFC';
                e.currentTarget.style.color = '#64748B';
                e.currentTarget.style.borderColor = '#E2E8F0';
              }}
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* 2. TAB CONTENT */}
        {activeTab === 'live' ? (
          <>
            {/* BIGGER, PROMINENT 5-BABY GRID */}
            <div className="ward-ambient-grid-large">
              {babies.slice(0, 5).map((baby, idx) => {
                const spanClass = idx < 3 ? 'ward-card-large-top' : 'ward-card-large-bottom';
                const isElevated = baby.currentTemp >= 37.4;
                const isCool = baby.currentTemp <= 36.4;

                return (
                  <div
                    key={baby.id || idx}
                    className={spanClass}
                    style={{
                      background: '#F8FDF9',
                      border: '2px solid #D5E8DC',
                      borderRadius: '14px',
                      padding: '14px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '8px',
                      minHeight: '105px',
                      boxSizing: 'border-box',
                      boxShadow: '0 4px 12px rgba(16, 100, 60, 0.04)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Card Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 900, color: '#0E7490', letterSpacing: '0.4px' }}>
                        {baby.babyNumber}
                      </span>
                      <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#475569', background: '#E2EFE6', padding: '2px 8px', borderRadius: '6px' }}>
                        {baby.bedId}
                      </span>
                    </div>

                    {/* Current Baby Body Temperature */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#5C7A68', fontWeight: 700 }}>
                        Current:
                      </span>
                      <span style={{ 
                        fontSize: '15px', 
                        fontWeight: 900, 
                        color: isElevated ? '#EA580C' : isCool ? '#0284C7' : '#133926',
                        letterSpacing: '-0.3px'
                      }}>
                        {baby.currentTemp.toFixed(1)}°C
                      </span>
                    </div>

                    {/* Required Ambient Temperature */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2EFE6', paddingTop: '6px' }}>
                      <span style={{ fontSize: '12px', color: '#5C7A68', fontWeight: 700 }}>
                        Required:
                      </span>
                      <span style={{ 
                        fontSize: '16px', 
                        fontWeight: 900, 
                        color: '#EA580C',
                        letterSpacing: '-0.4px',
                        background: '#FFF7ED',
                        padding: '1px 8px',
                        borderRadius: '6px',
                        border: '1px solid #FFEDD5'
                      }}>
                        {baby.requiredAmbientTemp.toFixed(1)}°C
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SCENARIO DEMO SHORTCUT */}
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                background: '#F0FDFA', 
                border: '1.5px dashed #99F6E4', 
                borderRadius: '12px', 
                padding: '8px 14px',
                fontSize: '11.5px'
              }}
            >
              <span style={{ color: '#0F766E', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} color="#0D9488" />
                <span>Simulation: Live temperature adaptation active</span>
              </span>
              <button
                onClick={triggerExampleBaby03Shift}
                style={{
                  background: '#CCFBF1',
                  border: '1.5px solid #99F6E4',
                  color: '#0F766E',
                  borderRadius: '7px',
                  padding: '4px 10px',
                  fontWeight: 800,
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Simulate Baby 03 reaching 37.4°C (Required: 26.2°C, Ward Avg: 27.0°C)"
              >
                ⚡ Test Baby 03 (+0.3°C shift)
              </button>
            </div>
          </>
        ) : (
          /* TEMPERATURE HISTORY & VISUALIZATION TAB */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* 1. History Trend Chart */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1.5px solid #E2E8F0',
                borderRadius: '14px',
                padding: '14px 18px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 900, color: '#133926', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Ward Ambient Requirement vs Time
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', fontWeight: 700 }}>
                  <span style={{ color: '#0E7490', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#0E7490' }} />
                    Ward Required (°C)
                  </span>
                  <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#94A3B8' }} />
                    Room Temp (°C)
                  </span>
                </div>
              </div>

              <div style={{ width: '100%', height: '170px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="wardReqGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0E7490" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#0E7490" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="time" tick={{ fontSize: 10.5, fill: '#64748B' }} />
                    <YAxis domain={[25.5, 28.5]} tick={{ fontSize: 10.5, fill: '#64748B' }} />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '10px', 
                        border: '1px solid #CBD5E1', 
                        fontSize: '11.5px', 
                        fontWeight: 700,
                        padding: '8px 12px'
                      }} 
                    />
                    <Area type="monotone" dataKey="wardTemp" stroke="#0E7490" strokeWidth={2.5} fill="url(#wardReqGrad)" name="Ward Required" />
                    <Area type="monotone" dataKey="roomTemp" stroke="#94A3B8" strokeWidth={2} strokeDasharray="3 3" fill="transparent" name="Room Temp" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. History Log Table */}
            <div
              style={{
                border: '1.5px solid #E2EFE6',
                borderRadius: '12px',
                overflow: 'hidden',
                maxHeight: '180px',
                overflowY: 'auto'
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F1F5F9', borderBottom: '1.5px solid #E2E8F0', color: '#334155', fontWeight: 800 }}>
                    <th style={{ padding: '8px 12px' }}>TIME</th>
                    <th style={{ padding: '8px 12px' }}>WARD REQUIRED</th>
                    <th style={{ padding: '8px 12px' }}>ROOM</th>
                    <th style={{ padding: '8px 12px' }}>CHANGE</th>
                    <th style={{ padding: '8px 12px' }}>BABIES</th>
                    <th style={{ padding: '8px 12px' }}>REASON / BREAKDOWN</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry, idx) => {
                    const isSelected = entry.id === selectedHistoryEntry?.id;
                    const changeVal = entry.change;
                    const changeBadge = changeVal > 0 ? `+${changeVal.toFixed(1)}°C` : changeVal < 0 ? `${changeVal.toFixed(1)}°C` : '—';
                    const changeColor = changeVal > 0 ? '#D97706' : changeVal < 0 ? '#2563EB' : '#64748B';

                    return (
                      <tr
                        key={entry.id || idx}
                        onClick={() => setSelectedHistoryId(entry.id)}
                        style={{
                          background: isSelected ? '#F0FDFA' : idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                          borderBottom: '1px solid #F1F5F9',
                          cursor: 'pointer',
                          fontWeight: isSelected ? 800 : 600
                        }}
                      >
                        <td style={{ padding: '8px 12px', color: '#133926' }}>{entry.timestamp}</td>
                        <td style={{ padding: '8px 12px', color: '#0E7490', fontWeight: 800 }}>{entry.wardRequiredTemperature.toFixed(1)}°C</td>
                        <td style={{ padding: '8px 12px', color: '#64748B' }}>{entry.currentRoomTemperature.toFixed(1)}°C</td>
                        <td style={{ padding: '8px 12px', color: changeColor, fontWeight: 800 }}>{changeBadge}</td>
                        <td style={{ padding: '8px 12px', color: '#475569' }}>{entry.babyCount} babies</td>
                        <td style={{ padding: '8px 12px', color: '#5C7A68', fontSize: '10.5px' }}>{entry.reason || 'Telemetry snapshot'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 3. Selected Historical Snapshot Detail Breakdown */}
            {selectedHistoryEntry && selectedHistoryEntry.babyRequirements && (
              <div style={{ background: '#F8FDF9', border: '1.5px solid #E2EFE6', borderRadius: '10px', padding: '8px 12px', fontSize: '11px' }}>
                <span style={{ fontWeight: 800, color: '#0E7490' }}>Snapshot Breakdown ({selectedHistoryEntry.timestamp}): </span>
                <span style={{ color: '#5C7A68' }}>
                  {selectedHistoryEntry.babyRequirements.map(b => `${b.babyNumber}: ${b.currentTemp.toFixed(1)}°C (Req: ${b.requiredAmbientTemperature.toFixed(1)}°C)`).join(' • ')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 3. LARGE FOOTER SUMMARY */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1.5px solid #E2E8F0',
            borderRadius: '14px',
            padding: '12px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '12.5px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#64748B', fontWeight: 800 }}>WARD AVERAGE:</span>
            <span style={{ color: '#0E7490', fontWeight: 900, fontSize: '15px' }}>{wardAverageFormatted}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#64748B', fontWeight: 800 }}>CURRENT ROOM:</span>
            <span style={{ color: '#133926', fontWeight: 900, fontSize: '15px' }}>{currentRoomTempFormatted}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#64748B', fontWeight: 800 }}>Difference:</span>
            <span
              style={{
                color: '#D97706',
                background: '#FEF3C7',
                border: '1.5px solid #FDE68A',
                fontWeight: 900,
                fontSize: '12.5px',
                padding: '3px 10px',
                borderRadius: '8px'
              }}
            >
              {differenceFormatted}
            </span>
          </div>
        </div>

        {/* 4. CLINICAL SAFETY DECISION SUPPORT NOTICE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10.5px', color: '#64748B', fontWeight: 600 }}>
          <Info size={14} color="#0D9488" style={{ flexShrink: 0 }} />
          <span>Clinical Decision Support: Ward requirement recommendations adapt dynamically to infant neutral thermal zones. Staff protocol confirmation required.</span>
        </div>
      </div>
    </div>
  );
}
