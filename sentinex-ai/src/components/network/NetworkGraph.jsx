import { useEffect, useRef } from "react";
import * as d3 from "d3";

// Color per community/group id - kept in sync with the "Network Cluster" legend.
const GROUP_COLORS = {
  1: "#22d3ee", // Technology Cluster
  2: "#ef4444", // News & Politics
  3: "#a855f7", // Entertainment
  4: "#22c55e", // Sports
};

// -----------------------------------------------------------------------
// NetworkGraph
// -----------------------------------------------------------------------
// Renders an interactive force-directed graph of users (nodes) and their
// interactions (links: mentions / replies / shares / forwards).
//   - Node size  = influence score
//   - Node color = community/group
//   - Click a node to call `onNodeClick(nodeData)` (parent shows detail panel)
// -----------------------------------------------------------------------
export default function NetworkGraph({ nodes, links, onNodeClick, selectedId }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!nodes?.length) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 480;

    const svg = d3.select(svgRef.current).attr("viewBox", [0, 0, width, height]);
    svg.selectAll("*").remove(); // clear on re-render

    // Deep copy so D3 can mutate x/y/vx/vy without touching React state/mockData.
    const nodesCopy = nodes.map((n) => ({ ...n }));
    const linksCopy = links.map((l) => ({ ...l }));

    const radiusScale = d3.scaleSqrt().domain([0, 1]).range([6, 26]);

    const simulation = d3
      .forceSimulation(nodesCopy)
      .force(
        "link",
        d3
          .forceLink(linksCopy)
          .id((d) => d.id)
          .distance(90)
          .strength(0.5)
      )
      .force("charge", d3.forceManyBody().strength(-220))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius((d) => radiusScale(d.influence) + 8));

    const g = svg.append("g");

    // Zoom + pan
    svg.call(
      d3
        .zoom()
        .scaleExtent([0.5, 3])
        .on("zoom", (event) => g.attr("transform", event.transform))
    );

    // Links
    const link = g
      .append("g")
      .attr("stroke", "#1c2436")
      .attr("stroke-opacity", 0.7)
      .selectAll("line")
      .data(linksCopy)
      .join("line")
      .attr("stroke-width", 1.2);

    // Nodes
    const node = g
      .append("g")
      .selectAll("g")
      .data(nodesCopy)
      .join("g")
      .attr("cursor", "pointer")
      .call(
        d3
          .drag()
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
      )
      .on("click", (event, d) => onNodeClick?.(d));

    node
      .append("circle")
      .attr("r", (d) => radiusScale(d.influence))
      .attr("fill", (d) => GROUP_COLORS[d.group] || "#94a3b8")
      .attr("fill-opacity", 0.85)
      .attr("stroke", (d) => (d.id === selectedId ? "#e6ebf5" : "#05070d"))
      .attr("stroke-width", (d) => (d.id === selectedId ? 2.5 : 1.5));

    node
      .append("text")
      .text((d) => `@${d.id}`)
      .attr("x", (d) => radiusScale(d.influence) + 5)
      .attr("y", 4)
      .attr("font-size", 10)
      .attr("font-family", "monospace")
      .attr("fill", "#94a3b8")
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    return () => simulation.stop();
  }, [nodes, links, onNodeClick, selectedId]);

  return (
    <div ref={containerRef} className="w-full h-[420px] sm:h-[480px]">
      <svg ref={svgRef} className="w-full h-full" role="img" aria-label="Network graph of influencers and connections" />
    </div>
  );
}
