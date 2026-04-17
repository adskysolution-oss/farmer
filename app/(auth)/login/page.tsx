import { ShieldCheck } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/forms/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = params.redirectTo || "/dashboard";

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <CardTitle className="text-3xl">Welcome back</CardTitle>
          <CardDescription>Sign in to access dashboards, workflows, lead operations, payment controls, and live field visibility.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <LoginForm redirectTo={redirectTo} />
        <div className="mt-8 rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground">
          Seed credentials:
          <div className="mt-2 space-y-1 font-medium text-foreground">
            <p>Admin: `9999999999 / Admin@123`</p>
            <p>Partner: `9000000001 / Partner@123`</p>
            <p>Caller: `9100000002 / Caller@123`</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
