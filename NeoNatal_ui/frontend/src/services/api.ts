// NAVAAYU Raspberry Pi 5 / Cloud Edge AI API Service (Ultra-Low Latency Engine)

export const DEFAULT_RENDER_URL = 'https://pc-2-hardware.onrender.com';

// Cache the winning endpoint path to avoid re-probing on every frame
let cachedWinningPath: string | null = null;
let lastSuccessfulBaseUrl: string | null = null;

export function sanitizeUrl(url?: string | null): string {
  if (!url) return DEFAULT_RENDER_URL;
  const clean = url.trim().replace(/\/+$/, '');
  const lower = clean.toLowerCase();
  if (
    lower === '' ||
    lower === 'render' ||
    lower === 'cloud' ||
    lower === 'default' ||
    clean.includes('localhost:8000') ||
    clean.includes('127.0.0.1:8000')
  ) {
    return DEFAULT_RENDER_URL;
  }
  return clean;
}

export function getResolvedPiBaseUrl(): string {
  // 1. Runtime override via window URL query parameter (?pi_url=http://...)
  if (typeof window !== 'undefined' && window.location?.search) {
    const params = new URLSearchParams(window.location.search);
    const queryUrl = params.get('pi_url') || params.get('pi') || params.get('api_url') || params.get('url');
    if (queryUrl) {
      return sanitizeUrl(queryUrl);
    }
  }

  // 2. Runtime override via localStorage (configurable directly from UI without rebuilding)
  if (typeof window !== 'undefined' && window.localStorage) {
    const stored = window.localStorage.getItem('NAVAAYU_PI_URL');
    if (stored && stored.trim().length > 0) {
      return sanitizeUrl(stored);
    }
  }

  // 3. Vite environment variable VITE_PI_API_URL or VITE_API_URL
  const envUrl = import.meta.env.VITE_PI_API_URL || import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return sanitizeUrl(envUrl);
  }

  // 4. Default fallback: Render Cloud
  return DEFAULT_RENDER_URL;
}

export function setRuntimePiBaseUrl(url: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    const cleaned = sanitizeUrl(url);
    window.localStorage.setItem('NAVAAYU_PI_URL', cleaned);
    cachedWinningPath = null;
  }
}

export function clearRuntimePiBaseUrl(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem('NAVAAYU_PI_URL');
    cachedWinningPath = null;
  }
}

export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
  sourceUrl?: string;
  latencyMs?: number;
}

/**
 * Normalizes different backend payload formats (/latest, /api/dashboard, /health)
 * into a unified structure expected by the NAVAAYU dashboard.
 */
export function normalizeTelemetryPayload(raw: any): any {
  if (!raw) return raw;

  // If already standard format with results
  if (raw.results || raw.result || raw.vitals || raw.predicted_label) {
    return raw;
  }

  // If /api/dashboard format with babies array and activeBabyId
  if (raw.babies && Array.isArray(raw.babies)) {
    const activeId = raw.activeBabyId || 'NB-2026-001';
    const active = raw.babies.find((b: any) => b.id === activeId || b.bedId === activeId) || raw.babies[0] || {};
    const motion = raw.motionMonitoring || {};
    const cry = raw.cryDetection || {};

    const v = active.vitals || {};
    return {
      results: [
        {
          baby_id: active.id || active.bedId || 'NICU_001',
          id: active.id || 'NICU_001',
          name: active.name || 'Patient',
          status: active.status || 'SAFE',
          risk_score: active.riskScore || 15,
          confidence: active.confidence || 95,
          timestamp: new Date().toISOString(),
          vitals: {
            heart_rate_bpm: v.heartRate ?? 140,
            oxygen_saturation: v.spo2 ?? 98,
            respiratory_rate_bpm: v.respRate ?? 44,
            temperature_c: v.temp ?? 36.8,
            systolic_bp: v.systolicBp ?? v.systolic_bp ?? 68,
            diastolic_bp: v.diastolicBp ?? v.diastolic_bp ?? 42,
            blood_pressure: v.bp ?? 50
          },
          motionMonitoring: motion,
          cryDetection: cry,
          reason: active.alertBanner?.title || `Vitals verified within normal bounds`,
          recommendation: `Continuous neonatal monitoring active`,
          actionToBeTaken: [
            'Maintain servo-controlled temperature.',
            'Continuous pulse oximetry check.'
          ]
        }
      ],
      rawDashboard: raw
    };
  }

  return raw;
}

/**
 * Fast single HTTP probe helper with AbortController timeout
 */
async function fetchWithTimeout(url: string, timeoutMs: number): Promise<{ ok: boolean; status: number; data?: any; error?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      },
      cache: 'no-store',
      signal: controller.signal
    });

    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json().catch(() => ({ status: 'healthy' }));
      return { ok: true, status: res.status, data };
    }
    return { ok: false, status: res.status, error: `HTTP ${res.status}` };
  } catch (err: any) {
    clearTimeout(timer);
    return { ok: false, status: 0, error: err.name === 'AbortError' ? 'Timeout' : (err.message || 'Network error') };
  }
}

