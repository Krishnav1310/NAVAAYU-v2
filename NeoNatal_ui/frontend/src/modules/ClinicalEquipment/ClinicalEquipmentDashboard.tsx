import React, { useState } from 'react';
import { 
  Stethoscope, 
  CheckCircle2, 
  Clock, 
  Battery, 
  Zap, 
  Activity,
  Bed,
  ShieldCheck,
  Cpu,
  Wind,
  Droplets,
  Sun,
  MapPin,
  Calendar
} from 'lucide-react';

interface EquipmentItem {
  id: string;
  itemNumber: number;
  name: string;
  category: 'Incubator' | 'Patient Monitor' | 'Ventilator' | 'Infusion Pump' | 'Phototherapy Unit';
  modelCode: string;
  location: string;
  status: 'OPERATIONAL' | 'STANDBY';
  statusBadge: string;
  power: string;
  battery: number;
  lastChecked: string;
  nextService: string;
}

const ESSENTIAL_EQUIPMENT: EquipmentItem[] = [
  {
    id: "EQ-INC-001",
    itemNumber: 1,
    name: "GE Giraffe OmniBed Carestation",
    category: "Incubator",
    modelCode: "OmniBed Pro v4.2",
    location: "Bed NICU-001",
    status: "OPERATIONAL",
    statusBadge: "OPERATIONAL",
    power: "Mains AC",
    battery: 98,
    lastChecked: "08:30 AM",
    nextService: "Apr 2026"
  },
  {
    id: "EQ-INC-003",
    itemNumber: 2,
    name: "Dräger Isolette 8000 Plus",
    category: "Incubator",
    modelCode: "Isolette 8000+",
    location: "Bed NICU-003",
    status: "OPERATIONAL",
    statusBadge: "OPERATIONAL",
    power: "Mains AC",
    battery: 100,
    lastChecked: "09:00 AM",
    nextService: "Mar 2026"
  },
  {
    id: "EQ-MON-001",
    itemNumber: 3,
    name: "Philips IntelliVue MX800",
    category: "Patient Monitor",
    modelCode: "MX800 High-Acuity",
    location: "Bed NICU-001",
    status: "OPERATIONAL",
    statusBadge: "OPERATIONAL",
    power: "Mains AC",
    battery: 99,
    lastChecked: "06:45 AM",
    nextService: "Jun 2026"
  },
  {
    id: "EQ-VEN-001",
    itemNumber: 4,
    name: "SLE6000 Neonatal Ventilator",
    category: "Ventilator",
    modelCode: "SLE6000 HFO+NIV",
    location: "Bed NICU-003",
    status: "OPERATIONAL",
    statusBadge: "OPERATIONAL",
    power: "Mains AC",
    battery: 100,
    lastChecked: "08:15 AM",
    nextService: "Mar 2026"
  },
  {
    id: "EQ-PMP-001",
    itemNumber: 5,
    name: "BD Alaris GP Plus Infusion Pump",
    category: "Infusion Pump",
    modelCode: "Alaris GP Plus",
    location: "Bed NICU-002",
    status: "OPERATIONAL",
    statusBadge: "OPERATIONAL",
    power: "Mains AC",
    battery: 94,
    lastChecked: "07:30 AM",
    nextService: "May 2026"
  },
  {
    id: "EQ-PHO-001",
    itemNumber: 6,
    name: "Dräger BiliLux LED Phototherapy",
    category: "Phototherapy Unit",
    modelCode: "BiliLux LED",
    location: "Standby Bay",
    status: "STANDBY",
    statusBadge: "STANDBY",
    power: "Mains AC",
    battery: 100,
    lastChecked: "Yesterday",
    nextService: "Apr 2026"
  }
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Incubator':
      return <Bed size={20} color="#0E7490" />;
    case 'Patient Monitor':
      return <Activity size={20} color="#7C3AED" />;
    case 'Ventilator':
      return <Wind size={20} color="#0284C7" />;
    case 'Infusion Pump':
      return <Droplets size={20} color="#059669" />;
    case 'Phototherapy Unit':
      return <Sun size={20} color="#D97706" />;
    default:
      return <Stethoscope size={20} color="#0E7490" />;
  }
};

const getCategoryBg = (category: string) => {
  switch (category) {
    case 'Incubator': return '#ECFEFF';
    case 'Patient Monitor': return '#F5F3FF';
    case 'Ventilator': return '#F0F9FF';
    case 'Infusion Pump': return '#ECFDF5';
    case 'Phototherapy Unit': return '#FFFBEB';
    default: return '#F8FAFC';
  }
};

