"use client";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { APP_NAME, NAV_ITEMS, ROLE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Sidebar({
  role,
}: {
  role: "ADMIN" | "PARTNER" | "EMPLOYEE" | "CALLER";
}) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside className="hidden w-[284px] flex-col border-r border-border/60 bg-white/70 px-5 py-6 backdrop-blur xl:flex dark:bg-slate-950/50">
      <div className="rounded-3xl bg-gradient-to-br from-primary to-accent px-5 py-6 text-white shadow-glow">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">Operations Suite</p>
        <h2 className="mt-3 font-display text-2xl font-semibold">{APP_NAME}</h2>
        <p className="mt-2 text-sm text-white/80">{ROLE_LABELS[role]} workspace with live revenue, lead, and field visibility.</p>
      </div>
      <nav className="mt-8 flex-1 space-y-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition",
                active ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              <ChevronRight className={cn("h-4 w-4 transition", active ? "opacity-100" : "opacity-0 group-hover:opacity-100")} />
            </a>
          );
        })}
      </nav>
      <div className="rounded-3xl border border-border/70 bg-card/70 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Ready For Audit</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Password resets, status changes, payment events, and commission actions are persisted in the activity log.
        </p>
      </div>
    </aside>
  );
}
