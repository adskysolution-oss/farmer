"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function WithdrawalReviewButtons({ withdrawalId }: { withdrawalId: string }) {
  const [pending, startTransition] = useTransition();

  const update = (status: "APPROVED" | "REJECTED") => {
    startTransition(async () => {
      const response = await fetch(`/api/wallets/withdrawals/${withdrawalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.message || "Unable to update withdrawal");
        return;
      }
      toast.success(`Withdrawal ${status.toLowerCase()}`);
      window.location.reload();
    });
  };

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" disabled={pending} onClick={() => update("APPROVED")}>
        <Check className="mr-2 h-4 w-4" />
        Approve
      </Button>
      <Button size="sm" variant="ghost" disabled={pending} onClick={() => update("REJECTED")}>
        <X className="mr-2 h-4 w-4" />
        Reject
      </Button>
    </div>
  );
}
