"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FormField = {
  id: string;
  label: string;
  key: string;
  type: string;
  required: boolean;
  placeholder: string | null;
  optionsJson: string | null;
};

export function PublicApplicationForm({
  title,
  description,
  paymentEnabled,
  paymentMandatory,
  paymentAmountPaise,
  fields,
}: {
  title: string;
  description?: string | null;
  paymentEnabled: boolean;
  paymentMandatory: boolean;
  paymentAmountPaise: number;
  fields: FormField[];
}) {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<Record<string, string>>({});

  const renderField = (field: FormField) => {
    const commonProps = {
      value: form[field.key] || "",
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm((current) => ({ ...current, [field.key]: event.target.value })),
      placeholder: field.placeholder || "",
      required: field.required,
    };

    if (field.type === "TEXTAREA") {
      return <Textarea {...commonProps} />;
    }

    if (field.type === "SELECT" || field.type === "RADIO") {
      const options = field.optionsJson
        ? (() => {
            try {
              return JSON.parse(field.optionsJson) as string[];
            } catch {
              return [];
            }
          })()
        : [];
      return (
        <select
          {...commonProps}
          className="flex h-11 w-full rounded-2xl border border-border bg-white/70 px-4 py-2 text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-slate-950/50"
        >
          <option value="">Select {field.label}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    return <Input {...commonProps} type={field.type === "NUMBER" ? "number" : "text"} />;
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const formData = new FormData();
          Object.entries(form).forEach(([key, value]) => formData.append(key, value));

          const response = await fetch("/api/payments/create-order", {
            method: "POST",
            body: formData,
          });
          const result = await response.json();
          if (!response.ok) {
            toast.error(result.message || "Unable to submit application");
            return;
          }

          if (result.data.gatewayConfigured) {
            toast.success("Application submitted. Payment order created.");
          } else {
            toast.warning("Application saved, but no payment gateway is configured yet.");
          }
        });
      }}
    >
      <div>
        <h2 className="font-display text-3xl font-semibold">{title}</h2>
        {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <div key={field.id} className={field.type === "TEXTAREA" ? "space-y-2 md:col-span-2" : "space-y-2"}>
            <Label>{field.label}</Label>
            {renderField(field)}
          </div>
        ))}
      </div>
      <div className="rounded-3xl border border-border bg-card/70 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Payment Control</p>
            <p className="text-sm text-muted-foreground">
              {paymentEnabled ? `This application currently requires a payment of INR ${(paymentAmountPaise / 100).toFixed(2)}.` : "Payment is currently disabled for this form."}
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl font-semibold">₹{(paymentAmountPaise / 100).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{paymentMandatory ? "Mandatory" : "Optional"}</p>
          </div>
        </div>
      </div>
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Submit Application
      </Button>
    </form>
  );
}
