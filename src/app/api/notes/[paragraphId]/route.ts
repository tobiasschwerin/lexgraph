import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ paragraphId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { paragraphId } = await params;

  const note = await prisma.note.findFirst({
    where: { paragraphId, userId },
  });

  return NextResponse.json({ content: note?.content ?? "" });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ paragraphId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { paragraphId } = await params;
  const { content } = (await req.json()) as { content: string };

  const existing = await prisma.note.findFirst({ where: { paragraphId, userId } });

  if (content.trim() === "") {
    if (existing) await prisma.note.delete({ where: { id: existing.id } });
    return NextResponse.json({ ok: true });
  }

  if (existing) {
    const updated = await prisma.note.update({
      where: { id: existing.id },
      data: { content },
    });
    return NextResponse.json(updated);
  }

  const created = await prisma.note.create({
    data: { paragraphId, userId, content },
  });
  return NextResponse.json(created, { status: 201 });
}
