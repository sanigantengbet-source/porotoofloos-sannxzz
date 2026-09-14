import { createFileRoute, Link } from "@tanstack/react-router";
import { TerminalHeading } from "@/components/terminal-heading";
import { usePortfolio } from "@/context/portfolio-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SANNDEC5TY — Web Developer & Founder SANN404 FORUM" },
      {
        name: "description",
        content:
          "Portofolio SANNDEC5TY: web developer otodidak, founder SANN404 FORUM, penjual source code web apps dan produk digital.",
      },
      { property: "og:title", content: "SANNDEC5TY — Web Developer & Founder SANN404 FORUM" },
      {
        property: "og:description",
        content: "Source code web apps, tools developer, dan produk digital modern.",
      },
    ],
  }),
  component: Tldr,
});

function Tldr() {
  const { data } = usePortfolio();
  const { profile, tldr, topSkills, quickLinks } = data;

  return (
    <div className="space-y-8">
      <TerminalHeading cmd="tldr" title={`${profile.name} - TL;DR`} />

      <dl className="panel space-y-3 p-4">
        {tldr.map((row, idx) => (
          <div key={`${row.k}-${idx}`} className="flex gap-4">
            <dt className="w-16 shrink-0 text-sm font-bold">{row.k}</dt>
            <dd className="flex-1 text-sm leading-relaxed text-foreground/90">{row.v}</dd>
          </div>
        ))}
      </dl>

      <section className="space-y-3">
        <h2 className="text-base font-bold">
          <span className="text-muted-foreground">{"{ } "}</span>Top Skills
        </h2>
        <ul className="flex flex-wrap gap-2">
          {topSkills.map((s, idx) => (
            <li key={`${s}-${idx}`} className="chip">
              {s}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold">
          <span className="text-muted-foreground">{"> "}</span>Quick Links
        </h2>
        <ul className="space-y-2">
          {quickLinks.map((l, idx) => (
            <li key={`${l.cmd}-${idx}`} className="flex items-center gap-3">
              <Link to={l.to} className="chip w-32 justify-center">
                {l.cmd}
              </Link>
              <span className="text-sm text-muted-foreground">{l.desc}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
