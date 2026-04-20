import { Download, FileText, Sheet } from "lucide-react";

import { FarmerFormDialog } from "@/components/forms/farmer-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth/session";
import { listEmployees } from "@/lib/services/employees";
import { listFarmerApplications } from "@/lib/services/farmers";
import { listPartners } from "@/lib/services/partners";
import { getApplicationScope, getEmployeeScope, getPartnerScope } from "@/lib/services/scope";
import { formatCompactCurrency } from "@/lib/utils";

export default async function FarmersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;
  const params = await searchParams;

  const [applications, partners, employees] = await Promise.all([
    listFarmerApplications(params, getApplicationScope(user)),
    listPartners({}, getPartnerScope(user)),
    listEmployees({}, getEmployeeScope(user)),
  ]);

  const callerOptions = employees.items.filter((employee) => employee.isCaller);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Farmer Management"
        description="Track loan status flow, payment state, document completeness, caller assignment, and operator ownership in one pipeline."
        actions={
          <>
            <Button variant="outline" asChild>
              <a href="/api/exports/farmers?format=csv">
                <Download className="mr-2 h-4 w-4" />
                CSV
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/api/exports/farmers?format=pdf">
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/api/exports/farmers?format=xlsx">
                <Sheet className="mr-2 h-4 w-4" />
                Excel
              </a>
            </Button>
            <FarmerFormDialog
              partners={partners.items.map((partner) => ({ id: partner.id, label: `${partner.code} • ${partner.user.name}` }))}
              employees={employees.items.map((employee) => ({ id: employee.id, label: employee.user.name }))}
              callers={callerOptions.map((employee) => ({ id: employee.id, label: employee.user.name }))}
            />
          </>
        }
      />

      <Card>
        <CardContent className="p-4">
          <form className="grid gap-3 md:grid-cols-5">
            <input name="search" defaultValue={params.search || ""} className="h-11 rounded-2xl border border-border bg-card px-4 text-sm" placeholder="Search farmer, mobile, reference..." />
            <input name="status" defaultValue={params.status || ""} className="h-11 rounded-2xl border border-border bg-card px-4 text-sm" placeholder="Status" />
            <input name="paymentStatus" defaultValue={params.paymentStatus || ""} className="h-11 rounded-2xl border border-border bg-card px-4 text-sm" placeholder="Payment status" />
            <input name="loanType" defaultValue={params.loanType || ""} className="h-11 rounded-2xl border border-border bg-card px-4 text-sm" placeholder="Loan type" />
            <button type="submit" className="h-11 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground">Apply Filters</button>
          </form>
        </CardContent>
      </Card>

      {applications.items.length ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Village</TableHead>
                  <TableHead>Loan Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.items.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <a className="font-semibold hover:text-primary" href={`/dashboard/farmers/${application.farmer.id}`}>
                        {application.farmer.name}
                      </a>
                      <p className="text-xs text-muted-foreground">{application.referenceNo}</p>
                    </TableCell>
                    <TableCell>{application.farmer.mobile}</TableCell>
                    <TableCell>{application.farmer.state}</TableCell>
                    <TableCell>{application.farmer.district}</TableCell>
                    <TableCell>{application.farmer.village}</TableCell>
                    <TableCell>{application.loanType}</TableCell>
                    <TableCell>
                      <Badge variant={application.status === "APPROVED" || application.status === "DISBURSED" ? "success" : application.status === "REJECTED" ? "destructive" : "warning"}>
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{application.paymentStatus}</p>
                        <p className="text-xs text-muted-foreground">{formatCompactCurrency(application.paymentAmountPaise)}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <EmptyState title="No farmer applications found" description="No applications match the current filter combination. Adjust filters or create a new farmer intake." />
      )}
    </div>
  );
}
