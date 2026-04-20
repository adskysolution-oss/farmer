"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CaptchaForm({ initialData }: { initialData: Record<string, string> }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);
        
        startTransition(async () => {
          try {
            const items = [
              { key: "captcha.siteKey", value: String(data.siteKey) },
              { key: "captcha.secretKey", value: String(data.secretKey) },
            ];
            
            const response = await fetch("/api/settings", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "Captcha", items }),
            });

            if (!response.ok) throw new Error("Failed to save captcha settings");
            toast.success("Captcha settings updated");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to save captcha settings");
          }
        });
      }}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Recaptcha Site Key</Label>
          <Input name="siteKey" defaultValue={initialData["captcha.siteKey"]} placeholder="Enter site key" />
        </div>
        <div className="space-y-2">
          <Label>Recaptcha Secret Key</Label>
          <Input name="secretKey" type="password" defaultValue={initialData["captcha.secretKey"]} placeholder="••••••••" />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="rounded-xl px-8">
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Captcha
        </Button>
      </div>
    </form>
  );
}
