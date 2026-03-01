/**
 * Web Server Module
 *
 * Serves the interactive visualization frontend and provides
 * API endpoints for graph data, delete simulation, and export.
 */

import express from "express";
import * as path from "path";
import * as http from "http";
import { DependencyGraph } from "./types";

/**
 * Simulate deleting a file and find all files that would be affected.
 * Returns direct and transitive dependents.
 */
function simulateDelete(
  graph: DependencyGraph,
  fileId: string
): {
  deletedFile: string;
  directlyAffected: string[];
  transitivelyAffected: string[];
  totalAffected: number;
  brokenImports: Array<{ file: string; brokenImport: string }>;
} {
  const fileNode = graph.files.find((f) => f.id === fileId);
  if (!fileNode) {
    return {
      deletedFile: fileId,
      directlyAffected: [],
      transitivelyAffected: [],
      totalAffected: 0,
      brokenImports: [],
    };
  }

  // Direct dependents: files that import the deleted file
  const directlyAffected = [...fileNode.importedBy];

  // Broken imports: each direct dependent has a broken import to the deleted file
  const brokenImports = directlyAffected.map((dep) => ({
    file: dep,
    brokenImport: fileId,
  }));

  // Transitive dependents: walk up the importedBy graph using BFS
  const allAffected = new Set<string>(directlyAffected);
  const queue = [...directlyAffected];
  const transitiveOnly = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentNode = graph.files.find((f) => f.id === current);
    if (!currentNode) continue;

    for (const dependent of currentNode.importedBy) {
      if (!allAffected.has(dependent) && dependent !== fileId) {
        allAffected.add(dependent);
        transitiveOnly.add(dependent);
        queue.push(dependent);
      }
    }
  }

  return {
    deletedFile: fileId,
    directlyAffected,
    transitivelyAffected: [...transitiveOnly],
    totalAffected: allAffected.size,
    brokenImports,
  };
}

/**
 * Start the local web server that serves the visualization.
 *
 * @param graph - The dependency graph data to visualize
 * @param port - Port number to listen on
 * @returns The HTTP server instance
 */
export function startServer(
  graph: DependencyGraph,
  port: number
): http.Server {
  const app = express();

  // Serve static frontend files
  const publicDir = path.join(__dirname, "..", "public");
  app.use(express.static(publicDir));

  // API endpoint for graph data
  app.get("/api/graph", (_req, res) => {
    res.json(graph);
  });

  // API endpoint for delete simulation
  app.get("/api/simulate-delete/:fileId", (req, res) => {
    const fileId = decodeURIComponent(req.params.fileId);
    const result = simulateDelete(graph, fileId);
    res.json(result);
  });

  // API endpoint for exporting graph as JSON
  app.get("/api/export/json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", "attachment; filename=depmap-graph.json");
    res.json(graph);
  });

  // Fallback to index.html for SPA routing (Express v5 syntax)
  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });

  const server = app.listen(port, () => {
    // Server started — message handled by the CLI command
  });

  return server;
}
