import { getCurrentUser } from "@/lib/auth/session";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ applicationId: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CALLER" && user.role !== "ADMIN" && user.role !== "EMPLOYEE") {
    return fail("Unauthorized", 401);
  }

  const employee = await prisma.employee.findUnique({ where: { userId: user.id } });
  if (!employee) return fail("Employee record not found", 404);

  try {
    const { applicationId } = await params;
    const body = await request.json();

    const callLog = await prisma.callLog.create({
      data: {
        applicationId,
        callerId: employee.id,
        connectionStatus: body.connectionStatus,
        interestStatus: body.interestStatus,
        notes: body.notes,
        followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
      },
    });

    // Also update the application with the latest call summary
    await prisma.loanApplication.update({
      where: { id: applicationId },
      data: {
        callConnectionStatus: body.connectionStatus,
        leadInterestStatus: body.interestStatus,
        followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
        callerNotes: body.notes,
      },
    });

    return ok(callLog);
  } catch (error) {
    return fail("Failed to create call log");
  }
}
