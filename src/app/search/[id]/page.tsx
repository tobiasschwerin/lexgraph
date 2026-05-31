import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BackButton } from "@/components/BackButton";
import { sectionPrefix } from "@/lib/law-utils";
import { UpgradeButton } from "@/components/UpgradeButton";
import { AddToMapButton } from "@/components/AddToMapButton";
import Link from "next/link";

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
        take: 20,
      },
      connectionsTo: {
        where: { isAutomatic: true },
        include: { from: { select: { id: true, lawCode: true, section: true, title: true } } },
        take: 20,
      },
    },
  });

  if (!paragraph) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-between gap-4 px-8 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-4">
          <BackButton href={mapId ? `/graph/${mapId}` : undefined} />
          <span className="text-lg font-bold text-blue-600">LexGraph</span>
        </div>
        <UpgradeButton />
      </nav>

      <div className="max-w-3xl mx-auto w-full px-6 py-10">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                {paragraph.lawCode}
              </span>
              <h1 className="text-2xl font-bold text-slate-900">{sectionPrefix(paragraph.lawCode)} {paragraph.section}</h1>
            </div>
            {mapId && (
              <AddToMapButton paragraphId={paragraph.id} mapId={mapId} label="In Map" />
            )}
          </div>
          {paragraph.title && (
            <h2 className="text-lg font-semibold text-slate-700 mb-4">{paragraph.title}</h2>
          )}
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{paragraph.content}</p>
        </div>

        {/* Dieser Paragraph verweist auf */}
        {paragraph.connectionsFrom.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-1">
              <ArrowRight className="w-4 h-4" /> Dieser Paragraph verweist auf
            </h3>
            <div className="flex flex-col gap-2">
              {paragraph.connectionsFrom.map((c) => (
                <div key={c.id} className="flex items-center gap-2">
                  <Link
                    href={`/search/${c.to.id}${mapId ? `?from=${mapId}` : ""}`}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-blue-300 hover:shadow-sm transition-all flex items-center gap-3"
                  >
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {c.to.lawCode}
                    </span>
                    <span className="font-medium text-slate-800">{sectionPrefix(c.to.lawCode)} {c.to.section}</span>
                    {c.to.title && <span className="text-sm text-slate-500 truncate">{c.to.title}</span>}
                  </Link>
                  {mapId && (
                    <AddToMapButton paragraphId={c.to.id} mapId={mapId} label="+" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verweist auf diesen Paragraph */}
        {paragraph.connectionsTo.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Verweist auf diesen Paragraph
            </h3>
            <div className="flex flex-col gap-2">
              {paragraph.connectionsTo.map((c) => (
                <div key={c.id} className="flex items-center gap-2">
                  <Link
                    href={`/search/${c.from.id}${mapId ? `?from=${mapId}` : ""}`}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-blue-300 hover:shadow-sm transition-all flex items-center gap-3"
                  >
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {c.from.lawCode}
                    </span>
                    <span className="font-medium text-slate-800">{sectionPrefix(c.from.lawCode)} {c.from.section}</span>
                    {c.from.title && <span className="text-sm text-slate-500 truncate">{c.from.title}</span>}
                  </Link>
                  {mapId && (
                    <AddToMapButton paragraphId={c.from.id} mapId={mapId} label="+" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
