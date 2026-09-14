import { Link } from "@tanstack/react-router";

const tabs = [
  { to: "/", glyph: "~", label: "TLDR" },
  { to: "/about", glyph: "?", label: "ABOUT" },
  { to: "/projects", glyph: "{/}", label: "PROJECTS" },
  { to: "/work", glyph: ">", label: "WORK" },
  { to: "/skills", glyph: "#", label: "SKILLS" },
  { to: "/contact", glyph: "@", label: "CONTACT" },
  { to: "/stats", glyph: "◉", label: "STATS" },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur">
      <ul className="mx-auto flex max-w-3xl items-stretch justify-between px-1">
        {tabs.map((tab) => (
          <li key={tab.to} className="flex-1">
            <Link
              to={tab.to}
              activeOptions={{ exact: tab.to === "/" }}
              className="group relative flex flex-col items-center gap-1 py-2.5 text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "!text-foreground" }}
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute -top-px h-0.5 w-10 rounded-full transition-opacity ${
                      isActive ? "bg-foreground opacity-100" : "opacity-0"
                    }`}
                  />
                  <span className="text-base leading-none font-bold">{tab.glyph}</span>
                  <span className="text-[9px] tracking-[0.08em]">{tab.label}</span>
                </>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
