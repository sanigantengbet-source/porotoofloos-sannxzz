export type SocialLink = {
  id?: string;
  label: string;
  iconName?: "github" | "whatsapp" | "telegram" | "tiktok" | "premium" | "free" | "email" | "custom";
  href: string;
  displayValue?: string;
};

export type Profile = {
  name: string;
  shortName: string;
  role: string;
  handle: string;
  location: string;
  email: string;
  initials: string;
  avatarUrl?: string;
  links: {
    github: string;
    whatsapp: string;
    telegram: string;
    tiktok: string;
    premium: string;
    free: string;
    custom?: SocialLink[];
  };
};

export type TldrItem = {
  k: string;
  v: string;
};

export type QuickLinkItem = {
  cmd: string;
  desc: string;
  to: string;
};

export type ProjectLink = {
  label: string;
  href: string;
};

export type Project = {
  no: string;
  name: string;
  tagline: string;
  desc: string;
  tags: string[];
  links?: ProjectLink[];
  demoUrl?: string;
  githubUrl?: string;
  isPaid?: boolean;
  price?: string;
  icon?: string;
  badgeText?: string;
  featured?: boolean;
};

export type Job = {
  title: string;
  org: string;
  period: string;
  bullets: string[];
};

export type SkillGroup = {
  title: string;
  items: string[];
};

export type StatCommunityItem = {
  label: string;
  value: string;
  unit: string;
};

export type StatProductItem = {
  label: string;
  value: string;
};

export type StatDistributionItem = {
  name: string;
  pct: number;
  color: string;
};

export type StatGrowthItem = {
  m: string;
  v: number;
};

export type StatActivityItem = {
  label: string;
  pct: number;
};

export type StatTopProductItem = {
  name: string;
  share: string;
  delta: string;
};

export type Stats = {
  community: StatCommunityItem[];
  products: StatProductItem[];
  distribution: StatDistributionItem[];
  growth: StatGrowthItem[];
  activity: StatActivityItem[];
  topProducts: StatTopProductItem[];
};

export type AdminSecurity = {
  adminPassword?: string;
  updatedAt?: string;
};

export type FullPortfolioData = {
  profile: Profile;
  tldr: TldrItem[];
  topSkills: string[];
  quickLinks: QuickLinkItem[];
  aboutParagraphs: string[];
  highlights: string[];
  projects: Project[];
  products: string[];
  experience: Job[];
  skillGroups: SkillGroup[];
  designPreferences: string[];
  stats: Stats;
  security?: AdminSecurity;
};

