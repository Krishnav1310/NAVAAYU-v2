export type NavaayuModule =
  | 'Patient_Software'
  | 'Patient_Hardware'
  | 'Clinical_Equipment'
  | 'Environmental_Factor'
  | 'Staff';

export interface NavItemConfig {
  id: NavaayuModule;
  label: string;
  route: string;
  description: string;
  badge: string;
  badgeType: 'real' | 'simulated' | 'software';
}

export const NAV_MODULES: NavItemConfig[] = [
  {
    id: 'Patient_Software',
    label: 'Patient_Software',
    route: '/patient-software',
    description: 'Multi-Patient Ward Telemetry (5-Baby Clinical Baseline)',
    badge: 'BASELINE WARD',
    badgeType: 'software'
  },
  {
    id: 'Patient_Hardware',
    label: 'Patient_Hardware',
    route: '/patient-hardware',
    description: 'Hardware-Connected Patient Monitoring (Raspberry Pi 5 / Render Cloud)',
    badge: 'LIVE HARDWARE',
    badgeType: 'real'
  },
  {
    id: 'Clinical_Equipment',
    label: 'Clinical_Equipment',
    route: '/clinical-equipment',
    description: 'Critical NICU Clinical Equipment Operational Status & Readiness',
    badge: 'PROTOTYPE TELEMETRY',
    badgeType: 'simulated'
  },
  {
    id: 'Environmental_Factor',
    label: 'Environmental_Factor',
    route: '/environmental-factor',
    description: 'NICU Environmental Safety (Temperature, Humidity, AQI, Noise)',
    badge: 'SIMULATED SENSORS',
    badgeType: 'simulated'
  },
  {
    id: 'Staff',
    label: 'Staff',
    route: '/staff',
    description: 'NICU Clinical Staff Availability, Shifts & Coverage Readiness',
    badge: 'PROTOTYPE ROSTER',
    badgeType: 'simulated'
  }
];
