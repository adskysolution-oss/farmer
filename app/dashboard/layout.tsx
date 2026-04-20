import { redirect } from "next/navigation";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role={user.role} />
      <div className="min-w-0 flex-1">
        <Topbar userName={user.name} role={user.role} />
        <main className="px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
