import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  profile as defaultProfile,
  tldr as defaultTldr,
  topSkills as defaultTopSkills,
  quickLinks as defaultQuickLinks,
  aboutParagraphs as defaultAboutParagraphs,
  highlights as defaultHighlights,
  projects as defaultProjects,
  products as defaultProducts,
  experience as defaultExperience,
  skillGroups as defaultSkillGroups,
  designPreferences as defaultDesignPreferences,
  stats as defaultStats,
} from "@/data/portfolio";
import type {
  FullPortfolioData,
  Profile,
  TldrItem,
  QuickLinkItem,
  Project,
  Job,
  SkillGroup,
  Stats,
} from "@/types/portfolio";
import { toast } from "sonner";

const STORAGE_KEY = "sanndec5ty_portfolio_db_v1";
const SYNC_EVENT = "sanndec5ty_portfolio_sync";

export const initialPortfolioData: FullPortfolioData = {
  profile: {
    ...defaultProfile,
    avatarUrl: "",
    links: {
      ...defaultProfile.links,
      custom: [],
    },
  },
  tldr: defaultTldr.map((item) => ({ ...item })),
  topSkills: [...defaultTopSkills],
  quickLinks: defaultQuickLinks.map((item) => ({ ...item })),
  aboutParagraphs: [...defaultAboutParagraphs],
  highlights: [...defaultHighlights],
  projects: defaultProjects.map((p) => ({
    ...p,
    tags: [...p.tags],
    links: p.links ? [...p.links] : [],
  })),
  products: [...defaultProducts],
  experience: defaultExperience.map((exp) => ({
    ...exp,
    bullets: [...exp.bullets],
  })),
  skillGroups: defaultSkillGroups.map((group) => ({
    title: group.title,
    items: [...group.items],
  })),
  designPreferences: [...defaultDesignPreferences],
  stats: JSON.parse(JSON.stringify(defaultStats)),
  security: {
    adminPassword: "admin",
    updatedAt: new Date().toISOString(),
  },
};

function loadStoredData(): FullPortfolioData {
  if (typeof window === "undefined") {
    return initialPortfolioData;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialPortfolioData;
    const parsed = JSON.parse(raw);
    return {
      profile: { ...initialPortfolioData.profile, ...(parsed.profile || {}) },
      tldr: Array.isArray(parsed.tldr) ? parsed.tldr : initialPortfolioData.tldr,
      topSkills: Array.isArray(parsed.topSkills) ? parsed.topSkills : initialPortfolioData.topSkills,
      quickLinks: Array.isArray(parsed.quickLinks) ? parsed.quickLinks : initialPortfolioData.quickLinks,
      aboutParagraphs: Array.isArray(parsed.aboutParagraphs) ? parsed.aboutParagraphs : initialPortfolioData.aboutParagraphs,
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights : initialPortfolioData.highlights,
      projects: Array.isArray(parsed.projects) ? parsed.projects : initialPortfolioData.projects,
      products: Array.isArray(parsed.products) ? parsed.products : initialPortfolioData.products,
      experience: Array.isArray(parsed.experience) ? parsed.experience : initialPortfolioData.experience,
      skillGroups: Array.isArray(parsed.skillGroups) ? parsed.skillGroups : initialPortfolioData.skillGroups,
      designPreferences: Array.isArray(parsed.designPreferences) ? parsed.designPreferences : initialPortfolioData.designPreferences,
      stats: parsed.stats ? { ...initialPortfolioData.stats, ...parsed.stats } : initialPortfolioData.stats,
      security: parsed.security
        ? {
            adminPassword: parsed.security.adminPassword || "admin",
            updatedAt: parsed.security.updatedAt || "",
          }
        : {
            adminPassword: localStorage.getItem("sanndec5ty_admin_pin") || "admin",
            updatedAt: "",
          },
    };
  } catch (err) {
    console.error("Failed to parse stored portfolio data:", err);
    return initialPortfolioData;
  }
}

import {
  fetchFromSupabase,
  saveToSupabase,
  testSupabaseTable,
} from "@/lib/supabase";

