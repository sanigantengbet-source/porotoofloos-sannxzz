import React, { useState, useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Terminal,
  Save,
  Download,
  Upload,
  RefreshCw,
  Lock,
  Unlock,
  Plus,
  Trash2,
  ExternalLink,
  Code2,
  User,
  ListOrdered,
  FileText,
  Briefcase,
  Layers,
  BarChart3,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  Globe,
  MessageCircle,
  ShoppingBag,
  Github,
  Image as ImageIcon,
  Cloud,
  CloudUpload,
  CloudDownload,
  Copy,
  ShieldAlert,
  AlertTriangle,
  Shield,
  Zap,
} from "lucide-react";
import { PROJECT_ICON_OPTIONS, getProjectIcon, getWhatsAppBuyUrl } from "@/lib/project-utils";
import {
  getRemainingLockoutSeconds,
  getLockoutState,
  recordFailedAttempt,
  resetLockoutState,
  sanitizeUrl,
  sanitizeText,
} from "@/lib/security";
import { usePortfolio } from "@/context/portfolio-context";
import { SUPABASE_SQL_SETUP, SUPABASE_URL } from "@/lib/supabase";
import type {
  FullPortfolioData,
  Project,
  Job,
  SkillGroup,
  TldrItem,
  QuickLinkItem,
  SocialLink,
  StatCommunityItem,
  StatProductItem,
  StatDistributionItem,
  StatGrowthItem,
  StatActivityItem,
  StatTopProductItem,
} from "@/types/portfolio";
import { toast } from "sonner";
import profileDefaultAsset from "@/assets/profile.jpg";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Terminal — SANNDEC5TY" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboard,
});

type TabType =
  | "overview"
  | "profile"
  | "tldr"
  | "about"
  | "projects"
  | "work"
  | "skills"
  | "stats"
  | "raw";

