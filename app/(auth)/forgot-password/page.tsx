import { KeyRound } from "lucide-react";

import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <KeyRound className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <CardTitle className="text-3xl">Reset access</CardTitle>
          <CardDescription>Generate a secure password reset token. If SMTP is configured, the reset link is delivered by email automatically.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
    </Card>
  );
}
