import type { FullPortfolioData } from "@/types/portfolio";
import { validatePayloadSize } from "@/lib/security";

export const SUPABASE_URL: string =
  (import.meta.env["VITE_SUPABASE_URL"] as string) || "https://oansqqeteisvskmelgbl.supabase.co";
export const SUPABASE_ANON_KEY: string =
  (import.meta.env["VITE_SUPABASE_ANON_KEY"] as string) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hbnNxcWV0ZWlzdnNrbWVsZ2JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzODE3NjAsImV4cCI6MjEwNDk1Nzc2MH0.OQ4mUUrS2w5esRfJ4I_45hLY3vUeyvP-vFW9-GGuJbk";

/**
 * SQL Security Script untuk Supabase
 * Melindungi dari:
 * 1. SQL / NoSQL Injection & Unauthorized Direct Write
 * 2. Brute-force Timing Attacks
 * 3. DDoS / Memory & Storage Exhaustion (2MB Payload Cap)
 */
export const SUPABASE_SQL_SETUP = `-- ==============================================================================
-- KEAMANAN DATABASE SUPABASE TINGKAT TINGGI (ANTI-INJECTION & ANTI-DDOS)
-- ==============================================================================
-- Jalankan di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Buat Tabel portfolio_settings
CREATE TABLE IF NOT EXISTS public.portfolio_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.portfolio_settings ENABLE ROW LEVEL SECURITY;

-- 3. CABUT SEMUA IZIN TULIS LANGSUNG DARI PUBLIK (ANTI-TAMPERING & ANTI-INJECTION)
-- Mencegah penyerang menulis/menghapus tabel langsung via REST API
REVOKE INSERT, UPDATE, DELETE ON public.portfolio_settings FROM anon, authenticated;
GRANT SELECT ON public.portfolio_settings TO anon, authenticated;

-- 4. Policy: Izinkan publik hanya MEMBACA data portofolio
DROP POLICY IF EXISTS "Allow public read access" ON public.portfolio_settings;
CREATE POLICY "Allow public read access" 
ON public.portfolio_settings 
FOR SELECT 
USING (true);

-- 5. FUNGSI AMAN TERSIMPAN (SECURE RPC: ANTI-DDOS & ANTI-INJECTION)
-- Hanya data yang menyertakan password admin valid yang dapat disimpan ke database.
CREATE OR REPLACE FUNCTION public.save_portfolio_data(
  p_admin_password TEXT,
  p_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_password TEXT;
  v_payload_size INT;
BEGIN
  -- A. Proteksi Anti-DDoS / Payload Bloat: Batasi maksimal 2MB per request
  v_payload_size := pg_column_size(p_data);
  IF v_payload_size > 2097152 THEN
    RAISE EXCEPTION 'Payload terlalu besar (Maksimal 2MB)';
  END IF;

  -- B. Ambil password admin aktif dari database
  SELECT COALESCE(data->'security'->>'adminPassword', 'admin')
  INTO v_current_password
  FROM public.portfolio_settings
  WHERE id = 'main';

  IF v_current_password IS NULL THEN
    v_current_password := 'admin';
  END IF;

  -- C. Proteksi Anti-Injection & Otentikasi Password
  IF p_admin_password IS NULL OR p_admin_password != v_current_password THEN
    -- Artificial delay untuk menggagalkan automated brute-force timing attacks
    PERFORM pg_sleep(0.5);
    RAISE EXCEPTION 'Akses Ditolak: Password admin tidak valid';
  END IF;

  -- D. Validasi Integritas Struktur Data Minimal
  IF NOT (p_data ? 'profile' AND p_data ? 'projects') THEN
    RAISE EXCEPTION 'Data tidak valid: struktur profil dan proyek wajib ada';
  END IF;

  -- E. Simpan / Perbarui Data Secara Aman
  INSERT INTO public.portfolio_settings (id, data, updated_at)
  VALUES ('main', p_data, now())
  ON CONFLICT (id)
  DO UPDATE SET
    data = EXCLUDED.data,
    updated_at = now();

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Data portofolio berhasil diverifikasi dan disimpan dengan aman',
    'updated_at', now()
  );
END;
$$;

-- Berikan izin eksekusi RPC yang aman ke publik
GRANT EXECUTE ON FUNCTION public.save_portfolio_data(TEXT, JSONB) TO anon, authenticated;
`;

