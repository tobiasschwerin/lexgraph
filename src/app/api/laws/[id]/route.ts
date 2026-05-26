import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const paragraph = await prisma.paragraph.findUnique({
    where: { id },
    include: {
      connectionsFrom: {
        include: { to: { select: { id: true, lawCode: true, section: true, title: true } } },
      },
      connectionsTo: {
        include: { from: { select: { id: true, lawCode: true, section: true, title: true } } },
      },
    },
  });

  if (!paragraph) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(paragraph);
}
