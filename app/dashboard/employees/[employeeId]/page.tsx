import { ArrowLeft } from "lucide-react";

import { EmployeeFormDialog } from "@/components/forms/employee-form-dialog";
import { DeleteEntityButton, ResetPasswordButton } from "@/components/forms/entity-action-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getEmployeeDetail } from "@/lib/services/employees";
import { listPartners } from "@/lib/services/partners";
import { formatCompactCurrency, formatDateTime } from "@/lib/utils";

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = await params;
  const [employee, partners] = await Promise.all([getEmployeeDetail(employeeId), listPartners({}, {})]);

  if (!employee) {
    return <div className="rounded-3xl border border-dashed border-border p-10 text-center">Employee not found.</div>;
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title={employee.user.name}
        description={`${employee.designation} • ${employee.partner?.code || "Unassigned"} • ${employee.state}, ${employee.district}`}
        actions={
          <>
            <Button variant="outline" asChild>
              <a href="/dashboard/employees">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </a>
            </Button>
            <ResetPasswordButton endpoint={`/api/employees/${employee.id}/reset-password`} />
            <EmployeeFormDialog
              employeeId={employee.id}
              triggerLabel="Edit Employee"
              partners={partners.items.map((partner) => ({ id: partner.id, label: `${partner.code} • ${partner.user.name}` }))}
              initialValues={{
                name: employee.user.name,
                mobile: employee.user.mobile,
                email: employee.user.email,
                partnerId: employee.partnerId,
                state: employee.state,
                district: employee.district,
                tehsil: employee.tehsil,
                designation: employee.designation,
                isCaller: employee.isCaller,
                fixedSalaryPaise: employee.fixedSalaryPaise,
                commissionRate: employee.commissionRate,
                status: employee.status,
              }}
            />
            <DeleteEntityButton endpoint={`/api/employees/${employee.id}`} label="Delete Employee" />
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Total Leads</p><p className="mt-3 font-display text-3xl font-semibold">{employee.summary.totalLeads}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Approved Leads</p><p className="mt-3 font-display text-3xl font-semibold">{employee.summary.approvedLeads}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Pending Leads</p><p className="mt-3 font-display text-3xl font-semibold">{employee.summary.pendingLeads}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Earnings</p><p className="mt-3 font-display text-3xl font-semibold">{formatCompactCurrency(employee.summary.earnings)}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Performance Score</p><p className="mt-3 font-display text-3xl font-semibold">{employee.summary.performanceScore}</p></CardContent></Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Assigned Leads</CardTitle>
            <CardDescription>Latest assigned cases and disposition status.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Loan Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employee.assignedApplications.slice(0, 8).map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>{application.referenceNo}</TableCell>
                    <TableCell>{application.farmer.name}</TableCell>
                    <TableCell>
                      <Badge variant={application.status === "DISBURSED" || application.status === "APPROVED" ? "success" : application.status === "REJECTED" ? "destructive" : "warning"}>
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{application.loanType}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest Tracking</CardTitle>
            <CardDescription>Recent heartbeat samples for employee visibility.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {employee.tracking.map((point) => (
              <div key={point.id} className="rounded-2xl border border-border/70 bg-card/70 p-4">
                <div className="flex items-center justify-between">
                  <Badge variant={point.isOnline ? "success" : "destructive"}>{point.isOnline ? "Online" : "Offline"}</Badge>
                  <span className="text-xs text-muted-foreground">{formatDateTime(point.lastActive)}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
