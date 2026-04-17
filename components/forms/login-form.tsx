"use client";

import { useState, useTransition } from "react";
import { Loader2, Lock, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ redirectTo = "/dashboard" }: { redirectTo?: string }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier, password }),
          });

          const result = await response.json();
          if (!response.ok) {
            toast.error(result.message || "Unable to sign in");
            return;
          }

          toast.success("Signed in successfully");
          window.location.assign(redirectTo);
        });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="identifier">Mobile Number or Email</Label>
        <div className="relative">
          <UserRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="identifier" className="pl-11" value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="9999999999 or admin@example.com" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <a href="/forgot-password" className="text-sm font-medium text-primary">
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="password" type="password" className="pl-11" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter secure password" />
        </div>
      </div>
      <Button className="w-full" size="lg" disabled={pending}>
        {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Access Control Center
      </Button>
    </form>
  );
}
