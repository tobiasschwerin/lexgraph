"use client";

import { useEffect, useState } from "react";
import { X, ArrowRight, ArrowLeft, ExternalLink } from "lucide-react";
import { sectionPrefix } from "@/lib/law-utils";
import Link from "next/link";

type CrossRef = {
  id: string;
  lawCode: string;
  section: string;
  title: string | null;
};

type ParagraphDetail = {
  id: string;
  lawCode: string;
  section: string;
  title: string | null;
  content: string;
  connectionsFrom: { id: string; to: CrossRef }[];
  connectionsTo: { id: string; from: CrossRef }[];
};

interface ParagraphDetailPanelProps {
  paragraphId: string | null;
  onClose: () => void;
  onAddToMap?: (id: string) => void;
  existingIds?: Set<string>;
}

export function ParagraphDetailPanel({
  paragraphId,
  onClose,
  onAddToMap,
  existingIds,
}: ParagraphDetailPanelProps) {
  const [detail, setDetail] = useState<ParagraphDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!paragraphId) { setDetail(null); return; }
    setLoading(true);
    fetch(`/api/laws/${paragraphId}`)
      .then((r) => r.json())
      .then((d) => { setDetail(d as ParagraphDetail); setLoading(false); })
      .catch(() => setLoading(false));
  }, [paragraphId]);

  if (!paragraphId) return null;

  return (
    <div className="absolute top-0 right-0 h-full w-96 bg-white border-l border-slate-200 shadow-xl z-20 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        {detail ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
              {detail.lawCode}
            </span>
            <span className="font-bold text-slate-800">{sectionPrefix(detail.lawCode)} {detail.section}</span>
          </div>
        ) : (
          <span className="text-sm text-slate-400">Lade…</span>
        )}
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
        {loading && (
          <p className="text-sm text-slate-400 text-center py-8">Lade Paragraph…</p>
        )}

        {detail && (
          <>
            {/* Titel */}
            {detail.title && (
              <h2 className="font-semibold text-slate-700 text-base leading-snug">
                {detail.title}
              </h2>
            )}

            {/* Gesetzestext */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {detail.content}
              </p>
            </div>

            {/* Querverweise: dieser § verweist auf */}
            {detail.connectionsFrom.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" /> Verweist auf
                </h3>
                <div className="flex flex-col gap-1.5">
                  {detail.connectionsFrom.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => onAddToMap?.(c.to.id)}
                      disabled={existingIds?.has(c.to.id)}
                      className="flex items-center gap-2 text-left px-3 py-2 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all disabled:opacity-40 disabled:cursor-default group"
                    >
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">
                        {c.to.lawCode}
                      </span>
                      <span className="text-sm font-medium text-slate-700">{sectionPrefix(c.to.lawCode)} {c.to.section}</span>
                      {c.to.title && (
                        <span className="text-xs text-slate-400 truncate">{c.to.title}</span>
                      )}
                      {!existingIds?.has(c.to.id) && (
                        <span className="ml-auto text-xs text-blue-500 opacity-0 group-hover:opacity-100 shrink-0">
                          + Map
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Querverweise: wird verwiesen von */}
            {detail.connectionsTo.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> Wird verwiesen von
                </h3>
                <div className="flex flex-col gap-1.5">
                  {detail.connectionsTo.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => onAddToMap?.(c.from.id)}
                      disabled={existingIds?.has(c.from.id)}
                      className="flex items-center gap-2 text-left px-3 py-2 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all disabled:opacity-40 disabled:cursor-default group"
                    >
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">
                        {c.from.lawCode}
                      </span>
                      <span className="text-sm font-medium text-slate-700">{sectionPrefix(c.from.lawCode)} {c.from.section}</span>
                      {c.from.title && (
                        <span className="text-xs text-slate-400 truncate">{c.from.title}</span>
                      )}
                      {!existingIds?.has(c.from.id) && (
                        <span className="ml-auto text-xs text-blue-500 opacity-0 group-hover:opacity-100 shrink-0">
                          + Map
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {detail.connectionsFrom.length === 0 && detail.connectionsTo.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-2">
                Keine automatischen Querverweise gefunden
              </p>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {detail && (
        <div className="px-5 py-3 border-t border-slate-100">
          <Link
            href={`/search/${detail.id}`}
            target="_blank"
            className="flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Vollansicht öffnen
          </Link>
        </div>
      )}
    </div>
  );
}
