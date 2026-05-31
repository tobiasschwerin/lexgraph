import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: mapId } = await params;
  const { paragraphId, posX, posY } = await req.json() as {
    paragraphId: string;
    posX?: number;
    posY?: number;
  };

  const map = await prisma.lexMap.findUnique({ where: { id: mapId } });
  if (!map || map.ownerId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const paragraph = await prisma.paragraph.findUnique({ where: { id: paragraphId } });
  if (!paragraph) {
    return NextResponse.json({ error: "Paragraph not found" }, { status: 404 });
  }

  const existing = await prisma.mapNode.findUnique({
    where: { mapId_paragraphId: { mapId, paragraphId } },
  });
  if (existing) return NextResponse.json({ error: "Already in map" }, { status: 409 });

  // Auto-position: place next to existing nodes or in a grid
  const existingNodes = await prisma.mapNode.findMany({ where: { mapId } });
  const count = existingNodes.length;
  const finalX = posX ?? 120 + (count % 4) * 300;
  const finalY = posY ?? 100 + Math.floor(count / 4) * 220;

  const node = await prisma.mapNode.create({
    data: { mapId, paragraphId, posX: finalX, posY: finalY },
  });

  return NextResponse.json(node, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: mapId } = await params;
  const { paragraphId } = await req.json() as { paragraphId: string };

  const map = await prisma.lexMap.findUnique({ where: { id: mapId } });
  if (!map || map.ownerId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.mapNode.deleteMany({ where: { mapId, paragraphId } });
  return new NextResponse(null, { status: 204 });
}
