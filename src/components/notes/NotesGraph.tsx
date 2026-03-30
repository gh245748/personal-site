"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";

interface NoteNode {
  id: string;
  title: string;
  author?: string | null;
  type: string;
  rating?: number | null;
}

interface NoteLink {
  source: string;
  target: string;
  label?: string | null;
}

interface TooltipState {
  x: number;
  y: number;
  node: NoteNode;
}

const TYPE_COLOR: Record<string, string> = {
  book:    "#D4872A",
  film:    "#5599E8",
  article: "#55C888",
  music:   "#C855E8",
};

const TYPE_LABEL: Record<string, string> = {
  book: "Kitap", film: "Film", article: "Makale", music: "Müzik",
};

function nodeRadius(rating: number | null | undefined) {
  return 10 + (rating ?? 3) * 2;
}

export default function NotesGraph({
  nodes,
  links,
}: {
  nodes: NoteNode[];
  links: NoteLink[];
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const hideTooltip = useCallback(() => setTooltip(null), []);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    if (nodes.length === 0) return;

    const el = svgRef.current;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    d3.select(el).selectAll("*").remove();

    const svg = d3
      .select(el)
      .attr("width", width)
      .attr("height", height);

    // Defs — glow filter
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "ng-glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Zoomable container
    const g = svg.append("g");
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on("zoom", (event) => g.attr("transform", event.transform));
    svg.call(zoom);

    // Clone link data so D3 can mutate source/target
    const linkData: (NoteLink & d3.SimulationLinkDatum<d3.SimulationNodeDatum>)[] =
      links.map((l) => ({ ...l }));

    const nodeData = nodes.map((n) => ({ ...n })) as (NoteNode &
      d3.SimulationNodeDatum)[];

    const simulation = d3
      .forceSimulation(nodeData)
      .force(
        "link",
        d3
          .forceLink<d3.SimulationNodeDatum, d3.SimulationLinkDatum<d3.SimulationNodeDatum>>(linkData)
          .id((d) => (d as NoteNode).id)
          .distance(140)
      )
      .force("charge", d3.forceManyBody().strength(-350))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d) => nodeRadius((d as NoteNode).rating) + 8));

    // Link lines
    const linkSel = g
      .append("g")
      .attr("class", "links")
      .selectAll<SVGLineElement, typeof linkData[0]>("line")
      .data(linkData)
      .join("line")
      .attr("stroke", "#2A2A2A")
      .attr("stroke-width", 1.5)
      .attr("stroke-linecap", "round");

    // Link labels
    const linkLabelSel = g
      .append("g")
      .attr("class", "link-labels")
      .selectAll<SVGTextElement, typeof linkData[0]>("text")
      .data(linkData.filter((l) => l.label))
      .join("text")
      .text((d) => d.label ?? "")
      .attr("text-anchor", "middle")
      .attr("fill", "#555")
      .attr("font-size", 9)
      .attr("font-family", "var(--font-mono, monospace)")
      .attr("pointer-events", "none");

    // Node groups
    const nodeSel = g
      .append("g")
      .attr("class", "nodes")
      .selectAll<SVGGElement, typeof nodeData[0]>("g")
      .data(nodeData)
      .join("g")
      .style("cursor", "grab")
      .call(
        d3
          .drag<SVGGElement, typeof nodeData[0]>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Outer glow ring
    nodeSel
      .append("circle")
      .attr("r", (d) => nodeRadius(d.rating) + 4)
      .attr("fill", (d) => TYPE_COLOR[d.type] ?? "#888")
      .attr("fill-opacity", 0.15)
      .attr("pointer-events", "none");

    // Main circle
    nodeSel
      .append("circle")
      .attr("r", (d) => nodeRadius(d.rating))
      .attr("fill", (d) => TYPE_COLOR[d.type] ?? "#888")
      .attr("fill-opacity", 0.9)
      .attr("filter", "url(#ng-glow)")
      .on("mouseenter", function (event, d) {
        d3.select(this).attr("fill-opacity", 1).attr("r", nodeRadius(d.rating) + 2);
        setTooltip({ x: event.clientX, y: event.clientY, node: d });
      })
      .on("mousemove", (event, d) => {
        setTooltip({ x: event.clientX, y: event.clientY, node: d });
      })
      .on("mouseleave", function (_, d) {
        d3.select(this).attr("fill-opacity", 0.9).attr("r", nodeRadius(d.rating));
        hideTooltip();
      });

    // Labels below node
    nodeSel
      .append("text")
      .text((d) => (d.title.length > 22 ? d.title.slice(0, 20) + "…" : d.title))
      .attr("text-anchor", "middle")
      .attr("dy", (d) => nodeRadius(d.rating) + 14)
      .attr("fill", "#C0BCB4")
      .attr("font-size", 11)
      .attr("font-family", "var(--font-sans, sans-serif)")
      .attr("pointer-events", "none");

    // Tick
    simulation.on("tick", () => {
      linkSel
        .attr("x1", (d) => (d.source as d3.SimulationNodeDatum & { x: number }).x)
        .attr("y1", (d) => (d.source as d3.SimulationNodeDatum & { y: number }).y)
        .attr("x2", (d) => (d.target as d3.SimulationNodeDatum & { x: number }).x)
        .attr("y2", (d) => (d.target as d3.SimulationNodeDatum & { y: number }).y);

      linkLabelSel
        .attr("x", (d) => {
          const s = d.source as d3.SimulationNodeDatum & { x: number };
          const t = d.target as d3.SimulationNodeDatum & { x: number };
          return (s.x + t.x) / 2;
        })
        .attr("y", (d) => {
          const s = d.source as d3.SimulationNodeDatum & { y: number };
          const t = d.target as d3.SimulationNodeDatum & { y: number };
          return (s.y + t.y) / 2;
        });

      nodeSel.attr(
        "transform",
        (d) => `translate(${(d as d3.SimulationNodeDatum & { x: number }).x},${(d as d3.SimulationNodeDatum & { y: number }).y})`
      );
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, hideTooltip]);

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-[560px] border border-[hsl(var(--border))] rounded-sm bg-[#060606]">
        <p className="text-[hsl(var(--muted))] text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          Henüz not yok.
        </p>
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-[560px] border border-[hsl(var(--border))] rounded-sm bg-[#060606]">
        <p className="text-[hsl(var(--muted))] text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          Henüz bağlantı tanımlanmamış.
        </p>
        <p className="text-[hsl(var(--muted))] text-xs">
          Admin panelinden notlar arasında bağlantı kurabilirsiniz.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[600px] bg-[#060606] border border-[hsl(var(--border))] rounded-sm overflow-hidden select-none"
    >
      <svg ref={svgRef} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-sm border border-[hsl(var(--border))]">
        {Object.entries(TYPE_COLOR).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span
              className="text-[10px] text-[hsl(var(--muted))]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {TYPE_LABEL[type] ?? type}
            </span>
          </div>
        ))}
      </div>

      {/* Zoom hint */}
      <div className="absolute top-3 right-3 text-[10px] text-[hsl(var(--muted))] bg-black/60 px-2 py-1 rounded-sm border border-[hsl(var(--border))]"
        style={{ fontFamily: "var(--font-mono)" }}>
        Kaydır: zoom · Sürükle: taşı
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-3 py-2 bg-[#1A1A1A] border border-amber/30 rounded-sm pointer-events-none shadow-xl"
          style={{ left: tooltip.x + 14, top: tooltip.y - 10 }}
        >
          <div
            className="text-sm text-[#F0EDE4] font-medium"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {tooltip.node.title}
          </div>
          {tooltip.node.author && (
            <div className="text-xs text-[hsl(var(--muted))] mt-0.5">{tooltip.node.author}</div>
          )}
          <div
            className="text-[10px] mt-1 font-medium"
            style={{ color: TYPE_COLOR[tooltip.node.type] ?? "#888", fontFamily: "var(--font-mono)" }}
          >
            {TYPE_LABEL[tooltip.node.type] ?? tooltip.node.type}
          </div>
        </div>
      )}
    </div>
  );
}
