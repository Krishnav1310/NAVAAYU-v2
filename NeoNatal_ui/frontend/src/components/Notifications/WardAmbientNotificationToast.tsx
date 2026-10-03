import React from 'react';
import { Thermometer, X, ArrowRight } from 'lucide-react';
import { useWardAmbient } from '../../context/WardAmbientContext';

export function WardAmbientNotificationToast() {
  const { activeNotification, dismissNotification, openAmbientModal } = useWardAmbient();

  if (!activeNotification || !activeNotification.isOpen) return null;

  const { previousWardTemp, currentWardTemp, totalChange, babyCount, timestamp } = activeNotification;
  const isWarming = totalChange > 0;
  const changeFormatted = (totalChange > 0 ? `+${totalChange.toFixed(1)}` : `${totalChange.toFixed(1)}`) + '°C';

  const handleViewDetails = () => {
    dismissNotification();
    openAmbientModal();
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: '18px',
        right: '18px',
        zIndex: 9998,
        maxWidth: '320px',
        width: 'calc(100% - 36px)',
        background: '#FFFFFF',
        borderRadius: '6px', // Clean, small rectangle shape
        border: '1px solid #FED7AA',
        borderLeft: '4px solid #EA580C', // Compact accent indicator
        boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.15), 0 2px 6px rgba(0, 0, 0, 0.06)',
        padding: '10px 12px',
        animation: 'wardToastSlideTopRight 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        boxSizing: 'border-box'
      }}
    >
      <style>{`
        @keyframes wardToastSlideTopRight {
          0% {
            opacity: 0;
            transform: translateX(30px) translateY(-8px);
          }
          100% {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }
      `}</style>

      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              background: '#FFF7ED',
              border: '1px solid #FFEDD5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#EA580C'
            }}
          >
            <Thermometer size={12} />
          </div>
          <span style={{ fontSize: '11px', fontWeight: 900, color: '#133926', letterSpacing: '0.2px', textTransform: 'uppercase' }}>
            Ward Temp Update
          </span>
          <span
            style={{
              fontSize: '9.5px',
              fontWeight: 800,
              color: isWarming ? '#D97706' : '#2563EB',
              background: isWarming ? '#FEF3C7' : '#EFF6FF',
              padding: '1px 5px',
              borderRadius: '3px'
            }}
          >
            {changeFormatted}
          </span>
        </div>

        <button
          onClick={dismissNotification}
          aria-label="Dismiss temperature update"
          style={{
            background: 'transparent',
            border: 'none',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#94A3B8',
            borderRadius: '3px',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#DC2626';
            e.currentTarget.style.background = '#FEE2E2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#94A3B8';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <X size={12} />
        </button>
      </div>

      {/* Compact Metric Row */}
      <div
        style={{
          background: '#F8FDF9',
          border: '1px solid #E2EFE6',
          borderRadius: '4px',
          padding: '5px 8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '10.5px'
        }}
      >
        <div style={{ color: '#64748B', fontWeight: 600 }}>
          Prev: <span style={{ color: '#334155', fontWeight: 700 }}>{previousWardTemp.toFixed(1)}°C</span>
        </div>
        <div style={{ color: '#0E7490', fontWeight: 800 }}>
          Req: <span style={{ fontSize: '11.5px', fontWeight: 900 }}>{currentWardTemp.toFixed(1)}°C</span>
        </div>
        <div style={{ color: '#64748B', fontWeight: 600, fontSize: '9.5px' }}>
          {babyCount} babies • {timestamp}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '6px', marginTop: '1px' }}>
        <button
          onClick={handleViewDetails}
          style={{
            flex: 1,
            padding: '4px 8px',
            borderRadius: '4px',
            background: '#0E7490',
            color: '#FFFFFF',
            fontSize: '10.5px',
            fontWeight: 800,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            transition: 'background 0.15s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#0891B2'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#0E7490'; }}
        >
          <span>View Details</span>
          <ArrowRight size={10} />
        </button>

        <button
          onClick={dismissNotification}
          style={{
            padding: '4px 10px',
            borderRadius: '4px',
            background: '#F1F5F9',
            color: '#475569',
            fontSize: '10.5px',
            fontWeight: 700,
            border: '1px solid #E2E8F0',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#E2E8F0'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
