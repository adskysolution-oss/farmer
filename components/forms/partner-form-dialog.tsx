"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function PartnerFormDialog({
  initialValues,
  partnerId,
  triggerLabel = "Add New Partner",
}: {
  initialValues?: {
    name: string;
    mobile: string;
    email?: string | null;
    state: string;
    district: string;
    tehsil: string;
    status: string;
  };
  partnerId?: string;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: initialValues?.name ?? "",
    mobile: initialValues?.mobile ?? "",
    email: initialValues?.email ?? "",
    state: initialValues?.state ?? "",
    district: initialValues?.district ?? "",
    tehsil: initialValues?.tehsil ?? "",
    status: initialValues?.status ?? "ACTIVE",
  });

  const method = partnerId ? "PUT" : "POST";
  const endpoint = partnerId ? `/api/partners/${partnerId}` : "/api/partners";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{partnerId ? "Edit Partner" : "Create Partner"}</DialogTitle>
          <DialogDescription>Manage partner credentials, geography, and account status from the central control panel.</DialogDescription>
        </DialogHeader>
        <form
          className="mt-6 grid gap-4 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            startTransition(async () => {
              const response = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
              });
              const result = await response.json();

              if (!response.ok) {
                toast.error(result.message || "Unable to save partner");
                return;
              }

              toast.success(partnerId ? "Partner updated" : `Partner created. Password: ${result.data.password}`);
              setOpen(false);
              window.location.reload();
            });
          }}
        >
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Mobile</Label>
            <Input value={form.mobile} onChange={(event) => setForm((current) => ({ ...current, mobile: event.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(value) => setForm((current) => ({ ...current, status: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>State</Label>
            <Input value={form.state} onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>District</Label>
            <Input value={form.district} onChange={(event) => setForm((current) => ({ ...current, district: event.target.value }))} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Tehsil</Label>
            <Input value={form.tehsil} onChange={(event) => setForm((current) => ({ ...current, tehsil: event.target.value }))} />
          </div>
          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {partnerId ? "Save Changes" : "Create Partner"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
