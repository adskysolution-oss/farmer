import { Fingerprint } from "lucide-react";

import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Fingerprint className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <CardTitle className="text-3xl">Set a new password</CardTitle>
          <CardDescription>Use the secure token from the reset link to create a fresh password for the selected account.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm token={params.token || ""} />
      </CardContent>
    </Card>
  );
}
