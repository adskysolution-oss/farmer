"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileUserId } from "@/lib/services/admin/profile-shared";

export function UserIdForm({ initialData }: { initialData: { name: string; email: string | null } }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = String(formData.get("userName"));
        const email = String(formData.get("userEmail"));
        
        startTransition(async () => {
          try {
            profileUserId.validateUserEmail(email);
            profileUserId.validateUserName(name);
            
            const response = await fetch("/api/admin/profile/userid", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name, email }),
            });

            if (!response.ok) throw new Error("Failed to update User ID");
            toast.success("User identity updated");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to update user identity");
          }
        });
      }}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label>User Email</Label>
          <Input name="userEmail" defaultValue={initialData.email || ""} placeholder="admin@example.com" />
        </div>
        <div className="space-y-2">
          <Label>User Name</Label>
          <Input name="userName" defaultValue={initialData.name} placeholder="Admin Name" />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="rounded-xl px-8">
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Update Identity
        </Button>
      </div>
    </form>
  );
}
