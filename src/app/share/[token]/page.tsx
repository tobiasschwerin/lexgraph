import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LexCanvas } from "@/components/graph/LexCanvas";

export const dynamic = "force-dynamic";

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const map = await prisma.lexMap.findUnique({
    where: { shareToken: token },
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
      <LexCanvas mapData={map} readOnly />
    </div>
  );
}
