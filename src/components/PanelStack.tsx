"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ParagraphPanel, type ParagraphData } from "./ParagraphPanel";

interface PanelStackProps {
  initialData: ParagraphData;
  mapId?: string;
}

export function PanelStack({ initialData, mapId }: PanelStackProps) {
  const [panels, setPanels] = useState<string[]>([initialData.id]);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const openPanel = useCallback((id: string) => {
    setPanels((prev) => {
      if (prev.includes(id)) {
        // Already open — scroll to it
        setTimeout(() => {
          const el = panelRefs.current.get(id);
          el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }, 50);
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  const closePanel = useCallback((id: string) => {
    setPanels((prev) => prev.filter((p) => p !== id));
  }, []);

  // Scroll to reveal newly added panel
  useEffect(() => {
    if (panels.length > 1 && containerRef.current) {
      setTimeout(() => {
        containerRef.current?.scrollTo({
          left: containerRef.current.scrollWidth,
          behavior: "smooth",
        });
      }, 50);
    }
  }, [panels.length]);

  return (
    <div
      ref={containerRef}
      className="flex-1 flex overflow-x-auto overflow-y-hidden"
      style={{ scrollbarWidth: "thin" }}
    >
      {panels.map((panelId, i) => (
        <div
          key={panelId}
          ref={(el) => {
            if (el) panelRefs.current.set(panelId, el);
            else panelRefs.current.delete(panelId);
          }}
          className="h-full"
        >
          <ParagraphPanel
            paragraphId={panelId}
            initialData={panelId === initialData.id ? initialData : undefined}
            onOpenPanel={openPanel}
            onClose={i > 0 ? () => closePanel(panelId) : undefined}
            mapId={mapId}
            isFirst={i === 0}
            isOnly={panels.length === 1}
          />
        </div>
      ))}
    </div>
  );
}
