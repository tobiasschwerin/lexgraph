import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

// POST /api/maps/[id]/share — generate or return existing shareToken
export async function POST(
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

  // Re-use existing token or generate a new one
  const token = map.shareToken ?? randomBytes(16).toString("hex");

  await prisma.lexMap.update({
    where: { id },
    data: { shareToken: token },
  });

  return NextResponse.json({ token });
}

// DELETE /api/maps/[id]/share — revoke share link
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

  await prisma.lexMap.update({ where: { id }, data: { shareToken: null } });
  return new NextResponse(null, { status: 204 });
}
