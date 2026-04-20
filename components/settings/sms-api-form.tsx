"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SmsApiForm({ initialData }: { initialData: Record<string, string> }) {
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
              { key: "sms.provider", value: String(data.provider) },
              { key: "sms.apiKey", value: String(data.apiKey) },
              { key: "sms.senderId", value: String(data.senderId) },
            ];
            
            const response = await fetch("/api/settings", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "SMS", items }),
            });

            if (!response.ok) throw new Error("Failed to save SMS settings");
            toast.success("SMS configuration updated");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to save SMS settings");
          }
        });
      }}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>SMS Provider</Label>
          <select name="provider" defaultValue={initialData["sms.provider"] || "FAST2SMS"} className="w-full rounded-2xl border border-border bg-card px-4 py-2 h-11 text-sm">
            <option value="FAST2SMS">Fast2SMS</option>
            <option value="TWILIO">Twilio</option>
            <option value="MSG91">MSG91</option>
          </select>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>API Key / Auth Token</Label>
            <Input name="apiKey" type="password" defaultValue={initialData["sms.apiKey"]} placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label>Sender ID</Label>
            <Input name="senderId" defaultValue={initialData["sms.senderId"]} placeholder="ADSKYS" />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="rounded-xl px-8">
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save SMS Settings
        </Button>
      </div>
    </form>
  );
}
