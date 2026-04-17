import { SettingsForm } from "@/components/forms/settings-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getSettingsBundle } from "@/lib/services/operations";

export default async function SettingsPage() {
  const bundle = await getSettingsBundle();

  return (
    <div className="space-y-6">
      <SectionHeader title="Settings Panel" description="Change branding, theme colors, gateway credentials, SMS APIs, email SMTP, and webhook secrets." />
      <Card>
        <CardHeader>
          <CardTitle>Global Configuration</CardTitle>
          <CardDescription>All critical runtime controls stay centralized here for audit-friendly operations.</CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm settings={bundle.settings} gateways={bundle.gateways} />
        </CardContent>
      </Card>
    </div>
  );
}
