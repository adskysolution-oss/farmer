import PDFDocument from "pdfkit";
import * as XLSX from "xlsx";

import { getCurrentUser } from "@/lib/auth/session";
import { fail } from "@/lib/http";
import { prisma } from "@/lib/prisma";

function jsonToCsv(rows: Array<Record<string, unknown>>) {
  if (!rows.length) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => JSON.stringify(String(row[header] ?? "")))
        .join(","),
    ),
  ];

  return lines.join("\n");
}

function pdfBuffer(rows: Array<Record<string, unknown>>, title: string) {
  return new Promise<Buffer>((resolve) => {
    const doc = new PDFDocument({ margin: 40 });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    doc.fontSize(20).text(title);
    doc.moveDown();

    rows.forEach((row, index) => {
      doc.fontSize(11).text(`${index + 1}. ${Object.entries(row).map(([key, value]) => `${key}: ${value}`).join(" | ")}`);
      doc.moveDown(0.5);
    });

    doc.end();
  });
}

async function loadDataset(dataset: string) {
  switch (dataset) {
    case "partners":
      return (
        await prisma.partner.findMany({ include: { user: true } })
      ).map((partner) => ({
        code: partner.code,
        name: partner.user.name,
        mobile: partner.user.mobile,
        email: partner.user.email || "",
        state: partner.state,
        district: partner.district,
        tehsil: partner.tehsil,
        status: partner.status,
      }));
    case "employees":
      return (
        await prisma.employee.findMany({ include: { user: true, partner: true } })
      ).map((employee) => ({
        name: employee.user.name,
        mobile: employee.user.mobile,
        partner: employee.partner?.code || "",
        designation: employee.designation,
        state: employee.state,
        district: employee.district,
        status: employee.status,
      }));
    case "farmers":
      return (
        await prisma.loanApplication.findMany({ include: { farmer: true } })
      ).map((application) => ({
        referenceNo: application.referenceNo,
        name: application.farmer.name,
        mobile: application.farmer.mobile,
        state: application.farmer.state,
        district: application.farmer.district,
        village: application.farmer.village,
        loanType: application.loanType,
        status: application.status,
        paymentStatus: application.paymentStatus,
      }));
    case "payments":
      return (
        await prisma.payment.findMany()
      ).map((payment) => ({
        payerName: payment.payerName,
        amountPaise: payment.amountPaise,
        status: payment.status,
        transactionId: payment.transactionId || "",
        gateway: payment.gateway,
        createdAt: payment.createdAt.toISOString(),
      }));
    default:
      return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ dataset: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return fail("Unauthorized", 401);
  }

  const { dataset } = await params;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "csv";
  const rows = await loadDataset(dataset);

  if (!rows) {
    return fail("Unknown dataset", 404);
  }

  if (format === "xlsx") {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, dataset);
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${dataset}.xlsx"`,
      },
    });
  }

  if (format === "pdf") {
    const buffer = await pdfBuffer(rows, `${dataset.toUpperCase()} Export`);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${dataset}.pdf"`,
      },
    });
  }

  const csv = jsonToCsv(rows);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${dataset}.csv"`,
    },
  });
}
