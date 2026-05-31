"use client";

import { useEffect, useState } from "react";
import { Zap, Crown } from "lucide-react";

export function UpgradeButton() {
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/subscription")
      .then((r) => r.json())
      .then((d: { isPro: boolean }) => setIsPro(d.isPro))
      .catch(() => setIsPro(false));
  }, []);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(`Fehler beim Checkout: ${data.error ?? "Unbekannter Fehler"}`);
        setLoading(false);
      }
    } catch (e) {
      alert(`Netzwerkfehler: ${String(e)}`);
      setLoading(false);
    }
  };

  if (isPro === null) return null;

  if (isPro) {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
        <Crown className="w-3.5 h-3.5" /> Pro
      </span>
    );
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-60"
    >
      <Zap className="w-3.5 h-3.5" />
      {loading ? "Weiterleitung…" : "Upgrade auf Pro"}
    </button>
  );
}
