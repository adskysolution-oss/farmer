"use client";

import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        toast.success("Signed out");
        window.location.assign("/login");
      }}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  );
}
