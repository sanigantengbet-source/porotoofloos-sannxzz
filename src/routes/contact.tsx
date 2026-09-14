import { createFileRoute } from "@tanstack/react-router";
import { Mail, Github, Send, MessageCircle, ShoppingBag, Music2, Gift, Link2 } from "lucide-react";
import { TerminalHeading } from "@/components/terminal-heading";
import { usePortfolio } from "@/context/portfolio-context";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — SANNDEC5TY" },
      {
        name: "description",
        content:
          "Hubungi SANNDEC5TY lewat email, Telegram, saluran WhatsApp, GitHub, TikTok, atau ambil source code premium & gratis.",
      },
      { property: "og:title", content: "Contact — SANNDEC5TY" },
      {
        property: "og:description",
        content: "Email, Telegram, saluran WhatsApp, GitHub, TikTok, premium & free code.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { data } = usePortfolio();
  const { profile } = data;

  const rows = [
    { icon: Mail, label: "Email", value: profile.email, href: profile.email ? `mailto:${profile.email}` : "" },
    { icon: Github, label: "GitHub", value: profile.links?.github ? profile.links.github.replace(/^https?:\/\//, "") : "", href: profile.links?.github || "" },
    { icon: MessageCircle, label: "Saluran WA", value: "SANN404 FORUM GROUP", href: profile.links?.whatsapp || "" },
    { icon: Send, label: "Telegram", value: profile.links?.telegram ? profile.links.telegram.replace(/^https?:\/\//, "") : "", href: profile.links?.telegram || "" },
    { icon: Music2, label: "TikTok", value: profile.links?.tiktok ? profile.links.tiktok.replace(/^https?:\/\/(www\.)?tiktok\.com\//, "") : "", href: profile.links?.tiktok || "" },
    { icon: ShoppingBag, label: "Premium Code", value: profile.links?.premium ? profile.links.premium.replace(/^https?:\/\//, "") : "", href: profile.links?.premium || "" },
    { icon: Gift, label: "Free Code", value: profile.links?.free ? profile.links.free.replace(/^https?:\/\//, "") : "", href: profile.links?.free || "" },
    ...(profile.links?.custom || []).map((c) => ({
      icon: Link2,
      label: c.label,
      value: c.displayValue || c.href.replace(/^https?:\/\//, ""),
      href: c.href,
    })),
  ].filter((r) => r.href || r.value);

  return (
    <div className="space-y-6">
      <TerminalHeading cmd="contact" title="CONTACT" />

      <p className="text-lg">Want to work together? Let&apos;s connect.</p>

      <ul className="space-y-3">
        {rows.map(({ icon: Icon, label, value, href }) => {
          const inner = (
            <>
              <Icon className="size-5 shrink-0 text-muted-foreground" />
              <span className="w-24 shrink-0 text-sm text-muted-foreground">{label}</span>
              <span className="text-sm break-all">{value}</span>
            </>
          );
          return (
            <li key={label}>
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="panel flex items-center gap-3 p-4 transition-colors hover:border-muted-foreground"
                >
                  {inner}
                </a>
              ) : (
                <div className="panel flex items-center gap-3 p-4">{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
