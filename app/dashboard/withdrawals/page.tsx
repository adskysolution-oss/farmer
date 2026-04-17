import { WithdrawalReviewButtons } from "@/components/forms/withdrawal-review-buttons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth/session";
import { listWithdrawals } from "@/lib/services/operations";
import { formatCompactCurrency, formatDateTime } from "@/lib/utils";

export default async function WithdrawalsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const withdrawals = await listWithdrawals(user);

  return (
    <div className="space-y-6">
      <SectionHeader title="Withdraw Requests" description="Approve or reject partner and employee payout requests with a complete status history." />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Owner</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payout Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell>{withdrawal.wallet.partner?.user.name || withdrawal.wallet.employee?.user.name || "Wallet"}</TableCell>
                  <TableCell>{formatCompactCurrency(withdrawal.amountPaise)}</TableCell>
                  <TableCell>
                    <Badge variant={withdrawal.status === "APPROVED" || withdrawal.status === "PAID" ? "success" : withdrawal.status === "PENDING" ? "warning" : "destructive"}>
                      {withdrawal.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{withdrawal.payoutMethod}</TableCell>
                  <TableCell>{formatDateTime(withdrawal.createdAt)}</TableCell>
                  <TableCell>{user.role === "ADMIN" && withdrawal.status === "PENDING" ? <WithdrawalReviewButtons withdrawalId={withdrawal.id} /> : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
