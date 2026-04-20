import { InfoForm } from "@/components/profile/info-form";
import { PasswordForm } from "@/components/profile/password-form";
import { SocialForm } from "@/components/profile/social-form";
import { BankForm } from "@/components/profile/bank-form";
import { UserIdForm } from "@/components/profile/userid-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { getSettingsBundle } from "@/lib/services/operations";
import { getCurrentUser } from "@/lib/auth/session";

export default async function ProfilePage() {
  const [bundle, user] = await Promise.all([
    getSettingsBundle(),
    getCurrentUser()
  ]);

  if (!user) return null;

  return (
    <div className="space-y-8">
      <SectionHeader 
        title="Admin Profile" 
        description="Manage your organization info, security, social links, and banking details in one modular view." 
      />

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="flex w-full justify-start border-b border-border bg-transparent p-0 pb-px">
          <TabsTrigger value="info" className="rounded-none border-b-2 border-transparent bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Info</TabsTrigger>
          <TabsTrigger value="password" className="rounded-none border-b-2 border-transparent bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Password</TabsTrigger>
          <TabsTrigger value="social" className="rounded-none border-b-2 border-transparent bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Social</TabsTrigger>
          <TabsTrigger value="bank" className="rounded-none border-b-2 border-transparent bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Bank</TabsTrigger>
          <TabsTrigger value="userid" className="rounded-none border-b-2 border-transparent bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Change User ID</TabsTrigger>
        </TabsList>

        <Card className="mt-8 border-none bg-transparent shadow-none">
          <CardContent className="p-0">
            <TabsContent value="info">
              <InfoForm initialData={bundle.settings} />
            </TabsContent>
            <TabsContent value="password">
              <PasswordForm />
            </TabsContent>
            <TabsContent value="social">
              <SocialForm initialData={bundle.settings} />
            </TabsContent>
            <TabsContent value="bank">
              <BankForm initialData={bundle.settings} />
            </TabsContent>
            <TabsContent value="userid">
              <UserIdForm initialData={{ name: user.name, email: user.email }} />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
