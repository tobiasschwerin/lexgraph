"use client";

import { useEffect, useRef, useState } from "react";
import { X, Search } from "lucide-react";
import { sectionPrefix } from "@/lib/law-utils";

type SearchResult = {
  id: string;
  lawCode: string;
  section: string;
  title: string | null;
};

interface SearchPanelProps {
  onAdd: (paragraphId: string) => void;
  onClose: () => void;
}

export function SearchPanel({ onAdd, onClose }: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    if (!query.trim()) { setResults([]); return; }

    debounce.current = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/laws?q=${encodeURIComponent(query)}&limit=10`);
      const data = await res.json() as { results: SearchResult[] };
      setResults(data.results);
      setLoading(false);
    }, 300);

    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [query]);

  return (
    <div className="absolute top-16 left-4 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
      <div className="flex items-center gap-2 p-3 border-b border-slate-100">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          autoFocus
          type="text"
          placeholder="Paragraph suchen… (§ 242 BGB)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 text-sm outline-none placeholder:text-slate-400"
        />
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-72 overflow-y-auto">
        {loading && (
          <p className="text-xs text-slate-400 text-center py-4">Suche…</p>
        )}
        {!loading && results.length === 0 && query.trim() && (
          <p className="text-xs text-slate-400 text-center py-4">Keine Ergebnisse</p>
        )}
        {results.map((r) => (
          <button
            key={r.id}
            onClick={() => { onAdd(r.id); onClose(); }}
            className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                {r.lawCode}
              </span>
              <span className="text-sm font-medium text-slate-700">{sectionPrefix(r.lawCode)} {r.section}</span>
            </div>
            {r.title && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">{r.title}</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
