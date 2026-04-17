"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Option = { id: string; label: string };

export function FarmerFormDialog({
  partners,
  employees,
  callers,
  triggerLabel = "Add Farmer",
}: {
  partners: Option[];
  employees: Option[];
  callers: Option[];
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    state: "",
    district: "",
    tehsil: "",
    village: "",
    loanType: "KCC",
    requestedAmountPaise: "2490000",
    status: "SUBMITTED",
    paymentStatus: "PENDING",
    paymentAmountPaise: "24900",
    partnerId: "",
    employeeId: "",
    callerId: "",
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create Farmer Application</DialogTitle>
          <DialogDescription>Capture a farmer lead, assign ownership, set payment state, and push the case into the loan pipeline.</DialogDescription>
        </DialogHeader>
        <form
          className="mt-6 grid gap-4 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            startTransition(async () => {
              const response = await fetch("/api/farmers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...form,
                  requestedAmountPaise: Number(form.requestedAmountPaise),
                  paymentAmountPaise: Number(form.paymentAmountPaise),
                  partnerId: form.partnerId || null,
                  employeeId: form.employeeId || null,
                  callerId: form.callerId || null,
                }),
              });
              const result = await response.json();

              if (!response.ok) {
                toast.error(result.message || "Unable to create farmer application");
                return;
              }

              toast.success("Farmer application created");
              setOpen(false);
              window.location.reload();
            });
          }}
        >
          <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></div>
          <div className="space-y-2"><Label>Mobile</Label><Input value={form.mobile} onChange={(event) => setForm((current) => ({ ...current, mobile: event.target.value }))} /></div>
          <div className="space-y-2"><Label>State</Label><Input value={form.state} onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))} /></div>
          <div className="space-y-2"><Label>District</Label><Input value={form.district} onChange={(event) => setForm((current) => ({ ...current, district: event.target.value }))} /></div>
          <div className="space-y-2"><Label>Tehsil</Label><Input value={form.tehsil} onChange={(event) => setForm((current) => ({ ...current, tehsil: event.target.value }))} /></div>
          <div className="space-y-2"><Label>Village</Label><Input value={form.village} onChange={(event) => setForm((current) => ({ ...current, village: event.target.value }))} /></div>
          <div className="space-y-2">
            <Label>Loan Type</Label>
            <Select value={form.loanType} onValueChange={(value) => setForm((current) => ({ ...current, loanType: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["KCC", "Tractor", "Dairy", "Personal", "Crop"].map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Requested Amount (Paise)</Label><Input value={form.requestedAmountPaise} onChange={(event) => setForm((current) => ({ ...current, requestedAmountPaise: event.target.value }))} /></div>
          <div className="space-y-2">
            <Label>Partner</Label>
            <Select value={form.partnerId || "none"} onValueChange={(value) => setForm((current) => ({ ...current, partnerId: value === "none" ? "" : value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Direct</SelectItem>
                {partners.map((partner) => <SelectItem key={partner.id} value={partner.id}>{partner.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Employee</Label>
            <Select value={form.employeeId || "none"} onValueChange={(value) => setForm((current) => ({ ...current, employeeId: value === "none" ? "" : value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {employees.map((employee) => <SelectItem key={employee.id} value={employee.id}>{employee.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Caller</Label>
            <Select value={form.callerId || "none"} onValueChange={(value) => setForm((current) => ({ ...current, callerId: value === "none" ? "" : value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {callers.map((caller) => <SelectItem key={caller.id} value={caller.id}>{caller.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(value) => setForm((current) => ({ ...current, status: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["SUBMITTED", "UNDER_REVIEW", "DOCUMENT_PENDING", "APPROVED", "REJECTED", "DISBURSED"].map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Payment Status</Label>
            <Select value={form.paymentStatus} onValueChange={(value) => setForm((current) => ({ ...current, paymentStatus: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["PENDING", "SUCCESS", "FAILED", "REFUNDED", "WAIVED"].map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2"><Label>Payment Amount (Paise)</Label><Input value={form.paymentAmountPaise} onChange={(event) => setForm((current) => ({ ...current, paymentAmountPaise: event.target.value }))} /></div>
          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Create Application</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
