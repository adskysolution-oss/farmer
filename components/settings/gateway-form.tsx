"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function GatewayForm({ initialData }: { initialData: Record<string, string> }) {
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
              { key: "gateway.razorpayKey", value: String(data.razorpayKey) },
              { key: "gateway.razorpaySecret", value: String(data.razorpaySecret) },
            ];
            
            const response = await fetch("/api/settings", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "Gateway", items }),
            });

            if (!response.ok) throw new Error("Failed to save gateway settings");
            toast.success("Gateway settings updated");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to save gateway settings");
          }
        });
      }}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Razorpay Key</Label>
          <Input name="razorpayKey" defaultValue={initialData["gateway.razorpayKey"]} placeholder="rzp_test_..." />
        </div>
        <div className="space-y-2">
          <Label>Razorpay Secret</Label>
          <Input name="razorpaySecret" type="password" defaultValue={initialData["gateway.razorpaySecret"]} placeholder="••••••••" />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="rounded-xl px-8">
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Gateway
        </Button>
      </div>
    </form>
  );
}
