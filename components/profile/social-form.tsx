"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileSocial } from "@/lib/services/admin/profile-shared";

export function SocialForm({ initialData }: { initialData: Record<string, string> }) {
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
            profileSocial.validateSocialLinks(data);
            const items = [
              profileSocial.updateFacebookLink(String(data.facebook)),
              profileSocial.updateInstagramLink(String(data.instagram)),
              profileSocial.updateYoutubeLink(String(data.youtube)),
              profileSocial.updateTwitterLink(String(data.twitter)),
              profileSocial.updateLinkedinLink(String(data.linkedin)),
              profileSocial.updateWhatsappNumber(String(data.whatsapp)),
            ];
            
            const response = await fetch("/api/admin/profile", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: "social", items }),
            });

            if (!response.ok) throw new Error("Failed to save social info");
            toast.success("Social links updated");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to save social links");
          }
        });
      }}
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label>Facebook Link</Label>
          <Input name="facebook" defaultValue={initialData["social.facebook"]} placeholder="https://facebook.com/..." />
        </div>
        <div className="space-y-2">
          <Label>Instagram</Label>
          <Input name="instagram" defaultValue={initialData["social.instagram"]} placeholder="https://instagram.com/..." />
        </div>
        <div className="space-y-2">
          <Label>YouTube</Label>
          <Input name="youtube" defaultValue={initialData["social.youtube"]} placeholder="https://youtube.com/..." />
        </div>
        <div className="space-y-2">
          <Label>Twitter</Label>
          <Input name="twitter" defaultValue={initialData["social.twitter"]} placeholder="https://twitter.com/..." />
        </div>
        <div className="space-y-2">
          <Label>LinkedIn</Label>
          <Input name="linkedin" defaultValue={initialData["social.linkedin"]} placeholder="https://linkedin.com/..." />
        </div>
        <div className="space-y-2">
          <Label>WhatsApp Number</Label>
          <Input name="whatsapp" defaultValue={initialData["social.whatsapp"]} placeholder="+91..." />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="rounded-xl px-8">
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Social Info
        </Button>
      </div>
    </form>
  );
}
