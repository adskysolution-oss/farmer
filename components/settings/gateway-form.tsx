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
              { key: "gateway.active", value: String(data.activeGateway) },
              { key: "gateway.razorpayKey", value: String(data.razorpayKey) },
              { key: "gateway.razorpaySecret", value: String(data.razorpaySecret) },
              { key: "gateway.phonepeKey", value: String(data.phonepeKey) },
              { key: "gateway.phonepeMerchantId", value: String(data.phonepeMerchantId) },
              { key: "gateway.kesariKey", value: String(data.kesariKey) },
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
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Active Gateway</Label>
          <select name="activeGateway" defaultValue={initialData["gateway.active"] || "RAZORPAY"} className="w-full rounded-2xl border border-border bg-card px-4 py-2 h-11 text-sm">
            <option value="RAZORPAY">Razorpay</option>
            <option value="PHONEPE">PhonePe</option>
            <option value="KESARI">Kesari Custom Gateway</option>
          </select>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 p-6 border border-border rounded-2xl bg-secondary/20">
          <div className="space-y-2 md:col-span-2"><h3 className="font-semibold">Razorpay Configuration</h3></div>
          <div className="space-y-2">
            <Label>Razorpay Key</Label>
            <Input name="razorpayKey" defaultValue={initialData["gateway.razorpayKey"]} placeholder="rzp_test_..." />
          </div>
          <div className="space-y-2">
            <Label>Razorpay Secret</Label>
            <Input name="razorpaySecret" type="password" defaultValue={initialData["gateway.razorpaySecret"]} placeholder="••••••••" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 p-6 border border-border rounded-2xl bg-secondary/20">
          <div className="space-y-2 md:col-span-2"><h3 className="font-semibold">PhonePe Configuration</h3></div>
          <div className="space-y-2">
            <Label>PhonePe Key / Salt</Label>
            <Input name="phonepeKey" defaultValue={initialData["gateway.phonepeKey"]} placeholder="099..." />
          </div>
          <div className="space-y-2">
            <Label>Merchant ID</Label>
            <Input name="phonepeMerchantId" defaultValue={initialData["gateway.phonepeMerchantId"]} placeholder="MUID..." />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 p-6 border border-border rounded-2xl bg-secondary/20">
          <div className="space-y-2 md:col-span-2"><h3 className="font-semibold">Kesari Configuration</h3></div>
          <div className="space-y-2 md:col-span-2">
            <Label>Kesari API Key</Label>
            <Input name="kesariKey" defaultValue={initialData["gateway.kesariKey"]} placeholder="ks_..." />
          </div>
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
