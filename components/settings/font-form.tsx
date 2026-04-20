"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FontForm({ initialData }: { initialData: Record<string, string> }) {
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
              { key: "font.body", value: String(data["font.body"]) },
              { key: "font.heading", value: String(data["font.heading"]) },
              { key: "font.paragraph", value: String(data["font.paragraph"]) },
              { key: "font.sectionHeading", value: String(data["font.sectionHeading"]) },
              { key: "font.sectionParagraph", value: String(data["font.sectionParagraph"]) },
            ];
            
            const response = await fetch("/api/settings", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "Font", items }),
            });

            if (!response.ok) throw new Error("Failed to save font settings");
            toast.success("Font settings updated");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to save font settings");
          }
        });
      }}
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Body Font", key: "font.body" },
          { label: "Heading Tag Font", key: "font.heading" },
          { label: "Paragraph Tag Font", key: "font.paragraph" },
          { label: "Heading Section Tag Font", key: "font.sectionHeading" },
          { label: "Paragraph Section Tag Font", key: "font.sectionParagraph" },
        ].map((item) => (
          <div key={item.key} className="space-y-2">
            <Label>{item.label}</Label>
            <Input name={item.key} defaultValue={initialData[item.key] || ""} placeholder="e.g. 'Inter', sans-serif" />
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="rounded-xl px-8">
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Fonts
        </Button>
      </div>
    </form>
  );
}
