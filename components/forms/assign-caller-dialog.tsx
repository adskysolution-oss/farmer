"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function AssignCallerDialog({ applicationId, callers, currentCallerId }: { applicationId: string; callers: Array<{ id: string, label: string }>; currentCallerId?: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleAssign = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const callerId = new FormData(e.currentTarget).get("callerId") as string;
    
    startTransition(async () => {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callerId: callerId || null }),
      });
      if (!response.ok) {
        toast.error("Failed to assign caller");
        return;
      }
      toast.success("Caller assigned");
      setOpen(false);
      window.location.reload();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Assign Caller</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign to Caller</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAssign} className="space-y-4">
          <div className="space-y-2">
            <Label>Select Caller</Label>
            <select name="callerId" defaultValue={currentCallerId || ""} className="w-full rounded-2xl border border-border bg-card px-4 py-2 h-11 text-sm">
              <option value="">Unassigned</option>
              {callers.map(caller => (
                <option key={caller.id} value={caller.id}>{caller.label}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={pending} className="rounded-xl">
              {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Assign
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
