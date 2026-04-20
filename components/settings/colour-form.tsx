"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ColourForm({ initialData }: { initialData: Record<string, string> }) {
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
              { label: "Theme Primary Colour", key: "color.primary" },
              { label: "Theme Secondary Colour", key: "color.secondary" },
              { label: "Top Bar Background Colour", key: "color.topbarBg" },
              { label: "Top Bar Text Colour", key: "color.topbarText" },
              { label: "Header Text Colour", key: "color.headerText" },
              { label: "H Colour", key: "color.heading" },
              { label: "P Colour", key: "color.paragraph" },
              { label: "Button Background", key: "color.btnBg" },
              { label: "Button Hover", key: "color.btnHover" },
              { label: "Section Colour", key: "color.section" },
              { label: "Footer Colour", key: "color.footer" },
              { label: "Scroll Top Colour", key: "color.scrollTop" },
            ].map((item) => ({ key: item.key, value: String(data[item.key]) }));
            
            const response = await fetch("/api/settings", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "Colour", items }),
            });

            if (!response.ok) throw new Error("Failed to save colour settings");
            toast.success("Colour settings updated");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to save colour settings");
          }
        });
      }}
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[
          { label: "Theme Primary Colour", key: "color.primary" },
          { label: "Theme Secondary Colour", key: "color.secondary" },
          { label: "Top Bar Background Colour", key: "color.topbarBg" },
          { label: "Top Bar Text Colour", key: "color.topbarText" },
          { label: "Header Text Colour", key: "color.headerText" },
          { label: "H Colour", key: "color.heading" },
          { label: "P Colour", key: "color.paragraph" },
          { label: "Button Background", key: "color.btnBg" },
          { label: "Button Hover", key: "color.btnHover" },
          { label: "Section Colour", key: "color.section" },
          { label: "Footer Colour", key: "color.footer" },
          { label: "Scroll Top Colour", key: "color.scrollTop" },
        ].map((item) => (
          <div key={item.key} className="space-y-2">
            <Label>{item.label}</Label>
            <div className="flex gap-2">
              <Input name={item.key} type="color" defaultValue={initialData[item.key] || "#000000"} className="w-12 p-1 h-9 rounded-lg" />
              <Input name={`${item.key}_text`} defaultValue={initialData[item.key] || "#000000"} className="flex-1" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="rounded-xl px-8">
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Colours
        </Button>
      </div>
    </form>
  );
}
