import { FormBuilderEditor } from "@/components/forms/form-builder-editor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getSettingsBundle } from "@/lib/services/operations";

export default async function FormBuilderPage() {
  const bundle = await getSettingsBundle();
  if (!bundle.form) return null;

  return (
    <div className="space-y-6">
      <SectionHeader title="Form + Payment Control" description="Manage dynamic form fields, upload sections, payment amount, and mandatory payment behavior." />
      <Card>
        <CardHeader>
          <CardTitle>Public Farmer Intake Builder</CardTitle>
          <CardDescription>Update fields, payment rules, and published capture settings without redeploying the app.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormBuilderEditor form={bundle.form} />
        </CardContent>
      </Card>
    </div>
  );
}
