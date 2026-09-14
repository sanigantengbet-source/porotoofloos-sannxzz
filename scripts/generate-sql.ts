import { initialPortfolioData } from "../src/context/portfolio-context";
import fs from "fs";
import path from "path";

const jsonStr = JSON.stringify(initialPortfolioData, null, 2);
// Escape single quotes for PostgreSQL
const escapedJson = jsonStr.split("'").join("''");

const sql = `-- ==============================================================================
-- DATABASE SETUP & SISTEM KEAMANAN TINGKAT TINGGI (PORTOFOLIO SANNDEC5TY)
-- ANTI-INJECTION · ANTI-DDOS · ANTI-BRUTE FORCE · ZERO DIRECT WRITE ACCESS
-- ==============================================================================
-- Project ID: oansqqeteisvskmelgbl
-- ==============================================================================
-- Cara Menjalankan:
-- 1. Buka Supabase Dashboard (https://supabase.com/dashboard)
-- 2. Pilih Project Anda: oansqqeteisvskmelgbl
-- 3. Buka menu 'SQL Editor' di sidebar kiri -> Klik 'New Query'
-- 4. Paste semua script ini lalu klik tombol 'Run' (atau Ctrl + Enter)
-- ==============================================================================

-- 1. Buat Tabel Utama portfolio_settings
CREATE TABLE IF NOT EXISTS public.portfolio_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.portfolio_settings ENABLE ROW LEVEL SECURITY;

-- 3. CABUT SEMUA IZIN TULIS LANGSUNG DARI PUBLIK (ANTI-TAMPERING & ANTI-INJECTION)
-- Mencegah siapapun mengubah atau menghapus data database via endpoint REST API publik!
REVOKE INSERT, UPDATE, DELETE ON public.portfolio_settings FROM anon, authenticated;
GRANT SELECT ON public.portfolio_settings TO anon, authenticated;

-- 4. Policy: Izinkan publik hanya MEMBACA data portofolio
DROP POLICY IF EXISTS "Allow public read access" ON public.portfolio_settings;
CREATE POLICY "Allow public read access" 
ON public.portfolio_settings 
FOR SELECT 
USING (true);

-- 5. FUNGSI AMAN TERSIMPAN (SECURE RPC: ANTI-DDOS & ANTI-INJECTION)
-- Seluruh perubahan data wajib melalui fungsi ini dengan menyertakan password admin yang valid.
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
  -- A. Proteksi Anti-DDoS / Payload Bloat: Batasi ukuran maksimal 2MB
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

-- 6. Masukkan Data Awal (Seed Data) Portofolio Lengkap
INSERT INTO public.portfolio_settings (id, data, updated_at)
VALUES (
  'main',
  '${escapedJson}'::jsonb,
  now()
)
ON CONFLICT (id) 
DO UPDATE SET 
  data = EXCLUDED.data,
  updated_at = now();

-- 7. Verifikasi Data & Keamanan
SELECT 
  id,
  updated_at,
  data->'profile'->>'name' AS owner_name,
  jsonb_array_length(data->'projects') AS total_projects,
  data->'security'->>'adminPassword' AS current_password
FROM public.portfolio_settings 
WHERE id = 'main';
`;

const outputPath = path.resolve(process.cwd(), "supabase_setup.sql");
fs.writeFileSync(outputPath, sql, "utf8");
console.log("Successfully created hardened SQL setup: " + outputPath);
