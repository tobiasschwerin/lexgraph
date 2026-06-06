"use client";

import { useEffect, useRef, useState } from "react";
import { X, Link2, Loader2 } from "lucide-react";
import { sectionPrefix } from "@/lib/law-utils";
import { NoteEditor } from "./NoteEditor";
import { ExplainButton } from "./ExplainButton";
import { AddToMapButton } from "./AddToMapButton";
import React from "react";

export type ParagraphData = {
  id: string;
  lawCode: string;
  section: string;
  title: string | null;
  content: string;
  connectionsFrom: Array<{ isAutomatic: boolean; to: { id: string; lawCode: string; section: string; title: string | null } }>;
  connectionsTo: Array<{ isAutomatic: boolean; from: { id: string; lawCode: string; section: string; title: string | null } }>;
};

// ─── Cross-reference rendering ───────────────────────────────────────────────

const KNOWN_LAWS = ["BGB", "HGB", "StGB", "GG", "ZPO", "StPO", "VwGO"];
const LAW_PATTERN = KNOWN_LAWS.join("|");
const REF_REGEX = new RegExp(
  `(§§?\\s*\\d+[a-z]*\\s+bis\\s+\\d+[a-z]*(?:\\s+(?:${LAW_PATTERN}))?` +
  `|§§?\\s*\\d+[a-z]*\\s+(?:${LAW_PATTERN})` +
  `|Art\\.?\\s*\\d+[a-z]*\\s+GG` +
  `|§§?\\s*\\d+[a-z]*)`,
  "gi"
);

const LINK_CLS = "text-blue-700 font-medium hover:underline cursor-pointer bg-transparent border-0 p-0 inline";

function refButton(id: string, label: string, onOpen: (id: string) => void, key: number | string) {
  return (
    <button key={key} onClick={() => onOpen(id)} className={LINK_CLS}>
      {label}
    </button>
  );
}

function renderRef(
  part: string,
  fallbackLaw: string,
  onOpen: (id: string) => void,
  key: number
): React.ReactNode {
  const rangeMatch = part.match(/§§?\s*(\d+[a-z]*)\s+bis\s+(\d+[a-z]*)(?:\s+(BGB|HGB|StGB|GG|ZPO|StPO|VwGO))?/i);
  if (rangeMatch) {
    const law = (rangeMatch[3] ?? fallbackLaw).toLowerCase();
    return (
      <React.Fragment key={key}>
        {"§§ "}
        {refButton(`${law}-${rangeMatch[1].toLowerCase()}`, rangeMatch[1], onOpen, `${key}a`)}
        {" bis "}
        {refButton(`${law}-${rangeMatch[2].toLowerCase()}`, rangeMatch[2], onOpen, `${key}b`)}
      </React.Fragment>
    );
  }
  const explicit = part.match(/§§?\s*(\d+[a-z]*)\s+(BGB|HGB|StGB|GG|ZPO|StPO|VwGO)/i);
  if (explicit) {
    return refButton(`${explicit[2].toLowerCase()}-${explicit[1].toLowerCase()}`, part, onOpen, key);
  }
  const art = part.match(/Art\.?\s*(\d+[a-z]*)\s+GG/i);
  if (art) {
    return refButton(`gg-${art[1].toLowerCase()}`, part, onOpen, key);
  }
  const bare = part.match(/§§?\s*(\d+[a-z]*)/i);
  if (bare) {
    return refButton(`${fallbackLaw.toLowerCase()}-${bare[1].toLowerCase()}`, part, onOpen, key);
  }
  return <React.Fragment key={key}>{part}</React.Fragment>;
}

function renderContent(content: string, lawCode: string, onOpen: (id: string) => void): React.ReactNode {
  const parts = content.split(REF_REGEX);
  return parts.map((part, i) =>
    i % 2 === 1
      ? renderRef(part, lawCode, onOpen, i)
      : <React.Fragment key={i}>{part}</React.Fragment>
  );
}

// ─── Panel component ─────────────────────────────────────────────────────────

interface ParagraphPanelProps {
  paragraphId: string;
  initialData?: ParagraphData;
  onOpenPanel: (id: string) => void;
  onClose?: () => void;
  mapId?: string;
  isFirst?: boolean;
  isOnly?: boolean;
}

export function ParagraphPanel({
  paragraphId,
  initialData,
  onOpenPanel,
  onClose,
  mapId,
  isFirst = false,
  isOnly = false,
}: ParagraphPanelProps) {
  const [paragraph, setParagraph] = useState<ParagraphData | null>(initialData ?? null);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (initialData) return;
    setLoading(true);
    fetch(`/api/laws/${paragraphId}`)
      .then((r) => r.json())
      .then((data: ParagraphData) => { setParagraph(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [paragraphId, initialData]);

  // Deduplicated refs
  const allRefs = (() => {
    if (!paragraph) return [];
    const seen = new Set<string>();
    const refs: ParagraphData["connectionsFrom"][0]["to"][] = [];
    for (const c of paragraph.connectionsFrom) {
      if (c.isAutomatic && !seen.has(c.to.id)) { seen.add(c.to.id); refs.push(c.to); }
    }
    for (const c of paragraph.connectionsTo) {
      if (c.isAutomatic && !seen.has(c.from.id)) { seen.add(c.from.id); refs.push(c.from); }
    }
    return refs.slice(0, 30);
  })();

  return (
    <div className={`${isOnly ? "w-full" : "flex-shrink-0 w-[680px] min-w-[320px]"} h-full overflow-y-auto border-r border-slate-200 bg-slate-50`}>
      <div className="px-6 py-8 space-y-5">

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
          </div>
        )}

        {!loading && paragraph && (
          <>
            {/* Header card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-7 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-blue-900 bg-blue-50 border border-blue-100 px-3 py-1 rounded-lg">
                    {paragraph.lawCode}
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'EB Garamond', serif" }}>
                    {sectionPrefix(paragraph.lawCode)} {paragraph.section}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {mapId && (
                    <AddToMapButton paragraphId={paragraph.id} mapId={mapId} label="In Map" />
                  )}
                  {!isFirst && onClose && (
                    <button
                      onClick={onClose}
                      className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              {paragraph.title && (
                <p className="text-sm font-semibold text-slate-500 mb-4">{paragraph.title}</p>
              )}
              <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
                {renderContent(paragraph.content, paragraph.lawCode, onOpenPanel)}
              </div>
            </div>

            {/* KI-Erklärung */}
            <ExplainButton paragraphId={paragraph.id} />

            {/* Notizen */}
            <NoteEditor paragraphId={paragraph.id} />

            {/* Verknüpfte Paragraphen */}
            {allRefs.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  Verknüpfte Paragraphen ({allRefs.length})
                </h3>
                <div className="flex flex-col gap-2">
                  {allRefs.map((ref) => (
                    <div key={ref.id} className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenPanel(ref.id)}
                        className="flex-1 bg-white border border-slate-100 rounded-2xl px-4 py-3 hover:border-blue-200 hover:shadow-md transition-all flex items-center gap-3 text-left"
                      >
                        <span className="text-xs font-bold text-blue-900 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-lg shrink-0">
                          {ref.lawCode}
                        </span>
                        <span className="font-medium text-slate-800 text-sm">
                          {sectionPrefix(ref.lawCode)} {ref.section}
                        </span>
                        {ref.title && (
                          <span className="text-sm text-slate-400 truncate">{ref.title}</span>
                        )}
                      </button>
                      {mapId && (
                        <AddToMapButton paragraphId={ref.id} mapId={mapId} label="+" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
