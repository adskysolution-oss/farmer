import { EmployeeFormDialog } from "@/components/forms/employee-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth/session";
import { listEmployees } from "@/lib/services/employees";
import { listPartners } from "@/lib/services/partners";
import { getEmployeeScope, getPartnerScope } from "@/lib/services/scope";

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const params = await searchParams;
  const [employees, partners] = await Promise.all([
    listEmployees(params, getEmployeeScope(user)),
    listPartners({}, getPartnerScope(user)),
  ]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Employee Management"
        description="Assign partners, monitor lead volume, review conversion rates, and manage caller versus field operations roles."
        actions={user.role !== "CALLER" ? <EmployeeFormDialog partners={partners.items.map((partner) => ({ id: partner.id, label: `${partner.code} • ${partner.user.name}` }))} /> : null}
      />

      <Card>
        <CardContent className="p-4">
          <form className="grid gap-3 md:grid-cols-4">
            <input name="search" defaultValue={params.search || ""} className="h-11 rounded-2xl border border-border bg-card px-4 text-sm" placeholder="Search employee, mobile, district..." />
            <select name="partnerId" defaultValue={params.partnerId || ""} className="h-11 rounded-2xl border border-border bg-card px-4 text-sm">
              <option value="">All partners</option>
              {partners.items.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.code}
                </option>
              ))}
            </select>
            <input name="sort" defaultValue={params.sort || ""} className="h-11 rounded-2xl border border-border bg-card px-4 text-sm" placeholder="Sort: leads-desc" />
            <button type="submit" className="h-11 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
              Apply Filters
            </button>
          </form>
        </CardContent>
      </Card>

      {employees.items.length ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Leads Generated</TableHead>
                  <TableHead>Conversion Rate</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.items.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <a className="font-semibold hover:text-primary" href={`/dashboard/employees/${employee.id}`}>
                        {employee.user.name}
                      </a>
                    </TableCell>
                    <TableCell>{employee.user.mobile}</TableCell>
                    <TableCell>{employee.partner?.code || "Unassigned"}</TableCell>
                    <TableCell>{employee.state}</TableCell>
                    <TableCell>{employee.district}</TableCell>
                    <TableCell>{employee.totalLeads}</TableCell>
                    <TableCell>{employee.conversionRate}%</TableCell>
                    <TableCell>
                      <Badge variant={employee.status === "ACTIVE" ? "success" : employee.status === "INACTIVE" ? "warning" : "destructive"}>
                        {employee.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <EmptyState title="No employees found" description="No employees match the applied filters. Add a team member or broaden the search." />
      )}
    </div>
  );
}
