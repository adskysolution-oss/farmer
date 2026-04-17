import { CampaignForm } from "@/components/forms/campaign-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCampaigns } from "@/lib/services/operations";
import { formatDateTime } from "@/lib/utils";

export default async function MarketingPage() {
  const campaigns = await getCampaigns();

  return (
    <div className="space-y-6">
      <SectionHeader title="Marketing System" description="Send WhatsApp, SMS, or email campaigns to farmers, partners, and employees." actions={<CampaignForm />} />
      <Card>
        <CardHeader>
          <CardTitle>Campaign History</CardTitle>
          <CardDescription>Bulk communication runs with recipient group and dispatch count.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dispatches</TableHead>
                <TableHead>Sent At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>{campaign.name}</TableCell>
                  <TableCell>{campaign.channel}</TableCell>
                  <TableCell>{campaign.recipientGroup}</TableCell>
                  <TableCell>{campaign.status}</TableCell>
                  <TableCell>{campaign.dispatches.length}</TableCell>
                  <TableCell>{formatDateTime(campaign.sentAt || campaign.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