/**
 * Cek status tabel Supabase
 */
export async function testSupabaseTable(): Promise<{
  connected: boolean;
  tableExists: boolean;
  message: string;
}> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/portfolio_settings?select=id&limit=1`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (res.ok) {
      return {
        connected: true,
        tableExists: true,
        message: "Tabel portfolio_settings siap dan terhubung!",
      };
    }

    const body = await res.json().catch(() => ({}));
    if (res.status === 404 || body.code === "PGRST205") {
      return {
        connected: true,
        tableExists: false,
        message:
          "Tabel 'portfolio_settings' belum dibuat di Supabase. Silakan jalankan script SQL di Supabase SQL Editor.",
      };
    }

    return {
      connected: false,
      tableExists: false,
      message: body.message || `HTTP ${res.status}: ${res.statusText}`,
    };
  } catch (err: any) {
    return {
      connected: false,
      tableExists: false,
      message: err.message || "Gagal menghubungi Supabase",
    };
  }
}

/**
 * Ambil data portofolio dari Supabase Cloud
 */
export async function fetchFromSupabase(): Promise<FullPortfolioData | null> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/portfolio_settings?id=eq.main&select=data`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!res.ok) return null;

    const rows = await res.json();
    if (Array.isArray(rows) && rows.length > 0 && rows[0].data) {
      return rows[0].data as FullPortfolioData;
    }
    return null;
  } catch (err) {
    console.warn("Supabase fetch error:", err);
    return null;
  }
}

/**
 * Simpan atau perbarui data portofolio ke Supabase Cloud
 * Dilengkapi validasi ukuran payload dan pemanggilan RPC tersimpan yang aman.
 */
export async function saveToSupabase(
  data: FullPortfolioData
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Anti-DDoS: Cek ukuran payload sebelum dikirim
    const payloadValidation = validatePayloadSize(data);
    if (!payloadValidation.valid) {
      return {
        success: false,
        error: `Payload ditolak: Ukuran data (${payloadValidation.sizeFormatted}) melebihi batas keamanan 2MB.`,
      };
    }

    const adminPassword = data.security?.adminPassword || "admin";

    // 2. Jalur Utama: Panggil Secure RPC `save_portfolio_data`
    const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/save_portfolio_data`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_admin_password: adminPassword,
        p_data: data,
      }),
    });

    if (rpcRes.ok) {
      return { success: true };
    }

    const rpcError = await rpcRes.json().catch(() => ({}));

    // Jika RPC belum dibuat di Supabase (PGRST202 / 404), gunakan fallback tabel sementara
    if (rpcRes.status === 404 || rpcError.code === "PGRST202") {
      const fallbackRes = await fetch(`${SUPABASE_URL}/rest/v1/portfolio_settings`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify([
          {
            id: "main",
            data,
            updated_at: new Date().toISOString(),
          },
        ]),
      });

      if (fallbackRes.ok) {
        return { success: true };
      }

      const fallbackErr = await fallbackRes.json().catch(() => ({}));
      return {
        success: false,
        error:
          fallbackErr.message ||
          "Gagal menyimpan ke database. Pastikan script SQL keamanan terbaru telah dijalankan di Supabase.",
      };
    }

    return {
      success: false,
      error:
        rpcError.message ||
        `Penyimpanan database ditolak (HTTP ${rpcRes.status}): Password admin tidak cocok atau akses dibatasi.`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Koneksi ke Supabase terputus",
    };
  }
}