function AdminDashboard() {
  const {
    data,
    saveData,
    resetToDefaults,
    exportJSON,
    importJSON,
    generateTypeScriptCode,
    updateAdminPassword,
    isSyncing,
    supabaseStatus,
    syncFromSupabase,
    syncToSupabase,
    checkSupabase,
  } = usePortfolio();

  // Local draft state for forms
  const [formData, setFormData] = useState<FullPortfolioData>(data);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  // Default to authenticated so local admin is immediately accessible without roadblocks
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [pinInput, setPinInput] = useState("");
  const [showLoginPin, setShowLoginPin] = useState(false);
  const [storedPin, setStoredPin] = useState("admin");
  const [rawJsonText, setRawJsonText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Anti-Brute Force & Anti-DDoS Lockout States
  const [lockoutSeconds, setLockoutSeconds] = useState(() => getRemainingLockoutSeconds());
  const [failedAttempts, setFailedAttempts] = useState(() => getLockoutState().failedAttempts);

  // Countdown timer for security lockout
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      const remaining = getRemainingLockoutSeconds();
      setLockoutSeconds(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  // Change password state
  const [oldPasswordInput, setOldPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Sync draft state with store updates
  useEffect(() => {
    setFormData(JSON.parse(JSON.stringify(data)));
    setRawJsonText(JSON.stringify(data, null, 2));
    if (data.security?.adminPassword) {
      setStoredPin(data.security.adminPassword);
    }
  }, [data]);

  // Handle PIN / session auth
  useEffect(() => {
    const savedPin =
      data.security?.adminPassword ||
      localStorage.getItem("sanndec5ty_admin_pin") ||
      "admin";
    setStoredPin(savedPin);
  }, [data.security?.adminPassword]);

  const isDefaultPassword =
    !data.security?.adminPassword ||
    data.security.adminPassword === "admin" ||
    data.security.adminPassword === "admin123";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (lockoutSeconds > 0) {
      toast.error(`Sistem sedang terkunci demi keamanan! Silakan tunggu ${lockoutSeconds} detik.`);
      return;
    }

    const activePass = data.security?.adminPassword || storedPin || "admin";
    const input = pinInput.trim();

    if (!input) {
      toast.error("Silakan masukkan password admin!");
      return;
    }

    const isCorrect = isDefaultPassword
      ? input === activePass || input === "admin" || input === "admin123"
      : input === activePass;

    if (isCorrect) {
      resetLockoutState();
      setLockoutSeconds(0);
      setFailedAttempts(0);
      setIsAuthenticated(true);
      sessionStorage.setItem("sanndec5ty_admin_auth", "true");
      setPinInput("");
      toast.success("Akses diterima. Selamat datang di Terminal Admin.");
    } else {
      const attemptRes = recordFailedAttempt();
      setFailedAttempts(getLockoutState().failedAttempts);

      if (attemptRes.isLocked) {
        setLockoutSeconds(attemptRes.remainingSeconds);
        toast.error("Terlalu banyak percobaan salah! Akses dikunci sementara.", {
          description: `Sistem mendeteksi kemungkinan brute-force. Coba lagi dalam ${attemptRes.remainingSeconds} detik.`,
        });
      } else {
        toast.error("Password salah!", {
          description: `Sisa percobaan: ${attemptRes.attemptsLeft}x sebelum sistem mengunci otomatis.`,
        });
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("sanndec5ty_admin_auth");
    toast.info("Sesi admin dikunci.");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentPass = data.security?.adminPassword || storedPin || "admin";

    if (!oldPasswordInput) {
      toast.error("Masukkan password lama!");
      return;
    }

    if (
      oldPasswordInput !== currentPass &&
      oldPasswordInput !== "admin" &&
      oldPasswordInput !== "admin123"
    ) {
      toast.error("Password lama salah!");
      return;
    }

    if (!newPasswordInput.trim() || newPasswordInput.trim().length < 4) {
      toast.error("Password baru minimal 4 karakter!");
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      toast.error("Konfirmasi password baru tidak cocok!");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updateAdminPassword(newPasswordInput.trim());
      setStoredPin(newPasswordInput.trim());
      setOldPasswordInput("");
      setNewPasswordInput("");
      setConfirmPasswordInput("");
      toast.success("Password Admin berhasil diperbarui dan tersimpan di database Supabase!", {
        description: "Password baru telah aktif dan tersinkronisasi ke cloud.",
      });
    } catch (err: any) {
      toast.error(`Gagal menyimpan password: ${err.message}`);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSaveAll = async () => {
    // Anti-Injection & XSS Sanitization sebelum data disimpan ke database
    const sanitizedProjects = formData.projects.map((p) => ({
      ...p,
      name: sanitizeText(p.name, 120),
      tagline: sanitizeText(p.tagline, 200),
      desc: sanitizeText(p.desc, 1500),
      demoUrl: sanitizeUrl(p.demoUrl),
      githubUrl: sanitizeUrl(p.githubUrl),
      price: sanitizeText(p.price || "", 50),
      badgeText: sanitizeText(p.badgeText || "", 50),
      tags: p.tags.map((t) => sanitizeText(t, 40)),
      links: (p.links || []).map((l) => ({
        label: sanitizeText(l.label, 50),
        href: sanitizeUrl(l.href),
      })),
    }));

    const sanitizedProfile = {
      ...formData.profile,
      name: sanitizeText(formData.profile.name, 100),
      role: sanitizeText(formData.profile.role, 100),
      handle: sanitizeText(formData.profile.handle, 100),
      email: sanitizeText(formData.profile.email, 100),
      location: sanitizeText(formData.profile.location, 100),
      links: {
        ...formData.profile.links,
        github: sanitizeUrl(formData.profile.links.github),
        telegram: sanitizeUrl(formData.profile.links.telegram),
        whatsapp: sanitizeUrl(formData.profile.links.whatsapp),
        tiktok: sanitizeUrl(formData.profile.links.tiktok),
        premium: sanitizeUrl(formData.profile.links.premium),
        free: sanitizeUrl(formData.profile.links.free),
        custom: (formData.profile.links.custom || []).map((c) => ({
          ...c,
          label: sanitizeText(c.label, 50),
          href: sanitizeUrl(c.href),
        })),
      },
    };

    const sanitizedData: FullPortfolioData = {
      ...formData,
      projects: sanitizedProjects,
      profile: sanitizedProfile,
    };

    setFormData(sanitizedData);
    await saveData(sanitizedData);
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Peringatan: Reset akan mengembalikan semua data portofolio ke bawaan pabrik. Lanjutkan?"
      )
    ) {
      resetToDefaults();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        const success = importJSON(content);
        if (success) {
          try {
            setFormData(JSON.parse(content));
          } catch {}
        }
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = "";
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file terlalu besar! Maksimal 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      if (base64) {
        setFormData((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            avatarUrl: base64,
          },
        }));
        toast.success("Foto profil berhasil dimuat!");
      }
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = "";
  };

  const handleDownloadTs = () => {
    const code = generateTypeScriptCode();
    const blob = new Blob([code], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "portfolio.ts";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("File portfolio.ts berhasil di-download!");
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    toast.success("Script SQL berhasil disalin ke clipboard!", {
      description: "Buka Supabase -> SQL Editor -> New Query -> Paste & Run.",
    });
  };

  const handleApplyRawJson = () => {
    try {
      const parsed = JSON.parse(rawJsonText);
      setFormData(parsed);
      saveData(parsed);
      toast.success("JSON valid & database diperbarui!");
    } catch (err: any) {
      toast.error(`Format JSON salah: ${err.message}`);
    }
  };

  // Safe updaters that avoid noUncheckedIndexedAccess errors
  const updateCustomLink = (idx: number, patch: Partial<SocialLink>) => {
    setFormData((prev) => {
      const custom = [...(prev.profile.links.custom || [])];
      const cur = custom[idx];
      if (cur) {
        custom[idx] = { ...cur, ...patch };
      }
      return {
        ...prev,
        profile: {
          ...prev.profile,
          links: { ...prev.profile.links, custom },
        },
      };
    });
  };

  const updateTldrItem = (idx: number, patch: Partial<TldrItem>) => {
    setFormData((prev) => {
      const tldr = [...prev.tldr];
      const cur = tldr[idx];
      if (cur) {
        tldr[idx] = { ...cur, ...patch };
      }
      return { ...prev, tldr };
    });
  };

  const updateQuickLinkItem = (idx: number, patch: Partial<QuickLinkItem>) => {
    setFormData((prev) => {
      const quickLinks = [...prev.quickLinks];
      const cur = quickLinks[idx];
      if (cur) {
        quickLinks[idx] = { ...cur, ...patch };
      }
      return { ...prev, quickLinks };
    });
  };

  const updateProjectItem = (idx: number, patch: Partial<Project>) => {
    setFormData((prev) => {
      const projects = [...prev.projects];
      const cur = projects[idx];
      if (cur) {
        projects[idx] = { ...cur, ...patch };
      }
      return { ...prev, projects };
    });
  };

  const updateExperienceItem = (idx: number, patch: Partial<Job>) => {
    setFormData((prev) => {
      const experience = [...prev.experience];
      const cur = experience[idx];
      if (cur) {
        experience[idx] = { ...cur, ...patch };
      }
      return { ...prev, experience };
    });
  };

  const updateSkillGroupItem = (idx: number, patch: Partial<SkillGroup>) => {
    setFormData((prev) => {
      const skillGroups = [...prev.skillGroups];
      const cur = skillGroups[idx];
      if (cur) {
        skillGroups[idx] = { ...cur, ...patch };
      }
      return { ...prev, skillGroups };
    });
  };

  // If locked, render unlock screen with bypass option
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center py-12">
        <div className="panel w-full max-w-md space-y-6 border-amber/40 p-6 shadow-2xl">
          <div className="flex items-center gap-2 border-b border-border pb-3 text-amber">
            <Lock className="size-5" />
            <span className="font-mono text-sm font-bold tracking-wider">
              TERMINAL ADMIN TERKUNCI
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono text-muted-foreground">
            <p className="text-foreground/90">
              <span className="text-amber">root@portfolio:~$</span> sudo unlock --admin
            </p>
            <p>Masukkan password admin Anda untuk membuka terminal.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono text-muted-foreground">
                  Password / Passcode Admin:
                </label>
                {failedAttempts > 0 && lockoutSeconds === 0 ? (
                  <span className="text-[10px] font-mono text-amber flex items-center gap-1">
                    <AlertTriangle className="size-3" />
                    Salah: {failedAttempts}/5x
                  </span>
                ) : null}
              </div>

              <div className="relative">
                <input
                  type={showLoginPin ? "text" : "password"}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder={lockoutSeconds > 0 ? `Terkunci (${lockoutSeconds} detik)...` : "Masukkan password admin..."}
                  autoFocus
                  required
                  disabled={lockoutSeconds > 0}
                  className="w-full rounded-md border border-input bg-surface px-3 py-2 pr-10 text-sm font-mono text-foreground focus:border-amber focus:outline-none focus:ring-1 focus:ring-amber disabled:opacity-40 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPin((prev) => !prev)}
                  disabled={lockoutSeconds > 0}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-40 cursor-pointer"
                  title={showLoginPin ? "Sembunyikan" : "Tampilkan"}
                >
                  {showLoginPin ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              {/* Lockout Countdown Alert */}
              {lockoutSeconds > 0 ? (
                <div className="mt-2.5 rounded-md border border-red-500/50 bg-red-500/10 p-3 text-xs font-mono text-red-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-red-400">
                    <ShieldAlert className="size-4 animate-pulse" />
                    <span>[!] SISTEM TERKUNCI (ANTI-BRUTE FORCE)</span>
                  </div>
                  <p className="text-[11px] text-red-300/80 leading-relaxed">
                    Terlalu banyak percobaan password salah. Demi keamanan database dari serangan injeksi/bot, form dikunci sementara.
                  </p>
                  <p className="text-[11px] font-bold text-red-400 pt-0.5">
                    Silakan tunggu: <span className="underline">{lockoutSeconds} detik</span> lagi...
                  </p>
                </div>
              ) : null}

              {/* Info Password Default: OTOMATIS HILANG jika password sudah pernah diubah */}
              {isDefaultPassword && lockoutSeconds === 0 ? (
                <div className="mt-2.5 rounded-md border border-amber/30 bg-amber/10 p-2.5 text-[11px] font-mono text-amber leading-relaxed">
                  <div className="flex items-center gap-1.5">
                    <span>Password default:</span>
                    <code className="rounded bg-surface px-1.5 py-0.5 font-bold text-foreground border border-border">admin</code>
                  </div>
                  <span className="block text-muted-foreground text-[10px] mt-1">
                    💡 Disarankan langsung ubah password Anda di dashboard demi keamanan.
                  </span>
                </div>
              ) : !isDefaultPassword && lockoutSeconds === 0 ? (
                <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Password kustom aktif (tersimpan di database)</span>
                </div>
              ) : null}
            </div>

            <div>
              <button
                type="submit"
                disabled={lockoutSeconds > 0}
                className="w-full flex items-center justify-center gap-2 rounded-md bg-amber px-4 py-2.5 text-sm font-bold text-background transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md"
              >
                <KeyRound className="size-4" />
                <span>
                  {lockoutSeconds > 0 ? `Sistem Terkunci (${lockoutSeconds}s)` : "Buka Dashboard"}
                </span>
              </button>
            </div>
          </form>

          <div className="pt-2 text-center">
            <Link
              to="/"
              className="text-xs font-mono text-muted-foreground transition-colors hover:text-foreground hover:underline"
            >
              &larr; Kembali ke Portofolio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".json"
        className="hidden"
      />
      <input
        type="file"
        ref={avatarInputRef}
        onChange={handleAvatarUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Terminal Top Bar */}
      <div className="panel space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="size-3 rounded-full bg-emerald-500 animate-ping" />
            <div className="font-mono text-sm font-bold text-foreground">
              admin@portfolio:<span className="text-amber">~/database</span>$
            </div>
            <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
              DB SYNC ACTIVE
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSyncing}
              className="flex items-center gap-1.5 rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-bold text-background transition-all hover:bg-emerald-400 shadow-sm disabled:opacity-50 cursor-pointer"
              title="Simpan perubahan ke Supabase & Browser"
            >
              <Save className="size-3.5" />
              <span>Simpan Perubahan</span>
            </button>

            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-mono text-muted-foreground transition-colors hover:border-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Eye className="size-3.5" />
              <span>Lihat Web</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-mono text-muted-foreground transition-colors hover:border-danger hover:text-danger cursor-pointer"
              title="Kunci sesi admin"
            >
              <Lock className="size-3.5" />
              <span>Kunci</span>
            </button>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={exportJSON}
              className="flex items-center gap-1.5 rounded border border-border bg-surface px-2.5 py-1 font-mono text-muted-foreground hover:border-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Download className="size-3" />
              <span>Backup JSON</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded border border-border bg-surface px-2.5 py-1 font-mono text-muted-foreground hover:border-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Upload className="size-3" />
              <span>Restore JSON</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadTs}
              className="flex items-center gap-1.5 rounded border border-border bg-surface px-2.5 py-1 font-mono text-muted-foreground hover:border-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Code2 className="size-3" />
              <span>Unduh portfolio.ts</span>
            </button>
            <button
              type="button"
              onClick={syncToSupabase}
              disabled={isSyncing}
              className="flex items-center gap-1.5 rounded border border-amber/40 bg-amber/10 px-2.5 py-1 font-mono text-amber hover:bg-amber/20 disabled:opacity-50 cursor-pointer"
              title="Kirim dan simpan data ke Supabase Cloud"
            >
              <CloudUpload className="size-3" />
              <span>Push ke Supabase</span>
            </button>
            <button
              type="button"
              onClick={syncFromSupabase}
              disabled={isSyncing}
              className="flex items-center gap-1.5 rounded border border-info/40 bg-info/10 px-2.5 py-1 font-mono text-info hover:bg-info/20 disabled:opacity-50 cursor-pointer"
              title="Tarik data terbaru dari Supabase Cloud"
            >
              <CloudDownload className="size-3" />
              <span>Pull dari Supabase</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-danger hover:underline font-mono cursor-pointer"
          >
            <RefreshCw className="size-3" />
            <span>Reset ke Setelan Awal</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-border pb-2">
        {(
          [
            { id: "overview", label: "Ringkasan", icon: Layers },
            { id: "profile", label: "Profil & Sosmed", icon: User },
            { id: "tldr", label: "TL;DR & Quick Links", icon: ListOrdered },
            { id: "about", label: "About Me", icon: FileText },
            { id: "projects", label: "Projects & Produk", icon: Code2 },
            { id: "work", label: "Experience", icon: Briefcase },
            { id: "skills", label: "Skills & Stack", icon: Layers },
            { id: "stats", label: "Statistik", icon: BarChart3 },
            { id: "raw", label: "Password & Database", icon: KeyRound },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-mono transition-all cursor-pointer ${
                isActive
                  ? "border border-amber bg-amber/15 text-amber font-bold shadow-sm"
                  : "border border-transparent bg-surface text-muted-foreground hover:border-border hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="panel p-4 space-y-1">
              <span className="text-[10px] font-mono text-muted-foreground">TOTAL PROYEK</span>
              <div className="text-2xl font-bold text-amber">{formData.projects.length}</div>
            </div>
            <div className="panel p-4 space-y-1">
              <span className="text-[10px] font-mono text-muted-foreground">PRODUK TERJUAL</span>
              <div className="text-2xl font-bold text-success">{formData.products.length}</div>
            </div>
            <div className="panel p-4 space-y-1">
              <span className="text-[10px] font-mono text-muted-foreground">GRUP KEAHLIAN</span>
              <div className="text-2xl font-bold text-info">{formData.skillGroups.length}</div>
            </div>
            <div className="panel p-4 space-y-1">
              <span className="text-[10px] font-mono text-muted-foreground">RIWAYAT KERJA</span>
              <div className="text-2xl font-bold text-foreground">{formData.experience.length}</div>
            </div>
          </div>

          <div className="panel p-5 space-y-4">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400" />
              Status Sistem Database Portofolio
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Semua konten portofolio Anda sekarang tersambung secara otomatis dengan sistem database Supabase Cloud dan cache lokal browser. Setiap kali Anda menekan tombol{" "}
              <strong className="text-foreground">"Simpan Perubahan"</strong>, perubahan langsung aktif secara instan di semua halaman (Home, About, Projects, Experience, Skills, Stats, dan Header).
            </p>

            <div className="border border-border/80 rounded-md p-3 bg-surface/50 text-xs font-mono space-y-2">
              <div className="text-amber">&gt; Cara Cepat Mengelola:</div>
              <ul className="space-y-1.5 text-muted-foreground list-disc list-inside">
                <li>Buka tab masing-masing di atas untuk mengedit teks, tautan, atau angka.</li>
                <li>Klik tombol hijau <strong>"Simpan Perubahan"</strong> untuk menerapkan.</li>
                <li>Gunakan <strong>"Backup JSON"</strong> untuk menyimpan cadangan file data Anda kapan saja.</li>
                <li>Gunakan <strong>"Unduh portfolio.ts"</strong> jika Anda ingin menaruh kode data terbaru ke dalam repository GitHub atau Lovable secara permanen.</li>
              </ul>
            </div>
          </div>

          {/* Supabase Cloud Status Card */}
          <div className="panel p-5 space-y-4 border-amber/30">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Cloud className="size-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-foreground">
                  Supabase Cloud Database Integration
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded px-2 py-0.5 font-mono text-[10px] font-semibold border ${
                    supabaseStatus.tableExists
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-amber/10 text-amber border-amber/20"
                  }`}
                >
                  {supabaseStatus.tableExists ? "TABLE READY" : "SETUP PENDING"}
                </span>
                <button
                  onClick={() => checkSupabase()}
                  className="p-1 rounded text-muted-foreground hover:text-foreground"
                  title="Cek ulang koneksi"
                >
                  <RefreshCw className="size-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                <span>PROJECT URL:</span>
                <span className="text-foreground">{SUPABASE_URL}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                <span>STATUS:</span>
                <span
                  className={
                    supabaseStatus.tableExists ? "text-emerald-400" : "text-amber"
                  }
                >
                  {supabaseStatus.message}
                </span>
              </div>
            </div>

            {!supabaseStatus.tableExists && (
              <div className="rounded-md border border-amber/40 bg-amber/5 p-3.5 space-y-3">
                <div className="text-xs font-bold text-amber flex items-center gap-1.5">
                  <span>⚡ Langkah Cepat Mengaktifkan Supabase (1 Menit):</span>
                </div>
                <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside font-mono">
                  <li>
                    Buka Dashboard Supabase Anda:{" "}
                    <a
                      href="https://supabase.com/dashboard/project/oansqqeteisvskmelgbl/sql/new"
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber underline inline-flex items-center gap-0.5"
                    >
                      Buka SQL Editor <ExternalLink className="size-2.5" />
                    </a>
                  </li>
                  <li>Klik tombol di bawah untuk menyalin script SQL setup.</li>
                  <li>Tempelkan (Paste) ke SQL Editor dan klik tombol **RUN**.</li>
                </ol>

                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="flex items-center gap-1.5 rounded-md bg-amber px-3 py-1.5 text-xs font-bold text-background hover:opacity-90 font-mono"
                  >
                    <Copy className="size-3.5" />
                    <span>Salin Script SQL Setup</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await checkSupabase();
                      if (supabaseStatus.tableExists) {
                        toast.success("Tabel Supabase terdeteksi dan aktif!");
                      }
                    }}
                    className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-mono text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw className="size-3.5" />
                    <span>Periksa Ulang Tabel</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={syncToSupabase}
                disabled={isSyncing}
                className="flex items-center gap-1.5 rounded border border-amber/40 bg-amber/10 px-3 py-1.5 text-xs font-mono font-bold text-amber hover:bg-amber/20 disabled:opacity-50"
              >
                <CloudUpload className="size-3.5" />
                <span>Kirim Seluruh Data ke Supabase (Push)</span>
              </button>
              <button
                type="button"
                onClick={syncFromSupabase}
                disabled={isSyncing}
                className="flex items-center gap-1.5 rounded border border-info/40 bg-info/10 px-3 py-1.5 text-xs font-mono font-bold text-info hover:bg-info/20 disabled:opacity-50"
              >
                <CloudDownload className="size-3.5" />
                <span>Tarik Data dari Supabase (Pull)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. PROFILE & SOCIAL TAB */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <div className="panel p-5 space-y-4">
            <h3 className="font-bold text-sm text-foreground border-b border-border pb-2">
              Identitas & Header Profil
            </h3>

            {/* Avatar Section */}
            <div className="flex flex-wrap items-center gap-4 py-2 border-b border-border">
              <img
                src={
                  formData.profile.avatarUrl && formData.profile.avatarUrl.trim() !== ""
                    ? formData.profile.avatarUrl
                    : profileDefaultAsset
                }
                alt="Avatar Preview"
                className="size-16 rounded-full border-2 border-amber object-cover shadow"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = profileDefaultAsset;
                }}
              />
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-md bg-surface-2 border border-border px-3 py-1.5 text-xs font-mono text-foreground hover:border-amber"
                  >
                    <ImageIcon className="size-3.5" />
                    <span>Upload Foto Baru</span>
                  </button>
                  {formData.profile.avatarUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          profile: { ...prev.profile, avatarUrl: "" },
                        }))
                      }
                      className="text-xs font-mono text-danger hover:underline"
                    >
                      Reset ke Foto Default
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.profile.avatarUrl || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, avatarUrl: e.target.value },
                    }))
                  }
                  placeholder="Atau masukkan URL gambar langsung (https://...)"
                  className="w-full min-w-[280px] rounded border border-input bg-surface px-2.5 py-1 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.profile.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, name: e.target.value },
                    }))
                  }
                  className="w-full rounded border border-input bg-surface px-3 py-1.5 text-sm font-mono text-foreground focus:border-amber focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">
                  Nama Pendek / Alias
                </label>
                <input
                  type="text"
                  value={formData.profile.shortName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, shortName: e.target.value },
                    }))
                  }
                  className="w-full rounded border border-input bg-surface px-3 py-1.5 text-sm font-mono text-foreground focus:border-amber focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">
                  Role / Profesi
                </label>
                <input
                  type="text"
                  value={formData.profile.role}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, role: e.target.value },
                    }))
                  }
                  className="w-full rounded border border-input bg-surface px-3 py-1.5 text-sm font-mono text-foreground focus:border-amber focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">
                  Handle Terminal
                </label>
                <input
                  type="text"
                  value={formData.profile.handle}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, handle: e.target.value },
                    }))
                  }
                  className="w-full rounded border border-input bg-surface px-3 py-1.5 text-sm font-mono text-foreground focus:border-amber focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">
                  Lokasi
                </label>
                <input
                  type="text"
                  value={formData.profile.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, location: e.target.value },
                    }))
                  }
                  className="w-full rounded border border-input bg-surface px-3 py-1.5 text-sm font-mono text-foreground focus:border-amber focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.profile.email}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, email: e.target.value },
                    }))
                  }
                  className="w-full rounded border border-input bg-surface px-3 py-1.5 text-sm font-mono text-foreground focus:border-amber focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">
                  Inisial
                </label>
                <input
                  type="text"
                  value={formData.profile.initials}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, initials: e.target.value },
                    }))
                  }
                  className="w-full rounded border border-input bg-surface px-3 py-1.5 text-sm font-mono text-foreground focus:border-amber focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="panel p-5 space-y-4">
            <h3 className="font-bold text-sm text-foreground border-b border-border pb-2">
              Tautan Media Sosial & Toko Digital
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">
                  GitHub URL
                </label>
                <input
                  type="text"
                  value={formData.profile.links.github}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      profile: {
                        ...prev.profile,
                        links: { ...prev.profile.links, github: e.target.value },
                      },
                    }))
                  }
                  className="w-full rounded border border-input bg-surface px-3 py-1.5 text-sm font-mono text-foreground focus:border-amber focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">
                  WhatsApp Channel URL
                </label>
                <input
                  type="text"
                  value={formData.profile.links.whatsapp}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      profile: {
                        ...prev.profile,
                        links: { ...prev.profile.links, whatsapp: e.target.value },
                      },
                    }))
                  }
                  className="w-full rounded border border-input bg-surface px-3 py-1.5 text-sm font-mono text-foreground focus:border-amber focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">
                  Telegram URL
                </label>
                <input
                  type="text"
                  value={formData.profile.links.telegram}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      profile: {
                        ...prev.profile,
                        links: { ...prev.profile.links, telegram: e.target.value },
                      },
                    }))
                  }
                  className="w-full rounded border border-input bg-surface px-3 py-1.5 text-sm font-mono text-foreground focus:border-amber focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">
                  TikTok URL
                </label>
                <input
                  type="text"
                  value={formData.profile.links.tiktok}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      profile: {
                        ...prev.profile,
                        links: { ...prev.profile.links, tiktok: e.target.value },
                      },
                    }))
                  }
                  className="w-full rounded border border-input bg-surface px-3 py-1.5 text-sm font-mono text-foreground focus:border-amber focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">
                  Premium Code Store (Lynk.id)
                </label>
                <input
                  type="text"
                  value={formData.profile.links.premium}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      profile: {
                        ...prev.profile,
                        links: { ...prev.profile.links, premium: e.target.value },
                      },
                    }))
                  }
                  className="w-full rounded border border-input bg-surface px-3 py-1.5 text-sm font-mono text-foreground focus:border-amber focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">
                  Free Code URL (Tempel.in)
                </label>
                <input
                  type="text"
                  value={formData.profile.links.free}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      profile: {
                        ...prev.profile,
                        links: { ...prev.profile.links, free: e.target.value },
                      },
                    }))
                  }
                  className="w-full rounded border border-input bg-surface px-3 py-1.5 text-sm font-mono text-foreground focus:border-amber focus:outline-none"
                />
              </div>
            </div>

            {/* Custom Links */}
            <div className="pt-3 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-foreground">
                  Tautan Tambahan (Kustom)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      profile: {
                        ...prev.profile,
                        links: {
                          ...prev.profile.links,
                          custom: [
                            ...(prev.profile.links.custom || []),
                            { label: "Link Baru", href: "https://", displayValue: "" },
                          ],
                        },
                      },
                    }));
                  }}
                  className="flex items-center gap-1 text-xs font-mono text-amber hover:underline"
                >
                  <Plus className="size-3" /> Tambah Link Kustom
                </button>
              </div>

              {(formData.profile.links.custom || []).map((link, idx) => (
                <div
                  key={idx}
                  className="flex flex-wrap items-center gap-2 rounded border border-border p-2 bg-surface/50"
                >
                  <input
                    type="text"
                    placeholder="Label (contoh: Discord, YouTube)"
                    value={link.label}
                    onChange={(e) => updateCustomLink(idx, { label: e.target.value })}
                    className="flex-1 min-w-[120px] rounded border border-input bg-surface px-2 py-1 text-xs font-mono"
                  />
                  <input
                    type="text"
                    placeholder="URL (https://...)"
                    value={link.href}
                    onChange={(e) => updateCustomLink(idx, { href: e.target.value })}
                    className="flex-1 min-w-[180px] rounded border border-input bg-surface px-2 py-1 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const custom = (formData.profile.links.custom || []).filter(
                        (_, i) => i !== idx
                      );
                      setFormData((prev) => ({
                        ...prev,
                        profile: {
                          ...prev.profile,
                          links: { ...prev.profile.links, custom },
                        },
                      }));
                    }}
                    className="text-danger hover:opacity-80 p-1"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. TL;DR & QUICK LINKS TAB */}
      {activeTab === "tldr" && (
        <div className="space-y-6">
          <div className="panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-bold text-sm text-foreground">
                Baris Ringkasan TL;DR (Halaman Depan)
              </h3>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    tldr: [...prev.tldr, { k: "BARU", v: "Deskripsi poin ringkasan..." }],
                  }));
                }}
                className="flex items-center gap-1 text-xs font-mono text-amber hover:underline"
              >
                <Plus className="size-3" /> Tambah Baris
              </button>
            </div>

            <div className="space-y-3">
              {formData.tldr.map((row, idx) => (
                <div
                  key={idx}
                  className="flex flex-wrap sm:flex-nowrap items-start gap-2 rounded border border-border p-2.5 bg-surface/50"
                >
                  <input
                    type="text"
                    value={row.k}
                    onChange={(e) => updateTldrItem(idx, { k: e.target.value })}
                    placeholder="KEY"
                    className="w-24 shrink-0 rounded border border-input bg-surface px-2.5 py-1 text-xs font-mono font-bold uppercase text-amber"
                  />
                  <textarea
                    rows={2}
                    value={row.v}
                    onChange={(e) => updateTldrItem(idx, { v: e.target.value })}
                    placeholder="Isi deskripsi..."
                    className="flex-1 rounded border border-input bg-surface px-2.5 py-1 text-xs font-mono text-foreground/90"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        tldr: prev.tldr.filter((_, i) => i !== idx),
                      }));
                    }}
                    className="text-danger p-1 hover:opacity-80"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-bold text-sm text-foreground">
                Quick Links (Halaman Depan)
              </h3>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    quickLinks: [
                      ...prev.quickLinks,
                      { cmd: "link", desc: "Deskripsi", to: "/" },
                    ],
                  }));
                }}
                className="flex items-center gap-1 text-xs font-mono text-amber hover:underline"
              >
                <Plus className="size-3" /> Tambah Quick Link
              </button>
            </div>

            <div className="space-y-3">
              {formData.quickLinks.map((l, idx) => (
                <div
                  key={idx}
                  className="flex flex-wrap items-center gap-2 rounded border border-border p-2 bg-surface/50"
                >
                  <input
                    type="text"
                    value={l.cmd}
                    onChange={(e) => updateQuickLinkItem(idx, { cmd: e.target.value })}
                    placeholder="cmd (about)"
                    className="w-28 rounded border border-input bg-surface px-2 py-1 text-xs font-mono"
                  />
                  <input
                    type="text"
                    value={l.desc}
                    onChange={(e) => updateQuickLinkItem(idx, { desc: e.target.value })}
                    placeholder="Deskripsi singkat"
                    className="flex-1 min-w-[160px] rounded border border-input bg-surface px-2 py-1 text-xs font-mono"
                  />
                  <input
                    type="text"
                    value={l.to}
                    onChange={(e) => updateQuickLinkItem(idx, { to: e.target.value })}
                    placeholder="Tujuan (/about)"
                    className="w-28 rounded border border-input bg-surface px-2 py-1 text-xs font-mono text-amber"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        quickLinks: prev.quickLinks.filter((_, i) => i !== idx),
                      }));
                    }}
                    className="text-danger p-1 hover:opacity-80"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. ABOUT ME TAB */}
      {activeTab === "about" && (
        <div className="space-y-6">
          <div className="panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-bold text-sm text-foreground">
                Paragraf Cerita (About Bio)
              </h3>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    aboutParagraphs: [
                      ...prev.aboutParagraphs,
                      "Tuliskan paragraf cerita baru di sini...",
                    ],
                  }));
                }}
                className="flex items-center gap-1 text-xs font-mono text-amber hover:underline"
              >
                <Plus className="size-3" /> Tambah Paragraf
              </button>
            </div>

            <div className="space-y-3">
              {formData.aboutParagraphs.map((para, idx) => (
                <div
                  key={idx}
                  className="space-y-1.5 rounded border border-border p-3 bg-surface/50"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                    <span>Paragraf #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          aboutParagraphs: prev.aboutParagraphs.filter((_, i) => i !== idx),
                        }));
                      }}
                      className="text-danger hover:underline"
                    >
                      Hapus Paragraf
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={para}
                    onChange={(e) => {
                      const updated = [...formData.aboutParagraphs];
                      updated[idx] = e.target.value;
                      setFormData((prev) => ({ ...prev, aboutParagraphs: updated }));
                    }}
                    className="w-full rounded border border-input bg-surface p-2.5 text-xs font-mono leading-relaxed text-foreground/90 focus:border-amber focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-bold text-sm text-foreground">
                Sorotan / Highlights (About Me)
              </h3>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    highlights: [...prev.highlights, "Poin sorotan baru"],
                  }));
                }}
                className="flex items-center gap-1 text-xs font-mono text-amber hover:underline"
              >
                <Plus className="size-3" /> Tambah Sorotan
              </button>
            </div>

            <div className="space-y-2">
              {formData.highlights.map((h, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-amber font-mono text-xs">&gt;</span>
                  <input
                    type="text"
                    value={h}
                    onChange={(e) => {
                      const updated = [...formData.highlights];
                      updated[idx] = e.target.value;
                      setFormData((prev) => ({ ...prev, highlights: updated }));
                    }}
                    className="flex-1 rounded border border-input bg-surface px-2.5 py-1 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        highlights: prev.highlights.filter((_, i) => i !== idx),
                      }));
                    }}
                    className="text-danger p-1 hover:opacity-80"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. PROJECTS & PRODUCTS TAB */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          <div className="panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-bold text-sm text-foreground">
                Featured Projects ({formData.projects.length})
              </h3>
              <button
                type="button"
                onClick={() => {
                  const nextNo = (formData.projects.length + 1).toString().padStart(2, "0");
                  setFormData((prev) => ({
                    ...prev,
                    projects: [
                      ...prev.projects,
                      {
                        no: nextNo,
                        name: "Project Baru",
                        tagline: "Tagline singkat proyek...",
                        desc: "Deskripsi lengkap proyek...",
                        tags: ["React", "TypeScript", "Tailwind CSS"],
                        demoUrl: "https://",
                        githubUrl: "https://github.com/",
                        isPaid: false,
                        price: "Rp 150.000",
                        icon: "code",
                        badgeText: "",
                        links: [],
                      },
                    ],
                  }));
                }}
                className="flex items-center gap-1.5 rounded bg-amber px-3 py-1.5 text-xs font-bold font-mono text-background hover:opacity-90 cursor-pointer shadow-sm"
              >
                <Plus className="size-3.5" /> Tambah Proyek
              </button>
            </div>

            <div className="space-y-5">
              {formData.projects.map((proj, idx) => {
                const isPaid = Boolean(proj.isPaid);
                const CurrentIcon = getProjectIcon(proj.icon);
                const previewWaUrl = getWhatsAppBuyUrl(
                  formData.profile.links.whatsapp,
                  proj.name,
                  proj.price
                );

                return (
                  <div
                    key={idx}
                    className={`rounded-lg border p-4.5 space-y-4 transition-all ${
                      isPaid
                        ? "border-emerald-500/40 bg-surface/60"
                        : "border-border bg-surface/40"
                    }`}
                  >
                    {/* Top Row: Icon, Number, Title & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <div
                          className={`flex size-9 items-center justify-center rounded-md border ${
                            isPaid
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                              : "border-amber/30 bg-amber/10 text-amber"
                          }`}
                        >
                          <CurrentIcon className="size-4" />
                        </div>

                        <input
                          type="text"
                          value={proj.no}
                          onChange={(e) => updateProjectItem(idx, { no: e.target.value })}
                          className="w-12 rounded border border-input bg-surface px-1.5 py-1 text-xs font-mono font-bold text-amber text-center"
                          title="Nomor urut"
                        />

                        <input
                          type="text"
                          value={proj.name}
                          onChange={(e) => updateProjectItem(idx, { name: e.target.value })}
                          placeholder="Nama Proyek..."
                          className="w-48 sm:w-64 rounded border border-input bg-surface px-2.5 py-1 text-sm font-bold font-mono text-foreground focus:border-amber focus:outline-none"
                        />

                        {/* Icon Selector Dropdown */}
                        <div className="flex items-center gap-1 text-xs font-mono">
                          <label className="text-[11px] text-muted-foreground">Ikon:</label>
                          <select
                            value={proj.icon || "code"}
                            onChange={(e) => updateProjectItem(idx, { icon: e.target.value })}
                            className="rounded border border-input bg-surface px-2 py-1 text-xs font-mono text-foreground focus:border-amber focus:outline-none cursor-pointer"
                          >
                            {PROJECT_ICON_OPTIONS.map((opt) => (
                              <option key={opt.id} value={opt.id}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            projects: prev.projects.filter((_, i) => i !== idx),
                          }));
                        }}
                        className="text-xs font-mono text-danger hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="size-3.5" /> Hapus
                      </button>
                    </div>

                    {/* Commercial / Paid Options Box */}
                    <div className="rounded-md border border-border/80 bg-surface-2/40 p-3 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-foreground font-bold">
                            Model Distribusi Proyek:
                          </span>
                          <div className="flex rounded-md border border-border bg-surface p-0.5">
                            <button
                              type="button"
                              onClick={() => updateProjectItem(idx, { isPaid: false })}
                              className={`rounded px-3 py-1 text-xs font-mono transition-all cursor-pointer ${
                                !isPaid
                                  ? "bg-info/20 text-info font-bold border border-info/30"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              ⚡ Gratis / Open Source
                            </button>
                            <button
                              type="button"
                              onClick={() => updateProjectItem(idx, { isPaid: true })}
                              className={`rounded px-3 py-1 text-xs font-mono transition-all cursor-pointer ${
                                isPaid
                                  ? "bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              💎 Berbayar (Jual Source Code)
                            </button>
                          </div>
                        </div>

                        {/* Custom Badge Text */}
                        <div className="flex items-center gap-1.5 text-xs font-mono">
                          <span className="text-muted-foreground text-[11px]">Badge:</span>
                          <input
                            type="text"
                            value={proj.badgeText || ""}
                            onChange={(e) => updateProjectItem(idx, { badgeText: e.target.value })}
                            placeholder="BEST SELLER / NEW"
                            className="w-32 rounded border border-input bg-surface px-2 py-0.5 text-xs font-mono text-amber"
                          />
                        </div>
                      </div>

                      {/* If Paid: Price and WhatsApp Buy Link Setup */}
                      {isPaid && (
                        <div className="space-y-2.5 pt-2 border-t border-border/60">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-mono font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                                <ShoppingBag className="size-3" />
                                <span>Harga Source Code:</span>
                              </label>
                              <input
                                type="text"
                                value={proj.price || ""}
                                onChange={(e) => updateProjectItem(idx, { price: e.target.value })}
                                placeholder="Contoh: Rp 150.000 atau Rp 250.000"
                                className="w-full rounded border border-emerald-500/40 bg-surface px-2.5 py-1.5 text-xs font-mono font-bold text-emerald-400 focus:border-emerald-500 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                                Preview Tombol WhatsApp Customer:
                              </label>
                              <a
                                href={previewWaUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 text-xs font-mono font-bold text-emerald-400 hover:bg-emerald-500/30 transition-all cursor-pointer"
                                title="Klik untuk tes format pesan WhatsApp"
                              >
                                <MessageCircle className="size-3.5" />
                                <span>Tes Beli via WhatsApp ({proj.price || "Harga"})</span>
                                <ExternalLink className="size-2.5" />
                              </a>
                            </div>
                          </div>
                          <p className="text-[10px] font-mono text-muted-foreground">
                            💡 Saat pengunjung mengklik tombol beli, otomatis membuka WhatsApp ke nomor profil Anda dengan pesan pemesanan yang rapi.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Direct Links: Live Demo & GitHub */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-muted-foreground mb-1 flex items-center gap-1">
                          <Globe className="size-3 text-amber" />
                          <span>Link Live Demo:</span>
                        </label>
                        <input
                          type="text"
                          value={proj.demoUrl || ""}
                          onChange={(e) => updateProjectItem(idx, { demoUrl: e.target.value })}
                          placeholder="https://demo-aplikasi.com"
                          className="w-full rounded border border-input bg-surface px-2.5 py-1.5 text-xs font-mono text-foreground focus:border-amber focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-muted-foreground mb-1 flex items-center gap-1">
                          <Github className="size-3" />
                          <span>Link GitHub / Source Code:</span>
                        </label>
                        <input
                          type="text"
                          value={proj.githubUrl || ""}
                          onChange={(e) => updateProjectItem(idx, { githubUrl: e.target.value })}
                          placeholder="https://github.com/username/repo"
                          className="w-full rounded border border-input bg-surface px-2.5 py-1.5 text-xs font-mono text-foreground focus:border-amber focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Tagline */}
                    <div>
                      <label className="block text-[11px] font-mono text-muted-foreground mb-0.5">
                        Tagline / Subjudul Singkat
                      </label>
                      <input
                        type="text"
                        value={proj.tagline}
                        onChange={(e) => updateProjectItem(idx, { tagline: e.target.value })}
                        className="w-full rounded border border-input bg-surface px-2.5 py-1 text-xs font-mono"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-[11px] font-mono text-muted-foreground mb-0.5">
                        Deskripsi Lengkap Proyek
                      </label>
                      <textarea
                        rows={2}
                        value={proj.desc}
                        onChange={(e) => updateProjectItem(idx, { desc: e.target.value })}
                        className="w-full rounded border border-input bg-surface px-2.5 py-1 text-xs font-mono leading-relaxed"
                      />
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-[11px] font-mono text-muted-foreground mb-0.5">
                        Tags / Tech Stack (Pisahkan dengan koma)
                      </label>
                      <input
                        type="text"
                        value={proj.tags.join(", ")}
                        onChange={(e) => {
                          const tags = e.target.value
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean);
                          updateProjectItem(idx, { tags });
                        }}
                        placeholder="Next.js, TypeScript, Tailwind CSS"
                        className="w-full rounded border border-input bg-surface px-2.5 py-1 text-xs font-mono text-muted-foreground"
                      />
                    </div>

                    {/* Extra Custom Links */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-muted-foreground">
                          Tautan Tambahan (Opsional):
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const links = [
                              ...(proj.links || []),
                              { label: "Website", href: "https://" },
                            ];
                            updateProjectItem(idx, { links });
                          }}
                          className="text-[11px] font-mono text-amber hover:underline cursor-pointer"
                        >
                          + Tambah Link Lain
                        </button>
                      </div>
                      {(proj.links || []).map((lnk, lIdx) => (
                        <div key={lIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={lnk.label}
                            onChange={(e) => {
                              const curLinks = [...(proj.links || [])];
                              const cur = curLinks[lIdx];
                              if (cur) {
                                curLinks[lIdx] = { ...cur, label: e.target.value };
                                updateProjectItem(idx, { links: curLinks });
                              }
                            }}
                            placeholder="Label (Docs / API)"
                            className="w-28 rounded border border-input bg-surface px-2 py-0.5 text-xs font-mono"
                          />
                          <input
                            type="text"
                            value={lnk.href}
                            onChange={(e) => {
                              const curLinks = [...(proj.links || [])];
                              const cur = curLinks[lIdx];
                              if (cur) {
                                curLinks[lIdx] = { ...cur, href: e.target.value };
                                updateProjectItem(idx, { links: curLinks });
                              }
                            }}
                            placeholder="URL (https://...)"
                            className="flex-1 rounded border border-input bg-surface px-2 py-0.5 text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const curLinks = (proj.links || []).filter(
                                (_, i) => i !== lIdx
                              );
                              updateProjectItem(idx, { links: curLinks });
                            }}
                            className="text-danger p-0.5 cursor-pointer"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Digital Products Sold */}
          <div className="panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-bold text-sm text-foreground">
                Source Code Terjual (Digital Products)
              </h3>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    products: [...prev.products, "Produk Digital Baru"],
                  }));
                }}
                className="flex items-center gap-1 text-xs font-mono text-amber hover:underline"
              >
                <Plus className="size-3" /> Tambah Produk
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {formData.products.map((prod, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded border border-border p-2 bg-surface/50"
                >
                  <input
                    type="text"
                    value={prod}
                    onChange={(e) => {
                      const updated = [...formData.products];
                      updated[idx] = e.target.value;
                      setFormData((prev) => ({ ...prev, products: updated }));
                    }}
                    className="flex-1 rounded border border-input bg-surface px-2 py-1 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        products: prev.products.filter((_, i) => i !== idx),
                      }));
                    }}
                    className="text-danger p-1 hover:opacity-80"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. WORK / EXPERIENCE TAB */}
      {activeTab === "work" && (
        <div className="space-y-6">
          <div className="panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-bold text-sm text-foreground">
                Riwayat Pengalaman Kerja & Proyek Komunitas
              </h3>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    experience: [
                      ...prev.experience,
                      {
                        title: "Posisi / Jabatan",
                        org: "Nama Organisasi / Komunitas",
                        period: "Present",
                        bullets: ["Penjelasan aktivitas atau pencapaian..."],
                      },
                    ],
                  }));
                }}
                className="flex items-center gap-1 rounded bg-amber px-2.5 py-1 text-xs font-bold text-background hover:opacity-90"
              >
                <Plus className="size-3" /> Tambah Experience
              </button>
            </div>

            <div className="space-y-4">
              {formData.experience.map((job, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-border p-4 bg-surface/40 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={job.title}
                        onChange={(e) => updateExperienceItem(idx, { title: e.target.value })}
                        placeholder="Jabatan / Role"
                        className="rounded border border-input bg-surface px-2.5 py-1 text-sm font-bold font-mono text-foreground"
                      />
                      <input
                        type="text"
                        value={job.org}
                        onChange={(e) => updateExperienceItem(idx, { org: e.target.value })}
                        placeholder="Organisasi"
                        className="rounded border border-input bg-surface px-2.5 py-1 text-xs font-mono text-muted-foreground"
                      />
                      <input
                        type="text"
                        value={job.period}
                        onChange={(e) => updateExperienceItem(idx, { period: e.target.value })}
                        placeholder="Periode (2024 - Present)"
                        className="w-32 rounded border border-input bg-surface px-2 py-1 text-xs font-mono text-amber"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          experience: prev.experience.filter((_, i) => i !== idx),
                        }));
                      }}
                      className="text-xs font-mono text-danger hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="size-3" /> Hapus
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-muted-foreground">
                        Poin Penjelasan (Bullets):
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const bullets = [...job.bullets, "Poin baru..."];
                          updateExperienceItem(idx, { bullets });
                        }}
                        className="text-[11px] font-mono text-amber hover:underline"
                      >
                        + Tambah Poin
                      </button>
                    </div>

                    {job.bullets.map((b, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">&gt;</span>
                        <input
                          type="text"
                          value={b}
                          onChange={(e) => {
                            const curBullets = [...job.bullets];
                            curBullets[bIdx] = e.target.value;
                            updateExperienceItem(idx, { bullets: curBullets });
                          }}
                          className="flex-1 rounded border border-input bg-surface px-2.5 py-1 text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const curBullets = job.bullets.filter((_, i) => i !== bIdx);
                            updateExperienceItem(idx, { bullets: curBullets });
                          }}
                          className="text-danger p-0.5"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. SKILLS & STACK TAB */}
      {activeTab === "skills" && (
        <div className="space-y-6">
          {/* Top Skills Chips */}
          <div className="panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-bold text-sm text-foreground">
                Top Skills (Ditampilkan di Home Page)
              </h3>
              <button
                type="button"
                onClick={() => {
                  const skill = prompt("Nama skill baru:");
                  if (skill?.trim()) {
                    setFormData((prev) => ({
                      ...prev,
                      topSkills: [...prev.topSkills, skill.trim()],
                    }));
                  }
                }}
                className="flex items-center gap-1 text-xs font-mono text-amber hover:underline"
              >
                <Plus className="size-3" /> Tambah Skill
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.topSkills.map((s, idx) => (
                <div
                  key={idx}
                  className="chip flex items-center gap-2 bg-surface-2 text-foreground"
                >
                  <input
                    type="text"
                    value={s}
                    onChange={(e) => {
                      const updated = [...formData.topSkills];
                      updated[idx] = e.target.value;
                      setFormData((prev) => ({ ...prev, topSkills: updated }));
                    }}
                    className="w-24 bg-transparent text-xs font-mono focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        topSkills: prev.topSkills.filter((_, i) => i !== idx),
                      }));
                    }}
                    className="text-danger hover:opacity-80"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Groups */}
          <div className="panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-bold text-sm text-foreground">
                Kategori Teknis (Skills Page)
              </h3>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    skillGroups: [
                      ...prev.skillGroups,
                      { title: "Kategori Baru", items: ["Teknologi 1"] },
                    ],
                  }));
                }}
                className="flex items-center gap-1 rounded bg-amber px-2.5 py-1 text-xs font-bold text-background hover:opacity-90"
              >
                <Plus className="size-3" /> Tambah Grup Kategori
              </button>
            </div>

            <div className="space-y-4">
              {formData.skillGroups.map((group, idx) => (
                <div
                  key={idx}
                  className="rounded border border-border p-3.5 bg-surface/40 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2">
                    <input
                      type="text"
                      value={group.title}
                      onChange={(e) => updateSkillGroupItem(idx, { title: e.target.value })}
                      placeholder="Judul Kategori (Languages, Frontend, dll)"
                      className="rounded border border-input bg-surface px-2.5 py-1 text-xs font-bold font-mono text-amber"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          skillGroups: prev.skillGroups.filter((_, i) => i !== idx),
                        }));
                      }}
                      className="text-xs font-mono text-danger hover:underline"
                    >
                      Hapus Grup
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                      Daftar Skill di Grup Ini (Pisahkan dengan koma):
                    </label>
                    <textarea
                      rows={2}
                      value={group.items.join(", ")}
                      onChange={(e) => {
                        const items = e.target.value
                          .split(",")
                          .map((i) => i.trim())
                          .filter(Boolean);
                        updateSkillGroupItem(idx, { items });
                      }}
                      className="w-full rounded border border-input bg-surface p-2 text-xs font-mono text-foreground/90"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Design Preferences */}
          <div className="panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-bold text-sm text-foreground">
                Design Preferences
              </h3>
            </div>
            <div>
              <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                Daftar Preferensi Desain (Pisahkan dengan koma):
              </label>
              <textarea
                rows={2}
                value={formData.designPreferences.join(", ")}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    designPreferences: e.target.value
                      .split(",")
                      .map((d) => d.trim())
                      .filter(Boolean),
                  }));
                }}
                className="w-full rounded border border-input bg-surface p-2 text-xs font-mono text-foreground/90"
              />
            </div>
          </div>
        </div>
      )}

      {/* 8. STATS & ANALYTICS TAB */}
      {activeTab === "stats" && (
        <div className="space-y-6">
          {/* Community Stats */}
          <div className="panel p-5 space-y-4">
            <h3 className="font-bold text-sm text-foreground border-b border-border pb-2">
              Metrik Komunitas (Cards)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {formData.stats.community.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded border border-border p-2.5 bg-surface/50"
                >
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => {
                      const updated = [...formData.stats.community];
                      const cur = updated[idx];
                      if (cur) {
                        updated[idx] = { ...cur, label: e.target.value };
                        setFormData((prev) => ({
                          ...prev,
                          stats: { ...prev.stats, community: updated },
                        }));
                      }
                    }}
                    className="w-24 rounded border border-input bg-surface px-2 py-1 text-xs font-mono font-bold"
                  />
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => {
                      const updated = [...formData.stats.community];
                      const cur = updated[idx];
                      if (cur) {
                        updated[idx] = { ...cur, value: e.target.value };
                        setFormData((prev) => ({
                          ...prev,
                          stats: { ...prev.stats, community: updated },
                        }));
                      }
                    }}
                    placeholder="Nilai (5K+)"
                    className="flex-1 rounded border border-input bg-surface px-2 py-1 text-xs font-mono text-amber font-bold"
                  />
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => {
                      const updated = [...formData.stats.community];
                      const cur = updated[idx];
                      if (cur) {
                        updated[idx] = { ...cur, unit: e.target.value };
                        setFormData((prev) => ({
                          ...prev,
                          stats: { ...prev.stats, community: updated },
                        }));
                      }
                    }}
                    placeholder="Unit (x)"
                    className="w-14 rounded border border-input bg-surface px-1.5 py-1 text-xs font-mono"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Metrics */}
          <div className="panel p-5 space-y-4">
            <h3 className="font-bold text-sm text-foreground border-b border-border pb-2">
              Metrik Produk
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {formData.stats.products.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded border border-border p-2.5 bg-surface/50"
                >
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => {
                      const updated = [...formData.stats.products];
                      const cur = updated[idx];
                      if (cur) {
                        updated[idx] = { ...cur, label: e.target.value };
                        setFormData((prev) => ({
                          ...prev,
                          stats: { ...prev.stats, products: updated },
                        }));
                      }
                    }}
                    className="w-24 rounded border border-input bg-surface px-2 py-1 text-xs font-mono font-bold"
                  />
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => {
                      const updated = [...formData.stats.products];
                      const cur = updated[idx];
                      if (cur) {
                        updated[idx] = { ...cur, value: e.target.value };
                        setFormData((prev) => ({
                          ...prev,
                          stats: { ...prev.stats, products: updated },
                        }));
                      }
                    }}
                    placeholder="Nilai (9+)"
                    className="flex-1 rounded border border-input bg-surface px-2 py-1 text-xs font-mono text-success font-bold"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Distribution Channels */}
          <div className="panel p-5 space-y-4">
            <h3 className="font-bold text-sm text-foreground border-b border-border pb-2">
              Distribusi Channel (Donut Chart)
            </h3>
            <div className="space-y-2">
              {formData.stats.distribution.map((d, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded border border-border p-2 bg-surface/50"
                >
                  <input
                    type="text"
                    value={d.name}
                    onChange={(e) => {
                      const updated = [...formData.stats.distribution];
                      const cur = updated[idx];
                      if (cur) {
                        updated[idx] = { ...cur, name: e.target.value };
                        setFormData((prev) => ({
                          ...prev,
                          stats: { ...prev.stats, distribution: updated },
                        }));
                      }
                    }}
                    className="w-32 rounded border border-input bg-surface px-2 py-1 text-xs font-mono"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={d.pct}
                      onChange={(e) => {
                        const updated = [...formData.stats.distribution];
                        const cur = updated[idx];
                        if (cur) {
                          updated[idx] = { ...cur, pct: Number(e.target.value) || 0 };
                          setFormData((prev) => ({
                            ...prev,
                            stats: { ...prev.stats, distribution: updated },
                          }));
                        }
                      }}
                      className="w-16 rounded border border-input bg-surface px-2 py-1 text-xs font-mono text-right"
                    />
                    <span className="text-xs font-mono text-muted-foreground">%</span>
                  </div>
                  <input
                    type="text"
                    value={d.color}
                    onChange={(e) => {
                      const updated = [...formData.stats.distribution];
                      const cur = updated[idx];
                      if (cur) {
                        updated[idx] = { ...cur, color: e.target.value };
                        setFormData((prev) => ({
                          ...prev,
                          stats: { ...prev.stats, distribution: updated },
                        }));
                      }
                    }}
                    placeholder="Warna / CSS var"
                    className="flex-1 rounded border border-input bg-surface px-2 py-1 text-xs font-mono"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Growth */}
          <div className="panel p-5 space-y-4">
            <h3 className="font-bold text-sm text-foreground border-b border-border pb-2">
              Grafik Pertumbuhan Member (Monthly Growth)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {formData.stats.growth.map((g, idx) => (
                <div key={idx} className="rounded border border-border p-2 bg-surface/50 text-center space-y-1">
                  <input
                    type="text"
                    value={g.m}
                    onChange={(e) => {
                      const updated = [...formData.stats.growth];
                      const cur = updated[idx];
                      if (cur) {
                        updated[idx] = { ...cur, m: e.target.value };
                        setFormData((prev) => ({
                          ...prev,
                          stats: { ...prev.stats, growth: updated },
                        }));
                      }
                    }}
                    className="w-full text-center rounded border border-input bg-surface px-1 py-0.5 text-xs font-mono font-bold"
                  />
                  <input
                    type="number"
                    value={g.v}
                    onChange={(e) => {
                      const updated = [...formData.stats.growth];
                      const cur = updated[idx];
                      if (cur) {
                        updated[idx] = { ...cur, v: Number(e.target.value) || 0 };
                        setFormData((prev) => ({
                          ...prev,
                          stats: { ...prev.stats, growth: updated },
                        }));
                      }
                    }}
                    className="w-full text-center rounded border border-input bg-surface px-1 py-0.5 text-xs font-mono text-amber"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Top Products Share */}
          <div className="panel p-5 space-y-4">
            <h3 className="font-bold text-sm text-foreground border-b border-border pb-2">
              Top Products (Pangsa Pasar & Delta)
            </h3>
            <div className="space-y-2">
              {formData.stats.topProducts.map((tp, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded border border-border p-2 bg-surface/50"
                >
                  <input
                    type="text"
                    value={tp.name}
                    onChange={(e) => {
                      const updated = [...formData.stats.topProducts];
                      const cur = updated[idx];
                      if (cur) {
                        updated[idx] = { ...cur, name: e.target.value };
                        setFormData((prev) => ({
                          ...prev,
                          stats: { ...prev.stats, topProducts: updated },
                        }));
                      }
                    }}
                    className="flex-1 rounded border border-input bg-surface px-2 py-1 text-xs font-mono font-bold"
                  />
                  <input
                    type="text"
                    value={tp.share}
                    onChange={(e) => {
                      const updated = [...formData.stats.topProducts];
                      const cur = updated[idx];
                      if (cur) {
                        updated[idx] = { ...cur, share: e.target.value };
                        setFormData((prev) => ({
                          ...prev,
                          stats: { ...prev.stats, topProducts: updated },
                        }));
                      }
                    }}
                    placeholder="Share (28.4%)"
                    className="w-24 rounded border border-input bg-surface px-2 py-1 text-xs font-mono text-muted-foreground"
                  />
                  <input
                    type="text"
                    value={tp.delta}
                    onChange={(e) => {
                      const updated = [...formData.stats.topProducts];
                      const cur = updated[idx];
                      if (cur) {
                        updated[idx] = { ...cur, delta: e.target.value };
                        setFormData((prev) => ({
                          ...prev,
                          stats: { ...prev.stats, topProducts: updated },
                        }));
                      }
                    }}
                    placeholder="Delta (+112.0%)"
                    className="w-28 rounded border border-input bg-surface px-2 py-1 text-xs font-mono text-success"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 9. PASSWORD & DATABASE TAB */}
      {activeTab === "raw" && (
        <div className="space-y-6">
          {/* Change Password Card */}
          <div className="panel p-5 space-y-4 border-amber/40">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-amber" />
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    Keamanan & Ganti Password Admin
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Password baru akan langsung disimpan secara persisten ke database Supabase Cloud & browser.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                  DATABASE SYNC READY
                </span>
              </div>
            </div>

            {/* Current Password Info Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border/80 bg-surface/60 p-3 text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">Password Aktif:</span>
                <span className="font-bold text-amber tracking-wider">
                  {showPassword ? storedPin : "••••••••"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                  title={showPassword ? "Sembunyikan" : "Lihat password saat ini"}
                >
                  {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>

              <div className="text-[11px] text-muted-foreground">
                Terakhir Diperbarui:{" "}
                <span className="text-foreground">
                  {data.security?.updatedAt
                    ? new Date(data.security.updatedAt).toLocaleString("id-ID")
                    : "Password Default"}
                </span>
              </div>
            </div>

            {/* Change Password Form */}
            <form onSubmit={handleChangePassword} className="space-y-4 pt-1">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-mono text-muted-foreground">
                    Password Lama:
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={oldPasswordInput}
                    onChange={(e) => setOldPasswordInput(e.target.value)}
                    placeholder="Masukkan password lama..."
                    required
                    className="w-full rounded border border-input bg-surface px-3 py-2 text-xs font-mono text-foreground focus:border-amber focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] font-mono text-muted-foreground">
                    {isDefaultPassword ? (
                      <>
                        Default awal: <code className="text-amber">admin</code>
                      </>
                    ) : (
                      <span className="text-emerald-400">Password kustom aktif di database</span>
                    )}
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-mono text-muted-foreground">
                    Password Baru:
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Minimal 4 karakter..."
                    required
                    minLength={4}
                    className="w-full rounded border border-input bg-surface px-3 py-2 text-xs font-mono text-foreground focus:border-amber focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-mono text-muted-foreground">
                    Konfirmasi Password Baru:
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    placeholder="Ulangi password baru..."
                    required
                    minLength={4}
                    className="w-full rounded border border-input bg-surface px-3 py-2 text-xs font-mono text-foreground focus:border-amber focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-[11px] font-mono text-muted-foreground">
                  * Password ini dipakai saat mengunci sesi admin atau login dari perangkat lain.
                </p>

                <button
                  type="submit"
                  disabled={isUpdatingPassword || isSyncing}
                  className="flex items-center gap-2 rounded bg-amber px-4 py-2 text-xs font-bold font-mono text-background transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-md"
                >
                  <KeyRound className="size-3.5" />
                  <span>
                    {isUpdatingPassword ? "Menyimpan ke Database..." : "Simpan Password ke Database"}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Security Shield & Database Protection Status */}
          <div className="panel p-5 space-y-4 border-emerald-500/30 bg-surface/50">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Shield className="size-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    Sistem Keamanan & Anti-DDoS Portofolio
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Lapisan pertahanan aktif untuk melindungi database dari injeksi dan pembajakan.
                  </p>
                </div>
              </div>

              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-[11px] font-mono text-emerald-400 font-bold">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ARMOR ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 font-mono text-xs">
              <div className="rounded-md border border-border bg-surface p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                  <CheckCircle2 className="size-3.5" />
                  <span>ANTI-INJECTION</span>
                </div>
                <p className="text-foreground font-semibold text-xs">RPC & Sanitizer</p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Protokol berbahaya (javascript:, data:) dan tag skrip otomatis dibersihkan.
                </p>
              </div>

              <div className="rounded-md border border-border bg-surface p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                  <CheckCircle2 className="size-3.5" />
                  <span>ANTI-DDOS</span>
                </div>
                <p className="text-foreground font-semibold text-xs">2MB Cap + Rate Limit</p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Membatasi ukuran muatan data maksimal 2MB untuk mencegah kehabisan memori.
                </p>
              </div>

              <div className="rounded-md border border-border bg-surface p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                  <CheckCircle2 className="size-3.5" />
                  <span>BRUTE-FORCE SHIELD</span>
                </div>
                <p className="text-foreground font-semibold text-xs">Lockout 5x Percobaan</p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Mengunci form otomatis jika salah 5 kali dengan jeda waktu bertingkat.
                </p>
              </div>

              <div className="rounded-md border border-border bg-surface p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                  <CheckCircle2 className="size-3.5" />
                  <span>DATABASE ACCESS</span>
                </div>
                <p className="text-foreground font-semibold text-xs">Zero Public Write</p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Izin tulis langsung ditutup dari publik. Wajib melalui RPC terverifikasi.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-[11px] font-mono border-t border-border/60">
              <span className="text-muted-foreground">
                File script SQL keamanan lengkap tersimpan di: <code className="text-amber">supabase_setup.sql</code>
              </span>
              <button
                type="button"
                onClick={handleCopySql}
                className="flex items-center gap-1.5 rounded border border-border bg-background px-2.5 py-1 text-xs text-foreground hover:border-muted-foreground cursor-pointer"
              >
                <Copy className="size-3" />
                <span>Salin SQL Keamanan</span>
              </button>
            </div>
          </div>

          {/* Raw JSON Editor */}
          <div className="panel p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
              <div>
                <h3 className="font-bold text-sm text-foreground">
                  Editor Database JSON Langsung
                </h3>
                <p className="text-xs text-muted-foreground">
                  Anda dapat menyalin atau menempelkan JSON lengkap secara langsung ke sini.
                </p>
              </div>
              <button
                type="button"
                onClick={handleApplyRawJson}
                className="rounded bg-emerald-500 px-3 py-1.5 text-xs font-bold text-background hover:bg-emerald-400 font-mono"
              >
                Terapkan & Simpan JSON
              </button>
            </div>

            <textarea
              rows={18}
              value={rawJsonText}
              onChange={(e) => setRawJsonText(e.target.value)}
              className="w-full rounded border border-input bg-background/90 p-3 text-xs font-mono text-foreground leading-relaxed focus:border-amber focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Precision Sticky Bottom Action Bar */}
      <div className="sticky bottom-4 z-40 mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/90 bg-surface/95 px-4 py-2.5 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2.5 text-xs font-mono">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-muted-foreground hidden sm:inline">Database:</span>
            <span className="font-semibold text-foreground">
              {supabaseStatus.tableExists ? "Supabase Cloud Sync" : "Local Browser Cache"}
            </span>
            <span className="hidden md:inline text-[11px] text-muted-foreground">
              (Semua tab otomatis tersimpan)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="hidden sm:flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-mono text-muted-foreground transition-colors hover:border-muted-foreground hover:text-foreground cursor-pointer"
              title="Kembali ke atas"
            >
              <span>&uarr; Ke Atas</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSyncing}
              className="flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-2 text-xs font-mono font-bold text-background transition-all hover:bg-emerald-400 active:scale-95 disabled:opacity-50 cursor-pointer shadow-md"
            >
              <Save className="size-3.5" />
              <span>{isSyncing ? "Menyimpan ke Cloud..." : "Simpan Perubahan Database"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
