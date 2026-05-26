import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const map = await prisma.lexMap.findUnique({
    where: { id },
    include: {
      nodes: {
        include: {
          paragraph: {
            select: { id: true, lawCode: true, section: true, title: true, content: true },
          },
        },
      },
      connections: true,
    },
  });

  if (!map) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(map);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as {
    title?: string;
    description?: string;
    isPublic?: boolean;
    nodes?: { paragraphId: string; posX: number; posY: number }[];
  };

  const map = await prisma.lexMap.findUnique({ where: { id } });
  if (!map || map.ownerId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.lexMap.update({
    where: { id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.isPublic !== undefined ? { isPublic: body.isPublic } : {}),
    },
  });

  if (body.nodes) {
    for (const n of body.nodes) {
      await prisma.mapNode.updateMany({
        where: { mapId: id, paragraphId: n.paragraphId },
        data: { posX: n.posX, posY: n.posY },
      });
    }
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const map = await prisma.lexMap.findUnique({ where: { id } });
  if (!map || map.ownerId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.lexMap.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
