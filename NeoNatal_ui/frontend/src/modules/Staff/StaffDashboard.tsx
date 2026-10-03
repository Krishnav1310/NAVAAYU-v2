import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Stethoscope, 
  Phone, 
  Clock, 
  Bed, 
  ShieldCheck,
  Award,
  AlertTriangle
} from 'lucide-react';

interface StaffMember {
  id: string;
  staffNumber: number;
  name: string;
  role: string;
  category: 'Doctor' | 'Nurse' | 'Technical';
  initials: string;
  status: 'ON FLOOR' | 'ON CALL';
  statusBadge: string;
  assignedBeds: string;
  contactExt: string;
  shift: string;
  experience: string;
  emergencyRole: string;
}

const ESSENTIAL_STAFF: StaffMember[] = [
  {
    id: "STF-DOC-001",
    staffNumber: 1,
    name: "Dr. Rajesh Kulkarni",
    role: "Attending Neonatologist",
    category: "Doctor",
    initials: "RK",
    status: "ON FLOOR",
    statusBadge: "ON FLOOR",
    assignedBeds: "Bed NICU-003 & Ward Lead",
    contactExt: "Ext. 4101",
    shift: "08:00 - 20:00",
    experience: "14 yrs",
    emergencyRole: "Code Neonate Lead"
  },
  {
    id: "STF-DOC-002",
    staffNumber: 2,
    name: "Dr. Shalini Verma",
    role: "Pediatric Registrar",
    category: "Doctor",
    initials: "SV",
    status: "ON FLOOR",
    statusBadge: "ON FLOOR",
    assignedBeds: "Beds NICU-001 & NICU-002",
    contactExt: "Ext. 4102",
    shift: "08:00 - 20:00",
    experience: "6 yrs",
    emergencyRole: "Vascular Line Lead"
  },
  {
    id: "STF-NUR-001",
    staffNumber: 3,
    name: "Priya Sharma, RN",
    role: "Charge Nurse",
    category: "Nurse",
    initials: "PS",
    status: "ON FLOOR",
    statusBadge: "ON FLOOR",
    assignedBeds: "Unit 4 Triage & Lead",
    contactExt: "Ext. 4110",
    shift: "08:00 - 20:00",
    experience: "11 yrs",
    emergencyRole: "Medication Prep"
  },
  {
    id: "STF-NUR-004",
    staffNumber: 4,
    name: "Deepa Nair, RN",
    role: "Senior NICU Nurse",
    category: "Nurse",
    initials: "DN",
    status: "ON FLOOR",
    statusBadge: "ON FLOOR",
    assignedBeds: "Bed NICU-003 (1:1 Care)",
    contactExt: "Ext. 4113",
    shift: "08:00 - 20:00",
    experience: "9 yrs",
    emergencyRole: "Airway Specialist"
  },
  {
    id: "STF-NUR-003",
    staffNumber: 5,
    name: "Kavita Joshi, RN",
    role: "Senior NICU Nurse",
    category: "Nurse",
    initials: "KJ",
    status: "ON FLOOR",
    statusBadge: "ON FLOOR",
    assignedBeds: "Bed NICU-002 (Kiara Patel)",
    contactExt: "Ext. 4112",
    shift: "08:00 - 20:00",
    experience: "7 yrs",
    emergencyRole: "Thermal Protocol"
  },
  {
    id: "STF-TEC-001",
    staffNumber: 6,
    name: "Vikram Malhotra",
    role: "Biomedical Specialist",
    category: "Technical",
    initials: "VM",
    status: "ON CALL",
    statusBadge: "ON CALL",
    assignedBeds: "Equipment & Sensors",
    contactExt: "Ext. 4120",
    shift: "24/7 On-Call",
    experience: "8 yrs",
    emergencyRole: "Edge Stack Lead"
  }
];

