import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BackButton } from "@/components/BackButton";
import { UpgradeButton } from "@/components/UpgradeButton";
import { PanelStack } from "@/components/PanelStack";

export const dynamic = "force-dynamic";

export default async function ParagraphDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from: mapId } = await searchParams;

  const paragraph = await prisma.paragraph.findUnique({
    where: { id },
    include: {
      connectionsFrom: {
        where: { isAutomatic: true },
        include: { to: { select: { id: true, lawCode: true, section: true, title: true } } },
        take: 30,
      },
      connectionsTo: {
        where: { isAutomatic: true },
        include: { from: { select: { id: true, lawCode: true, section: true, title: true } } },
        take: 30,
      },
    },
  });

  if (!paragraph) notFound();

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      <nav className="flex items-center justify-between gap-4 px-8 py-4 border-b border-slate-200 bg-white/90 backdrop-blur-sm z-10 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <BackButton href={mapId ? `/graph/${mapId}` : "/search"} />
          <span className="text-base font-bold text-blue-900" style={{ fontFamily: "'EB Garamond', serif" }}>JuraMap</span>
        </div>
        <UpgradeButton />
      </nav>

      <PanelStack initialData={paragraph} mapId={mapId} />
    </div>
  );
}
