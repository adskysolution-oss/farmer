"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function HidePageForm({ initialData }: { initialData: Record<string, string> }) {
  const [pending, startTransition] = useTransition();

  const pages = [
    { label: "About", key: "hide.about" },
    { label: "Testimonial", key: "hide.testimonial" },
    { label: "Campaign", key: "hide.campaign" },
    { label: "Member Designation", key: "hide.memberDesignation" },
    { label: "Internship", key: "hide.internship" },
    { label: "Team", key: "hide.team" },
    { label: "Complaint", key: "hide.complaint" },
    { label: "Donor", key: "hide.donor" },
    { label: "User", key: "hide.user" },
    { label: "Pledge", key: "hide.pledge" },
    { label: "Authorization", key: "hide.auth" },
    { label: "Complaint Status", key: "hide.complaintStatus" },
    { label: "Member", key: "hide.member" },
    { label: "Volunteer", key: "hide.volunteer" },
    { label: "Highlights", key: "hide.highlights" },
    { label: "FAQ", key: "hide.faq" },
    { label: "Work", key: "hide.work" },
    { label: "Member List", key: "hide.memberList" },
    { label: "Volunteer List", key: "hide.volunteerList" },
    { label: "Blog", key: "hide.blog" },
  ];

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        
        startTransition(async () => {
          try {
            // Collecting toggle states directly from the Radix switch attributes or the name mapping
            const items = pages.map((page) => {
              // Radix Switches with a name attribute will have a corresponding button in the form
              // We check the 'data-state' attribute which Radix uses
              const button = form.querySelector(`button[name="${page.key}"]`);
              const isChecked = button?.getAttribute("data-state") === "checked";
              
              // If checked (Visible), then 'hide' is false
              return { key: page.key, value: String(!isChecked) };
            });
            
            const response = await fetch("/api/settings", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "Visibility", items }),
            });

            if (!response.ok) throw new Error("Failed to save visibility settings");
            toast.success("Page visibility updated");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to save visibility settings");
          }
        });
      }}
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {pages.map((page) => (
          <div key={page.key} className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 p-4">
            <Label className="text-sm font-medium">{page.label}</Label>
            <Switch 
              name={page.key}
              defaultChecked={initialData[page.key] !== "true"} 
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="rounded-xl px-8">
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Page Visibility
        </Button>
      </div>
    </form>
  );
}
