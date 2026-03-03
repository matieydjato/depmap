import { useRef, useEffect, useCallback } from "react";
import cytoscape from "cytoscape";
import type { Core } from "cytoscape";
import type { DependencyGraph, DeleteSimResult } from "../types";
import { PACKAGE_COLORS } from "../constants";

interface GraphCanvasProps {
  graph: DependencyGraph;
  sizeMode: "connections" | "fileSize";
  searchQuery: string;
  packageFilter: string;
  selectedFileId: string | null;
  deleteSim: DeleteSimResult | null;
  onNodeSelect: (id: string | null) => void;
  onCyInit: (cy: Core) => void;
}

function buildPackageColorMap(graph: DependencyGraph): Record<string, string> {
  const map: Record<string, string> = {};
  if (graph.packages) {
    graph.packages.forEach((pkg, i) => {
      map[pkg.name] = PACKAGE_COLORS[i % PACKAGE_COLORS.length];
    });
  }
  return map;
}

export default function GraphCanvas({
  graph,
  sizeMode,
  searchQuery,
  packageFilter,
  selectedFileId,
  deleteSim,
  onNodeSelect,
  onCyInit,
}: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const packageColorsRef = useRef<Record<string, string>>({});

  // Initialize cytoscape once
  useEffect(() => {
    if (!containerRef.current) return;
    const pkgColors = buildPackageColorMap(graph);
    packageColorsRef.current = pkgColors;

    const maxSize = Math.max(1, ...graph.files.map((f) => f.sizeBytes || 0));
    const nodeCount = graph.files.length;

    const elements: cytoscape.ElementDefinition[] = [];

    for (const file of graph.files) {
      const pkgColor =
        file.package && pkgColors[file.package] ? pkgColors[file.package] : "#58a6ff";
      elements.push({
        data: {
          id: file.id,
          label: file.name,
          filePath: file.path,
          isCircular: file.isCircular,
          importCount: file.imports.length,
          importedByCount: file.importedBy.length,
          sizeBytes: file.sizeBytes || 0,
          sizeFormatted: file.sizeFormatted || "0 B",
          pkg: file.package || "",
          pkgColor,
          maxSize,
        },
      });
    }

    for (const edge of graph.edges) {
      let isCircularEdge = false;
      for (const cycle of graph.circularDependencies) {
        if (cycle.includes(edge.from) && cycle.includes(edge.to)) {
          isCircularEdge = true;
          break;
        }
      }
      elements.push({
        data: {
          id: `${edge.from}->${edge.to}`,
          source: edge.from,
          target: edge.to,
          isCircular: isCircularEdge,
          isCrossPackage: edge.isCrossPackage || false,
        },
      });
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: "node",
          style: {
            "background-color": graph.isMonorepo
              ? ("data(pkgColor)" as unknown as string)
              : "#58a6ff",
            label: "data(label)",
            color: "#c9d1d9",
            "font-size": "11px",
            "text-valign": "bottom",
            "text-margin-y": 8,
            "text-halign": "center",
            "text-outline-color": "#0d1117",
            "text-outline-width": 2,
            "min-zoomed-font-size": 8,
            width: "mapData(importedByCount, 0, 20, 36, 72)",
            height: "mapData(importedByCount, 0, 20, 36, 72)",
            "border-width": 0,
            "overlay-padding": 4,
          },
        },
        {
          selector: "node[?isCircular]",
          style: {
            "background-color": "#f85149",
            "border-color": "#da3633",
            "border-width": 2,
          },
        },
        {
          selector: "edge",
          style: {
            width: 1,
            "line-color": "#30363d",
            "target-arrow-color": "#30363d",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            "arrow-scale": 0.7,
            opacity: 0.6,
          },
        },
        {
          selector: "edge[?isCircular]",
          style: {
            "line-color": "#f85149",
            "target-arrow-color": "#f85149",
            width: 2,
            opacity: 0.9,
          },
        },
        {
          selector: "edge[?isCrossPackage]",
          style: {
            "line-color": "#f0883e",
            "target-arrow-color": "#f0883e",
            "line-style": "dashed",
            width: 1.5,
            opacity: 0.8,
          },
        },
        {
          selector: "node:selected",
          style: {
            "background-color": "#3fb950",
            "border-color": "#2ea043",
            "border-width": 2,
          },
        },
        {
          selector: ".highlighted",
          style: {
            "background-color": "#3fb950",
            "border-color": "#2ea043",
            "border-width": 2,
          },
        },
        {
          selector: ".dimmed",
          style: { opacity: 0.15 },
        },
        {
          selector: "edge.highlighted",
          style: {
            "line-color": "#3fb950",
            "target-arrow-color": "#3fb950",
            width: 2,
            opacity: 1,
          },
        },
        {
          selector: ".affected-direct",
          style: {
            "background-color": "#f85149",
            "border-color": "#da3633",
            "border-width": 3,
          },
        },
        {
          selector: ".affected-transitive",
          style: {
            "background-color": "#d29922",
            "border-color": "#bb8009",
            "border-width": 2,
          },
        },
        {
          selector: ".deleted-sim",
          style: {
            "background-color": "#6e7681",
            "border-color": "#484f58",
            "border-width": 3,
            "border-style": "dashed",
            opacity: 0.5,
          },
        },
      ],
      layout: {
        name: "cose",
        idealEdgeLength: () => Math.max(120, 60 + nodeCount * 4),
        nodeOverlap: 4,
        refresh: 20,
        fit: true,
        padding: 60,
        randomize: false,
        componentSpacing: Math.max(150, nodeCount * 5),
        nodeRepulsion: () => Math.max(10000, nodeCount * 500),
        edgeElasticity: () => 120,
        nestingFactor: 1.2,
        gravity: Math.max(0.25, 15 / nodeCount),
        numIter: Math.max(1500, nodeCount * 50),
        animate: false,
      } as cytoscape.CoseLayoutOptions,
      minZoom: 0.1,
      maxZoom: 5,
      wheelSensitivity: 0.3,
    });

    cy.on("tap", "node", (evt) => {
      onNodeSelect(evt.target.data("id"));
    });

    cy.on("tap", (evt) => {
      if (evt.target === cy) {
        onNodeSelect(null);
      }
    });

    cyRef.current = cy;
    onCyInit(cy);

    return () => {
      cy.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph]);

  // Handle highlight on select
  const highlightConnections = useCallback((nodeId: string) => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.elements().removeClass("dimmed highlighted affected-direct affected-transitive deleted-sim");
    cy.elements().addClass("dimmed");

    const node = cy.getElementById(nodeId);
    node.removeClass("dimmed").addClass("highlighted");

    const connectedEdges = node.connectedEdges();
    connectedEdges.removeClass("dimmed").addClass("highlighted");

    const connectedNodes = connectedEdges.connectedNodes();
    connectedNodes.removeClass("dimmed");
  }, []);

  const clearHighlights = useCallback(() => {
    cyRef.current
      ?.elements()
      .removeClass("dimmed highlighted affected-direct affected-transitive deleted-sim");
  }, []);

  // React to selectedFileId changes
  useEffect(() => {
    if (selectedFileId) {
      highlightConnections(selectedFileId);
    } else {
      clearHighlights();
    }
  }, [selectedFileId, highlightConnections, clearHighlights]);

  // React to deleteSim changes
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !deleteSim) return;

    clearHighlights();
    cy.elements().addClass("dimmed");

    const deletedNode = cy.getElementById(deleteSim.deletedFile);
    deletedNode.removeClass("dimmed").addClass("deleted-sim");

    for (const fid of deleteSim.directlyAffected) {
      const n = cy.getElementById(fid);
      if (n.length) n.removeClass("dimmed").addClass("affected-direct");
    }

    for (const fid of deleteSim.transitivelyAffected) {
      const n = cy.getElementById(fid);
      if (n.length) n.removeClass("dimmed").addClass("affected-transitive");
    }

    deletedNode.connectedEdges().removeClass("dimmed");
  }, [deleteSim, clearHighlights]);

  // React to search query changes
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      clearHighlights();
      return;
    }

    cy.elements().addClass("dimmed");
    const matchingNodes = cy.nodes().filter((node) => {
      const label = (node.data("label") as string).toLowerCase();
      const filePath = (node.data("filePath") as string).toLowerCase();
      return label.includes(query) || filePath.includes(query);
    });

    matchingNodes.removeClass("dimmed").addClass("highlighted");

    if (matchingNodes.length === 1) {
      cy.animate(
        { center: { eles: matchingNodes }, zoom: 2 } as unknown as cytoscape.AnimationOptions,
        { duration: 300 } as unknown as cytoscape.AnimationOptions
      );
    } else if (matchingNodes.length > 1) {
      cy.animate(
        { fit: { eles: matchingNodes, padding: 50 } } as unknown as cytoscape.AnimationOptions,
        { duration: 300 } as unknown as cytoscape.AnimationOptions
      );
    }
  }, [searchQuery, clearHighlights]);

  // React to package filter changes
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    if (!packageFilter) {
      clearHighlights();
      return;
    }

    cy.elements().addClass("dimmed");
    const matchingNodes = cy.nodes().filter((node) => node.data("pkg") === packageFilter);
    matchingNodes.removeClass("dimmed").addClass("highlighted");
    matchingNodes.connectedEdges().removeClass("dimmed");

    if (matchingNodes.length > 0) {
      cy.animate(
        { fit: { eles: matchingNodes, padding: 50 } } as unknown as cytoscape.AnimationOptions,
        { duration: 300 } as unknown as cytoscape.AnimationOptions
      );
    }
  }, [packageFilter, clearHighlights]);

  // React to size mode changes
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const maxSize = Math.max(1, ...graph.files.map((f) => f.sizeBytes || 0));

    if (sizeMode === "fileSize") {
      cy.style()
        .selector("node")
        .style({
          width: `mapData(sizeBytes, 0, ${maxSize}, 36, 80)`,
          height: `mapData(sizeBytes, 0, ${maxSize}, 36, 80)`,
        })
        .update();
    } else {
      cy.style()
        .selector("node")
        .style({
          width: "mapData(importedByCount, 0, 20, 36, 72)",
          height: "mapData(importedByCount, 0, 20, 36, 72)",
        })
        .update();
    }
  }, [sizeMode, graph.files]);

  return <div ref={containerRef} className="w-full h-full" />;
}
