import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const law = searchParams.get("law") ?? "";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 1000);
  const offset = parseInt(searchParams.get("offset") ?? "0");

  const where = {
    ...(law ? { lawCode: { contains: law } } : {}),
    ...(q
      ? {
          OR: [
            { section: { contains: q } },
            { title: { contains: q } },
            { content: { contains: q } },
          ],
        }
      : {}),
  };

  const [results, total] = await Promise.all([
    prisma.paragraph.findMany({
      where,
      select: { id: true, lawCode: true, section: true, title: true },
      take: limit,
      skip: offset,
      // sectionOrder sorgt für numerische Reihenfolge: § 1, 2, 3, …, 305, 305a, 305b
      orderBy: [{ lawCode: "asc" }, { sectionOrder: "asc" }, { section: "asc" }],
    }),
    prisma.paragraph.count({ where }),
  ]);

  return NextResponse.json({ results, total });
}
