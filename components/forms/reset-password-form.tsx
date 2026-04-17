"use client";

import { useMemo, useState, useTransition } from "react";
import { Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [pending, startTransition] = useTransition();
  const hasToken = useMemo(() => Boolean(token), [token]);

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const response = await fetch("/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password }),
          });
          const result = await response.json();

          if (!response.ok) {
            toast.error(result.message || "Unable to reset password");
            return;
          }

          toast.success("Password updated. Please sign in.");
          window.location.assign("/login");
        });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <div className="relative">
          <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="password" type="password" className="pl-11" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Choose a strong password" />
        </div>
      </div>
      <Button className="w-full" size="lg" disabled={pending || !hasToken}>
        {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Update Password
      </Button>
    </form>
  );
}
