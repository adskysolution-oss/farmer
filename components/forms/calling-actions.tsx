"use client";

import { useRef, useTransition } from "react";
import { Loader2, UploadCloud, WandSparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function CallingActions() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  const uploadFile = (file?: File) => {
    if (!file) {
      fileRef.current?.click();
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/calling/bulk-upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.message || "Lead upload failed");
        return;
      }
      toast.success(`Imported ${result.data.created} leads`);
      window.location.reload();
      if (fileRef.current) {
        fileRef.current.value = "";
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-3">
      <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(event) => uploadFile(event.target.files?.[0])} />
      <Button
        variant="outline"
        disabled={pending}
        onClick={() => uploadFile(fileRef.current?.files?.[0])}
      >
        {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
        Upload Leads
      </Button>
      <Button
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            const response = await fetch("/api/calling/distribute", {
              method: "POST",
            });
            const result = await response.json();
            if (!response.ok) {
              toast.error(result.message || "Auto-distribution failed");
              return;
            }
            toast.success(`Assigned ${result.data.assigned} leads`);
            window.location.reload();
          });
        }}
      >
        <WandSparkles className="mr-2 h-4 w-4" />
        Auto Distribute Leads
      </Button>
    </div>
  );
}
