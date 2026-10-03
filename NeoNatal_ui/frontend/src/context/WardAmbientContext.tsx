import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type {
  BabyAmbientRequirement,
  BabyRequirementSnapshot,
  WardTemperatureHistoryEntry,
  WardTemperatureConfig,
  WardTemperatureNotification
} from '../types/wardAmbient';

const STORAGE_KEY_HISTORY = 'NAVAAYU_WARD_TEMP_HISTORY';
const STORAGE_KEY_CONFIG = 'NAVAAYU_WARD_TEMP_CONFIG';

const DEFAULT_CONFIG: WardTemperatureConfig = {
  temperatureChangeThreshold: 0.2, // 0.2°C threshold for significant change
  notificationIntervalMs: 2 * 60 * 1000, // Exactly 2 minutes interval (120,000 ms)
  isSimulationActive: true,
  simulationIntervalMs: 5000 // gentle physiological drift every 5s
};

const INITIAL_5_BABIES: BabyAmbientRequirement[] = [
  {
    id: 'baby-1',
    babyNumber: 'BABY 01',
    bedId: 'NICU-001',
    name: 'Aarav',
    currentTemp: 36.2,
    requiredAmbientTemp: 27.5,
    baseTemp: 36.2,
    baseAmbient: 27.5,
    status: 'OPTIMAL',
    lastUpdated: '10:42 AM'
  },
  {
    id: 'baby-2',
    babyNumber: 'BABY 02',
    bedId: 'NICU-002',
    name: 'Kiara',
    currentTemp: 36.8,
    requiredAmbientTemp: 27.0,
    baseTemp: 36.8,
    baseAmbient: 27.0,
    status: 'OPTIMAL',
    lastUpdated: '10:42 AM'
  },
  {
    id: 'baby-3',
    babyNumber: 'BABY 03',
    bedId: 'NICU-003',
    name: 'Aditya',
    currentTemp: 37.1,
    requiredAmbientTemp: 26.5,
    baseTemp: 37.1,
    baseAmbient: 26.5,
    status: 'ELEVATED',
    lastUpdated: '10:42 AM'
  },
  {
    id: 'baby-4',
    babyNumber: 'BABY 04',
    bedId: 'NICU-004',
    name: 'Meera',
    currentTemp: 36.7,
    requiredAmbientTemp: 27.0,
    baseTemp: 36.7,
    baseAmbient: 27.0,
    status: 'OPTIMAL',
    lastUpdated: '10:42 AM'
  },
  {
    id: 'baby-5',
    babyNumber: 'BABY 05',
    bedId: 'NICU-005',
    name: 'Vivaan',
    currentTemp: 36.3,
    requiredAmbientTemp: 27.5,
    baseTemp: 36.3,
    baseAmbient: 27.5,
    status: 'COOL',
    lastUpdated: '10:42 AM'
  }
];

