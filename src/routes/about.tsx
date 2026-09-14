import { createFileRoute } from "@tanstack/react-router";
import { TerminalHeading } from "@/components/terminal-heading";
import { usePortfolio } from "@/context/portfolio-context";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — SANNDEC5TY" },
      {
        name: "description",
        content:
          "Cerita SANNDEC5TY: lulusan 2026 jurusan IPS, developer otodidak, dan founder SANN404 FORUM.",
      },
      { property: "og:title", content: "About — SANNDEC5TY" },
      {
        property: "og:description",
        content: "Lulusan 2026, developer otodidak, dan founder SANN404 FORUM.",
      },
    ],
  }),
  component: About,
});

function About() {
  const { data } = usePortfolio();
  const { profile, aboutParagraphs, highlights } = data;

  return (
    <div className="space-y-6">
      <TerminalHeading cmd="about" title="ABOUT ME" />

      <p className="text-lg">
        Hey, I&apos;m <strong className="font-bold">{profile.name}</strong>.
      </p>

      {aboutParagraphs.map((p, idx) => (
        <p key={idx} className="text-sm leading-7 text-foreground/90">
          {p}
        </p>
      ))}

      <ul className="space-y-2 pt-2">
        {highlights.map((h, idx) => (
          <li key={idx} className="chip w-full">
            <span className="mr-2 text-muted-foreground">&gt;</span>
            {h}
          </li>
        ))}
      </ul>
    </div>
  );
}
