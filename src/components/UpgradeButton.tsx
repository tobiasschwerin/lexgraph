"use client";

import { useEffect, useState } from "react";
import { Zap, Crown } from "lucide-react";

export function UpgradeButton() {
  const [isPro, setIsPro] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/subscription")
      .then((r) => r.json())
      .then((d: { isPro: boolean }) => setIsPro(d.isPro))
      .catch(() => setIsPro(false));
  }, []);

  if (isPro === null) return null;

  if (isPro) {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
        <Crown className="w-3.5 h-3.5" /> Pro
      </span>
    );
  }

  return (
    <a
      href="/api/stripe/checkout"
      className="flex items-center gap-1.5 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity"
    >
      <Zap className="w-3.5 h-3.5" />
      Upgrade auf Pro
    </a>
  );
}
