"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileBank } from "@/lib/services/admin/profile-shared";

export function BankForm({ initialData }: { initialData: Record<string, string> }) {
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
            profileBank.validateBankDetails(data);
            const items = [
              profileBank.updateAccountHolderName(String(data.holderName)),
              profileBank.updateBankName(String(data.bankName)),
              profileBank.updateAccountNumber(String(data.accountNumber)),
              profileBank.updateIFSCCode(String(data.ifsc)),
              profileBank.updateBranchAddress(String(data.branch)),
            ];
            
            const response = await fetch("/api/admin/profile", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "bank", items }),
            });

            if (!response.ok) throw new Error("Failed to save bank details");
            toast.success("Bank details updated");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to save bank details");
          }
        });
      }}
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label>Account Holder Name</Label>
          <Input name="holderName" defaultValue={initialData["bank.holderName"]} placeholder="Enter name" />
        </div>
        <div className="space-y-2">
          <Label>Bank Name</Label>
          <Input name="bankName" defaultValue={initialData["bank.bankName"]} placeholder="Enter bank name" />
        </div>
        <div className="space-y-2">
          <Label>Account Number</Label>
          <Input name="accountNumber" defaultValue={initialData["bank.accountNumber"]} placeholder="Enter account number" />
        </div>
        <div className="space-y-2">
          <Label>IFSC Code</Label>
          <Input name="ifsc" defaultValue={initialData["bank.ifsc"]} placeholder="IFSC" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Branch Address</Label>
          <Input name="branch" defaultValue={initialData["bank.branch"]} placeholder="Enter branch address" />
        </div>
        <div className="space-y-2">
          <Label>QR Image</Label>
          <Input type="file" />
          <p className="text-[10px] text-muted-foreground mt-1">Upload your bank QR code image.</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="rounded-xl px-8">
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Bank Info
        </Button>
      </div>
    </form>
  );
}
