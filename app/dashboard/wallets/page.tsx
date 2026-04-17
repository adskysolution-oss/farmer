import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getCurrentUser } from "@/lib/auth/session";
import { listWallets } from "@/lib/services/operations";
import { formatCompactCurrency, formatDateTime } from "@/lib/utils";

export default async function WalletsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const wallets = await listWallets(user);

  return (
    <div className="space-y-6">
      <SectionHeader title="Wallets" description="Partner wallet balances, employee earnings, ledger entries, salary credits, and pending withdrawal amounts." />
      <div className="grid gap-6 xl:grid-cols-2">
        {wallets.map((wallet) => (
          <Card key={wallet.id}>
            <CardHeader>
              <CardTitle>{wallet.partner?.user.name || wallet.employee?.user.name || "Wallet"}</CardTitle>
              <CardDescription>{wallet.ownerType}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div><p className="text-sm text-muted-foreground">Balance</p><p className="mt-2 font-display text-2xl font-semibold">{formatCompactCurrency(wallet.balancePaise)}</p></div>
                <div><p className="text-sm text-muted-foreground">Lifetime</p><p className="mt-2 font-display text-2xl font-semibold">{formatCompactCurrency(wallet.lifetimeEarningsPaise)}</p></div>
                <div><p className="text-sm text-muted-foreground">Pending Withdraw</p><p className="mt-2 font-display text-2xl font-semibold">{formatCompactCurrency(wallet.pendingWithdrawalPaise)}</p></div>
              </div>
              <div className="space-y-3">
                {wallet.ledgerEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded-2xl bg-secondary/50 px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium">{entry.description}</p>
                      <p className="text-muted-foreground">{formatDateTime(entry.createdAt)}</p>
                    </div>
                    <p className="font-semibold">{formatCompactCurrency(entry.amountPaise)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
