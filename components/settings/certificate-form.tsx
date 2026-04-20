"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CertificateAndICardForm({ initialData }: { initialData: Record<string, string> }) {
  void initialData;
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          try {
            // File upload logic would go here
            toast.success("Certificate settings updated (Placeholders used)");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to save certificate settings");
          }
        });
      }}
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Volunteer Certificate", key: "cert.volunteer" },
          { label: "Internship Certificate", key: "cert.internship" },
          { label: "Member/Volunteer ID Card", key: "cert.idcard" },
          { label: "Event Certificate", key: "cert.event" },
          { label: "Blood Donation Certificate", key: "cert.blood" },
          { label: "Director Signature", key: "cert.signature" },
        ].map((item) => (
          <div key={item.key} className="space-y-2">
            <Label>{item.label}</Label>
            <Input type="file" />
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="rounded-xl px-8">
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Certificates
        </Button>
      </div>
    </form>
  );
}