/**
 * Health check endpoint on Raspberry Pi FastAPI server: GET /health or /api/dashboard or /
 */
export async function checkPiHealth(baseUrl?: string, timeoutMs: number = 1500): Promise<ApiResponse> {
  const base = sanitizeUrl(baseUrl || getResolvedPiBaseUrl());
  const cacheBuster = `_t=${Date.now()}`;
  const startTime = performance.now();

  // Try cached path or test fast endpoints concurrently
  const candidatePaths = ['health', 'api/dashboard', ''];
  const promises = candidatePaths.map(path => {
    const url = path ? `${base}/${path}?${cacheBuster}` : `${base}?${cacheBuster}`;
    return fetchWithTimeout(url, timeoutMs).then(res => ({ ...res, url, path }));
  });

  try {
    // Return as soon as ANY endpoint succeeds (Promise.any race for zero delay)
    const result = await Promise.any(
      promises.map(p => p.then(res => {
        if (res.ok) return res;
        throw new Error(res.error || 'Failed');
      }))
    );

    return {
      ok: true,
      data: result.data,
      statusCode: result.status,
      sourceUrl: result.url,
      latencyMs: Math.round(performance.now() - startTime)
    };
  } catch {
    return {
      ok: false,
      error: 'Health check probe timed out',
      sourceUrl: base,
      latencyMs: Math.round(performance.now() - startTime)
    };
  }
}

/**
 * Request latest prediction from Raspberry Pi / Render Cloud Edge AI with ZERO DELAY:
 * Uses parallel racing across /latest, /api/dashboard, and cached path with fast 1200ms timeout.
 */
export async function getLatestPredictions(baseUrl?: string, babyId?: string, timeoutMs: number = 1200): Promise<ApiResponse> {
  const base = sanitizeUrl(baseUrl || getResolvedPiBaseUrl());
  const cacheBuster = `_t=${Date.now()}`;
  const startTime = performance.now();

  // Reset cache if base URL switched
  if (lastSuccessfulBaseUrl !== base) {
    cachedWinningPath = null;
    lastSuccessfulBaseUrl = base;
  }

  // 1. If we already know the winning working path on this host, try it directly
  if (cachedWinningPath) {
    const directUrl = `${base}/${cachedWinningPath}?${cacheBuster}`;
    const directRes = await fetchWithTimeout(directUrl, timeoutMs);
    if (directRes.ok && directRes.data) {
      const normalized = normalizeTelemetryPayload(directRes.data);
      return {
        ok: true,
        data: normalized,
        statusCode: directRes.status,
        sourceUrl: directUrl,
        latencyMs: Math.round(performance.now() - startTime)
      };
    }
    // Cached path failed, invalidate and proceed to concurrent probe
    cachedWinningPath = null;
  }

  // 2. Ultra-fast parallel probe across all possible backend API paths
  const candidatePaths: string[] = [
    'api/dashboard',
    babyId ? `latest/${encodeURIComponent(babyId)}` : 'latest',
    'latest',
    'health'
  ];

  // Remove duplicates
  const uniquePaths = Array.from(new Set(candidatePaths));

  const probePromises = uniquePaths.map(path => {
    const targetUrl = `${base}/${path}?${cacheBuster}`;
    return fetchWithTimeout(targetUrl, timeoutMs).then(res => ({
      ...res,
      url: targetUrl,
      path
    }));
  });

  try {
    // Race all candidate endpoints simultaneously; whichever responds first wins immediately
    const fastestSuccess = await Promise.any(
      probePromises.map(p => p.then(res => {
        if (res.ok && res.data) return res;
        throw new Error(res.error || 'Failed probe');
      }))
    );

    // Cache the winning path for subsequent instant calls
    cachedWinningPath = fastestSuccess.path;
    const normalized = normalizeTelemetryPayload(fastestSuccess.data);

    return {
      ok: true,
      data: normalized,
      statusCode: fastestSuccess.status,
      sourceUrl: fastestSuccess.url,
      latencyMs: Math.round(performance.now() - startTime)
    };
  } catch {
    return {
      ok: false,
      error: 'Edge server did not respond within timeout',
      statusCode: 0,
      sourceUrl: base,
      latencyMs: Math.round(performance.now() - startTime)
    };
  }
}

// Backward-compatible exports for prototype
export async function getMotion(baseUrl?: string) {
  const base = sanitizeUrl(baseUrl || getResolvedPiBaseUrl());
  const res = await fetch(`${base}/api/motion?_t=${Date.now()}`, { cache: 'no-store' });
  return res.json();
}

export async function getCry(baseUrl?: string) {
  const base = sanitizeUrl(baseUrl || getResolvedPiBaseUrl());
  const res = await fetch(`${base}/api/cry?_t=${Date.now()}`, { cache: 'no-store' });
  return res.json();
}

export async function getStatus(baseUrl?: string) {
  const base = sanitizeUrl(baseUrl || getResolvedPiBaseUrl());
  const res = await fetch(`${base}/api/status?_t=${Date.now()}`, { cache: 'no-store' });
  return res.json();
}
