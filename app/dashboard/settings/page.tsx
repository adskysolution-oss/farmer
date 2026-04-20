import { BreadcrumbForm } from "@/components/settings/breadcrumb-form";
import { SEOForm } from "@/components/settings/seo-form";
import { InvoiceForm } from "@/components/settings/invoice-form";
import { CertificateAndICardForm } from "@/components/settings/certificate-form";
import { ColourForm } from "@/components/settings/colour-form";
import { FontForm } from "@/components/settings/font-form";
import { GatewayForm } from "@/components/settings/gateway-form";
import { CaptchaForm } from "@/components/settings/captcha-form";
import { MailForm } from "@/components/settings/mail-form";
import { HidePageForm } from "@/components/settings/hidepage-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionHeader } from "@/components/ui/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { getSettingsBundle } from "@/lib/services/operations";

export default async function SettingsPage() {
  const bundle = await getSettingsBundle();

  const sections = [
    { value: "breadcrumb", label: "Breadcrumb", component: BreadcrumbForm },
    { value: "seo", label: "SEO", component: SEOForm },
    { value: "invoice", label: "Invoice", component: InvoiceForm },
    { value: "cert", label: "Certificate & I-Card", component: CertificateAndICardForm },
    { value: "color", label: "Colour", component: ColourForm },
    { value: "font", label: "Font", component: FontForm },
    { value: "gateway", label: "Gateway", component: GatewayForm },
    { value: "captcha", label: "Captcha", component: CaptchaForm },
    { value: "mail", label: "Mail Integration", component: MailForm },
    { value: "hide", label: "Hide Page", component: HidePageForm },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader 
        title="Global Settings" 
        description="Configure your platform branding, theme, SEO, and integrations in a modular layout." 
      />

      <Tabs defaultValue="breadcrumb" className="w-full">
        <TabsList className="flex w-full flex-wrap justify-start items-start h-auto gap-1 border-b border-border bg-transparent p-0 pb-px">
          {sections.map((section) => (
            <TabsTrigger 
              key={section.value}
              value={section.value} 
              className="rounded-none border-b-2 border-transparent bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              {section.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <Card className="mt-8 border-none bg-transparent shadow-none">
          <CardContent className="p-0">
            {sections.map((section) => (
              <TabsContent key={section.value} value={section.value}>
                <section.component initialData={bundle.settings} />
              </TabsContent>
            ))}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
