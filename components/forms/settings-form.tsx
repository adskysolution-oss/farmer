"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Gateway = {
  id: string;
  gateway: string;
  enabled: boolean;
  keyId: string | null;
  secretKey: string | null;
  merchantId: string | null;
  saltKey: string | null;
  saltIndex: string | null;
  endpointUrl: string | null;
  successUrl: string | null;
  failureUrl: string | null;
  webhookSecret: string | null;
};

export function SettingsForm({
  settings,
  gateways,
}: {
  settings: Record<string, string>;
  gateways: Gateway[];
}) {
  const [pending, startTransition] = useTransition();
  const [settingState, setSettingState] = useState(settings);
  const [gatewayState, setGatewayState] = useState(gateways);

  return (
    <form
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const response = await fetch("/api/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              settings: settingState,
              gateways: gatewayState,
            }),
          });
          const result = await response.json();
          if (!response.ok) {
            toast.error(result.message || "Unable to save settings");
            return;
          }
          toast.success("Settings updated");
          window.location.reload();
        });
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["brand.companyName", "Company Name"],
          ["brand.logoUrl", "Logo URL"],
          ["theme.primary", "Primary Theme Color"],
          ["theme.accent", "Accent Theme Color"],
          ["smtp.host", "SMTP Host"],
          ["smtp.user", "SMTP User"],
          ["smtp.from", "SMTP From"],
          ["sms.baseUrl", "SMS API Base URL"],
          ["sms.apiKey", "SMS API Key"],
          ["whatsapp.baseUrl", "WhatsApp API Base URL"],
          ["whatsapp.apiKey", "WhatsApp API Key"],
        ].map(([key, label]) => (
          <div key={key} className="space-y-2">
            <Label>{label}</Label>
            <Input value={settingState[key] || ""} onChange={(event) => setSettingState((current) => ({ ...current, [key]: event.target.value }))} />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="font-display text-2xl font-semibold">Payment Gateways</h3>
        <div className="grid gap-4">
          {gatewayState.map((gateway, index) => (
            <div key={gateway.id} className="rounded-3xl border border-border bg-card/70 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{gateway.gateway}</p>
                  <p className="text-sm text-muted-foreground">Configure credentials and switch availability instantly.</p>
                </div>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={gateway.enabled}
                    onChange={(event) =>
                      setGatewayState((current) =>
                        current.map((item, itemIndex) => (itemIndex === index ? { ...item, enabled: event.target.checked } : item)),
                      )
                    }
                  />
                  Enabled
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ["keyId", "Key ID"],
                  ["secretKey", "Secret Key"],
                  ["merchantId", "Merchant ID"],
                  ["saltKey", "Salt Key"],
                  ["saltIndex", "Salt Index"],
                  ["endpointUrl", "Endpoint URL"],
                  ["successUrl", "Success URL"],
                  ["failureUrl", "Failure URL"],
                  ["webhookSecret", "Webhook Secret"],
                ].map(([field, label]) => (
                  <div key={field} className="space-y-2">
                    <Label>{label}</Label>
                    <Input
                      value={(gateway as unknown as Record<string, string | boolean | null>)[field] as string | undefined}
                      onChange={(event) =>
                        setGatewayState((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, [field]: event.target.value } : item,
                          ),
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Settings
        </Button>
      </div>
    </form>
  );
}
