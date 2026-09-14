export const profile = {
  name: "SANNDEC5TY",
  shortName: "SANNDEC5TY",
  role: "Web Developer",
  handle: "saann@portfolio",
  location: "Indonesia",
  email: "sann404forum@gmail.com",
  initials: "SD",
  links: {
    github: "https://github.com/sannnproject",
    whatsapp: "https://whatsapp.com/channel/0029Vb6ukqnHQbS4mKP0j80L",
    telegram: "https://t.me/sannnforums",
    tiktok: "https://www.tiktok.com/@sannforums",
    premium: "https://lynk.id/sannnx",
    free: "https://tempel.in/view/u2aQkq",
  },
};

export const tldr = [
  { k: "WHO", v: "Founder @ SANN404 FORUM · Self-taught developer" },
  { k: "WHAT", v: "Jual source code web apps, produk digital, tools developer" },
  { k: "WHERE", v: "Indonesia · Lynk.id · WhatsApp · Telegram · TikTok" },
  { k: "STUDY", v: "Lulus SMA 2026 (jurusan IPS) · belajar teknologi otodidak" },
  { k: "BUILD", v: "Saluran komunitas 100 → 5K+ member dalam < 6 bulan" },
];


export const topSkills = [
  "TypeScript",
  "Next.js",
  "React",
  "TanStack Start",
  "Tailwind CSS",
  "Node.js",
  "Express",
  "FastAPI",
  "Firebase",
  "Supabase",
  "Vercel",
  "Termux",
];

export const quickLinks = [
  { cmd: "about", desc: "My story", to: "/about" },
  { cmd: "projects", desc: "What I've built", to: "/projects" },
  { cmd: "experience", desc: "Where I've worked", to: "/work" },
  { cmd: "skills", desc: "My stack", to: "/skills" },
  { cmd: "contact", desc: "Let's connect", to: "/contact" },
] as const;

export const aboutParagraphs = [
  "Saya mulai dari bangku sekolah dan sekarang sudah lulus tahun 2026. Sejak jadi pelajar saya aktif membangun proyek digital dan bisnis berbasis teknologi lewat SANN404 FORUM. Sehari-hari saya membuat, mengembangkan, dan menjual source code aplikasi web — fokus di produk digital, tools developer, desain modern, dan pemasaran lewat komunitas online.",
  "Latar belakang saya jurusan IPS, dan semua soal teknologi saya pelajari otodidak. Di sisi lain saya punya pengalaman marketing sekitar 2 tahun, jadi saya terbiasa memikirkan produk sekaligus cara menjualnya. Saya pernah mengelola saluran komunitas di WhatsApp yang tumbuh dari sekitar 100 anggota menjadi lebih dari 5 ribu anggota dalam waktu kurang dari setengah tahun.",
  "Stack yang saya pakai berkisar di Next.js App Router, React, TypeScript, Tailwind CSS, Node.js, Express, dan Python FastAPI. Aplikasi yang saya bangun selalu saya siapkan supaya siap deploy ke Vercel atau platform lain, dengan perhatian pada arsitektur, performa, dan keamanan.",
];

export const highlights = [
  "Founder @ SANN404 FORUM GROUP",
  "Saluran komunitas — 100 → 5K+ member dalam < 6 bulan",
  "Penjual source code web apps & produk digital",
  "Pengalaman marketing ~2 tahun",
  "Self-taught developer · lulus sekolah 2026 (jurusan IPS)",
];

export type Project = {
  no: string;
  name: string;
  tagline: string;
  desc: string;
  tags: string[];
  links?: { label: string; href: string }[];
  demoUrl?: string;
  githubUrl?: string;
  isPaid?: boolean;
  price?: string;
  icon?: string;
  badgeText?: string;
};

