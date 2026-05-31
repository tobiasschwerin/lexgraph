"use client";

import { useState } from "react";
import { Plus, Check, Loader2 } from "lucide-react";

export function AddToMapButton({
  paragraphId,
  mapId,
  label = "+",
}: {
  paragraphId: string;
  mapId: string;
  label?: string;
}) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "exists">("idle");

  const handleAdd = async () => {
    if (state !== "idle") return;
    setState("loading");
    const res = await fetch(`/api/maps/${mapId}/nodes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paragraphId }),
    });
    if (res.ok) {
      setState("done");
    } else if (res.status === 409) {
      setState("exists");
    } else {
      setState("idle");
    }
  };

  return (
    <button
      onClick={handleAdd}
      disabled={state === "loading" || state === "done" || state === "exists"}
      title={
        state === "done" ? "Hinzugefügt" :
        state === "exists" ? "Bereits in der Map" :
        "Zur Map hinzufügen"
      }
      className={`shrink-0 flex items-center gap-1 text-xs font-medium px-3 py-2 rounded-xl border transition-all ${
        state === "done"
          ? "bg-green-50 border-green-200 text-green-700"
          : state === "exists"
          ? "bg-slate-50 border-slate-200 text-slate-400"
          : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
      }`}
    >
      {state === "loading" ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : state === "done" ? (
        <Check className="w-3.5 h-3.5" />
      ) : (
        <Plus className="w-3.5 h-3.5" />
      )}
      {label === "+" ? null : label}
    </button>
  );
}