const getCategoryAvatar = (category: string, initials: string) => {
  let bg = '#F0FDFA';
  let color = '#0E7490';
  let border = '#CCFBF1';

  if (category === 'Nurse') {
    bg = '#ECFDF5';
    color = '#059669';
    border = '#A7F3D0';
  } else if (category === 'Technical') {
    bg = '#F5F3FF';
    color = '#7C3AED';
    border = '#DDD6FE';
  }

  return (
    <div 
      style={{
        width: '46px',
        height: '46px',
        borderRadius: '12px',
        background: bg,
        border: `1.5px solid ${border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        fontWeight: 900,
        fontSize: '14px',
        flexShrink: 0
      }}
    >
      {initials}
    </div>
  );
};

export function StaffDashboard() {
  const [staff] = useState<StaffMember[]>(ESSENTIAL_STAFF);
  const [selectedId, setSelectedId] = useState<string>("STF-DOC-001");

  return (
    <main style={{ maxWidth: '1440px', margin: '24px auto 0', padding: '0 28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* 1. DIRECTORY HEADER TITLE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0E7490', margin: 0, letterSpacing: '-0.5px' }}>
            Clinical Staff Directory
          </h2>
          <p style={{ color: '#5C7A68', fontSize: '12px', fontWeight: 600, margin: '4px 0 0 0' }}>
            Overview of active neonatal physicians, nursing staff, and specialists on duty
          </p>
        </div>

        {/* Status Counter Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 12px', background: '#F0FDF4', color: '#15803D', borderRadius: '8px', border: '1px solid #DCFCE7' }}>
            2 Physicians
          </span>
          <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 12px', background: '#F0FDFA', color: '#0D9488', borderRadius: '8px', border: '1px solid #CCFBF1' }}>
            3 Floor Nurses
          </span>
          <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 12px', background: '#ECFEFF', color: '#0E7490', borderRadius: '8px', border: '1px solid #CFFAFE' }}>
            Day Shift (08:00 - 20:00)
          </span>
        </div>
      </div>

      {/* 2. RECTANGULAR HORIZONTAL STAFF CARDS */}
      <section 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', 
          gap: '20px', 
          alignItems: 'stretch' 
        }}
      >
        {staff.map((person) => {
          const isSelected = person.id === selectedId;
          const isOnFloor = person.status === 'ON FLOOR';

          const borderColor = isSelected 
            ? '#0E7490' 
            : '#E2EFE6';

          const cardShadow = isSelected
            ? '0 6px 24px rgba(14, 116, 144, 0.16)'
            : '0 3px 14px rgba(16, 100, 60, 0.04)';

          return (
            <div 
              key={person.id}
              onClick={() => setSelectedId(person.id)}
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
              {/* Top Row: Left Avatar + Name/Role | Right Status Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {getCategoryAvatar(person.category, person.initials)}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 900, color: '#133926', lineHeight: 1.25 }}>
                        {person.name}
                      </span>
                      {isSelected && (
                        <span style={{ fontSize: '9px', fontWeight: 900, background: '#0E7490', color: 'white', padding: '1px 6px', borderRadius: '5px' }}>
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#5C7A68', fontWeight: 700, marginTop: '2px' }}>
                      {person.id} • {person.role} • {person.experience}
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
                    background: isOnFloor ? '#DCFCE7' : '#ECFEFF',
                    color: isOnFloor ? '#15803D' : '#0E7490',
                    border: `1px solid ${isOnFloor ? '#BBF7D0' : '#CFFAFE'}`,
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {person.statusBadge}
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
                {/* 1. Assigned Bay */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ color: '#5C7A68', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    ASSIGNED BAY
                  </span>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#0E7490', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {person.assignedBeds}
                  </div>
                </div>

                {/* 2. Contact Ext */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ color: '#5C7A68', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    CONTACT EXT
                  </span>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#133926' }}>
                    {person.contactExt}
                  </div>
                </div>

                {/* 3. Shift */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ color: '#5C7A68', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    SHIFT
                  </span>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#133926' }}>
                    {person.shift}
                  </div>
                </div>

                {/* 4. Emergency Role */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ color: '#5C7A68', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    CLINICAL ROLE
                  </span>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#059669', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {person.emergencyRole}
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
