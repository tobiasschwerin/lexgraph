import { notFound } from "next/navigation";
import { Link2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { BackButton } from "@/components/BackButton";
import { sectionPrefix } from "@/lib/law-utils";
import { UpgradeButton } from "@/components/UpgradeButton";
import { AddToMapButton } from "@/components/AddToMapButton";
import { NoteEditor } from "@/components/NoteEditor";
import { ExplainButton } from "@/components/ExplainButton";
import Link from "next/link";
import React from "react";

const KNOWN_LAWS = ["BGB", "HGB", "StGB", "GG", "ZPO", "StPO", "VwGO"];
const LAW_PATTERN = KNOWN_LAWS.join("|");
// Match in order of specificity:
// 1. Explicit cross-law: "§ 242 BGB"
// 2. Article GG: "Art. 20 GG"
// 3. Bare same-law: "§ 242" (no law suffix)
const REF_REGEX = new RegExp(
  `(§§?\\s*\\d+[a-z]*\\s+(?:${LAW_PATTERN})|Art\\.?\\s*\\d+[a-z]*\\s+GG|§§?\\s*\\d+[a-z]*)`,
  "gi"
);

function refToId(ref: string, fallbackLaw: string): string | null {
  // Explicit: "§ 242 BGB"
  const paraMatch = ref.match(/§§?\s*(\d+[a-z]*)\s+(BGB|HGB|StGB|GG|ZPO|StPO|VwGO)/i);
  if (paraMatch) {
    return `${paraMatch[2].toLowerCase()}-${paraMatch[1].toLowerCase()}`;
  }
  // Article: "Art. 20 GG"
  const artMatch = ref.match(/Art\.?\s*(\d+[a-z]*)\s+GG/i);
  if (artMatch) {
    return `gg-${artMatch[1].toLowerCase()}`;
  }
  // Bare: "§ 242" → use current law
  const bareMatch = ref.match(/§§?\s*(\d+[a-z]*)/i);
  if (bareMatch) {
    return `${fallbackLaw.toLowerCase()}-${bareMatch[1].toLowerCase()}`;
  }
  return null;
}

function renderContent(content: string, lawCode: string, mapId?: string): React.ReactNode {
  const parts = content.split(REF_REGEX);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      const id = refToId(part, lawCode);
      if (id) {
        return (
          <Link
            key={i}
            href={`/search/${id}${mapId ? `?from=${mapId}` : ""}`}
            className="text-blue-700 font-medium hover:underline cursor-pointer"
          >
            {part}
          </Link>
        );
      }
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

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

  // Deduplizierte Verweise-Liste
  const seenIds = new Set<string>();
  type RefPara = { id: string; lawCode: string; section: string; title: string | null };
  const allRefs: RefPara[] = [];

  for (const c of paragraph.connectionsFrom) {
    if (!seenIds.has(c.to.id)) {
      seenIds.add(c.to.id);
      allRefs.push(c.to);
    }
  }
  for (const c of paragraph.connectionsTo) {
    if (!seenIds.has(c.from.id)) {
      seenIds.add(c.from.id);
      allRefs.push(c.from);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <nav className="flex items-center justify-between gap-4 px-8 py-4 border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <BackButton href={mapId ? `/graph/${mapId}` : undefined} />
          <span className="text-base font-bold text-blue-900" style={{ fontFamily: "'EB Garamond', serif" }}>LexGraph</span>
        </div>
        <UpgradeButton />
      </nav>

      <div className="max-w-3xl mx-auto w-full px-6 py-10">
        {/* Paragraph Inhalt */}
        <div className="bg-white border border-slate-100 rounded-2xl p-8 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-blue-900 bg-blue-50 border border-blue-100 px-3 py-1 rounded-lg">
                {paragraph.lawCode}
              </span>
              <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'EB Garamond', serif" }}>
                {sectionPrefix(paragraph.lawCode)} {paragraph.section}
              </h1>
            </div>
            {mapId && (
              <AddToMapButton paragraphId={paragraph.id} mapId={mapId} label="In Map" />
            )}
          </div>
          {paragraph.title && (
            <h2 className="text-base font-semibold text-slate-600 mb-4 leading-snug">{paragraph.title}</h2>
          )}
          <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
            {renderContent(paragraph.content, paragraph.lawCode, mapId)}
          </div>
        </div>

        {/* KI-Erklärung */}
        <div className="mb-4">
          <ExplainButton paragraphId={paragraph.id} />
        </div>

        {/* Persönliche Notizen */}
        <div className="mb-6">
          <NoteEditor paragraphId={paragraph.id} />
        </div>

        {/* Verknüpfte Paragraphen — einmalige deduplizierte Liste */}
        {allRefs.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Verknüpfte Paragraphen ({allRefs.length})
            </h3>
            <div className="flex flex-col gap-2">
              {allRefs.map((ref) => (
                <div key={ref.id} className="flex items-center gap-2">
                  <Link
                    href={`/search/${ref.id}${mapId ? `?from=${mapId}` : ""}`}
                    className="flex-1 bg-white border border-slate-100 rounded-2xl px-4 py-3 hover:border-blue-200 hover:shadow-md transition-all flex items-center gap-3 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-blue-900 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-lg shrink-0">
                      {ref.lawCode}
                    </span>
                    <span className="font-medium text-slate-800 text-sm">{sectionPrefix(ref.lawCode)} {ref.section}</span>
                    {ref.title && <span className="text-sm text-slate-400 truncate">{ref.title}</span>}
                  </Link>
                  {mapId && (
                    <AddToMapButton paragraphId={ref.id} mapId={mapId} label="+" />
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
