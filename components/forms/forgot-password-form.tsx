"use client";

import { useState, useTransition } from "react";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [identifier, setIdentifier] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const response = await fetch("/api/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier }),
          });
          const result = await response.json();

          if (!response.ok) {
            toast.error(result.message || "Unable to process request");
            return;
          }

          toast.success(result.data?.message || "Reset link created");
          if (result.data?.resetUrl) {
            toast.info(`Development reset link: ${result.data.resetUrl}`);
          }
        });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="identifier">Mobile Number or Email</Label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="identifier" className="pl-11" value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="Enter registered contact" />
        </div>
      </div>
      <Button className="w-full" size="lg" disabled={pending}>
        {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Send Reset Link
      </Button>
    </form>
  );
}
