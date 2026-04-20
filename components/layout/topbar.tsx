import { Bell, Search, ShieldCheck } from "lucide-react";

import { UserNav } from "@/components/layout/user-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
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
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-primary/10 p-2 text-primary lg:hidden">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="relative hidden min-w-[320px] lg:block">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-11" placeholder="Search farmers, partners, references..." />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative mr-2 lg:hidden">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="w-40 pl-9" placeholder="Search..." />
          </div>
          <button className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card shadow-sm sm:inline-flex">
            <Bell className="h-4 w-4" />
          </button>
          <ThemeToggle />
          <UserNav userName={userName} role={role} />
        </div>
      </div>
    </header>
  );
}