const INITIAL_SEED_HISTORY: WardTemperatureHistoryEntry[] = [
  {
    id: 'hist-1',
    timestamp: '10:42 AM',
    isoTime: new Date(Date.now() - 20 * 60000).toISOString(),
    wardRequiredTemperature: 27.1,
    previousWardTemperature: 27.1,
    change: 0.0,
    currentRoomTemperature: 26.4,
    babyCount: 5,
    babyRequirements: [
      { babyId: 'baby-1', babyNumber: 'BABY 01', bedId: 'NICU-001', name: 'Aarav', currentTemp: 36.2, requiredAmbientTemperature: 27.5 },
      { babyId: 'baby-2', babyNumber: 'BABY 02', bedId: 'NICU-002', name: 'Kiara', currentTemp: 36.8, requiredAmbientTemperature: 27.0 },
      { babyId: 'baby-3', babyNumber: 'BABY 03', bedId: 'NICU-003', name: 'Aditya', currentTemp: 37.1, requiredAmbientTemperature: 26.5 },
      { babyId: 'baby-4', babyNumber: 'BABY 04', bedId: 'NICU-004', name: 'Meera', currentTemp: 36.7, requiredAmbientTemperature: 27.0 },
      { babyId: 'baby-5', babyNumber: 'BABY 05', bedId: 'NICU-005', name: 'Vivaan', currentTemp: 36.3, requiredAmbientTemperature: 27.5 }
    ],
    reason: 'Initial ward baseline established'
  },
  {
    id: 'hist-2',
    timestamp: '10:47 AM',
    isoTime: new Date(Date.now() - 15 * 60000).toISOString(),
    wardRequiredTemperature: 27.0,
    previousWardTemperature: 27.1,
    change: -0.1,
    currentRoomTemperature: 26.4,
    babyCount: 5,
    babyRequirements: [
      { babyId: 'baby-1', babyNumber: 'BABY 01', bedId: 'NICU-001', name: 'Aarav', currentTemp: 36.3, requiredAmbientTemperature: 27.4 },
      { babyId: 'baby-2', babyNumber: 'BABY 02', bedId: 'NICU-002', name: 'Kiara', currentTemp: 36.8, requiredAmbientTemperature: 27.0 },
      { babyId: 'baby-3', babyNumber: 'BABY 03', bedId: 'NICU-003', name: 'Aditya', currentTemp: 37.1, requiredAmbientTemperature: 26.5 },
      { babyId: 'baby-4', babyNumber: 'BABY 04', bedId: 'NICU-004', name: 'Meera', currentTemp: 36.7, requiredAmbientTemperature: 27.0 },
      { babyId: 'baby-5', babyNumber: 'BABY 05', bedId: 'NICU-005', name: 'Vivaan', currentTemp: 36.4, requiredAmbientTemperature: 27.4 }
    ],
    reason: 'Mild warming trend in Bay 1 & Bay 5'
  },
  {
    id: 'hist-3',
    timestamp: '10:52 AM',
    isoTime: new Date(Date.now() - 10 * 60000).toISOString(),
    wardRequiredTemperature: 26.8,
    previousWardTemperature: 27.0,
    change: -0.2,
    currentRoomTemperature: 26.5,
    babyCount: 5,
    babyRequirements: [
      { babyId: 'baby-1', babyNumber: 'BABY 01', bedId: 'NICU-001', name: 'Aarav', currentTemp: 36.5, requiredAmbientTemperature: 27.2 },
      { babyId: 'baby-2', babyNumber: 'BABY 02', bedId: 'NICU-002', name: 'Kiara', currentTemp: 37.0, requiredAmbientTemperature: 26.8 },
      { babyId: 'baby-3', babyNumber: 'BABY 03', bedId: 'NICU-003', name: 'Aditya', currentTemp: 37.3, requiredAmbientTemperature: 26.3 },
      { babyId: 'baby-4', babyNumber: 'BABY 04', bedId: 'NICU-004', name: 'Meera', currentTemp: 36.9, requiredAmbientTemperature: 26.8 },
      { babyId: 'baby-5', babyNumber: 'BABY 05', bedId: 'NICU-005', name: 'Vivaan', currentTemp: 36.6, requiredAmbientTemperature: 27.2 }
    ],
    reason: 'Phototherapy session active in Bay 3'
  },
  {
    id: 'hist-4',
    timestamp: '10:57 AM',
    isoTime: new Date(Date.now() - 5 * 60000).toISOString(),
    wardRequiredTemperature: 27.0,
    previousWardTemperature: 26.8,
    change: +0.2,
    currentRoomTemperature: 26.6,
    babyCount: 5,
    babyRequirements: [
      { babyId: 'baby-1', babyNumber: 'BABY 01', bedId: 'NICU-001', name: 'Aarav', currentTemp: 36.3, requiredAmbientTemperature: 27.4 },
      { babyId: 'baby-2', babyNumber: 'BABY 02', bedId: 'NICU-002', name: 'Kiara', currentTemp: 36.8, requiredAmbientTemperature: 27.0 },
      { babyId: 'baby-3', babyNumber: 'BABY 03', bedId: 'NICU-003', name: 'Aditya', currentTemp: 37.1, requiredAmbientTemperature: 26.5 },
      { babyId: 'baby-4', babyNumber: 'BABY 04', bedId: 'NICU-004', name: 'Meera', currentTemp: 36.7, requiredAmbientTemperature: 27.0 },
      { babyId: 'baby-5', babyNumber: 'BABY 05', bedId: 'NICU-005', name: 'Vivaan', currentTemp: 36.4, requiredAmbientTemperature: 27.4 }
    ],
    reason: 'Thermal stabilization after kangaroo care'
  }
];

