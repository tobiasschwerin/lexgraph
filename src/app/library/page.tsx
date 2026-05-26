"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Map, Trash2 } from "lucide-react";

type LexMap = {
  id: string;
  title: string;
  description: string | null;
  updatedAt: string;
  _count: { nodes: number };
};

export default function LibraryPage() {
  const router = useRouter();
  const [maps, setMaps] = useState<LexMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/maps")
      .then((r) => r.json())
      .then((data) => { setMaps(data as LexMap[]); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const createMap = async () => {
    if (!newTitle.trim() || saving) return;
    setSaving(true);
    const res = await fetch("/api/maps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim() }),
    });
    const map = await res.json() as { id: string };
    // Direkt zur neuen Mindmap weiterleiten
    router.push(`/graph/${map.id}`);
  };

  const deleteMap = async (id: string) => {
    if (!confirm("Map löschen?")) return;
    await fetch(`/api/maps/${id}`, { method: "DELETE" });
    setMaps((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-between gap-4 px-8 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-lg font-bold text-blue-600">LexGraph</span>
          <span className="text-slate-300">|</span>
          <span className="text-sm text-slate-500">Meine Maps</span>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Neue Map
        </button>
      </nav>

      <div className="max-w-3xl mx-auto w-full px-6 pt-10 pb-8">
        {creating && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-3">Neue Map erstellen</h3>
            <input
              autoFocus
              type="text"
              placeholder="Titel, z.B. 'AGB-Recht § 305ff'"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createMap()}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-300 mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={createMap}
                disabled={!newTitle.trim() || saving}
                className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? "Wird erstellt…" : "Erstellen & öffnen"}
              </button>
              <button
                onClick={() => { setCreating(false); setNewTitle(""); }}
                disabled={saving}
                className="text-slate-500 text-sm px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {loading && <p className="text-slate-400 text-sm text-center py-16">Lade…</p>}

        {!loading && maps.length === 0 && !creating && (
          <div className="text-center py-20">
            <Map className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Noch keine Maps</p>
            <p className="text-slate-400 text-sm mt-1">Erstelle deine erste Map, um Paragraphen zu verbinden.</p>
            <button
              onClick={() => setCreating(true)}
              className="mt-5 bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Erste Map erstellen
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {maps.map((map) => (
            <div
              key={map.id}
              className="bg-white border border-slate-200 rounded-xl px-5 py-4 hover:border-blue-300 hover:shadow-sm transition-all flex items-center gap-4 group"
            >
              <Link href={`/graph/${map.id}`} className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{map.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {map._count.nodes} Paragraph{map._count.nodes !== 1 ? "en" : ""} ·{" "}
                  {new Date(map.updatedAt).toLocaleDateString("de-DE")}
                </p>
              </Link>
              <button
                onClick={() => deleteMap(map.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
