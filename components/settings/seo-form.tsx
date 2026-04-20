"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SEOForm({ initialData }: { initialData: Record<string, string> }) {
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
              { key: "seo.domain", value: String(data.domain) },
              { key: "seo.title", value: String(data.title) },
              { key: "seo.keyword", value: String(data.keyword) },
              { key: "seo.description", value: String(data.description) },
            ];
            
            const response = await fetch("/api/settings", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "SEO", items }),
            });

            if (!response.ok) throw new Error("Failed to save SEO settings");
            toast.success("SEO settings updated");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to save SEO settings");
          }
        });
      }}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Domain Name</Label>
          <Input name="domain" defaultValue={initialData["seo.domain"]} placeholder="example.com" />
        </div>
        <div className="space-y-2">
          <Label>Meta Title</Label>
          <Input name="title" defaultValue={initialData["seo.title"]} placeholder="Enter site title" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Meta Keyword</Label>
          <Input name="keyword" defaultValue={initialData["seo.keyword"]} placeholder="NGO, Welfare, Society, etc." />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Meta Description</Label>
          <Textarea name="description" defaultValue={initialData["seo.description"]} placeholder="Enter meta description..." />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="rounded-xl px-8">
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save SEO
        </Button>
      </div>
    </form>
  );
}
