"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeMouseHandler,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ParagraphNode, type ParagraphNodeData } from "./ParagraphNode";
import { ConnectionEdge } from "./ConnectionEdge";
import { SearchPanel } from "./SearchPanel";

const nodeTypes = { paragraph: ParagraphNode };
const edgeTypes = { connection: ConnectionEdge };

type MapNode = {
  id: string;
  paragraphId: string;
  posX: number;
  posY: number;
  paragraph: {
    id: string;
    lawCode: string;
    section: string;
    title: string | null;
    content: string;
  };
};

type MapConnection = {
  id: string;
  fromId: string;
  toId: string;
  label?: string | null;
  isAutomatic: boolean;
};

type LexMapData = {
  id: string;
  title: string;
  nodes: MapNode[];
  connections: MapConnection[];
};

interface LexCanvasProps {
  mapData: LexMapData;
  readOnly?: boolean;
}

function mapDataToFlow(data: LexMapData): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = data.nodes.map((n) => ({
    id: n.paragraphId,
    type: "paragraph",
    position: { x: n.posX, y: n.posY },
    data: {
      lawCode: n.paragraph.lawCode,
      section: n.paragraph.section,
      title: n.paragraph.title,
      content: n.paragraph.content,
    } satisfies ParagraphNodeData,
  }));

  const edges: Edge[] = data.connections.map((c) => ({
    id: c.id,
    source: c.fromId,
    target: c.toId,
    type: "connection",
    markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12 },
    data: { label: c.label, isAutomatic: c.isAutomatic },
  }));

  return { nodes, edges };
}

export function LexCanvas({ mapData, readOnly = false }: LexCanvasProps) {
  const { nodes: initNodes, edges: initEdges } = mapDataToFlow(mapData);
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
  const [saving, setSaving] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleSave = useCallback(
    (updatedNodes: Node[]) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        setSaving(true);
        await fetch(`/api/maps/${mapData.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nodes: updatedNodes.map((n) => ({
              paragraphId: n.id,
              posX: n.position.x,
              posY: n.position.y,
            })),
          }),
        });
        setSaving(false);
      }, 1000);
    },
    [mapData.id]
  );

  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      onNodesChange(changes);
      setNodes((nds) => {
        scheduleSave(nds);
        return nds;
      });
    },
    [onNodesChange, setNodes, scheduleSave]
  );

  // Paragraph doppelklicken → im selben Tab zur Detailseite navigieren
  // mapId als Query-Param mitgeben, damit der Zurück-Button frisch laden kann
  const onNodeDoubleClick: NodeMouseHandler = useCallback((_event, node) => {
    router.push(`/search/${node.id}?from=${mapData.id}`);
  }, [router, mapData.id]);


  const onConnect = useCallback(
    async (connection: Connection) => {
      const label = prompt("Verbindungsbezeichnung (optional):", "") ?? undefined;
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromId: connection.source,
          toId: connection.target,
          label: label || undefined,
          mapId: mapData.id,
        }),
      });
      const newConn = await res.json() as { id: string };
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id: newConn.id,
            type: "connection",
            markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12 },
            data: { label, isAutomatic: false },
          },
          eds
        )
      );
    },
    [setEdges, mapData.id]
  );

  const addParagraph = useCallback(
    async (paragraphId: string) => {
      const alreadyExists = nodes.some((n) => n.id === paragraphId);
      if (alreadyExists) return;

      const xOffset = 100 + (nodes.length % 5) * 280;
      const yOffset = 100 + Math.floor(nodes.length / 5) * 200;

      const res = await fetch(`/api/maps/${mapData.id}/nodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paragraphId, posX: xOffset, posY: yOffset }),
      });

      if (!res.ok) return;

      const paraRes = await fetch(`/api/laws/${paragraphId}`);
      const para = await paraRes.json() as {
        id: string;
        lawCode: string;
        section: string;
        title: string | null;
        content: string;
      };

      setNodes((nds) => [
        ...nds,
        {
          id: para.id,
          type: "paragraph",
          position: { x: xOffset, y: yOffset },
          data: {
            lawCode: para.lawCode,
            section: para.section,
            title: para.title,
            content: para.content,
          } satisfies ParagraphNodeData,
        },
      ]);
    },
    [nodes, setNodes, mapData.id]
  );

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : handleNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        onNodeDoubleClick={readOnly ? undefined : onNodeDoubleClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        fitView
        minZoom={0.2}
        maxZoom={2}
      >
        <Background gap={24} color="#e2e8f0" />
        <Controls />
        <MiniMap nodeColor="#3b82f6" maskColor="rgba(0,0,0,0.05)" />
      </ReactFlow>

      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white border border-slate-200 rounded-xl shadow-md px-4 py-2 z-10">
        {readOnly ? (
          <>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">Nur lesen</span>
            <span className="text-slate-300">|</span>
          </>
        ) : (
          <>
            <Link
              href="/library"
              className="text-slate-400 hover:text-slate-700 transition-colors"
              title="Zurück zur Übersicht"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-slate-300">|</span>
          </>
        )}
        <h1 className="text-sm font-semibold text-slate-700">{mapData.title}</h1>
        {!readOnly && (
          <>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setShowSearch((s) => !s)}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Paragraph hinzufügen
            </button>
            {saving && <span className="text-xs text-slate-400">Speichert…</span>}
          </>
        )}
      </div>

      {/* Suchpanel */}
      {!readOnly && showSearch && (
        <SearchPanel
          onAdd={addParagraph}
          onClose={() => setShowSearch(false)}
        />
      )}

    </div>
  );
}
