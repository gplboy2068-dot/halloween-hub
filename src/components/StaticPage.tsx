import type { ReactNode } from "react";
import { PageShell } from "./PageShell";

export function StaticPage({ title, lead, children }: { title: string; lead?: string; children: ReactNode }) {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14">
        <h1 className="font-display text-4xl sm:text-5xl font-bold">{title}</h1>
        {lead && <p className="mt-4 text-lg text-muted-foreground">{lead}</p>}
        <div className="mt-10 space-y-6 text-muted-foreground leading-relaxed [&_h2]:font-display [&_h2]:text-foreground [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-3 [&_a]:text-primary [&_a:hover]:underline">
          {children}
        </div>
      </div>
    </PageShell>
  );
}
