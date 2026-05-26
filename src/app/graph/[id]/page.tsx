import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LexCanvas } from "@/components/graph/LexCanvas";

export const dynamic = "force-dynamic";

export default async function GraphPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  if (!map) notFound();

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden">
      <LexCanvas mapData={map} />
    </div>
  );
}
