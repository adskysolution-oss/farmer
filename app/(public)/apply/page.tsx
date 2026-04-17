import { PublicApplicationForm } from "@/components/forms/public-application-form";
import { Card, CardContent } from "@/components/ui/card";
import { getSettingsBundle } from "@/lib/services/operations";

export default async function ApplyPage() {
  const bundle = await getSettingsBundle();
  if (!bundle.form) {
    return <div className="mx-auto max-w-3xl px-6 py-12">No public form is configured yet.</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Card>
        <CardContent className="p-8">
          <PublicApplicationForm
            title={bundle.form.title}
            description={bundle.form.description}
            paymentEnabled={bundle.form.paymentEnabled}
            paymentMandatory={bundle.form.paymentMandatory}
            paymentAmountPaise={bundle.form.paymentAmountPaise}
            fields={bundle.form.fields}
          />
        </CardContent>
      </Card>
    </div>
  );
}