// Helper: Calculate individual baby required ambient temperature
export function calculateBabyRequiredAmbient(currentTemp: number, baseTemp: number = 36.8, baseAmbient: number = 27.0): number {
  // Slope: If baby temp rises by delta, required ambient decreases by delta
  const delta = currentTemp - baseTemp;
  const rawAmbient = baseAmbient - delta;
  // Clamp to safe clinical neonatal ambient range (24.0°C to 30.0°C)
  const clamped = Math.max(24.0, Math.min(30.0, rawAmbient));
  return Math.round(clamped * 10) / 10;
}

// Helper: Calculate ward average
export function calculateWardAverage(babiesList: BabyAmbientRequirement[]): number {
  if (!babiesList || babiesList.length === 0) return 27.0;
  const sum = babiesList.reduce((acc, b) => acc + b.requiredAmbientTemp, 0);
  const avg = sum / babiesList.length;
  return Math.round(avg * 10) / 10;
}

interface WardAmbientContextType {
  babies: BabyAmbientRequirement[];
  wardAverage: number;
  wardAverageFormatted: string;
  previousWardAverage: number;
  previousWardAverageFormatted: string;
  currentRoomTemp: number;
  currentRoomTempFormatted: string;
  differenceFormatted: string;
  history: WardTemperatureHistoryEntry[];
  activeNotification: WardTemperatureNotification | null;
  isAmbientModalOpen: boolean;
  config: WardTemperatureConfig;
  updateBabyTemp: (babyId: string, newTemp: number, reason?: string) => void;
  addBaby: (baby: Omit<BabyAmbientRequirement, 'requiredAmbientTemp' | 'lastUpdated'>) => void;
  removeBaby: (babyId: string) => void;
  dismissNotification: () => void;
  openAmbientModal: () => void;
  closeAmbientModal: () => void;
  setConfig: (newConfig: Partial<WardTemperatureConfig>) => void;
  triggerExampleBaby03Shift: () => void;
  clearHistory: () => void;
}

const WardAmbientContext = createContext<WardAmbientContextType | undefined>(undefined);

