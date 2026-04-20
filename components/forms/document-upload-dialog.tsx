"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function DocumentUploadDialog({ applicationId, documentType, isReplace = false }: { applicationId: string; documentType?: string; isReplace?: boolean }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (documentType) {
      formData.append("type", documentType);
    }
    
    startTransition(async () => {
      const response = await fetch(`/api/applications/${applicationId}/documents`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        toast.error("Failed to upload document");
        return;
      }
      toast.success(isReplace ? "Document replaced" : "Document uploaded");
      setOpen(false);
      window.location.reload();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isReplace ? (
          <Button variant="ghost" size="sm"><RefreshCw className="mr-2 h-4 w-4"/>Replace</Button>
        ) : (
          <Button variant="ghost" size="sm"><Plus className="mr-2 h-4 w-4"/>Upload</Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isReplace ? "Replace" : "Upload"} Document</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="space-y-2">
            <Label>Document Type</Label>
            {documentType ? (
               <p className="text-sm font-medium">{documentType}</p>
            ) : (
               <select name="type" required className="w-full rounded-2xl border border-border bg-card px-4 py-2 h-11 text-sm">
                 <option value="AADHAAR">Aadhaar</option>
                 <option value="PAN">PAN</option>
                 <option value="LAND_PAPER">Land Paper</option>
                 <option value="BANK_DETAILS">Bank Details</option>
                 <option value="OTHER">Other</option>
               </select>
            )}
          </div>
          <div className="space-y-2">
            <Label>Select File</Label>
            <input type="file" name="file" required className="w-full text-sm" />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={pending} className="rounded-xl">
              {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isReplace ? "Replace Document" : "Upload Document"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
