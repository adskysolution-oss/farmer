"use client";

import { 
  ChevronDown, 
  Globe, 
  LogOut, 
  Settings, 
  ShieldCheck, 
  User,
  Info,
  Lock,
  Share2,
  Building2,
  UserCog,
  LayoutTemplate,
  Search,
  FileText,
  FileBadge,
  Palette,
  Type,
  CreditCard,
  CheckCircle2,
  Mail,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { Badge } from "@/components/ui/badge";

interface UserNavProps {
  userName: string;
  role: string;
}

export function UserNav({ userName, role }: UserNavProps) {
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Signed out successfully");
    window.location.assign("/login");
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-3 rounded-2xl border border-border bg-card/50 p-1.5 pr-4 transition hover:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold leading-none">{userName}</p>
            <p className="mt-1 text-xs text-muted-foreground lowercase">{role}</p>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[260px] overflow-hidden rounded-2xl border border-border bg-popover p-2 shadow-xl animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
          align="end"
          sideOffset={8}
        >
          <div className="px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{userName}!</p>
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-border" />

          {/* 1. Go To Website */}
          <DropdownMenu.Item className="group relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition hover:bg-secondary focus:bg-secondary">
            <Globe className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary" />
            <a href="/" className="flex-1">Go To Website</a>
          </DropdownMenu.Item>

          {/* 2. Profile with Submenu */}
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger className="group relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition hover:bg-secondary focus:bg-secondary">
              <User className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary" />
              <span>My Profile</span>
              <Badge className="ml-3 bg-green-100 text-green-700 hover:bg-green-100 border-none px-1.5 py-0 text-[10px]" variant="outline">New</Badge>
              <ChevronDown className="ml-auto h-4 w-4 -rotate-90 text-muted-foreground" />
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent className="z-50 min-w-[200px] overflow-hidden rounded-2xl border border-border bg-popover p-2 shadow-xl animate-in fade-in-0 zoom-in-95 data-[side=right]:slide-in-from-left-2">
                {[
                  { label: "Info", icon: Info },
                  { label: "Password", icon: Lock },
                  { label: "Social", icon: Share2 },
                  { label: "Bank", icon: Building2 },
                  { label: "Change User ID", icon: UserCog },
                ].map((item) => (
                  <DropdownMenu.Item key={item.label} className="group flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm font-medium outline-none hover:bg-secondary">
                    <item.icon className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    {item.label}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>

          {/* 3. Setting with Submenu */}
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger className="group relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition hover:bg-secondary focus:bg-secondary">
              <Settings className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary" />
              <span>Setting</span>
              <ChevronDown className="ml-auto h-4 w-4 -rotate-90 text-muted-foreground" />
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent className="z-50 min-w-[220px] overflow-hidden rounded-2xl border border-border bg-popover p-2 shadow-xl animate-in fade-in-0 zoom-in-95 data-[side=right]:slide-in-from-left-2">
                {[
                  { label: "Breadcrumb", icon: LayoutTemplate },
                  { label: "SEO", icon: Search },
                  { label: "Invoice", icon: FileText },
                  { label: "Certificate & I-Card", icon: FileBadge },
                  { label: "Colour", icon: Palette },
                  { label: "Font", icon: Type },
                  { label: "Gateway", icon: CreditCard },
                  { label: "Captcha", icon: CheckCircle2 },
                  { label: "Mail Integration", icon: Mail },
                  { label: "Hide Page", icon: EyeOff },
                ].map((item) => (
                  <DropdownMenu.Item key={item.label} className="group flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm font-medium outline-none hover:bg-secondary">
                    <item.icon className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    {item.label}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>

          <DropdownMenu.Separator className="my-1 h-px bg-border" />

          {/* 4. Logout */}
          <DropdownMenu.Item 
            onClick={handleLogout}
            className="group flex cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm font-medium text-destructive outline-none transition hover:bg-destructive/10 focus:bg-destructive/10"
          >
            <LogOut className="mr-3 h-4 w-4 animate-out" />
            Logout
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
