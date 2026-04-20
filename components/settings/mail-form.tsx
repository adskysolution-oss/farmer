"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MailForm({ initialData }: { initialData: Record<string, string> }) {
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
              { key: "mail.main", value: String(data["mail.main"]) },
              { key: "mail.member", value: String(data["mail.member"]) },
              { key: "mail.volunteer", value: String(data["mail.volunteer"]) },
              { key: "mail.internship", value: String(data["mail.internship"]) },
              { key: "mail.user", value: String(data["mail.user"]) },
              { key: "mail.event", value: String(data["mail.event"]) },
              { key: "mail.donation", value: String(data["mail.donation"]) },
            ];
            
            const response = await fetch("/api/settings", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "Mail", items }),
            });

            if (!response.ok) throw new Error("Failed to save mail settings");
            toast.success("Mail settings updated");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to save mail settings");
          }
        });
      }}
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Main Mail Integration", key: "mail.main" },
          { label: "Member Email", key: "mail.member" },
          { label: "Volunteer Email", key: "mail.volunteer" },
          { label: "Internship Email", key: "mail.internship" },
          { label: "User Email", key: "mail.user" },
          { label: "Event Email", key: "mail.event" },
          { label: "Donation Email", key: "mail.donation" },
        ].map((item) => (
          <div key={item.key} className="space-y-2">
            <Label>{item.label}</Label>
            <Input name={item.key} defaultValue={initialData[item.key] || ""} placeholder="sender@example.com" />
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="rounded-xl px-8">
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Mail Settings
        </Button>
      </div>
    </form>
  );
}
