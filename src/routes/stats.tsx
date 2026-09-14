import { createFileRoute } from "@tanstack/react-router";
import { usePortfolio } from "@/context/portfolio-context";
import type { Stats as StatsType } from "@/types/portfolio";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "Stats — SANNDEC5TY" },
      {
        name: "description",
        content:
          "Statistik komunitas dan produk digital SANNDEC5TY: pertumbuhan member, distribusi channel, dan produk terlaris.",
      },
      { property: "og:title", content: "Stats — SANNDEC5TY" },
      { property: "og:description", content: "Growth komunitas dan performa produk digital." },
    ],
  }),
  component: Stats,
});

function Donut({ distribution }: { distribution: StatsType["distribution"] }) {
  const r = 60;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const channelCount = distribution.length;
  return (
    <svg viewBox="0 0 160 160" className="mx-auto size-44">
      {distribution.map((d) => {
        const len = (d.pct / 100) * c;
        const el = (
          <circle
            key={d.name}
            cx="80"
            cy="80"
            r={r}
            fill="none"
            stroke={d.color}
            strokeWidth="16"
            strokeDasharray={`${len} ${c - len}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 80 80)"
          />
        );
        offset += len;
        return el;
      })}
      {/* ribbed overlay */}
      <circle
        cx="80"
        cy="80"
        r={r}
        fill="none"
        stroke="var(--background)"
        strokeWidth="16"
        strokeDasharray="1.5 4"
        opacity="0.55"
        transform="rotate(-90 80 80)"
      />
      <text
        x="80"
        y="76"
        textAnchor="middle"
        className="fill-foreground text-[22px] font-bold"
      >
        {channelCount}
      </text>
      <text
        x="80"
        y="94"
        textAnchor="middle"
        className="fill-muted-foreground text-[9px] tracking-[0.2em]"
      >
        CHANNELS
      </text>
    </svg>
  );
}

function Gauge() {
  const r = 46;
  const c = 2 * Math.PI * r;
  const pct = 0.82;
  return (
    <svg viewBox="0 0 120 120" className="mx-auto size-32">
      <circle cx="60" cy="60" r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke="var(--amber)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${c * pct} ${c}`}
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="60" textAnchor="middle" className="fill-foreground text-[24px] font-bold">
        82
      </text>
      <text
        x="60"
        y="74"
        textAnchor="middle"
        className="fill-amber text-[8px] tracking-[0.2em]"
      >
        ACTIVE
      </text>
    </svg>
  );
}

function GrowthChart({ growth }: { growth: StatsType["growth"] }) {
  const data = growth && growth.length > 0 ? growth : [{ m: "NOW", v: 100 }];
  const w = 320;
  const h = 120;
  const max = Math.max(...data.map((d) => d.v));
  const min = Math.min(...data.map((d) => d.v));
  const pts: [number, number][] = data.map((d, i) => [
    (i / Math.max(1, data.length - 1)) * (w - 60) + 8,
    h - 22 - ((d.v - min) / (max - min || 1)) * (h - 44),
  ]);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const deltaVal = data[0]?.v ? Math.round(((data[data.length - 1]!.v - data[0]!.v) / data[0]!.v) * 100) : 0;
  const delta = deltaVal >= 0 ? `+${deltaVal}.0%` : `${deltaVal}.0%`;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        <line
          x1="8"
          x2={w - 56}
          y1={h / 2 - 6}
          y2={h / 2 - 6}
          stroke="var(--border)"
          strokeWidth="1"
          strokeDasharray="6 6"
        />
        <path
          d={line}
          fill="none"
          stroke="var(--amber)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          style={{
            strokeDasharray: 1,
            strokeDashoffset: 0,
            animation: "growthDraw 1.4s cubic-bezier(0.22,1,0.36,1) both",
          }}
        />
        <text
          x={w - 48}
          y={(pts[pts.length - 1]?.[1] ?? 50) + 4}
          className="fill-success text-[11px] font-bold"
        >
          {delta}
        </text>
        {data.map((d, i) => (
          <text
            key={d.m}
            x={pts[i]?.[0] ?? 0}
            y={h - 4}
            textAnchor="middle"
            className="fill-muted-foreground text-[8px] tracking-[0.15em]"
          >
            {d.m}
          </text>
        ))}
      </svg>
      <style>{`@keyframes growthDraw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}`}</style>
    </div>
  );
}

function ActivityBars({ activity }: { activity: StatsType["activity"] }) {
  return (
    <ul className="space-y-3">
      {activity.map((a, idx) => (
        <li key={`${a.label}-${idx}`} className="space-y-1">
          <div className="flex items-center justify-between text-xs tracking-[0.12em] text-muted-foreground">
            <span>{a.label}</span>
            <span className="text-foreground">{a.pct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-amber transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(0, a.pct))}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Stats() {
  const { data } = usePortfolio();
  const stats = data.stats;

  return (
    <div className="space-y-8 pt-6">
      <section className="space-y-4">
        <h2 className="text-xs tracking-[0.2em] text-muted-foreground">COMMUNITY</h2>
        <Gauge />
        <p className="text-center text-sm tracking-[0.2em] text-muted-foreground">ENGAGEMENT</p>
        <div className="grid grid-cols-2 gap-3">
          {stats.community.map((s, idx) => (
            <div key={`${s.label}-${idx}`} className="panel panel-hover p-4">
              <div className="text-xs tracking-[0.15em] text-muted-foreground">{s.label}</div>
              <div className="mt-1 text-3xl font-bold text-amber">
                {s.value}
                <span className="text-base">{s.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs tracking-[0.2em] text-muted-foreground">MEMBER GROWTH</h2>
        <GrowthChart growth={stats.growth} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xs tracking-[0.2em] text-muted-foreground">ACTIVITY</h2>
        <ActivityBars activity={stats.activity} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xs tracking-[0.2em] text-muted-foreground">PRODUCTS</h2>
        <div className="grid grid-cols-3 gap-3">
          {stats.products.map((p, idx) => (
            <div key={`${p.label}-${idx}`} className="panel p-3 text-center">
              <div className="text-[10px] tracking-[0.12em] text-muted-foreground">{p.label}</div>
              <div className="mt-1 text-xl font-bold text-success">{p.value}</div>
            </div>
          ))}
        </div>
        <Donut distribution={stats.distribution} />
        <ul className="space-y-1">
          {stats.distribution.map((d, idx) => (
            <li key={`${d.name}-${idx}`} className="flex items-center justify-center gap-2 text-sm">
              <span className="size-2.5 rounded-full" style={{ background: d.color }} />
              <span className="text-muted-foreground">{d.name}</span>
              <strong className="font-bold">{d.pct}%</strong>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xs tracking-[0.2em] text-muted-foreground">TOP PRODUCTS</h2>
        <ul>
          {stats.topProducts.map((p, idx) => (
            <li
              key={`${p.name}-${idx}`}
              className="flex items-center justify-between border-b border-border py-3 text-sm"
            >
              <span className="font-bold">{p.name}</span>
              <span className="flex items-center gap-4">
                <span className="text-muted-foreground">{p.share}</span>
                <span className="text-success">{p.delta}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
