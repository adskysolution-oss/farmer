"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PartnerOption = { id: string; label: string };

export function EmployeeFormDialog({
  partners,
  employeeId,
  initialValues,
  triggerLabel = "Add Employee",
}: {
  partners: PartnerOption[];
  employeeId?: string;
  triggerLabel?: string;
  initialValues?: {
    name: string;
    mobile: string;
    email?: string | null;
    partnerId?: string | null;
    state: string;
    district: string;
    tehsil?: string | null;
    designation: string;
    isCaller: boolean;
    fixedSalaryPaise: number;
    commissionRate: number;
    status: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: initialValues?.name ?? "",
    mobile: initialValues?.mobile ?? "",
    email: initialValues?.email ?? "",
    partnerId: initialValues?.partnerId ?? "",
    state: initialValues?.state ?? "",
    district: initialValues?.district ?? "",
    tehsil: initialValues?.tehsil ?? "",
    designation: initialValues?.designation ?? "",
    isCaller: initialValues?.isCaller ?? false,
    fixedSalaryPaise: String(initialValues?.fixedSalaryPaise ?? 0),
    commissionRate: String(initialValues?.commissionRate ?? 0),
    status: initialValues?.status ?? "ACTIVE",
  });

  const endpoint = employeeId ? `/api/employees/${employeeId}` : "/api/employees";
  const method = employeeId ? "PUT" : "POST";

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
          <DialogTitle>{employeeId ? "Edit Employee" : "Create Employee"}</DialogTitle>
          <DialogDescription>Assign partner ownership, configure salaries and commissions, and choose whether the user operates as a caller.</DialogDescription>
        </DialogHeader>
        <form
          className="mt-6 grid gap-4 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            startTransition(async () => {
              const response = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...form,
                  fixedSalaryPaise: Number(form.fixedSalaryPaise),
                  commissionRate: Number(form.commissionRate),
                  isCaller: form.isCaller,
                  partnerId: form.partnerId || null,
                }),
              });
              const result = await response.json();

              if (!response.ok) {
                toast.error(result.message || "Unable to save employee");
                return;
              }

              toast.success(employeeId ? "Employee updated" : `Employee created. Password: ${result.data.password}`);
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
            <Label>Partner</Label>
            <Select value={form.partnerId || "unassigned"} onValueChange={(value) => setForm((current) => ({ ...current, partnerId: value === "unassigned" ? "" : value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {partners.map((partner) => (
                  <SelectItem key={partner.id} value={partner.id}>
                    {partner.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Designation</Label>
            <Input value={form.designation} onChange={(event) => setForm((current) => ({ ...current, designation: event.target.value }))} />
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
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
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
          <div className="space-y-2">
            <Label>Tehsil</Label>
            <Input value={form.tehsil} onChange={(event) => setForm((current) => ({ ...current, tehsil: event.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Fixed Salary (Paise)</Label>
            <Input value={form.fixedSalaryPaise} onChange={(event) => setForm((current) => ({ ...current, fixedSalaryPaise: event.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Commission Rate</Label>
            <Input value={form.commissionRate} onChange={(event) => setForm((current) => ({ ...current, commissionRate: event.target.value }))} />
          </div>
          <label className="md:col-span-2 flex items-center gap-3 rounded-2xl border border-border bg-card/70 px-4 py-3 text-sm font-medium">
            <input type="checkbox" checked={form.isCaller} onChange={(event) => setForm((current) => ({ ...current, isCaller: event.target.checked }))} />
            Mark this user as a caller / work-from-home agent
          </label>
          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {employeeId ? "Save Changes" : "Create Employee"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
