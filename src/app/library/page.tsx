"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Map, Trash2, Zap, Crown } from "lucide-react";

const FREE_LIMIT = 3;

type LexMap = {
  id: string;
  title: string;
  description: string | null;
  updatedAt: string;
  _count: { nodes: number };
};

export default function LibraryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [maps, setMaps] = useState<LexMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const upgraded = searchParams.get("upgraded") === "true";

  useEffect(() => {
    fetch("/api/maps")
      .then((r) => r.json())
      .then((data) => { setMaps(data as LexMap[]); setLoading(false); })
      .catch(() => setLoading(false));
    fetch("/api/subscription")
      .then((r) => r.json())
      .then((d: { isPro: boolean }) => setIsPro(d.isPro))
      .catch(() => {});
  }, []);

  const createMap = async () => {
    if (!newTitle.trim() || saving) return;
    setSaving(true);
    const res = await fetch("/api/maps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim() }),
    });
    if (res.status === 403) {
      setSaving(false);
      setCreating(false);
      setNewTitle("");
      setShowUpgradePrompt(true);
      return;
    }
    const map = await res.json() as { id: string };
    router.push(`/graph/${map.id}`);
  };

  const deleteMap = async (id: string) => {
    if (!confirm("Map löschen?")) return;
    await fetch(`/api/maps/${id}`, { method: "DELETE" });
    setMaps((prev) => prev.filter((m) => m.id !== id));
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json() as { url: string };
    if (data.url) window.location.href = data.url;
    else setUpgrading(false);
  };

  const atLimit = !isPro && maps.length >= FREE_LIMIT;

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
        <div className="flex items-center gap-3">
          {isPro ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
              <Crown className="w-3.5 h-3.5" /> Pro
            </span>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="flex items-center gap-1.5 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              <Zap className="w-3.5 h-3.5" />
              {upgrading ? "Weiterleitung…" : "Upgrade auf Pro"}
            </button>
          )}
          <button
            onClick={() => atLimit ? setShowUpgradePrompt(true) : setCreating(true)}
            className="flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Neue Map
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto w-full px-6 pt-10 pb-8">

        {/* Upgrade success banner */}
        {upgraded && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <Crown className="w-5 h-5 text-green-600 shrink-0" />
            <p className="text-sm text-green-800 font-medium">Willkommen bei Pro! Du hast jetzt unbegrenzte Maps.</p>
          </div>
        )}

        {/* Free plan usage */}
        {!isPro && !loading && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>Maps ({maps.length}/{FREE_LIMIT} kostenlos)</span>
              {atLimit && <span className="text-orange-500 font-medium">Limit erreicht</span>}
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${atLimit ? "bg-orange-400" : "bg-blue-500"}`}
                style={{ width: `${Math.min(100, (maps.length / FREE_LIMIT) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Upgrade prompt modal */}
        {showUpgradePrompt && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm text-center">
            <Crown className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-800 mb-1">Free-Limit erreicht</h3>
            <p className="text-sm text-slate-500 mb-4">
              Mit dem Free-Plan kannst du bis zu {FREE_LIMIT} Maps erstellen. Upgrade auf Pro für unbegrenzte Maps und Kollaboration.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-60 transition-opacity"
              >
                <Zap className="w-4 h-4" />
                {upgrading ? "Weiterleitung…" : "Pro für €14,99/Monat"}
              </button>
              <button
                onClick={() => setShowUpgradePrompt(false)}
                className="text-slate-500 text-sm px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}

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