export function ClinicalEquipmentDashboard() {
  const [equipment] = useState<EquipmentItem[]>(ESSENTIAL_EQUIPMENT);
  const [selectedId, setSelectedId] = useState<string>("EQ-INC-001");

  return (
    <main style={{ maxWidth: '1440px', margin: '24px auto 0', padding: '0 28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* 1. DIRECTORY HEADER TITLE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0E7490', margin: 0, letterSpacing: '-0.5px' }}>
            Clinical Equipment Readiness
          </h2>
          <p style={{ color: '#5C7A68', fontSize: '12px', fontWeight: 600, margin: '4px 0 0 0' }}>
            Operational status and availability of critical NICU biomedical equipment
          </p>
        </div>

        {/* Status Counter Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 12px', background: '#F0FDF4', color: '#15803D', borderRadius: '8px', border: '1px solid #DCFCE7' }}>
            5 Operational
          </span>
          <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 12px', background: '#ECFEFF', color: '#0E7490', borderRadius: '8px', border: '1px solid #CFFAFE' }}>
            1 Standby Ready
          </span>
          <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 12px', background: '#F0FDFA', color: '#0D9488', borderRadius: '8px', border: '1px solid #CCFBF1' }}>
            6 Monitored Units
          </span>
        </div>
      </div>

      {/* 2. RECTANGULAR HORIZONTAL EQUIPMENT CARDS */}
      <section 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', 
          gap: '20px', 
          alignItems: 'stretch' 
        }}
      >
        {equipment.map((item) => {
          const isSelected = item.id === selectedId;
          const isOperational = item.status === 'OPERATIONAL';
          const iconBg = getCategoryBg(item.category);

          const borderColor = isSelected 
            ? '#0E7490' 
            : '#E2EFE6';

          const cardShadow = isSelected
            ? '0 6px 24px rgba(14, 116, 144, 0.16)'
            : '0 3px 14px rgba(16, 100, 60, 0.04)';

          return (
            <div 
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: isSelected ? `2.5px solid ${borderColor}` : `1.5px solid ${borderColor}`,
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s ease',
                boxShadow: cardShadow,
                boxSizing: 'border-box'
              }}
            >
              {/* Top Row: Left Icon + Name/Category | Right Status Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div 
                    style={{ 
                      width: '46px', 
                      height: '46px', 
                      borderRadius: '12px', 
                      background: iconBg, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      flexShrink: 0 
                    }}
                  >
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 900, color: '#133926', lineHeight: 1.25 }}>
                        {item.name}
                      </span>
                      {isSelected && (
                        <span style={{ fontSize: '9px', fontWeight: 900, background: '#0E7490', color: 'white', padding: '1px 6px', borderRadius: '5px' }}>
                          SELECTED
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#5C7A68', fontWeight: 700, marginTop: '2px' }}>
                      {item.id} • {item.category} • {item.modelCode}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <span 
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 900,
                    letterSpacing: '0.5px',
                    padding: '4px 12px',
                    borderRadius: '8px',
                    background: isOperational ? '#DCFCE7' : '#ECFEFF',
                    color: isOperational ? '#15803D' : '#0E7490',
                    border: `1px solid ${isOperational ? '#BBF7D0' : '#CFFAFE'}`,
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {item.statusBadge}
                </span>

              </div>

              {/* Bottom Row: Rectangular Horizontal Metric Boxes */}
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(4, 1fr)', 
                  gap: '8px', 
                  background: 'rgba(104, 178, 160, 0.04)', 
                  padding: '10px 14px', 
                  borderRadius: '12px', 
                  border: '1px solid #E2EFE6' 
                }}
              >
                {/* 1. Location */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ color: '#5C7A68', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    LOCATION
                  </span>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#0E7490', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.location}
                  </div>
                </div>

                {/* 2. Power */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ color: '#5C7A68', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    POWER
                  </span>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#133926' }}>
                    {item.power}
                  </div>
                </div>

                {/* 3. Battery */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ color: '#5C7A68', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    BATTERY
                  </span>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#16A34A', fontVariantNumeric: 'tabular-nums' }}>
                    {item.battery}%
                  </div>
                </div>

                {/* 4. Service */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ color: '#5C7A68', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    SERVICE DUE
                  </span>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#5C7A68' }}>
                    {item.nextService}
                  </div>
                </div>

              </div>

            </div>
          );
        })}
      </section>

    </main>
  );
}
