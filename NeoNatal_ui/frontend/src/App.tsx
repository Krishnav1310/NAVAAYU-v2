import React, { useState, useEffect, useCallback } from 'react';
import { 
  Menu, 
  Volume2, 
  VolumeX, 
  Clock, 
  Activity, 
  Cpu,
  Stethoscope,
  Wind,
  Users,
  ShieldCheck
} from 'lucide-react';
import { type NavaayuModule, NAV_MODULES } from './types/navigation';
import { HamburgerDrawer } from './components/Navigation/HamburgerDrawer';
import { WardAmbientProvider } from './context/WardAmbientContext';
import { WardAmbientNotificationToast } from './components/Notifications/WardAmbientNotificationToast';
import { PatientSoftwareDashboard } from './modules/PatientSoftware/PatientSoftwareDashboard';
import { PatientHardwareDashboard } from './modules/PatientHardware/PatientHardwareDashboard';
import { ClinicalEquipmentDashboard } from './modules/ClinicalEquipment/ClinicalEquipmentDashboard';
import { EnvironmentalFactorDashboard } from './modules/EnvironmentalFactor/EnvironmentalFactorDashboard';
import { StaffDashboard } from './modules/Staff/StaffDashboard';

function getInitialModule(): NavaayuModule {
  if (typeof window === 'undefined') return 'Patient_Hardware';
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  
  if (path.includes('patient-software') || hash.includes('patient-software')) return 'Patient_Software';
  if (path.includes('clinical-equipment') || hash.includes('clinical-equipment')) return 'Clinical_Equipment';
  if (path.includes('environmental-factor') || hash.includes('environmental-factor')) return 'Environmental_Factor';
  if (path.includes('staff') || hash.includes('staff')) return 'Staff';
  
  return 'Patient_Hardware';
}

function moduleToPath(mod: NavaayuModule): string {
  switch (mod) {
    case 'Patient_Software': return '/patient-software';
    case 'Patient_Hardware': return '/patient-hardware';
    case 'Clinical_Equipment': return '/clinical-equipment';
    case 'Environmental_Factor': return '/environmental-factor';
    case 'Staff': return '/staff';
  }
}

const getModuleIcon = (id: NavaayuModule, isActive: boolean) => {
  const color = isActive ? '#FFFFFF' : '#0E7490';
  switch (id) {
    case 'Patient_Software':
      return <Activity size={14} color={color} />;
    case 'Patient_Hardware':
      return <Cpu size={14} color={color} />;
    case 'Clinical_Equipment':
      return <Stethoscope size={14} color={color} />;
    case 'Environmental_Factor':
      return <Wind size={14} color={color} />;
    case 'Staff':
      return <Users size={14} color={color} />;
  }
};

const getModuleSummary = (id: NavaayuModule) => {
  switch (id) {
    case 'Patient_Software':
      return '5-Baby Ward Telemetry (Software Baseline)';
    case 'Patient_Hardware':
      return 'Edge AI Live Stream (Raspberry Pi 5 / Cloud)';
    case 'Clinical_Equipment':
      return 'Critical Equipment Operational Status & Readiness';
    case 'Environmental_Factor':
      return 'Ward Environmental Safety & Microclimate';
    case 'Staff':
      return 'Clinical Staff Availability & Emergency Readiness';
  }
};