export const projects: Project[] = [
  {
    no: "01",
    name: "Platform Streaming",
    tagline: "Anime · Donghua · Komik · Novel",
    desc: "Platform streaming dan baca multi-konten: anime, donghua, komik, dan novel dalam satu aplikasi. Dibangun dengan Next.js App Router, pemisahan layer data yang rapi, caching, dan penanganan timeout agar sumber pihak ketiga tetap stabil saat diakses banyak user.",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Caching", "Vercel"],
    demoUrl: "https://demo-streaming.sanndec5ty.dev",
    githubUrl: "",
    isPaid: true,
    price: "Rp 250.000",
    icon: "video",
    badgeText: "BEST SELLER",
  },
  {
    no: "02",
    name: "Sanexus AI Search",
    tagline: "AI search engine & answer engine",
    desc: "Mesin pencari berbasis AI yang merangkum hasil pencarian menjadi jawaban ringkas dengan sumber. Fokus pada streaming response, rate limiting, dan concurrency agar tetap hemat resource saat dipakai bersamaan.",
    tags: ["Next.js", "TypeScript", "FastAPI", "Rate Limiting", "Streaming"],
    demoUrl: "https://sanexus-ai.vercel.app",
    githubUrl: "https://github.com/sanndec5ty/sanexus-ai-search",
    isPaid: false,
    icon: "bot",
    badgeText: "AI POWERED",
  },
  {
    no: "03",
    name: "MEDIA-DOWNLOADER",
    tagline: "Multi-platform media downloader",
    desc: "Tool downloader media dari berbagai platform dengan antarmuka mobile-first. Memakai keepAlive HTTP Agent, timeout, dan concurrency control supaya request berat tidak menjatuhkan server.",
    tags: ["Node.js", "Express", "TypeScript", "keepAlive Agent", "Concurrency"],
    demoUrl: "https://downloader.sanndec5ty.dev",
    githubUrl: "",
    isPaid: true,
    price: "Rp 120.000",
    icon: "download",
    badgeText: "COMMERCIAL",
  },
  {
    no: "04",
    name: "SHARELOK",
    tagline: "Share lokasi & short link",
    desc: "Aplikasi berbagi lokasi dan short link dengan halaman preview rapi. Data ringan disimpan di localStorage/IndexedDB bila cukup, sisanya lewat API dengan environment variable untuk semua kredensial.",
    tags: ["Next.js", "TypeScript", "IndexedDB", "Short Link"],
    demoUrl: "https://sharelok.app",
    githubUrl: "https://github.com/sanndec5ty/sharelok",
    isPaid: false,
    icon: "map",
  },
  {
    no: "05",
    name: "CheckNik",
    tagline: "Validator & parser NIK",
    desc: "Tool untuk memvalidasi dan membaca struktur NIK secara lokal di browser, tanpa mengirim data sensitif ke server. Dirancang cepat, offline-friendly, dan mobile first.",
    tags: ["React", "TypeScript", "Client-side", "Privacy"],
    demoUrl: "https://checknik.dev",
    githubUrl: "https://github.com/sanndec5ty/checknik",
    isPaid: false,
    icon: "shield",
  },
  {
    no: "06",
    name: "Stream Beats",
    tagline: "Music player & streaming UI",
    desc: "Music player web dengan queue, kontrol playback, dan UI card modern. Salah satu source code yang saya rilis dan pasarkan di SANN404 FORUM.",
    tags: ["React", "TypeScript", "Tailwind CSS", "Audio API"],
    demoUrl: "https://streambeats.sanndec5ty.dev",
    githubUrl: "",
    isPaid: true,
    price: "Rp 150.000",
    icon: "music",
    badgeText: "HOT PRODUCT",
  },
  {
    no: "07",
    name: "GitHub Uploader",
    tagline: "Upload file ke repo langsung dari web",
    desc: "Uploader berbasis web untuk mendorong file ke repository GitHub lewat API, lengkap dengan token yang disimpan aman di environment variable dan penanganan error yang jelas.",
    tags: ["Next.js", "GitHub API", "TypeScript"],
    demoUrl: "https://gh-uploader.dev",
    githubUrl: "https://github.com/sanndec5ty/gh-uploader",
    isPaid: false,
    icon: "globe",
  },
  {
    no: "08",
    name: "WishlistKU",
    tagline: "Wishlist & tabungan target",
    desc: "Aplikasi wishlist tanpa batas dengan upload foto, kategori, prioritas, target tanggal, progress otomatis, tabungan wishlist, dan estimasi waktu tercapai.",
    tags: ["React", "TypeScript", "Tailwind CSS", "PWA", "IndexedDB"],
    demoUrl: "https://wishlistku.app",
    githubUrl: "https://github.com/sanndec5ty/wishlistku",
    isPaid: false,
    icon: "heart",
  },
  {
    no: "09",
    name: "ReconX",
    tagline: "Recon & automation toolkit (konsep)",
    desc: "Konsep toolkit recon dan automation berbasis Puppeteer untuk screenshot, scraping terjadwal, dan monitoring halaman.",
    tags: ["Node.js", "Puppeteer", "Automation"],
    demoUrl: "",
    githubUrl: "",
    isPaid: true,
    price: "Rp 200.000",
    icon: "terminal",
  },
  {
    no: "10",
    name: "DesignMD · Design System Generator",
    tagline: "Generator design token & DESIGN.md",
    desc: "Konsep tool yang menghasilkan design token, color palette, spacing, dan typography lengkap dengan file DESIGN.md siap pakai untuk tiap proyek baru.",
    tags: ["TypeScript", "Design Tokens", "Tooling"],
    demoUrl: "https://designmd.dev",
    githubUrl: "https://github.com/sanndec5ty/design-md",
    isPaid: false,
    icon: "sparkles",
  },
];

export const products = [
  "Music Player",
  "Image to Prompt",
  "Short Link",
  "Web Monitoring",
  "Platform Anime Streaming",
  "Screenshot Tools",
  "Downloader",
  "DeepImages",
  "Sanexus AI Search",
];

export type Job = {
  title: string;
  org: string;
  period: string;
  bullets: string[];
};

