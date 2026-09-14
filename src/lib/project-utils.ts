import React from "react";
import {
  Code2,
  Video,
  Bot,
  Download,
  MapPin,
  Music,
  ShieldCheck,
  ShoppingBag,
  Heart,
  Terminal,
  Smartphone,
  Globe,
  Database,
  Sparkles,
  Layers,
} from "lucide-react";

export const PROJECT_ICON_OPTIONS = [
  { id: "code", label: "Kode / Aplikasi", icon: Code2 },
  { id: "video", label: "Video / Streaming", icon: Video },
  { id: "bot", label: "AI / Bot Otomasi", icon: Bot },
  { id: "download", label: "Media Downloader", icon: Download },
  { id: "map", label: "Lokasi / Peta", icon: MapPin },
  { id: "music", label: "Musik / Audio Player", icon: Music },
  { id: "shield", label: "Keamanan / Validator", icon: ShieldCheck },
  { id: "shopping", label: "Produk / Toko", icon: ShoppingBag },
  { id: "heart", label: "Wishlist / Tabungan", icon: Heart },
  { id: "terminal", label: "CLI / Terminal Tool", icon: Terminal },
  { id: "smartphone", label: "Mobile / PWA", icon: Smartphone },
  { id: "globe", label: "Website / Web Portal", icon: Globe },
  { id: "database", label: "Database / Backend API", icon: Database },
  { id: "sparkles", label: "Generator / Design Tool", icon: Sparkles },
] as const;

export function getProjectIcon(iconId?: string) {
  switch (iconId?.toLowerCase()) {
    case "video":
      return Video;
    case "bot":
    case "ai":
      return Bot;
    case "download":
      return Download;
    case "map":
    case "location":
      return MapPin;
    case "music":
      return Music;
    case "shield":
    case "security":
      return ShieldCheck;
    case "shopping":
    case "cart":
      return ShoppingBag;
    case "heart":
      return Heart;
    case "terminal":
      return Terminal;
    case "smartphone":
    case "mobile":
      return Smartphone;
    case "globe":
    case "web":
      return Globe;
    case "database":
      return Database;
    case "sparkles":
      return Sparkles;
    case "code":
    default:
      return Code2;
  }
}

export function getWhatsAppBuyUrl(
  whatsappRaw: string | undefined,
  projectName: string,
  price?: string
): string {
  const target = (whatsappRaw || "").trim();

  // If already a direct link to a channel or full link
  let cleanNumber = "";
  if (target.includes("wa.me/")) {
    const parts = target.split("wa.me/");
    const afterWa = parts[1] ?? "";
    const firstPart = afterWa.split("?")[0] ?? "";
    cleanNumber = firstPart.replace(/[^0-9]/g, "");
  } else if (target.includes("whatsapp.com/channel/")) {
    // Return channel directly if it's a channel link
    return target;
  } else {
    cleanNumber = target.replace(/[^0-9]/g, "");
  }

  // Indonesian number standardizer
  if (cleanNumber.startsWith("08")) {
    cleanNumber = "628" + cleanNumber.slice(2);
  } else if (cleanNumber && !cleanNumber.startsWith("62") && cleanNumber.length >= 9) {
    cleanNumber = "62" + cleanNumber;
  }

  // Fallback number if profile only has channel
  if (!cleanNumber) {
    cleanNumber = "6289528652203"; // standard contact or fallback
  }

  const priceText = price && price.trim() !== "" ? ` seharga *${price}*` : "";
  const message = `Halo SANNDEC5TY! Saya tertarik membeli source code proyek *${projectName}*${priceText}. Apakah source code ini ready? Mohon informasi metode pembayaran dan cara pengirimannya ya, terima kasih!`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