export const WardAmbientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfigState] = useState<WardTemperatureConfig>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY_CONFIG);
        if (stored) {
          const parsed = JSON.parse(stored);
          return { ...DEFAULT_CONFIG, ...parsed, notificationIntervalMs: 2 * 60 * 1000 };
        }
      } catch (e) {
        console.warn('Failed to parse stored ward ambient config', e);
      }
    }
    return DEFAULT_CONFIG;
  });

  const [babies, setBabies] = useState<BabyAmbientRequirement[]>(INITIAL_5_BABIES);
  const [wardAverage, setWardAverage] = useState<number>(() => calculateWardAverage(INITIAL_5_BABIES));
  const [previousWardAverage, setPreviousWardAverage] = useState<number>(27.1);
  const [currentRoomTemp, setCurrentRoomTemp] = useState<number>(26.4);
  const [isAmbientModalOpen, setIsAmbientModalOpen] = useState<boolean>(false);
  const [activeNotification, setActiveNotification] = useState<WardTemperatureNotification | null>(null);

  // Reference to last notified / acknowledged ward average baseline
  const lastAcknowledgedTempRef = useRef<number>(27.1);
  const lastNotificationTimeRef = useRef<number>(0);

  // History state
  const [history, setHistory] = useState<WardTemperatureHistoryEntry[]>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY_HISTORY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse stored ward temperature history', e);
      }
    }
    return INITIAL_SEED_HISTORY;
  });

  // Save history to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history.slice(0, 50)));
      } catch (e) {
        console.warn('Failed to persist history', e);
      }
    }
  }, [history]);

  // Save config to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
      } catch (e) {
        console.warn('Failed to persist config', e);
      }
    }
  }, [config]);

  // Central change detection & history recording function
  const processWardTempChange = useCallback((
    newBabies: BabyAmbientRequirement[], 
    customReason?: string
  ) => {
    const newWardAvg = calculateWardAverage(newBabies);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    setWardAverage(prev => {
      if (prev !== newWardAvg) {
        setPreviousWardAverage(prev);
      }
      return newWardAvg;
    });

    // Check change vs last acknowledged baseline
    const totalChangeFromBaseline = Math.round((newWardAvg - lastAcknowledgedTempRef.current) * 10) / 10;
    const isSignificant = Math.abs(totalChangeFromBaseline) >= config.temperatureChangeThreshold;
    const nowMs = Date.now();
    const timeSinceLastNotification = nowMs - lastNotificationTimeRef.current;
    const intervalReached = timeSinceLastNotification >= config.notificationIntervalMs;

    // Build history entry
    const newEntry: WardTemperatureHistoryEntry = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: timeStr,
      isoTime: now.toISOString(),
      wardRequiredTemperature: newWardAvg,
      previousWardTemperature: wardAverage,
      change: Math.round((newWardAvg - wardAverage) * 10) / 10,
      currentRoomTemperature: currentRoomTemp,
      babyCount: newBabies.length,
      babyRequirements: newBabies.map(b => ({
        babyId: b.id,
        babyNumber: b.babyNumber,
        bedId: b.bedId,
        name: b.name,
        currentTemp: b.currentTemp,
        requiredAmbientTemperature: b.requiredAmbientTemp
      })),
      reason: customReason || `Telemetry recalculation (Avg: ${newWardAvg}°C)`
    };

    // Always update history for meaningful updates (change != 0 or custom trigger)
    if (Math.abs(newWardAvg - wardAverage) >= 0.05 || customReason) {
      setHistory(prevHist => [newEntry, ...prevHist.slice(0, 49)]);
    }

    // Trigger Notification Popup if significant & interval reached
    if (isSignificant && intervalReached) {
      setActiveNotification({
        id: `notif-${Date.now()}`,
        isOpen: true,
        previousWardTemp: lastAcknowledgedTempRef.current,
        currentWardTemp: newWardAvg,
        totalChange: totalChangeFromBaseline,
        babyCount: newBabies.length,
        timestamp: timeStr,
        isoTime: now.toISOString()
      });
      lastNotificationTimeRef.current = nowMs;
    }
  }, [config, wardAverage, currentRoomTemp]);

  // Update baby temperature
  const updateBabyTemp = useCallback((babyId: string, newTemp: number, reason?: string) => {
    const roundedTemp = Math.round(newTemp * 10) / 10;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    setBabies(prevBabies => {
      const updated = prevBabies.map(baby => {
        if (baby.id === babyId) {
          const reqAmbient = calculateBabyRequiredAmbient(roundedTemp, baby.baseTemp, baby.baseAmbient);
          let status: 'OPTIMAL' | 'ELEVATED' | 'COOL' = 'OPTIMAL';
          if (roundedTemp >= 37.4) status = 'ELEVATED';
          else if (roundedTemp <= 36.4) status = 'COOL';

          return {
            ...baby,
            currentTemp: roundedTemp,
            requiredAmbientTemp: reqAmbient,
            status,
            lastUpdated: timeStr
          };
        }
        return baby;
      });

      processWardTempChange(updated, reason || `Baby ${babyId} temp adjusted to ${roundedTemp}°C`);
      return updated;
    });
  }, [processWardTempChange]);

  // Dynamic baby count: Add baby
  const addBaby = useCallback((newBabyData: Omit<BabyAmbientRequirement, 'requiredAmbientTemp' | 'lastUpdated'>) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const reqAmbient = calculateBabyRequiredAmbient(newBabyData.currentTemp, newBabyData.baseTemp, newBabyData.baseAmbient);

    const fullBaby: BabyAmbientRequirement = {
      ...newBabyData,
      requiredAmbientTemp: reqAmbient,
      lastUpdated: timeStr
    };

    setBabies(prev => {
      const updated = [...prev, fullBaby];
      processWardTempChange(updated, `New baby admitted: ${fullBaby.babyNumber}`);
      return updated;
    });
  }, [processWardTempChange]);

  // Dynamic baby count: Remove baby
  const removeBaby = useCallback((babyId: string) => {
    setBabies(prev => {
      const updated = prev.filter(b => b.id !== babyId);
      processWardTempChange(updated, `Baby ${babyId} discharged/transferred`);
      return updated;
    });
  }, [processWardTempChange]);

  // Dismiss notification
  const dismissNotification = useCallback(() => {
    if (activeNotification) {
      lastAcknowledgedTempRef.current = wardAverage;
    }
    setActiveNotification(null);
  }, [activeNotification, wardAverage]);

  // Open / Close Ambient Modal
  const openAmbientModal = useCallback(() => {
    setIsAmbientModalOpen(true);
  }, []);

  const closeAmbientModal = useCallback(() => {
    setIsAmbientModalOpen(false);
  }, []);

  // Update Config
  const setConfig = useCallback((newConfig: Partial<WardTemperatureConfig>) => {
    setConfigState(prev => ({ ...prev, ...newConfig }));
  }, []);

  // Clear History
  const clearHistory = useCallback(() => {
    setHistory(INITIAL_SEED_HISTORY);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY_HISTORY);
    }
  }, []);

  // Trigger exact user-requested Baby 03 scenario:
  // Baby 03 goes from 37.1°C to 37.4°C -> Required ambient goes 26.5°C to 26.2°C -> Ward Avg 27.1°C to 27.0°C!
  const triggerExampleBaby03Shift = useCallback(() => {
    updateBabyTemp('baby-3', 37.4, 'Prompt Scenario: Baby 03 elevated to 37.4°C');
  }, [updateBabyTemp]);

  // Realistic continuous micro-simulation loop
  useEffect(() => {
    if (!config.isSimulationActive) return;

    const interval = setInterval(() => {
      setBabies(prevBabies => {
        if (!prevBabies || prevBabies.length === 0) return prevBabies;

        // Pick 1 random baby for gentle physiological thermal drift (+/- 0.05 to 0.1°C)
        const targetIdx = Math.floor(Math.random() * prevBabies.length);
        const targetBaby = prevBabies[targetIdx];

        // Gentle sinusoidal / physiological fluctuation around base
        const driftOptions = [-0.1, -0.05, 0.05, 0.1];
        const drift = driftOptions[Math.floor(Math.random() * driftOptions.length)];
        let newTemp = Math.round((targetBaby.currentTemp + drift) * 10) / 10;

        // Keep within plausible physiological range (36.0°C - 37.6°C)
        if (newTemp < 36.1) newTemp = 36.2;
        if (newTemp > 37.5) newTemp = 37.3;

        // If no change, skip
        if (newTemp === targetBaby.currentTemp) return prevBabies;

        const reqAmbient = calculateBabyRequiredAmbient(newTemp, targetBaby.baseTemp, targetBaby.baseAmbient);
        let status: 'OPTIMAL' | 'ELEVATED' | 'COOL' = 'OPTIMAL';
        if (newTemp >= 37.4) status = 'ELEVATED';
        else if (newTemp <= 36.4) status = 'COOL';

        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        const updated = [...prevBabies];
        updated[targetIdx] = {
          ...targetBaby,
          currentTemp: newTemp,
          requiredAmbientTemp: reqAmbient,
          status,
          lastUpdated: timeStr
        };

        // Check and process ward changes
        const newWardAvg = calculateWardAverage(updated);
        setWardAverage(prevAvg => {
          if (prevAvg !== newWardAvg) {
            setPreviousWardAverage(prevAvg);
          }
          return newWardAvg;
        });

        // Also gently fluctuate room temp between 26.3 and 26.6
        if (Math.random() > 0.8) {
          const roomDrift = Math.random() > 0.5 ? 0.1 : -0.1;
          setCurrentRoomTemp(r => Math.round(Math.max(26.0, Math.min(27.0, r + roomDrift)) * 10) / 10);
        }

        // Periodically record history or notify
        const totalChangeFromBaseline = Math.round((newWardAvg - lastAcknowledgedTempRef.current) * 10) / 10;
        const isSignificant = Math.abs(totalChangeFromBaseline) >= config.temperatureChangeThreshold;
        const nowMs = Date.now();
        const timeSinceLastNotification = nowMs - lastNotificationTimeRef.current;
        const intervalReached = timeSinceLastNotification >= config.notificationIntervalMs;

        if (Math.abs(newWardAvg - wardAverage) >= 0.1) {
          const newEntry: WardTemperatureHistoryEntry = {
            id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            timestamp: timeStr,
            isoTime: now.toISOString(),
            wardRequiredTemperature: newWardAvg,
            previousWardTemperature: wardAverage,
            change: Math.round((newWardAvg - wardAverage) * 10) / 10,
            currentRoomTemperature: currentRoomTemp,
            babyCount: updated.length,
            babyRequirements: updated.map(b => ({
              babyId: b.id,
              babyNumber: b.babyNumber,
              bedId: b.bedId,
              name: b.name,
              currentTemp: b.currentTemp,
              requiredAmbientTemperature: b.requiredAmbientTemp
            })),
            reason: `Continuous telemetry update (${targetBaby.babyNumber} drifted to ${newTemp}°C)`
          };
          setHistory(h => [newEntry, ...h.slice(0, 49)]);
        }

        if (isSignificant && intervalReached) {
          setActiveNotification({
            id: `notif-${Date.now()}`,
            isOpen: true,
            previousWardTemp: lastAcknowledgedTempRef.current,
            currentWardTemp: newWardAvg,
            totalChange: totalChangeFromBaseline,
            babyCount: updated.length,
            timestamp: timeStr,
            isoTime: now.toISOString()
          });
          lastNotificationTimeRef.current = nowMs;
        }

        return updated;
      });
    }, config.simulationIntervalMs);

    return () => clearInterval(interval);
  }, [config, wardAverage, currentRoomTemp]);

  // Dedicated high-precision check loop to trigger notifications accurately when 2 minutes elapse
  useEffect(() => {
    const checkTimer = setInterval(() => {
      const nowMs = Date.now();
      const timeSinceLast = nowMs - lastNotificationTimeRef.current;
      if (timeSinceLast >= config.notificationIntervalMs) {
        const currentAvg = calculateWardAverage(babies);
        const totalChange = Math.round((currentAvg - lastAcknowledgedTempRef.current) * 10) / 10;
        if (Math.abs(totalChange) >= config.temperatureChangeThreshold && !activeNotification) {
          const now = new Date();
          const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          setActiveNotification({
            id: `notif-${nowMs}`,
            isOpen: true,
            previousWardTemp: lastAcknowledgedTempRef.current,
            currentWardTemp: currentAvg,
            totalChange,
            babyCount: babies.length,
            timestamp: timeStr,
            isoTime: now.toISOString()
          });
          lastNotificationTimeRef.current = nowMs;
        }
      }
    }, 2500); // High-precision 2.5s accuracy

    return () => clearInterval(checkTimer);
  }, [config, babies, activeNotification]);

  const diff = Math.round((wardAverage - currentRoomTemp) * 10) / 10;
  const differenceFormatted = (diff >= 0 ? `+${diff.toFixed(1)}` : `${diff.toFixed(1)}`) + '°C';
  const wardAverageFormatted = `${wardAverage.toFixed(1)}°C`;
  const previousWardAverageFormatted = `${previousWardAverage.toFixed(1)}°C`;
  const currentRoomTempFormatted = `${currentRoomTemp.toFixed(1)}°C`;

  return (
    <WardAmbientContext.Provider
      value={{
        babies,
        wardAverage,
        wardAverageFormatted,
        previousWardAverage,
        previousWardAverageFormatted,
        currentRoomTemp,
        currentRoomTempFormatted,
        differenceFormatted,
        history,
        activeNotification,
        isAmbientModalOpen,
        config,
        updateBabyTemp,
        addBaby,
        removeBaby,
        dismissNotification,
        openAmbientModal,
        closeAmbientModal,
        setConfig,
        triggerExampleBaby03Shift,
        clearHistory
      }}
    >
      {children}
    </WardAmbientContext.Provider>
  );
};

export function useWardAmbient(): WardAmbientContextType {
  const context = useContext(WardAmbientContext);
  if (!context) {
    throw new Error('useWardAmbient must be used within a WardAmbientProvider');
  }
  return context;
}
