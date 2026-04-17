"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type BuilderField = {
  id?: string;
  label: string;
  key: string;
  type: string;
  required: boolean;
  placeholder?: string | null;
  optionsJson?: string | null;
  sortOrder: number;
};

export function FormBuilderEditor({
  form,
}: {
  form: {
    id: string;
    title: string;
    description: string | null;
    paymentEnabled: boolean;
    paymentMandatory: boolean;
    paymentAmountPaise: number;
    fields: BuilderField[];
  };
}) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState({
    title: form.title,
    description: form.description || "",
    paymentEnabled: form.paymentEnabled,
    paymentMandatory: form.paymentMandatory,
    paymentAmountPaise: String(form.paymentAmountPaise),
    fields: form.fields,
  });

  return (
    <form
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const response = await fetch("/api/form-builder", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              formId: form.id,
              title: state.title,
              description: state.description,
              paymentEnabled: state.paymentEnabled,
              paymentMandatory: state.paymentMandatory,
              paymentAmountPaise: Number(state.paymentAmountPaise),
              fields: state.fields,
            }),
          });
          const result = await response.json();
          if (!response.ok) {
            toast.error(result.message || "Unable to update form");
            return;
          }
          toast.success("Form updated");
          window.location.reload();
        });
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Form Title</Label>
          <Input value={state.title} onChange={(event) => setState((current) => ({ ...current, title: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Input value={state.description} onChange={(event) => setState((current) => ({ ...current, description: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Payment Amount (Paise)</Label>
          <Input value={state.paymentAmountPaise} onChange={(event) => setState((current) => ({ ...current, paymentAmountPaise: event.target.value }))} />
        </div>
        <div className="flex items-center gap-6 rounded-2xl border border-border bg-card/70 px-4 py-3 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={state.paymentEnabled} onChange={(event) => setState((current) => ({ ...current, paymentEnabled: event.target.checked }))} /> Payment Enabled</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={state.paymentMandatory} onChange={(event) => setState((current) => ({ ...current, paymentMandatory: event.target.checked }))} /> Mandatory</label>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl font-semibold">Fields</h3>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setState((current) => ({
                ...current,
                fields: [
                  ...current.fields,
                  { label: "", key: "", type: "TEXT", required: false, placeholder: "", optionsJson: "", sortOrder: current.fields.length + 1 },
                ],
              }))
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Field
          </Button>
        </div>
        <div className="space-y-4">
          {state.fields.map((field, index) => (
            <div key={field.id || `${field.key}-${index}`} className="rounded-3xl border border-border bg-card/70 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Label</Label><Input value={field.label} onChange={(event) => setState((current) => ({ ...current, fields: current.fields.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item) }))} /></div>
                <div className="space-y-2"><Label>Key</Label><Input value={field.key} onChange={(event) => setState((current) => ({ ...current, fields: current.fields.map((item, itemIndex) => itemIndex === index ? { ...item, key: event.target.value } : item) }))} /></div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={field.type} onValueChange={(value) => setState((current) => ({ ...current, fields: current.fields.map((item, itemIndex) => itemIndex === index ? { ...item, type: value } : item) }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["TEXT", "NUMBER", "SELECT", "DATE", "TEXTAREA", "FILE", "RADIO", "CHECKBOX"].map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Placeholder / Options</Label><Input value={field.placeholder || field.optionsJson || ""} onChange={(event) => setState((current) => ({ ...current, fields: current.fields.map((item, itemIndex) => itemIndex === index ? { ...item, placeholder: event.target.value } : item) }))} /></div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={field.required} onChange={(event) => setState((current) => ({ ...current, fields: current.fields.map((item, itemIndex) => itemIndex === index ? { ...item, required: event.target.checked } : item) }))} /> Required</label>
                <Button type="button" variant="ghost" size="sm" onClick={() => setState((current) => ({ ...current, fields: current.fields.filter((_, itemIndex) => itemIndex !== index) }))}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Form Builder
        </Button>
      </div>
    </form>
  );
}
