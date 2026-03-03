/**
 * Web Server Module
 *
 * Serves the interactive visualization frontend and provides
 * API endpoints for graph data, delete simulation, and export.
 */

import express, { Request, Response, NextFunction } from "express";
import * as path from "path";
import * as http from "http";
import { DependencyGraph, FileNode } from "./types";

/** Build an O(1) lookup index from file ID → FileNode */
function buildFileIndex(graph: DependencyGraph): Map<string, FileNode> {
  const index = new Map<string, FileNode>();
  for (const file of graph.files) {
    index.set(file.id, file);
  }
  return index;
}

/**
 * Simulate deleting a file and find all files that would be affected.
 * Returns direct and transitive dependents.
 */
function simulateDelete(
  fileIndex: Map<string, FileNode>,
  fileId: string
): {
  deletedFile: string;
  directlyAffected: string[];
  transitivelyAffected: string[];
  totalAffected: number;
  brokenImports: Array<{ file: string; brokenImport: string }>;
} {
  const fileNode = fileIndex.get(fileId);
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
    const currentNode = fileIndex.get(current);
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

  // Build O(1) file index once at startup
  const fileIndex = buildFileIndex(graph);

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

    // Validate: reject empty or excessively long file IDs
    if (!fileId || fileId.length > 500) {
      res.status(400).json({ error: "Invalid file ID" });
      return;
    }

    const result = simulateDelete(fileIndex, fileId);
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

  // Global error handler — prevents unhandled errors from crashing the server
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(`[depmap] Server error: ${err.message}`);
    res.status(500).json({ error: "Internal server error" });
  });

  const server = app.listen(port, "127.0.0.1", () => {
    // Server started — bound to localhost only for security
  });

  return server;
}
