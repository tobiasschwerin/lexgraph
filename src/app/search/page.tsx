"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Search, ArrowLeft } from "lucide-react";
import { sectionPrefix } from "@/lib/law-utils";

type SearchResult = {
  id: string;
  lawCode: string;
  section: string;
  title: string | null;
};

const LAW_FILTERS = ["Alle", "BGB", "HGB", "StGB", "GG", "ZPO", "StPO", "VwGO"];

const PAGE_SIZE = 50;

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [lawFilter, setLawFilter] = useState("Alle");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const offsetRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const fetchResults = useCallback(
    async (q: string, law: string, off: number, append: boolean) => {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const limit = PAGE_SIZE;
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(off),
      });
      if (q.trim()) params.set("q", q.trim());
      if (law !== "Alle") params.set("law", law);

      try {
        const res = await fetch(`/api/laws?${params}`);
        const data = (await res.json()) as { results: SearchResult[]; total: number };

        const newResults = data.results;
        const nextOffset = off + newResults.length;

        setResults((prev) => (append ? [...prev, ...newResults] : newResults));
        setTotal(data.total);
        setHasMore(nextOffset < data.total);
        offsetRef.current = nextOffset;
      } finally {
        if (append) setLoadingMore(false);
        else setLoading(false);
      }
    },
    []
  );

  // Neue Suche wenn Query oder Filter sich ändern
  // Beim ersten Laden (query leer, Filter "Alle") sofort feuern
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const delay = query ? 300 : 0;
    debounceRef.current = setTimeout(() => {
      offsetRef.current = 0;
      fetchResults(query, lawFilter, 0, false);
    }, delay);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, lawFilter, fetchResults]);

  // Infinite Scroll: wenn untere Kante sichtbar wird, nächste Seite laden
  useEffect(() => {
    const el = bottomRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          fetchResults(query, lawFilter, offsetRef.current, true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, query, lawFilter, fetchResults]);

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center gap-4 px-8 py-4 border-b border-slate-200 bg-white">
        <Link href="/" className="text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="text-lg font-bold text-blue-600">LexGraph</span>
        <span className="text-slate-300">|</span>
        <span className="text-sm text-slate-500">Gesetze suchen</span>
      </nav>

      <div className="max-w-3xl mx-auto w-full px-6 pt-12 pb-8">
        {/* Suchfeld */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            autoFocus
            type="text"
            placeholder="Suche nach Paragraph, Begriff oder Gesetz…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-base border border-slate-200 rounded-xl bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
          />
        </div>

        {/* Gesetz-Filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          {LAW_FILTERS.map((law) => (
            <button
              key={law}
              onClick={() => setLawFilter(law)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                lawFilter === law
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
              }`}
            >
              {law}
            </button>
          ))}
        </div>

        {/* Ladezustand */}
        {loading && (
          <p className="text-sm text-slate-400 text-center py-12">Lade…</p>
        )}

        {/* Treffer-Zähler */}
        {!loading && total > 0 && (
          <p className="text-xs text-slate-400 mb-3">
            {`${total} Paragraph${total !== 1 ? "en" : ""}`}
          </p>
        )}

        {/* Kein Ergebnis */}
        {!loading && results.length === 0 && (query || lawFilter !== "Alle") && (
          <div className="text-center py-16">
            <p className="text-slate-400 text-sm">Keine Paragraphen gefunden.</p>
            <p className="text-slate-400 text-xs mt-1">
              Tipp: Importiere zuerst die Gesetze mit{" "}
              <code className="bg-slate-100 px-1 rounded">npm run import-laws</code>
            </p>
          </div>
        )}


        {/* Ergebnisliste */}
        <div className="flex flex-col gap-2">
          {results.map((r) => (
            <Link
              key={r.id}
              href={`/search/${r.id}`}
              className="bg-white border border-slate-200 rounded-xl px-5 py-4 hover:border-blue-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg group-hover:bg-blue-100 transition-colors">
                  {r.lawCode}
                </span>
                <span className="font-semibold text-slate-800">{sectionPrefix(r.lawCode)} {r.section}</span>
                {r.title && (
                  <span className="text-slate-500 text-sm truncate">{r.title}</span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Infinite-Scroll-Anker + Ladeindikator */}
        {hasMore && (
          <div ref={bottomRef} className="py-10 text-center">
            {loadingMore && (
              <p className="text-sm text-slate-400">Weitere Paragraphen werden geladen…</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
