import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { TerminalHeading } from "@/components/terminal-heading";
import { usePortfolio } from "@/context/portfolio-context";
import {
  ExternalLink,
  Github,
  Globe,
  MessageCircle,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  Code2,
} from "lucide-react";
import { getProjectIcon, getWhatsAppBuyUrl } from "@/lib/project-utils";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects & Source Code — SANNDEC5TY" },
      {
        name: "description",
        content:
          "Kumpulan proyek, live demo, dan source code premium & open source: platform streaming, Sanexus AI Search, downloader, tools developer, dan produk digital siap pakai.",
      },
      { property: "og:title", content: "Projects & Source Code — SANNDEC5TY" },
      {
        property: "og:description",
        content:
          "Platform streaming, AI search, downloader, tools developer, dan source code siap pakai.",
      },
    ],
  }),
  component: Projects,
});

type FilterType = "all" | "paid" | "free";

function Projects() {
  const { data } = usePortfolio();
  const { projects, products, profile } = data;
  const [filter, setFilter] = useState<FilterType>("all");

  const paidCount = projects.filter((p) => p.isPaid).length;
  const freeCount = projects.filter((p) => !p.isPaid).length;

  const filteredProjects = projects.filter((p) => {
    if (filter === "paid") return p.isPaid;
    if (filter === "free") return !p.isPaid;
    return true;
  });

  return (
    <div className="space-y-6">
      <TerminalHeading cmd="projects" title="FEATURED PROJECTS & SOURCE CODE" />

      {/* Intro & Filter Bar */}
      <div className="panel p-4 space-y-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Kumpulan aplikasi dan source code yang saya kembangkan. Tersedia proyek{" "}
          <strong className="text-foreground">Open Source / Gratis</strong> dengan repositori publik, serta{" "}
          <strong className="text-amber">Source Code Siap Pakai (Berbayar)</strong> yang bisa langsung Anda order via WhatsApp.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60">
          <span className="text-[11px] font-mono text-muted-foreground mr-1">Filter:</span>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-md px-3 py-1 text-xs font-mono transition-all cursor-pointer ${
              filter === "all"
                ? "border border-amber bg-amber/15 text-amber font-bold shadow-sm"
                : "border border-border bg-surface text-muted-foreground hover:text-foreground"
            }`}
          >
            Semua ({projects.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("paid")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-mono transition-all cursor-pointer ${
              filter === "paid"
                ? "border border-emerald-500 bg-emerald-500/15 text-emerald-400 font-bold shadow-sm"
                : "border border-border bg-surface text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShoppingBag className="size-3" />
            <span>Source Code Berbayar ({paidCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter("free")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-mono transition-all cursor-pointer ${
              filter === "free"
                ? "border border-info bg-info/15 text-info font-bold shadow-sm"
                : "border border-border bg-surface text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code2 className="size-3" />
            <span>Free / Open Source ({freeCount})</span>
          </button>
        </div>
      </div>

      {/* Project Cards List */}
      <div className="space-y-4">
        {filteredProjects.map((p, idx) => {
          const IconComponent = getProjectIcon(p.icon);
          const isPaid = Boolean(p.isPaid);
          const waBuyUrl = getWhatsAppBuyUrl(profile.links.whatsapp, p.name, p.price);

          return (
            <article
              key={`${p.no}-${idx}`}
              className={`panel panel-hover space-y-4 p-5 transition-all duration-200 ${
                isPaid ? "hover:border-emerald-500/50" : "hover:border-amber/50"
              }`}
            >
              {/* Header: Icon, Number, Name, Badges & Price */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg border shadow-sm ${
                      isPaid
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-amber/30 bg-amber/10 text-amber"
                    }`}
                  >
                    <IconComponent className="size-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground font-semibold">
                        #{p.no}
                      </span>
                      <h2 className="text-lg font-bold tracking-tight text-foreground">
                        {p.name}
                      </h2>
                      {p.badgeText && (
                        <span className="rounded bg-amber/15 border border-amber/30 px-2 py-0.5 text-[10px] font-mono font-bold text-amber">
                          {p.badgeText}
                        </span>
                      )}
                    </div>
                    {p.tagline && (
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">
                        <span className="text-amber">&gt;</span> {p.tagline}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status / Pricing Badge */}
                <div>
                  {isPaid ? (
                    <div className="flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 shadow-sm">
                      <ShoppingBag className="size-3.5 text-emerald-400" />
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {p.price ? p.price : "Source Code Berbayar"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 rounded-md border border-info/40 bg-info/10 px-2.5 py-1 text-xs font-mono text-info font-medium">
                      <Code2 className="size-3" />
                      <span>Free / Open Source</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm leading-relaxed text-foreground/90 font-sans">
                {p.desc}
              </p>

              {/* Tech Stack Chips */}
              {p.tags && p.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {p.tags.map((t, tIdx) => (
                    <span
                      key={tIdx}
                      className="chip text-[11px] font-mono text-muted-foreground border-border/80"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons Bar: Live Demo, Source Code & Buy via WA */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-border/60 text-xs font-mono">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Live Demo Button */}
                  {p.demoUrl && (
                    <a
                      href={p.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-foreground transition-all hover:border-amber hover:text-amber cursor-pointer"
                    >
                      <Globe className="size-3.5 text-amber" />
                      <span>Live Demo</span>
                      <ExternalLink className="size-2.5 text-muted-foreground" />
                    </a>
                  )}

                  {/* GitHub / Source Code Button */}
                  {p.githubUrl && (
                    <a
                      href={p.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-foreground transition-all hover:border-muted-foreground cursor-pointer"
                    >
                      <Github className="size-3.5" />
                      <span>GitHub</span>
                      <ExternalLink className="size-2.5 text-muted-foreground" />
                    </a>
                  )}

                  {/* Extra Custom Links */}
                  {p.links &&
                    p.links.map((link, lIdx) => (
                      <a
                        key={lIdx}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-muted-foreground hover:border-muted-foreground hover:text-foreground"
                      >
                        <span>{link.label}</span>
                        <ExternalLink className="size-2.5" />
                      </a>
                    ))}
                </div>

                {/* WhatsApp Buy Button (If Paid) */}
                {isPaid && (
                  <a
                    href={waBuyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-md bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-background transition-all hover:bg-emerald-400 active:scale-95 shadow-md cursor-pointer ml-auto"
                  >
                    <MessageCircle className="size-3.5" />
                    <span>Beli via WhatsApp {p.price ? `(${p.price})` : ""}</span>
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Digital Products List */}
      <section className="space-y-3 pt-2">
        <h2 className="text-base font-bold flex items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <span>Source Code & Produk Terjual Lainnya</span>
        </h2>
        <ul className="flex flex-wrap gap-2">
          {products.map((prod, idx) => (
            <li
              key={idx}
              className="chip border-border/80 bg-surface/70 text-xs font-mono text-foreground/90 hover:border-amber/50"
            >
              {prod}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

