"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profilePassword } from "@/lib/services/admin/profile-shared";

export function PasswordForm() {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const oldPass = String(formData.get("oldPassword"));
        const newPass = String(formData.get("newPassword"));
        const confirmPass = String(formData.get("confirmPassword"));

        startTransition(async () => {
          try {
            profilePassword.validatePasswordStrength(newPass);
            profilePassword.validatePasswordMatch(newPass, confirmPass);
            
            const response = await fetch("/api/admin/profile/password", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ oldPass, newPass }),
            });

            if (!response.ok) {
              const result = await response.json();
              throw new Error(result.message || "Failed to change password");
            }
            
            toast.success("Password updated successfully");
            (e.target as HTMLFormElement).reset();
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to update password");
          }
        });
      }}
    >
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Old Password *</Label>
          <Input name="oldPassword" type="password" placeholder="Enter current password" required />
        </div>
        <div className="space-y-2">
          <Label>New Password *</Label>
          <Input name="newPassword" type="password" placeholder="Enter new password" required />
        </div>
        <div className="space-y-2">
          <Label>Confirm Password *</Label>
          <Input name="confirmPassword" type="password" placeholder="Confirm new password" required />
        </div>
      </div>
      <div className="flex justify-start">
        <Button type="submit" disabled={pending} className="rounded-xl bg-emerald-500 px-8 hover:bg-emerald-600">
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Change Password
        </Button>
      </div>
    </form>
  );
}
