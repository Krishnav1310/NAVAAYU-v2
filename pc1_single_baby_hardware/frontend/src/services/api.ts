// NAVAAYU Raspberry Pi 5 / Cloud Edge AI API Service

export const DEFAULT_RENDER_URL = 'https://pc-2-hardware.onrender.com';

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
  }
}

export function clearRuntimePiBaseUrl(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem('NAVAAYU_PI_URL');
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
 * Health check endpoint on Raspberry Pi FastAPI server: GET /health
 */
export async function checkPiHealth(baseUrl?: string, timeoutMs: number = 3000): Promise<ApiResponse> {
  const base = sanitizeUrl(baseUrl || getResolvedPiBaseUrl());
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const cacheBuster = `_t=${Date.now()}`;
  const startTime = performance.now();

  const candidates: string[] = [
    `${base}/health?${cacheBuster}`
  ];

  for (const url of candidates) {
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
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json().catch(() => ({ status: 'healthy' }));
        return { 
          ok: true, 
          data, 
          statusCode: res.status, 
          sourceUrl: url, 
          latencyMs: Math.round(performance.now() - startTime) 
        };
      }
    } catch {
      // try next
    }
  }

  clearTimeout(timeoutId);
  return { 
    ok: false, 
    error: 'Health check failed across all endpoints', 
    sourceUrl: base, 
    latencyMs: Math.round(performance.now() - startTime) 
  };
}

/**
 * Request latest prediction from Raspberry Pi Edge AI:
 * GET /latest or GET /latest/{baby_id}
 */
export async function getLatestPredictions(baseUrl?: string, babyId?: string, timeoutMs: number = 3000): Promise<ApiResponse> {
  const base = sanitizeUrl(baseUrl || getResolvedPiBaseUrl());
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const cacheBuster = `_t=${Date.now()}`;
  const startTime = performance.now();

  const endpointPath = babyId ? `latest/${encodeURIComponent(babyId)}` : 'latest';

  const candidates: string[] = [
    `${base}/${endpointPath}?${cacheBuster}`
  ];

  if (babyId) {
    candidates.push(`${base}/latest?${cacheBuster}`);
  }

  let lastError = '';
  let lastStatus = 0;

  for (const url of candidates) {
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

      if (res.ok) {
        clearTimeout(timeoutId);
        const data = await res.json();
        return { 
          ok: true, 
          data, 
          statusCode: res.status, 
          sourceUrl: url, 
          latencyMs: Math.round(performance.now() - startTime) 
        };
      }
      lastStatus = res.status;
      lastError = `HTTP ${res.status}: ${res.statusText}`;
    } catch (err: any) {
      lastError = err.name === 'AbortError' ? 'Connection timeout' : (err.message || 'Network error');
    }
  }

  clearTimeout(timeoutId);
  return { 
    ok: false, 
    error: lastError, 
    statusCode: lastStatus, 
    sourceUrl: candidates[0], 
    latencyMs: Math.round(performance.now() - startTime) 
  };
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

