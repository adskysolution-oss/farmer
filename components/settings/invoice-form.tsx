"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function InvoiceForm({ initialData }: { initialData: Record<string, string> }) {
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
              { key: "invoice.pan", value: String(data.pan) },
              { key: "invoice.terms", value: String(data.terms) },
            ];
            
            const response = await fetch("/api/settings", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "Invoice", items }),
            });

            if (!response.ok) throw new Error("Failed to save invoice settings");
            toast.success("Invoice settings updated");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to save invoice settings");
          }
        });
      }}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label>PAN Number</Label>
          <Input name="pan" defaultValue={initialData["invoice.pan"]} placeholder="ABCDE1234F" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Terms & Conditions</Label>
          <Textarea name="terms" defaultValue={initialData["invoice.terms"]} className="min-h-[150px]" placeholder="Enter terms and conditions for invoices..." />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="rounded-xl px-8">
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Invoice
        </Button>
      </div>
    </form>
  );
}