export const experience: Job[] = [
  {
    title: "Founder",
    org: "SANN404 FORUM GROUP",
    period: "Present",
    bullets: [
      "Membangun komunitas dan toko digital untuk menjual source code web apps.",
      "Distribusi produk lewat Lynk.id, WhatsApp, dan Telegram.",
      "Menyusun katalog produk: music player, short link, downloader, screenshot tools, dan lainnya.",
    ],
  },
  {
    title: "Owner & Admin",
    org: "Saluran SANN404 FORUM (WhatsApp)",
    period: "Growth Project",
    bullets: [
      "Tumbuh dari ~100 anggota menjadi 5.000+ anggota dalam kurang dari setengah tahun.",
      "Mengelola konten harian, moderasi, dan funnel ke produk digital.",
    ],
  },
  {
    title: "Web Developer (Freelance)",
    org: "Independen",
    period: "Ongoing",
    bullets: [
      "Membangun aplikasi web siap deploy ke Vercel dan Netlify.",
      "Fokus pada arsitektur, performa, dan keamanan: env variable, caching, rate limiting, timeout.",
    ],
  },
  {
    title: "Digital Marketing",
    org: "Komunitas Online",
    period: "~2 tahun",
    bullets: [
      "Pemasaran produk digital untuk segmen remaja dan pelajar.",
      "Gaya komunikasi fleksibel antara nuansa Gen Z dan profesional.",
    ],
  },
];

export const skillGroups: { title: string; items: string[] }[] = [
  {
    title: "Languages",
    items: [
      "TypeScript",
      "JavaScript",
      "Python",
      "Kotlin",
      "Java",
      "Ruby",
      "Rust",
      "HTML",
      "CSS",
      "Bash",
    ],
  },
  {
    title: "Frontend",
    items: [
      "Next.js App Router",
      "React",
      "TanStack Start",
      "Tailwind CSS",
      "Card UI",
      "Floating Sidebar",
      "Dark Mode",
      "PWA",
      "Mobile First",
    ],
  },
  {
    title: "Backend & APIs",
    items: ["Node.js", "Express", "Python FastAPI", "REST APIs", "Puppeteer"],
  },
  {
    title: "Databases & Storage",
    items: ["Firebase", "Supabase", "localStorage", "IndexedDB"],
  },
  {
    title: "Cloud & DevOps",
    items: [
      "Vercel",
      "Netlify",
      "GitHub",
      "Environment Variable",
      "VPS",
      "Oracle Cloud Free Tier",
    ],
  },
  {
    title: "Performance & Security",
    items: [
      "Caching",
      "Timeout",
      "Rate Limiting",
      "keepAlive HTTP Agent",
      "Concurrency",
    ],
  },
  {
    title: "Design System",
    items: [
      "Design Tokens",
      "Color Palette",
      "Spacing",
      "Typography",
      "DESIGN.md",
    ],
  },
  {
    title: "AI & ML",
    items: [
      "Claude API",
      "OpenAI API",
      "Gemini",
      "LangChain",
      "Mastra",
      "RAG",
      "ONNX",
      "MCP Servers",
      "MediaPipe",
      "LiveKit",
      "Embeddings",
    ],
  },
  {
    title: "Tools & Deployment",
    items: [
      "Git",
      "VS Code",
      "Acode",
      "Termux",
      "Linux",
      "GitHub",
      "GitLab",
      "Vercel",
      "Vercel CLI",
    ],
  },
];

export const designPreferences = [
  "Modern",
  "Profesional",
  "Mobile First",
  "Tren 2026",
  "Floating Sidebar",
  "Dark Mode",
  "PWA",
  "Card UI",
  "Sistem warna rapi",
];

export const stats = {
  community: [
    { label: "MEMBER", value: "5K+", unit: "" },
    { label: "GROWTH", value: "50", unit: "x" },
    { label: "BULAN", value: "<6", unit: "" },
    { label: "CHANNEL", value: "3", unit: "" },
  ],
  products: [
    { label: "SOURCE CODE", value: "9+" },
    { label: "PROYEK", value: "10+" },
    { label: "STACK", value: "20+" },
  ],
  distribution: [
    { name: "whatsapp", pct: 52, color: "var(--success)" },
    { name: "telegram", pct: 30, color: "var(--info)" },
    { name: "lynk.id", pct: 18, color: "var(--danger)" },
  ],
  growth: [
    { m: "JAN", v: 100 },
    { m: "FEB", v: 620 },
    { m: "MAR", v: 1450 },
    { m: "APR", v: 2380 },
    { m: "MEI", v: 3600 },
    { m: "JUN", v: 5200 },
  ],
  activity: [
    { label: "SOURCE CODE", pct: 92 },
    { label: "KOMUNITAS", pct: 78 },
    { label: "MARKETING", pct: 66 },
    { label: "OPEN SOURCE", pct: 54 },
  ],
  topProducts: [
    { name: "SANEXUS AI", share: "28.4%", delta: "+112.0%" },
    { name: "DOWNLOADER", share: "22.1%", delta: "+64.5%" },
    { name: "SHORT LINK", share: "18.9%", delta: "+41.3%" },
    { name: "MUSIC PLAYER", share: "15.2%", delta: "+22.8%" },
  ],
};
