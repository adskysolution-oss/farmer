import { readFile } from "node:fs/promises";

import { fail } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ documentId: string }> }) {
  const { documentId } = await params;
  const document = await prisma.farmerDocument.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    return fail("Document not found", 404);
  }

  const buffer = await readFile(document.filePath);

  return new Response(buffer, {
    headers: {
      "Content-Type": document.mimeType,
      "Content-Disposition": `inline; filename="${document.fileName}"`,
    },
  });
}
