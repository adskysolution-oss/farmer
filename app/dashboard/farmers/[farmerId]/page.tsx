import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getFarmerDetail } from "@/lib/services/farmers";
import { formatCompactCurrency, formatDateTime } from "@/lib/utils";

export default async function FarmerDetailPage({
  params,
}: {
  params: Promise<{ farmerId: string }>;
}) {
  const { farmerId } = await params;
  const farmer = await getFarmerDetail(farmerId);

  if (!farmer) {
    return <div className="rounded-3xl border border-dashed border-border p-10 text-center">Farmer not found.</div>;
  }

  const latestApplication = farmer.applications[0];

  return (
    <div className="space-y-6">
      <SectionHeader
        title={farmer.name}
        description={`${farmer.mobile} • ${farmer.state}, ${farmer.district}, ${farmer.village}`}
        actions={
          <Button variant="outline" asChild>
            <a href="/dashboard/farmers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </a>
          </Button>
        }
      />

      {latestApplication ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Current Status</p><p className="mt-3 font-display text-3xl font-semibold">{latestApplication.status}</p></CardContent></Card>
            <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Payment Status</p><p className="mt-3 font-display text-3xl font-semibold">{latestApplication.paymentStatus}</p></CardContent></Card>
            <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Payment Amount</p><p className="mt-3 font-display text-3xl font-semibold">{formatCompactCurrency(latestApplication.paymentAmountPaise)}</p></CardContent></Card>
            <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Document Completion</p><p className="mt-3 font-display text-3xl font-semibold">{latestApplication.documentCompletion}%</p></CardContent></Card>
          </section>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Application Overview</CardTitle>
                <CardDescription>Reference, ownership, and loan progress snapshot.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Reference</span><span className="font-medium">{latestApplication.referenceNo}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Loan Type</span><span className="font-medium">{latestApplication.loanType}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Partner</span><span className="font-medium">{latestApplication.partner?.code || "Direct"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Assigned Employee</span><span className="font-medium">{latestApplication.assignedEmployee?.user.name || "Unassigned"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Assigned Caller</span><span className="font-medium">{latestApplication.assignedCaller?.user.name || "Unassigned"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Follow Up</span><span className="font-medium">{formatDateTime(latestApplication.followUpDate)}</span></div>
                <div className="rounded-2xl bg-secondary/60 p-4">
                  <p className="text-sm font-medium">Caller Notes</p>
                  <p className="mt-2 text-muted-foreground">{latestApplication.callerNotes || "No notes yet."}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Document Management</CardTitle>
                <CardDescription>Aadhaar, PAN, land papers, bank details, and replacements tracked by application.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead>Mime Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {latestApplication.documents.map((document) => (
                      <TableRow key={document.id}>
                        <TableCell>{document.type}</TableCell>
                        <TableCell>
                          <a className="font-medium text-primary" href={`/api/files/${document.id}`}>
                            {document.fileName}
                          </a>
                        </TableCell>
                        <TableCell>{document.mimeType}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Application Timeline</CardTitle>
                <CardDescription>Tracked status changes, assignments, and internal workflow events.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {latestApplication.timeline.map((event) => (
                  <div key={event.id} className="rounded-2xl border border-border/70 bg-card/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{event.title}</p>
                      <Badge variant="outline">{event.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>
                    <p className="mt-3 text-xs text-muted-foreground">{formatDateTime(event.createdAt)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calling Feedback</CardTitle>
                <CardDescription>Connection history, interest disposition, and next follow-up promises.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {latestApplication.callLogs.length ? (
                  latestApplication.callLogs.map((log) => (
                    <div key={log.id} className="rounded-2xl border border-border/70 bg-card/70 p-4">
                      <div className="flex items-center justify-between">
                        <Badge variant={log.connectionStatus === "CONNECTED" ? "success" : "warning"}>{log.connectionStatus}</Badge>
                        <span className="text-xs text-muted-foreground">{formatDateTime(log.createdAt)}</span>
                      </div>
                      <p className="mt-2 text-sm font-medium">{log.interestStatus}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{log.notes || "No notes provided"}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No call logs captured yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <p className="rounded-3xl border border-dashed border-border p-10 text-center">No loan applications found for this farmer.</p>
      )}
    </div>
  );
}