export default function App() {
  const [activeModule, setActiveModule] = useState<NavaayuModule>(getInitialModule);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Listen to browser navigation popstate
  useEffect(() => {
    const onPopState = () => {
      setActiveModule(getInitialModule());
    };
    window.addEventListener('popstate', onPopState);
    window.addEventListener('hashchange', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('hashchange', onPopState);
    };
  }, []);

  const handleSelectModule = useCallback((mod: NavaayuModule) => {
    setActiveModule(mod);
    const newPath = moduleToPath(mod);
    if (typeof window !== 'undefined' && window.location.pathname !== newPath) {
      window.history.pushState({ module: mod }, '', newPath);
    }
  }, []);

  return (
    <WardAmbientProvider>
      <div style={{ minHeight: '100vh', background: 'var(--akesis-bg)', paddingBottom: '40px' }}>
      
      {/* 1. TOP HEADER BAR (TIER 1) */}
      <header className="akesis-header" style={{ padding: '12px 28px', height: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Left Section: Hamburger Menu & Brand Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button 
            onClick={() => setIsDrawerOpen(true)}
            style={{ 
              background: '#F0FDFA', 
              border: '1.5px solid #CCFBF1', 
              cursor: 'pointer', 
              padding: '6px 12px', 
              borderRadius: '9px', 
              color: '#0E7490',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
            title="Open Platform Navigation Drawer"
          >
            <Menu size={18} />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#0E7490', letterSpacing: '0.4px' }}>MODULES</span>
          </button>

          <div>
            <div style={{ fontSize: '19px', fontWeight: 900, letterSpacing: '-0.5px', color: '#0E7490', display: 'flex', alignItems: 'center', gap: '8px', lineHeight: 1.1 }}>
              NAVAAYU
              <span style={{ fontSize: '9.5px', fontWeight: 800, padding: '2px 7px', background: '#ECFEFF', color: '#0E7490', borderRadius: '10px', border: '1px solid #CFFAFE', letterSpacing: '0.5px' }}>
                AKESIS PROTOCOL
              </span>
            </div>
            <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--akesis-text-muted)', marginTop: '2px' }}>
              Intelligent Neonatal Monitoring Platform
            </div>
          </div>
        </div>

        {/* Right Section: Status Badges & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 13px', background: '#F0FDF4', borderRadius: '20px', border: '1px solid #DCFCE7', fontSize: '11px', fontWeight: 800, color: '#15803D' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22C55E' }} className="pulse-dot" />
            ACTIVE BACKEND
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 13px', background: '#F0FDF4', borderRadius: '20px', border: '1px solid #DCFCE7', fontSize: '11px', fontWeight: 800, color: '#15803D' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22C55E' }} />
            STATUS: ONLINE
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 13px', background: '#ECFEFF', borderRadius: '20px', border: '1px solid #CFFAFE', fontSize: '11px', fontWeight: 800, color: '#0E7490' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#06B6D4' }} />
            PC2 API: CONNECTED
          </div>

          <button 
            onClick={() => setIsMuted(!isMuted)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 13px', background: '#FFFFFF', borderRadius: '20px', border: '1px solid var(--akesis-border)', fontSize: '11px', fontWeight: 800, color: isMuted ? '#EF4444' : 'var(--akesis-text-main)', cursor: 'pointer', transition: 'all 0.15s ease' }}
          >
            {isMuted ? <VolumeX size={14} color="#EF4444" /> : <Volume2 size={14} color="#0D9488" />}
            ALARM VOL
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 13px', background: '#FFFFFF', borderRadius: '20px', border: '1px solid var(--akesis-border)', fontSize: '11.5px', fontWeight: 800, color: 'var(--akesis-text-main)', fontVariantNumeric: 'tabular-nums' }}>
            <Clock size={13} color="var(--akesis-text-muted)" />
            {currentTime || "01:58:35 AM"}
          </div>

          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 15px', background: '#FFFFFF', borderRadius: '20px', border: '1.5px solid #FCA5A5', fontSize: '11px', fontWeight: 900, color: '#DC2626', cursor: 'pointer', transition: 'all 0.15s ease' }}>
            LOGOUT
          </button>

        </div>
      </header>

      {/* 2. DEDICATED CLINICAL MODULE NAVIGATION SUBHEADER (TIER 2) */}
      <nav 
        aria-label="Platform Clinical Modules Navigation"
        style={{
          position: 'sticky',
          top: '64px',
          zIndex: 90,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--akesis-border)',
          padding: '7px 28px',
          boxShadow: '0 2px 8px rgba(16, 100, 60, 0.03)'
        }}
      >
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          
          {/* Module Tabs (Exact 5 Modules in Order) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px', maxWidth: '100%' }}>
            {NAV_MODULES.map((item) => {
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectModule(item.id)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '9px',
                    border: isActive ? '1.5px solid #0E7490' : '1px solid transparent',
                    background: isActive ? '#0E7490' : '#F8FAFC',
                    color: isActive ? '#FFFFFF' : 'var(--akesis-text-muted)',
                    fontSize: '11.5px',
                    fontWeight: isActive ? 900 : 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    boxShadow: isActive ? '0 2px 6px rgba(14, 116, 144, 0.22)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {getModuleIcon(item.id, isActive)}
                  <span>{item.label}</span>
                  {isActive && (
                    <span style={{ fontSize: '9px', fontWeight: 800, padding: '1px 6px', background: 'rgba(255,255,255,0.22)', color: '#FFFFFF', borderRadius: '8px', marginLeft: '2px' }}>
                      ACTIVE
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Module Context / Situational Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--akesis-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0D9488' }} />
              {getModuleSummary(activeModule)}
            </span>
          </div>

        </div>
      </nav>

      {/* 3. ACTIVE MODULE CONTENT */}
      {activeModule === 'Patient_Software' && <PatientSoftwareDashboard />}
      {activeModule === 'Patient_Hardware' && <PatientHardwareDashboard />}
      {activeModule === 'Clinical_Equipment' && <ClinicalEquipmentDashboard />}
      {activeModule === 'Environmental_Factor' && <EnvironmentalFactorDashboard />}
      {activeModule === 'Staff' && <StaffDashboard />}

      {/* 4. SLIDE-OUT HAMBURGER NAVIGATION DRAWER */}
      <HamburgerDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        activeModule={activeModule} 
        onSelectModule={handleSelectModule} 
      />

      {/* 5. WARD AMBIENT SIGNIFICANT TEMPERATURE CHANGE NOTIFICATION */}
      <WardAmbientNotificationToast />

      {/* 6. CLINICAL DISCLAIMER & COPYRIGHT FOOTER */}
      <footer style={{ marginTop: '36px', textAlign: 'center', fontSize: '11px', color: 'var(--akesis-text-muted)', lineHeight: 1.6, padding: '0 20px' }}>
        <div>
          Disclaimer: NAVAAYU is an AI-assisted neonatal monitoring prototype and is not a substitute for professional medical judgment, clinical diagnosis, or medical decision thresholds.
        </div>
        <div style={{ fontWeight: 700, marginTop: '4px' }}>
          © 2026 NAVAAYU • @AKESISPROTOCOL. All rights reserved.
        </div>
      </footer>

    </div>
    </WardAmbientProvider>
  );
}
