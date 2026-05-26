import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const maps = await prisma.lexMap.findMany({
    where: { ownerId: userId },
    include: { _count: { select: { nodes: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(maps);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description } = body as { title: string; description?: string };

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  const map = await prisma.lexMap.create({
    data: { title: title.trim(), description, ownerId: userId },
  });

  return NextResponse.json(map, { status: 201 });
}
