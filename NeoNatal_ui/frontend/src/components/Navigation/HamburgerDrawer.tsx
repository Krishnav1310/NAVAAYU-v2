import React, { useEffect } from 'react';
import { 
  X, 
  Users, 
  Cpu, 
  Stethoscope, 
  Wind, 
  UserCheck, 
  ChevronRight,
  Shield,
  Activity
} from 'lucide-react';
import { type NavaayuModule, NAV_MODULES } from '../../types/navigation';

interface HamburgerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeModule: NavaayuModule;
  onSelectModule: (module: NavaayuModule) => void;
}

const getModuleIcon = (id: NavaayuModule) => {
  switch (id) {
    case 'Patient_Software':
      return <Users size={20} color="#0D9488" />;
    case 'Patient_Hardware':
      return <Cpu size={20} color="#0284C7" />;
    case 'Clinical_Equipment':
      return <Stethoscope size={20} color="#7C3AED" />;
    case 'Environmental_Factor':
      return <Wind size={20} color="#EA580C" />;
    case 'Staff':
      return <UserCheck size={20} color="#16A34A" />;
  }
};

export const HamburgerDrawer: React.FC<HamburgerDrawerProps> = ({
  isOpen,
  onClose,
  activeModule,
  onSelectModule
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(19, 57, 38, 0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-start',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '380px',
          height: '100vh',
          background: '#FFFFFF',
          borderRight: '1.5px solid var(--akesis-border)',
          boxShadow: '4px 0 24px rgba(19, 57, 38, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflowY: 'auto'
        }}
      >
        {/* Drawer Header */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--akesis-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '10px', 
                background: '#ECFEFF', 
                border: '1px solid #CFFAFE',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Activity size={20} color="#0E7490" />
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#0E7490', letterSpacing: '-0.5px' }}>
                  NAVAAYU
                </div>
                <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--akesis-text-muted)' }}>
                  Platform Navigation Hub
                </div>
              </div>
            </div>

            <button 
              onClick={onClose}
              style={{
                background: '#F8FAFC',
                border: '1px solid var(--akesis-border)',
                borderRadius: '8px',
                padding: '6px',
                cursor: 'pointer',
                color: 'var(--akesis-text-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Close Navigation"
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ 
            marginTop: '16px', 
            padding: '8px 12px', 
            background: 'var(--akesis-bg)', 
            borderRadius: '10px', 
            border: '1px solid var(--akesis-border)',
            fontSize: '11px',
            color: 'var(--akesis-text-main)',
            fontWeight: 700,
            lineHeight: 1.4
          }}>
            <span style={{ color: '#0E7490', fontWeight: 900 }}>NAVAAYU EDGE:</span> Unified clinical intelligence spanning software, edge hardware, equipment, environmental, and staff domains.
          </div>
        </div>

        {/* Navigation Items (Exact 5 required items in order) */}
        <div style={{ padding: '16px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ 
            fontSize: '10px', 
            fontWeight: 800, 
            letterSpacing: '0.8px', 
            color: 'var(--akesis-text-muted)', 
            textTransform: 'uppercase',
            padding: '0 8px 4px'
          }}>
            PLATFORM MODULES
          </div>

          {NAV_MODULES.map((item) => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectModule(item.id);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: isActive ? '2px solid #0E7490' : '1.5px solid var(--akesis-border)',
                  background: isActive ? '#ECFEFF' : '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: isActive ? '#FFFFFF' : 'var(--akesis-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {getModuleIcon(item.id)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <span style={{ 
                      fontSize: '13.5px', 
                      fontWeight: 900, 
                      color: isActive ? '#0E7490' : 'var(--akesis-text-main)' 
                    }}>
                      {item.label}
                    </span>
                    <span style={{
                      fontSize: '9.5px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '6px',
                      background: item.badgeType === 'real' ? '#DCFCE7' : (item.badgeType === 'software' ? '#E0F2FE' : '#FEF3C7'),
                      color: item.badgeType === 'real' ? '#15803D' : (item.badgeType === 'software' ? '#0369A1' : '#B45309'),
                      flexShrink: 0
                    }}>
                      {item.badge}
                    </span>
                  </div>

                  <p style={{
                    margin: '3px 0 0',
                    fontSize: '11px',
                    color: 'var(--akesis-text-muted)',
                    fontWeight: 600,
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.description}
                  </p>
                </div>

                <ChevronRight size={16} color={isActive ? '#0E7490' : 'var(--akesis-text-muted)'} />
              </button>
            );
          })}
        </div>

        {/* Drawer Footer with Architecture Contract */}
        <div style={{ 
          padding: '16px 20px', 
          borderTop: '1px solid var(--akesis-border)', 
          background: '#F8FAFC',
          fontSize: '10.5px',
          color: 'var(--akesis-text-muted)',
          lineHeight: 1.5
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: 'var(--akesis-text-main)', marginBottom: '4px' }}>
            <Shield size={12} color="#0D9488" />
            <span>HARDWARE-CATEGORY ARCHITECTURE</span>
          </div>
          <div>Physical / Edge Inputs → NAVAAYU Edge (Pi 5) → Intelligence → NAVAAYU Platform Dashboard</div>
        </div>

      </div>
    </div>
  );
};
