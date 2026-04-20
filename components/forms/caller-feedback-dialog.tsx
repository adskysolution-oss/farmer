"use client";

import { useState, useTransition } from "react";
import { Loader2, PhoneCall } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function CallerFeedbackDialog({ applicationId }: { applicationId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    startTransition(async () => {
      const response = await fetch(`/api/applications/${applicationId}/calls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        toast.error("Failed to add feedback");
        return;
      }
      toast.success("Feedback added successfully");
      setOpen(false);
      window.location.reload();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="hidden xl:flex text-primary">
          <PhoneCall className="mr-2 h-4 w-4" />
          Feedback
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Call Feedback</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Connection Status</Label>
              <select name="connectionStatus" required className="w-full rounded-2xl border border-border bg-card px-4 py-2 h-11 text-sm">
                <option value="CONNECTED">Connected</option>
                <option value="NOT_CONNECTED">Not Connected</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Interest Level</Label>
              <select name="interestStatus" required className="w-full rounded-2xl border border-border bg-card px-4 py-2 h-11 text-sm">
                <option value="INTERESTED">Interested</option>
                <option value="NOT_INTERESTED">Not Interested</option>
                <option value="DOCUMENTS_PENDING">Documents Pending</option>
                <option value="FOLLOW_UP">Follow Up</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Follow Up Date</Label>
            <input type="datetime-local" name="followUpDate" className="w-full rounded-2xl border border-border bg-card px-4 py-2 h-11 text-sm" />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <textarea name="notes" className="w-full rounded-2xl border border-border bg-card px-4 py-2 text-sm" rows={3} placeholder="Add your feedback..." />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={pending} className="rounded-xl">
              {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Submit Feedback
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
