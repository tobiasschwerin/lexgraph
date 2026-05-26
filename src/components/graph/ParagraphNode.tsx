"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { sectionPrefix } from "@/lib/law-utils";

export type ParagraphNodeData = {
  lawCode: string;
  section: string;
  title: string | null;
  content: string;
  selected?: boolean;
};

export function ParagraphNode({ data, selected }: NodeProps) {
  const d = data as ParagraphNodeData;
  return (
    <div
      className={cn(
        "bg-white border-2 rounded-xl shadow-md p-3 w-64 cursor-pointer transition-all",
        selected ? "border-blue-500 shadow-blue-100 shadow-lg" : "border-slate-200 hover:border-slate-400"
      )}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-slate-400" />

      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
          {d.lawCode}
        </span>
        <span className="text-sm font-semibold text-slate-800">{sectionPrefix(d.lawCode)} {d.section}</span>
      </div>

      {d.title && (
        <p className="text-xs font-medium text-slate-600 mb-1 truncate">{d.title}</p>
      )}

      <p className="text-xs text-slate-500 line-clamp-3">{d.content}</p>

      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-slate-400" />
    </div>
  );
}
