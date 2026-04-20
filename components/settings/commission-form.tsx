"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CommissionForm({ initialData }: { initialData: Record<string, string> }) {
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
              { key: "commission.adminShare", value: String(data.adminShare) },
              { key: "commission.partnerShare", value: String(data.partnerShare) },
              { key: "commission.employeeShare", value: String(data.employeeShare) },
              { key: "commission.fixedSalary", value: String(data.fixedSalary) },
            ];
            
            const response = await fetch("/api/settings", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "Commission", items }),
            });

            if (!response.ok) throw new Error("Failed to save commission settings");
            toast.success("Commission strategy updated");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to save commission settings");
          }
        });
      }}
    >
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Admin Share (%)</Label>
          <Input name="adminShare" type="number" defaultValue={initialData["commission.adminShare"] || "40"} placeholder="40" />
        </div>
        <div className="space-y-2">
          <Label>Partner Share (%)</Label>
          <Input name="partnerShare" type="number" defaultValue={initialData["commission.partnerShare"] || "35"} placeholder="35" />
        </div>
        <div className="space-y-2">
          <Label>Employee Share (%)</Label>
          <Input name="employeeShare" type="number" defaultValue={initialData["commission.employeeShare"] || "25"} placeholder="25" />
        </div>
      </div>
      <div className="space-y-2 max-w-sm">
        <Label>Fixed Base Salary (₹)</Label>
        <Input name="fixedSalary" type="number" defaultValue={initialData["commission.fixedSalary"] || "0"} placeholder="15000" />
        <p className="text-xs text-muted-foreground">Fixed payout irrespective of leads tracking.</p>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="rounded-xl px-8">
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Commission
        </Button>
      </div>
    </form>
  );
}
