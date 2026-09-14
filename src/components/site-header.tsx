import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Github, Mail, Send, MessageCircle, Music2, ShoppingBag } from "lucide-react";
import { usePortfolio } from "@/context/portfolio-context";
import profileAsset from "@/assets/profile.jpg";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const { data } = usePortfolio();
  const profile = data.profile;
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const actions = [
    { icon: Github, label: "GitHub", href: profile.links.github },
    { icon: Send, label: "Telegram", href: profile.links.telegram },
    { icon: MessageCircle, label: "WhatsApp Channel", href: profile.links.whatsapp },
    { icon: Music2, label: "TikTok", href: profile.links.tiktok },
    { icon: ShoppingBag, label: "Premium Code", href: profile.links.premium },
    { icon: Mail, label: "Email", href: `mailto:${profile.email}` },
  ];

  const avatarSrc = profile.avatarUrl && profile.avatarUrl.trim() !== "" ? profile.avatarUrl : profileAsset;

  return (
    <header
      className={
        "sticky top-0 z-30 border-b transition-all duration-300 " +
        (scrolled
          ? "border-border/70 bg-background/55 backdrop-blur-xl backdrop-saturate-150 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.9)]"
          : "border-border bg-background/90 backdrop-blur-none")
      }
    >
      <div className={`mx-auto flex items-center justify-between gap-3 px-4 py-3 ${isAdmin ? "max-w-5xl" : "max-w-3xl"}`}>
        <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-85">
          <img
            src={avatarSrc}
            alt={`Foto profil ${profile.name}`}
            loading="eager"
            className="size-11 shrink-0 rounded-full border border-border object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = profileAsset;
            }}
          />
          <div className="leading-tight">
            <div className="text-base font-bold tracking-tight">{profile.name}</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{profile.role}</span>
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1.5">
            {actions.slice(0, 4).map(({ icon: Icon, label, href }) =>
              href ? (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-muted-foreground hover:text-foreground"
                >
                  <Icon className="size-[17px]" />
                </a>
              ) : null
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
