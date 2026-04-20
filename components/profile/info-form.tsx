"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileInfo } from "@/lib/services/admin/profile-shared";

export function InfoForm({ initialData }: { initialData: Record<string, string> }) {
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
            profileInfo.validateProfileInfo(data);
            const items = [
              profileInfo.updateFirmName(String(data.firmName)),
              profileInfo.updateEmailAddress1(String(data.email1)),
              profileInfo.updateEmailAddress2(String(data.email2)),
              profileInfo.updateEmailAddress3(String(data.email3)),
              profileInfo.updateMobile(String(data.mobile)),
              profileInfo.updateAddress(String(data.address)),
              profileInfo.updatePrefix(String(data.prefix)),
            ];
            
            // In a real app, this would be a server action
            const response = await fetch("/api/admin/profile", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "info", items }),
            });

            if (!response.ok) throw new Error("Failed to save profile info");
            toast.success("Profile information updated");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to save profile information");
          }
        });
      }}
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-1">
          <Label>Firm Name *</Label>
          <Input name="firmName" defaultValue={initialData["info.firmName"]} placeholder="Enter firm name" />
        </div>
        <div className="space-y-2">
          <Label>Email Address 1</Label>
          <Input name="email1" defaultValue={initialData["info.email1"]} placeholder="primary@email.com" />
        </div>
        <div className="space-y-2">
          <Label>Email Address 2</Label>
          <Input name="email2" defaultValue={initialData["info.email2"]} placeholder="secondary@email.com" />
        </div>
        <div className="space-y-2">
          <Label>Email Address 3</Label>
          <Input name="email3" defaultValue={initialData["info.email3"]} placeholder="support@email.com" />
        </div>
        <div className="space-y-2">
          <Label>Mobile</Label>
          <Input name="mobile" defaultValue={initialData["info.mobile"]} placeholder="8240090675" />
        </div>
        <div className="space-y-2">
          <Label>Prefix</Label>
          <Input name="prefix" defaultValue={initialData["info.prefix"]} placeholder="lifeline/" />
        </div>
        <div className="space-y-2 md:col-span-2 lg:col-span-3">
          <Label>Address</Label>
          <Input name="address" defaultValue={initialData["info.address"]} placeholder="Enter full address" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Profile Image</Label>
          <Input type="file" />
          <p className="text-[10px] text-muted-foreground mt-1">File type allowed: jpg, jpeg, png, webp. (px size : 250*150)</p>
        </div>
        <div className="space-y-2">
          <Label>Logo</Label>
          <Input type="file" />
          <p className="text-[10px] text-muted-foreground mt-1">File type allowed: jpg, jpeg, png, webp. (px size : 250*150)</p>
        </div>
        <div className="space-y-2">
          <Label>Favicon Icon</Label>
          <Input type="file" />
          <p className="text-[10px] text-muted-foreground mt-1">File type allowed: jpg, jpeg, png, webp. (px size : 64*64)</p>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={pending} className="rounded-xl px-8">
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Info
        </Button>
      </div>
    </form>
  );
}