interface PortfolioContextType {
  data: FullPortfolioData;
  isHydrated: boolean;
  isSyncing: boolean;
  supabaseStatus: { connected: boolean; tableExists: boolean; message: string };
  saveData: (customData?: FullPortfolioData) => Promise<void>;
  syncFromSupabase: () => Promise<boolean>;
  syncToSupabase: () => Promise<boolean>;
  checkSupabase: () => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => void;
  updateTldr: (tldr: TldrItem[]) => void;
  updateTopSkills: (topSkills: string[]) => void;
  updateQuickLinks: (quickLinks: QuickLinkItem[]) => void;
  updateAbout: (paragraphs: string[], highlights: string[]) => void;
  updateProjects: (projects: Project[]) => void;
  updateProducts: (products: string[]) => void;
  updateExperience: (experience: Job[]) => void;
  updateSkillGroups: (groups: SkillGroup[]) => void;
  updateDesignPreferences: (prefs: string[]) => void;
  updateStats: (stats: Stats) => void;
  setFullData: (data: FullPortfolioData) => void;
  resetToDefaults: () => void;
  exportJSON: () => void;
  importJSON: (jsonString: string) => boolean;
  generateTypeScriptCode: () => string;
  updateAdminPassword: (newPassword: string) => Promise<boolean>;
}

