import { CallingActions } from "@/components/forms/calling-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth/session";
import { getCallingOverview } from "@/lib/services/operations";
import { formatDateTime } from "@/lib/utils";

export default async function CallingPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const overview = await getCallingOverview(user);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Calling Operations"
        description="Bulk import leads, auto-distribute unassigned applications, and monitor caller feedback flow from a single panel."
        actions={<CallingActions />}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Total Leads</p><p className="mt-3 font-display text-3xl font-semibold">{overview.leads.length}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Active Callers</p><p className="mt-3 font-display text-3xl font-semibold">{overview.callers.length}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Unassigned Leads</p><p className="mt-3 font-display text-3xl font-semibold">{overview.leads.filter((lead) => !lead.callerId).length}</p></CardContent></Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Caller Panel</CardTitle>
          <CardDescription>Assigned leads, farmer details, connection status, and latest feedback snapshots.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Farmer</TableHead>
                <TableHead>Caller</TableHead>
                <TableHead>Call Status</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>Follow Up</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overview.leads.map((lead) => {
                const latestCall = lead.callLogs[0];
                return (
                  <TableRow key={lead.id}>
                    <TableCell>{lead.referenceNo}</TableCell>
                    <TableCell>{lead.farmer.name}</TableCell>
                    <TableCell>{lead.assignedCaller?.user.name || "Unassigned"}</TableCell>
                    <TableCell>
                      <Badge variant={lead.callConnectionStatus === "CONNECTED" ? "success" : "warning"}>
                        {lead.callConnectionStatus || "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>{lead.leadInterestStatus || latestCall?.interestStatus || "—"}</TableCell>
                    <TableCell>{formatDateTime(lead.followUpDate || latestCall?.followUpDate)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
