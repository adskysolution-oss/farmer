import { ArrowLeft, WalletCards } from "lucide-react";

import { PartnerFormDialog } from "@/components/forms/partner-form-dialog";
import { DeleteEntityButton, ResetPasswordButton } from "@/components/forms/entity-action-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPartnerDetail } from "@/lib/services/partners";
import { formatCompactCurrency, formatDateTime } from "@/lib/utils";

export default async function PartnerDetailPage({
  params,
}: {
  params: Promise<{ partnerId: string }>;
}) {
  const { partnerId } = await params;
  const partner = await getPartnerDetail(partnerId);

  if (!partner) {
    return <div className="rounded-3xl border border-dashed border-border p-10 text-center">Partner not found.</div>;
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title={partner.user.name}
        description={`${partner.code} • ${partner.state}, ${partner.district}, ${partner.tehsil}`}
        actions={
          <>
            <Button variant="outline" asChild>
              <a href="/dashboard/partners">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </a>
            </Button>
            <ResetPasswordButton endpoint={`/api/partners/${partner.id}/reset-password`} />
            <PartnerFormDialog
              partnerId={partner.id}
              triggerLabel="Edit Partner"
              initialValues={{
                name: partner.user.name,
                mobile: partner.user.mobile,
                email: partner.user.email,
                state: partner.state,
                district: partner.district,
                tehsil: partner.tehsil,
                status: partner.status,
              }}
            />
            <DeleteEntityButton endpoint={`/api/partners/${partner.id}`} label="Delete Partner" />
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Total Employees</p><p className="mt-3 font-display text-3xl font-semibold">{partner.summary.totalEmployees}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Total Farmers</p><p className="mt-3 font-display text-3xl font-semibold">{partner.summary.totalFarmers}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Total Revenue</p><p className="mt-3 font-display text-3xl font-semibold">{formatCompactCurrency(partner.summary.totalRevenue)}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Commission Earned</p><p className="mt-3 font-display text-3xl font-semibold">{formatCompactCurrency(partner.summary.commissionEarned)}</p></CardContent></Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Performance Graph</CardTitle>
            <CardDescription>Recent payment-linked contribution for this partner.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {partner.performance.map((entry) => (
              <div key={entry.label} className="rounded-2xl bg-secondary/50 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{entry.label}</p>
                  <p className="font-semibold">{formatCompactCurrency(entry.value)}</p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-background">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${Math.max(12, Math.min(100, entry.value / 150))}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WalletCards className="h-5 w-5" />
              Withdraw History
            </CardTitle>
            <CardDescription>Ledger-backed requests and payout status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {partner.wallet?.withdrawals.length ? (
              partner.wallet.withdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="rounded-2xl border border-border/70 bg-card/70 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{formatCompactCurrency(withdrawal.amountPaise)}</p>
                    <Badge variant={withdrawal.status === "APPROVED" || withdrawal.status === "PAID" ? "success" : withdrawal.status === "PENDING" ? "warning" : "destructive"}>
                      {withdrawal.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{withdrawal.notes || "No note provided"}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(withdrawal.createdAt)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No withdrawal requests yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>Latest leads and payment-linked activity under this partner.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Farmer</TableHead>
                <TableHead>Loan Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partner.applications.slice(0, 8).map((application) => (
                <TableRow key={application.id}>
                  <TableCell>{application.referenceNo}</TableCell>
                  <TableCell>{application.farmer.name}</TableCell>
                  <TableCell>{application.loanType}</TableCell>
                  <TableCell>{application.status}</TableCell>
                  <TableCell>{application.payment ? formatCompactCurrency(application.payment.amountPaise) : "Pending"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