const PortfolioContext = createContext<PortfolioContextType | null>(null);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<FullPortfolioData>(initialPortfolioData);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState({
    connected: false,
    tableExists: false,
    message: "Memeriksa koneksi...",
  });

  const checkSupabase = useCallback(async () => {
    const status = await testSupabaseTable();
    setSupabaseStatus(status);
  }, []);

  // Initialize from localStorage on mount, then attempt background sync from Supabase
  useEffect(() => {
    const loaded = loadStoredData();
    setData(loaded);
    setIsHydrated(true);

    const handleSync = () => {
      setData(loadStoredData());
    };

    window.addEventListener("storage", handleSync);
    window.addEventListener(SYNC_EVENT, handleSync);

    // Background check & fetch from Supabase
    checkSupabase().then(() => {
      fetchFromSupabase().then((remoteData) => {
        if (remoteData) {
          setData(remoteData);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteData));
          } catch {}
        }
      });
    });

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener(SYNC_EVENT, handleSync);
    };
  }, [checkSupabase]);

  const persist = useCallback(
    async (newData: FullPortfolioData, notify = true) => {
      setData(newData);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
        window.dispatchEvent(new CustomEvent(SYNC_EVENT));
      } catch (err) {
        console.error("Gagal menyimpan ke localStorage:", err);
      }

      // Sync to Supabase in background
      setIsSyncing(true);
      const supabaseResult = await saveToSupabase(newData);
      setIsSyncing(false);

      if (notify) {
        if (supabaseResult.success) {
          toast.success("Tersimpan di Supabase & Browser!", {
            description: "Data portofolio telah disinkronkan ke cloud.",
          });
        } else {
          toast.success("Tersimpan di browser lokal!", {
            description:
              supabaseResult.error?.includes("PGRST205")
                ? "Tabel Supabase belum dibuat. Jalankan script SQL di Supabase."
                : "Tersimpan offline di browser.",
          });
        }
      }
    },
    []
  );

  const syncFromSupabase = useCallback(async () => {
    setIsSyncing(true);
    toast.loading("Mengambil data dari Supabase...", { id: "sb-sync" });
    const remote = await fetchFromSupabase();
    setIsSyncing(false);
    if (remote) {
      setData(remote);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
        window.dispatchEvent(new CustomEvent(SYNC_EVENT));
      } catch {}
      toast.success("Data berhasil disinkronkan dari Supabase!", { id: "sb-sync" });
      return true;
    } else {
      toast.error("Tidak ada data di Supabase atau tabel belum dibuat.", { id: "sb-sync" });
      return false;
    }
  }, []);

  const syncToSupabase = useCallback(async () => {
    setIsSyncing(true);
    toast.loading("Mendorong data ke Supabase...", { id: "sb-push" });
    const res = await saveToSupabase(data);
    setIsSyncing(false);
    if (res.success) {
      toast.success("Data berhasil didorong ke Supabase Cloud!", { id: "sb-push" });
      await checkSupabase();
      return true;
    } else {
      toast.error(`Gagal: ${res.error || "Tabel belum dibuat"}`, { id: "sb-push" });
      return false;
    }
  }, [data, checkSupabase]);

  const saveData = useCallback(
    async (customData?: FullPortfolioData) => {
      await persist(customData || data, true);
    },
    [data, persist]
  );

  const updateProfile = useCallback(
    (patch: Partial<Profile>) => {
      persist({
        ...data,
        profile: {
          ...data.profile,
          ...patch,
          links: {
            ...data.profile.links,
            ...(patch.links || {}),
          },
        },
      });
    },
    [data, persist]
  );

  const updateTldr = useCallback(
    (tldr: TldrItem[]) => {
      persist({ ...data, tldr });
    },
    [data, persist]
  );

  const updateTopSkills = useCallback(
    (topSkills: string[]) => {
      persist({ ...data, topSkills });
    },
    [data, persist]
  );

  const updateQuickLinks = useCallback(
    (quickLinks: QuickLinkItem[]) => {
      persist({ ...data, quickLinks });
    },
    [data, persist]
  );

  const updateAbout = useCallback(
    (aboutParagraphs: string[], highlights: string[]) => {
      persist({ ...data, aboutParagraphs, highlights });
    },
    [data, persist]
  );

  const updateProjects = useCallback(
    (projects: Project[]) => {
      persist({ ...data, projects });
    },
    [data, persist]
  );

  const updateProducts = useCallback(
    (products: string[]) => {
      persist({ ...data, products });
    },
    [data, persist]
  );

  const updateExperience = useCallback(
    (experience: Job[]) => {
      persist({ ...data, experience });
    },
    [data, persist]
  );

  const updateSkillGroups = useCallback(
    (skillGroups: SkillGroup[]) => {
      persist({ ...data, skillGroups });
    },
    [data, persist]
  );

  const updateDesignPreferences = useCallback(
    (designPreferences: string[]) => {
      persist({ ...data, designPreferences });
    },
    [data, persist]
  );

  const updateStats = useCallback(
    (stats: Stats) => {
      persist({ ...data, stats });
    },
    [data, persist]
  );

  const setFullData = useCallback(
    (newData: FullPortfolioData) => {
      persist(newData, true);
    },
    [persist]
  );

  const resetToDefaults = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setData(initialPortfolioData);
      window.dispatchEvent(new CustomEvent(SYNC_EVENT));
      toast.info("Database berhasil di-reset ke data bawaan!");
    } catch (err) {
      console.error(err);
      toast.error("Gagal me-reset database.");
    }
  }, []);

  const exportJSON = useCallback(() => {
    try {
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `portfolio-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Backup JSON berhasil diunduh!");
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengekspor data JSON.");
    }
  }, [data]);

  const importJSON = useCallback(
    (jsonString: string): boolean => {
      try {
        const parsed = JSON.parse(jsonString) as FullPortfolioData;
        if (!parsed.profile || !parsed.projects) {
          throw new Error("Format data JSON tidak valid.");
        }
        persist(parsed, true);
        toast.success("Data berhasil diimpor dan diperbarui!");
        return true;
      } catch (err: any) {
        toast.error(`Gagal mengimpor JSON: ${err.message || "Format salah"}`);
        return false;
      }
    },
    [persist]
  );

  const generateTypeScriptCode = useCallback(() => {
    return `// Auto-generated by Admin Dashboard on ${new Date().toISOString()}
export const profile = ${JSON.stringify(data.profile, null, 2)};

export const tldr = ${JSON.stringify(data.tldr, null, 2)};

export const topSkills = ${JSON.stringify(data.topSkills, null, 2)};

export const quickLinks = ${JSON.stringify(data.quickLinks, null, 2)} as const;

export const aboutParagraphs = ${JSON.stringify(data.aboutParagraphs, null, 2)};

export const highlights = ${JSON.stringify(data.highlights, null, 2)};

export type Project = {
  no: string;
  name: string;
  tagline: string;
  desc: string;
  tags: string[];
  links?: { label: string; href: string }[];
};

export const projects: Project[] = ${JSON.stringify(data.projects, null, 2)};

export const products = ${JSON.stringify(data.products, null, 2)};

export type Job = {
  title: string;
  org: string;
  period: string;
  bullets: string[];
};

export const experience: Job[] = ${JSON.stringify(data.experience, null, 2)};

export const skillGroups: { title: string; items: string[] }[] = ${JSON.stringify(data.skillGroups, null, 2)};

export const designPreferences = ${JSON.stringify(data.designPreferences, null, 2)};

export const stats = ${JSON.stringify(data.stats, null, 2)};
`;
  }, [data]);

  const updateAdminPassword = useCallback(
    async (newPassword: string): Promise<boolean> => {
      const updated: FullPortfolioData = {
        ...data,
        security: {
          adminPassword: newPassword,
          updatedAt: new Date().toISOString(),
        },
      };
      await persist(updated, true);
      try {
        localStorage.setItem("sanndec5ty_admin_pin", newPassword);
      } catch {}
      return true;
    },
    [data, persist]
  );

  return (
    <PortfolioContext.Provider
      value={{
        data,
        isHydrated,
        isSyncing,
        supabaseStatus,
        saveData,
        syncFromSupabase,
        syncToSupabase,
        checkSupabase,
        updateProfile,
        updateTldr,
        updateTopSkills,
        updateQuickLinks,
        updateAbout,
        updateProjects,
        updateProducts,
        updateExperience,
        updateSkillGroups,
        updateDesignPreferences,
        updateStats,
        setFullData,
        resetToDefaults,
        exportJSON,
        importJSON,
        generateTypeScriptCode,
        updateAdminPassword,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
}
