// Type definitions for NAVAAYU Ward Ambient Temperature Monitoring & Decision Support

export interface BabyAmbientRequirement {
  id: string;
  babyNumber: string;
  bedId: string;
  name: string;
  currentTemp: number;         // Current baby body temperature (°C), e.g. 36.2
  requiredAmbientTemp: number; // Calculated required ward ambient for this baby (°C), e.g. 27.5
  baseTemp: number;            // Baseline baby temp reference, e.g. 36.2
  baseAmbient: number;         // Baseline required ambient reference, e.g. 27.5
  status?: 'OPTIMAL' | 'ELEVATED' | 'COOL';
  lastUpdated: string;
}

export interface BabyRequirementSnapshot {
  babyId: string;
  babyNumber: string;
  bedId?: string;
  name?: string;
  currentTemp: number;
  requiredAmbientTemperature: number;
}

export interface WardTemperatureHistoryEntry {
  id: string;
  timestamp: string;               // e.g. "10:42 AM"
  isoTime: string;
  wardRequiredTemperature: number; // e.g. 27.1
  previousWardTemperature: number; // e.g. 27.0
  change: number;                  // e.g. +0.1 or -0.3
  currentRoomTemperature: number;  // e.g. 26.4
  babyCount: number;               // e.g. 5
  babyRequirements: BabyRequirementSnapshot[];
  reason?: string;
}

export interface WardTemperatureConfig {
  temperatureChangeThreshold: number; // In °C, default 0.2
  notificationIntervalMs: number;     // In milliseconds, default 2 * 60 * 1000 (2 minutes)
  isSimulationActive: boolean;        // Enables realistic micro-fluctuations
  simulationIntervalMs: number;       // Default 5000ms
}

export interface WardTemperatureNotification {
  id: string;
  isOpen: boolean;
  previousWardTemp: number;
  currentWardTemp: number;
  totalChange: number;
  babyCount: number;
  timestamp: string;
  isoTime: string;
}
