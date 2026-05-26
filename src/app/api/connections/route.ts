import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fromId, toId, label, mapId } = await req.json() as {
    fromId: string;
    toId: string;
    label?: string;
    mapId?: string;
  };

  if (!fromId || !toId || fromId === toId) {
    return NextResponse.json({ error: "fromId and toId required and must differ" }, { status: 400 });
  }

  const connection = await prisma.connection.create({
    data: { fromId, toId, label, mapId, createdBy: userId },
  });

  return NextResponse.json(connection, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json() as { id: string };

  const conn = await prisma.connection.findUnique({ where: { id } });
  if (!conn || conn.createdBy !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.connection.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
