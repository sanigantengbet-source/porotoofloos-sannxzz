import { createFileRoute } from "@tanstack/react-router";
import { TerminalHeading } from "@/components/terminal-heading";
import { usePortfolio } from "@/context/portfolio-context";

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { title: "Experience — SANNDEC5TY" },
      {
        name: "description",
        content:
          "Pengalaman SANNDEC5TY: founder SANN404 FORUM, admin saluran komunitas, freelance web developer, dan digital marketing.",
      },
      { property: "og:title", content: "Experience — SANNDEC5TY" },
      {
        property: "og:description",
        content: "Founder, community builder, freelance web developer, digital marketer.",
      },
    ],
  }),
  component: Work,
});

function Work() {
  const { data } = usePortfolio();
  const { experience } = data;

  return (
    <div className="space-y-6">
      <TerminalHeading cmd="experience" title="EXPERIENCE" />

      <div className="space-y-4">
        {experience.map((job, idx) => (
          <article key={`${job.title}-${job.org}-${idx}`} className="panel space-y-3 p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base font-bold">{job.title}</h2>
              <span className="text-sm text-muted-foreground">{job.period}</span>
            </div>
            <p className="text-sm text-muted-foreground">{job.org}</p>
            <ul className="space-y-2">
              {job.bullets.map((b, bIdx) => (
                <li key={bIdx} className="flex gap-2 text-sm leading-7 text-foreground/90">
                  <span className="text-muted-foreground">&gt;</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
