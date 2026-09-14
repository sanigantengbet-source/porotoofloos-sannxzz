import { profile } from "@/data/portfolio";

export function TerminalHeading({ cmd, title }: { cmd: string; title: string }) {
  return (
    <div className="pt-5">
      <p className="text-lg text-muted-foreground">
        <span>{profile.handle}</span>
        <span className="text-muted-foreground/70">:~$ </span>
        <span className="text-foreground">{cmd}</span>
      </p>
      <h1 className="mt-3 border-b border-border pb-3 text-sm tracking-[0.18em] text-foreground">
        {title}
      </h1>
    </div>
  );
}
