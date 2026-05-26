"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  type EdgeProps,
} from "@xyflow/react";

export type ConnectionEdgeData = {
  label?: string;
  isAutomatic?: boolean;
};

export function ConnectionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  markerEnd,
}: EdgeProps) {
  const d = (data ?? {}) as ConnectionEdgeData;
  const [edgePath, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: d.isAutomatic ? "#94a3b8" : "#3b82f6",
          strokeDasharray: d.isAutomatic ? "5 3" : undefined,
          strokeWidth: 1.5,
        }}
      />
      {d.label && (
        <EdgeLabelRenderer>
          <div
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)` }}
            className="absolute pointer-events-none bg-white border border-slate-200 text-xs text-slate-600 px-2 py-0.5 rounded-full shadow-sm"
          >
            {d.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
