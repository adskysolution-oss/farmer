"use client";

import { useTransition } from "react";
import { KeySquare, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function DeleteEntityButton({
  endpoint,
  label = "Delete",
}: {
  endpoint: string;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const response = await fetch(endpoint, { method: "DELETE" });
          const result = await response.json();
          if (!response.ok) {
            toast.error(result.message || "Delete failed");
            return;
          }
          toast.success(`${label} completed`);
          window.location.reload();
        });
      }}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}

export function ResetPasswordButton({
  endpoint,
}: {
  endpoint: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const response = await fetch(endpoint, { method: "POST" });
          const result = await response.json();
          if (!response.ok) {
            toast.error(result.message || "Password reset failed");
            return;
          }
          toast.success(`New password: ${result.data.password}`);
        });
      }}
    >
      <KeySquare className="mr-2 h-4 w-4" />
      Reset Password
    </Button>
  );
}
