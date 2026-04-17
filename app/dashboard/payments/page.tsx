import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth/session";
import { getSettingsBundle, listPayments } from "@/lib/services/operations";
import { formatCompactCurrency, formatDateTime } from "@/lib/utils";

export default async function PaymentsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const [payments, settings] = await Promise.all([listPayments(user), getSettingsBundle()]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Payment System" description="Track application payments, gateway switching, verification state, and transaction logging." />

      <section className="grid gap-4 md:grid-cols-3">
        {settings.gateways.map((gateway) => (
          <Card key={gateway.id}>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">{gateway.displayName}</p>
              <p className="mt-3 font-display text-3xl font-semibold">{gateway.enabled ? "Enabled" : "Disabled"}</p>
              <p className="mt-2 text-xs text-muted-foreground">{gateway.endpointUrl || "No endpoint configured"}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Payment Ledger</CardTitle>
          <CardDescription>User name, amount, gateway status, transaction ID, and payment timestamps.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Gateway</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.payerName}</TableCell>
                  <TableCell>{formatCompactCurrency(payment.amountPaise)}</TableCell>
                  <TableCell>{payment.status}</TableCell>
                  <TableCell>{payment.gateway}</TableCell>
                  <TableCell>{payment.transactionId || payment.orderId || "—"}</TableCell>
                  <TableCell>{formatDateTime(payment.paidAt || payment.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
