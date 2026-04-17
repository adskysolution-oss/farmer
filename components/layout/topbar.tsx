import { Bell, Search, ShieldCheck } from "lucide-react";

import { LogoutButton } from "@/components/layout/logout-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export function Topbar({
  userName,
  role,
}: {
  userName: string;
  role: string;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="flex flex-col gap-4 px-4 py-4 md:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <div className="flex items-center gap-3">
              <h2 className="font-display text-xl font-semibold">{userName}</h2>
              <Badge variant="outline">{role}</Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-[240px]">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-11" placeholder="Search farmers, partners, references..." />
          </div>
          <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
            <Bell className="h-4 w-4" />
          </button>
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
