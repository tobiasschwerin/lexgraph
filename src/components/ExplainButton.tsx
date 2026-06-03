"use client";

import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

type State = "idle" | "loading" | "done" | "error";

function renderMarkdown(text: string): React.ReactNode {
  // Simple bold (**text**) and newline rendering — no external lib needed
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const parts = line.split(/\*\*(.+?)\*\*/g);
    const rendered = parts.map((p, j) =>
      j % 2 === 1 ? <strong key={j} className="font-semibold text-slate-800">{p}</strong> : p
    );
    return (
      <span key={i}>
        {rendered}
        {i < lines.length - 1 && <br />}
      </span>
    );
  });
}

export function ExplainButton({ paragraphId }: { paragraphId: string }) {
  const [state, setState] = useState<State>("idle");
  const [explanation, setExplanation] = useState("");
  const [open, setOpen] = useState(false);

  const explain = async () => {
    if (state === "done") {
      setOpen((o) => !o);
      return;
    }
    setState("loading");
    setOpen(true);
    try {
      const res = await fetch(`/api/explain/${paragraphId}`, { method: "POST" });
      if (!res.ok) throw new Error("API error");
      const data = (await res.json()) as { explanation: string };
      setExplanation(data.explanation);
      setState("done");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl overflow-hidden shadow-sm">
      {/* Button row */}
      <button
        onClick={explain}
        disabled={state === "loading"}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-indigo-100/50 transition-colors disabled:opacity-70"
      >
        <div className="flex items-center gap-2.5">
          {state === "loading" ? (
            <Loader2 className="w-4 h-4 text-indigo-500 animate-spin shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
          )}
          <span className="text-sm font-semibold text-indigo-700">
            {state === "idle" && "KI-Erklärung anzeigen"}
            {state === "loading" && "Analyse läuft…"}
            {state === "done" && "KI-Erklärung"}
            {state === "error" && "Fehler — erneut versuchen"}
          </span>
        </div>
        {state === "done" && (
          open ? <ChevronUp className="w-4 h-4 text-indigo-400" /> : <ChevronDown className="w-4 h-4 text-indigo-400" />
        )}
      </button>

      {/* Explanation body */}
      {state === "done" && open && (
        <div className="px-5 pb-5 pt-1 border-t border-indigo-100">
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {renderMarkdown(explanation)}
          </p>
          <p className="text-xs text-indigo-300 mt-3 text-right">Generiert von Claude · Keine Rechtsberatung</p>
        </div>
      )}
    </div>
  );
}
