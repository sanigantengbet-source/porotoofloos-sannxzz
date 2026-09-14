/**
 * Security & Anti-Abuse Utility
 * Melindungi antarmuka admin dan database dari:
 * 1. XSS / Script Injection (sanitasi teks & URL)
 * 2. Brute-force attacks (rate limiting & progressive lockout)
 * 3. DDoS / Payload bloat attacks (pembatasan ukuran data)
 */

const LOCKOUT_STORAGE_KEY = "sanndec5ty_security_lockout";
const MAX_FAILED_ATTEMPTS = 5;
const COOLDOWN_TIERS_SECONDS = [30, 60, 300]; // 30s, 1m, 5m

export interface LockoutState {
  failedAttempts: number;
  lockoutUntil: number; // Unix timestamp in ms
  tier: number;
}

/**
 * Membaca status keamanan lockout dari storage lokal
 */
export function getLockoutState(): LockoutState {
  if (typeof window === "undefined") {
    return { failedAttempts: 0, lockoutUntil: 0, tier: 0 };
  }
  try {
    const raw = localStorage.getItem(LOCKOUT_STORAGE_KEY);
    if (!raw) return { failedAttempts: 0, lockoutUntil: 0, tier: 0 };
    const parsed = JSON.parse(raw);
    return {
      failedAttempts: Number(parsed.failedAttempts) || 0,
      lockoutUntil: Number(parsed.lockoutUntil) || 0,
      tier: Number(parsed.tier) || 0,
    };
  } catch {
    return { failedAttempts: 0, lockoutUntil: 0, tier: 0 };
  }
}

/**
 * Mencatat percobaan login gagal dan menerapkan penundaan bertingkat (progressive cooldown)
 */
export function recordFailedAttempt(): {
  isLocked: boolean;
  remainingSeconds: number;
  attemptsLeft: number;
} {
  const current = getLockoutState();
  const nextAttempts = current.failedAttempts + 1;
  const now = Date.now();

  if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
    const tier = Math.min(current.tier, COOLDOWN_TIERS_SECONDS.length - 1);
    const cooldownSec = COOLDOWN_TIERS_SECONDS[tier] ?? 30;
    const lockoutUntil = now + cooldownSec * 1000;

    const newState: LockoutState = {
      failedAttempts: nextAttempts,
      lockoutUntil,
      tier: tier + 1,
    };
    try {
      localStorage.setItem(LOCKOUT_STORAGE_KEY, JSON.stringify(newState));
    } catch {
      // Ignore storage errors
    }

    return {
      isLocked: true,
      remainingSeconds: cooldownSec,
      attemptsLeft: 0,
    };
  }

  const newState: LockoutState = {
    failedAttempts: nextAttempts,
    lockoutUntil: 0,
    tier: current.tier,
  };
  try {
    localStorage.setItem(LOCKOUT_STORAGE_KEY, JSON.stringify(newState));
  } catch {
    // Ignore storage errors
  }

  return {
    isLocked: false,
    remainingSeconds: 0,
    attemptsLeft: MAX_FAILED_ATTEMPTS - nextAttempts,
  };
}

/**
 * Mereset status lockout setelah login berhasil
 */
export function resetLockoutState(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LOCKOUT_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Menghitung sisa detik penguncian jika sedang dalam kondisi terkunci
 */
export function getRemainingLockoutSeconds(): number {
  const state = getLockoutState();
  if (!state.lockoutUntil) return 0;
  const diff = Math.ceil((state.lockoutUntil - Date.now()) / 1000);
  return diff > 0 ? diff : 0;
}

/**
 * Sanitasi URL untuk mencegah XSS via protokol berbahaya seperti:
 * `javascript:alert(1)`, `data:text/html,...`, `vbscript:...`
 */
export function sanitizeUrl(rawUrl: string | undefined | null): string {
  if (!rawUrl) return "";
  const trimmed = rawUrl.trim();
  if (trimmed === "") return "";

  // Protokol berbahaya yang wajib diblokir
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.includes("javascript:")
  ) {
    console.warn("[Security] Berbahaya: URL mengandung skrip berbahaya yang diblokir:", trimmed);
    return "#blocked-insecure-url";
  }

  // Jika URL berupa hash atau path lokal, izinkan
  if (trimmed.startsWith("#") || trimmed.startsWith("/")) {
    return trimmed;
  }

  // Hanya izinkan http, https, mailto, tel
  if (
    lower.startsWith("http://") ||
    lower.startsWith("https://") ||
    lower.startsWith("mailto:") ||
    lower.startsWith("tel:")
  ) {
    return trimmed;
  }

  // Jika user hanya mengetik domain tanpa protocol (misal: "github.com/user")
  return "https://" + trimmed;
}

/**
 * Sanitasi teks dari tag HTML/skrip berbahaya
 */
export function sanitizeText(text: string | undefined | null, maxLength = 5000): string {
  if (!text) return "";
  // Potong jika melebihi batas panjang maksimal
  let cleaned = text.slice(0, maxLength);

  // Bersihkan tag <script>...</script>
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  // Bersihkan event handler jahat seperti onload=, onerror=, onclick=
  cleaned = cleaned.replace(/\s+on\w+\s*=\s*(['"]).*?\1/gi, "");
  cleaned = cleaned.replace(/\s+on\w+\s*=\s*[^>\s]+/gi, "");

  return cleaned.trim();
}

/**
 * Validasi batas ukuran payload untuk mencegah serangan DDoS / Memory Exhaustion
 * Batas standar: 2 Megabytes
 */
export function validatePayloadSize(data: unknown, maxBytes = 2 * 1024 * 1024): {
  valid: boolean;
  sizeBytes: number;
  sizeFormatted: string;
} {
  try {
    const jsonString = typeof data === "string" ? data : JSON.stringify(data);
    const sizeBytes = new TextEncoder().encode(jsonString).length;
    const sizeFormatted = (sizeBytes / 1024).toFixed(2) + " KB";
    return {
      valid: sizeBytes <= maxBytes,
      sizeBytes,
      sizeFormatted,
    };
  } catch {
    return {
      valid: false,
      sizeBytes: 0,
      sizeFormatted: "0 KB",
    };
  }
}
