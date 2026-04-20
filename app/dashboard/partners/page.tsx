import { Download, FileText, Sheet } from "lucide-react";

import { PartnerFormDialog } from "@/components/forms/partner-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth/session";
import { getPartnerScope } from "@/lib/services/scope";
import { listPartners } from "@/lib/services/partners";
import { formatCompactCurrency } from "@/lib/utils";

export default async function PartnersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;
  const params = await searchParams;
  const data = await listPartners(params, getPartnerScope(user));

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Partner Management"
        description="Control partner onboarding, geography coverage, revenue attribution, credentials, withdrawals, and performance visibility."
        actions={
          <>
            <Button variant="outline" asChild>
              <a href="/api/exports/partners?format=csv">
                <Download className="mr-2 h-4 w-4" />
                CSV
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/api/exports/partners?format=pdf">
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/api/exports/partners?format=xlsx">
                <Sheet className="mr-2 h-4 w-4" />
                Excel
              </a>
            </Button>
            {user.role === "ADMIN" ? <PartnerFormDialog /> : null}
          </>
        }
      />

      <Card>
        <CardContent className="p-4">
          <form className="grid gap-3 md:grid-cols-3 xl:grid-cols-7">
            <input name="search" defaultValue={params.search || ""} className="h-11 rounded-2xl border border-border bg-card px-4 text-sm" placeholder="Search name, code, mobile..." />
            <input name="state" defaultValue={params.state || ""} className="h-11 rounded-2xl border border-border bg-card px-4 text-sm" placeholder="State" />
            <input name="district" defaultValue={params.district || ""} className="h-11 rounded-2xl border border-border bg-card px-4 text-sm" placeholder="District" />
            <input name="tehsil" defaultValue={params.tehsil || ""} className="h-11 rounded-2xl border border-border bg-card px-4 text-sm" placeholder="Tehsil" />
            <input type="date" name="date" defaultValue={params.date || ""} className="h-11 rounded-2xl border border-border bg-card px-4 text-sm" />
            <input type="number" name="revenue" defaultValue={params.revenue || ""} className="h-11 rounded-2xl border border-border bg-card px-4 text-sm" placeholder="Min Revenue" />
            <Button type="submit" className="h-11 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground">Apply Filters</Button>
          </form>
        </CardContent>
      </Card>

      {data.items.length ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Tehsil</TableHead>
                  <TableHead>Total Leads</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell>
                      <div>
                        <a className="font-semibold hover:text-primary" href={`/dashboard/partners/${partner.id}`}>
                          {partner.user.name}
                        </a>
                        <p className="text-xs text-muted-foreground">{partner.code}</p>
                      </div>
                    </TableCell>
                    <TableCell>{partner.user.mobile}</TableCell>
                    <TableCell>{partner.user.email || "—"}</TableCell>
                    <TableCell>{partner.state}</TableCell>
                    <TableCell>{partner.district}</TableCell>
                    <TableCell>{partner.tehsil}</TableCell>
                    <TableCell>{partner.totalLeads}</TableCell>
                    <TableCell>{formatCompactCurrency(partner.revenuePaise)}</TableCell>
                    <TableCell>
                      <Badge variant={partner.status === "ACTIVE" ? "success" : partner.status === "ON_HOLD" ? "warning" : "destructive"}>
                        {partner.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/dashboard/partners/${partner.id}`}>View</a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <EmptyState title="No partners found" description="No partner records match the current filters. Adjust the filter set or add a new partner to begin onboarding." />
      )}
    </div>
  );
}
