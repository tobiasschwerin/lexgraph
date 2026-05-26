"use client";

import { useEffect, useState } from "react";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import { sectionPrefix } from "@/lib/law-utils";

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

interface ParagraphModalProps {
  paragraphId: string | null;
  onClose: () => void;
  onAddToMap?: (id: string) => void;
  existingIds?: Set<string>;
}

export function ParagraphModal({
  paragraphId,
  onClose,
  onAddToMap,
  existingIds,
}: ParagraphModalProps) {
  const [detail, setDetail] = useState<ParagraphDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!paragraphId) { setDetail(null); return; }
    setLoading(true);
    setDetail(null);
    fetch(`/api/laws/${paragraphId}`)
      .then((r) => r.json())
      .then((d) => { setDetail(d as ParagraphDetail); setLoading(false); })
      .catch(() => setLoading(false));
  }, [paragraphId]);

  // Escape-Taste schließt das Modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!paragraphId) return null;

  return (
    /* Dunkler Hintergrund */
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      {/* Modal-Karte — Klick innen schließt NICHT */}
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
          {loading && <span className="text-slate-400 text-sm">Lade…</span>}
          {detail && (
            <div className="flex items-center gap-3">
              <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-sm">
                {detail.lawCode}
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                {sectionPrefix(detail.lawCode)} {detail.section}
              </h2>
            </div>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700"
            title="Schließen (Escape)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollbarer Inhalt */}
        <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6">
          {loading && (
            <p className="text-center text-slate-400 py-12">Paragraph wird geladen…</p>
          )}

          {detail && (
            <>
              {/* Titel */}
              {detail.title && (
                <h3 className="text-lg font-semibold text-slate-700">
                  {detail.title}
                </h3>
              )}

              {/* Vollständiger Gesetzestext */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <p className="text-slate-800 leading-relaxed whitespace-pre-wrap text-base">
                  {detail.content}
                </p>
              </div>

              {/* Querverweise */}
              {detail.connectionsFrom.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <ArrowRight className="w-4 h-4" />
                    Dieser Paragraph verweist auf
                  </h4>
                  <div className="flex flex-col gap-2">
                    {detail.connectionsFrom.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => { onAddToMap?.(c.to.id); onClose(); }}
                        disabled={existingIds?.has(c.to.id)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left disabled:opacity-40 disabled:cursor-default group"
                      >
                        <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded shrink-0">
                          {c.to.lawCode}
                        </span>
                        <span className="font-semibold text-slate-700">{sectionPrefix(c.to.lawCode)} {c.to.section}</span>
                        {c.to.title && (
                          <span className="text-sm text-slate-500 truncate">{c.to.title}</span>
                        )}
                        {!existingIds?.has(c.to.id) && (
                          <span className="ml-auto text-xs text-blue-500 shrink-0 opacity-0 group-hover:opacity-100">
                            Zur Map hinzufügen →
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {detail.connectionsTo.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <ArrowLeft className="w-4 h-4" />
                    Wird verwiesen von
                  </h4>
                  <div className="flex flex-col gap-2">
                    {detail.connectionsTo.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => { onAddToMap?.(c.from.id); onClose(); }}
                        disabled={existingIds?.has(c.from.id)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left disabled:opacity-40 disabled:cursor-default group"
                      >
                        <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded shrink-0">
                          {c.from.lawCode}
                        </span>
                        <span className="font-semibold text-slate-700">{sectionPrefix(c.from.lawCode)} {c.from.section}</span>
                        {c.from.title && (
                          <span className="text-sm text-slate-500 truncate">{c.from.title}</span>
                        )}
                        {!existingIds?.has(c.from.id) && (
                          <span className="ml-auto text-xs text-blue-500 shrink-0 opacity-0 group-hover:opacity-100">
                            Zur Map hinzufügen →
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-xl font-medium text-sm transition-colors"
          >
            ← Zurück zur Mindmap
          </button>
        </div>
      </div>
    </div>
  );
}
