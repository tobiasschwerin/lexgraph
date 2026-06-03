"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { NotebookPen, Check, Loader2 } from "lucide-react";

type SaveState = "idle" | "saving" | "saved";

export function NoteEditor({ paragraphId }: { paragraphId: string }) {
  const [content, setContent] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load existing note
  useEffect(() => {
    fetch(`/api/notes/${paragraphId}`)
      .then((r) => r.json())
      .then((d: { content?: string }) => {
        setContent(d.content ?? "");
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [paragraphId]);

  const save = useCallback(
    async (text: string) => {
      setSaveState("saving");
      try {
        await fetch(`/api/notes/${paragraphId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text }),
        });
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 2000);
      } catch {
        setSaveState("idle");
      }
    },
    [paragraphId]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    setSaveState("idle");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(val), 800);
  };

  if (!loaded) return null;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <NotebookPen className="w-4 h-4" />
          Meine Notizen
        </h3>
        <span className="flex items-center gap-1 text-xs text-slate-400 h-4">
          {saveState === "saving" && (
            <><Loader2 className="w-3 h-3 animate-spin" /> Speichern…</>
          )}
          {saveState === "saved" && (
            <><Check className="w-3 h-3 text-green-500" /> <span className="text-green-600">Gespeichert</span></>
          )}
        </span>
      </div>
      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Eigene Notizen, Subsumtion, Formulierungsbausteine…"
        rows={4}
        className="w-full text-sm text-slate-700 placeholder-slate-300 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-y leading-relaxed transition-all"
      />
    </div>
  );
}
