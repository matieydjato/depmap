/**
 * Core pipeline: scan → parse → build graph
 *
 * Reusable across all CLI commands.
 * Supports monorepos and bundle weight analysis.
 */

import * as path from "path";
import { scanFiles } from "./scanner";
import { parseFiles } from "./parser";
import { buildGraph } from "./graph";
import { mergeWithConfig } from "./config";
import { detectMonorepo } from "./monorepo";
import { DependencyGraph, ScanOptions } from "./types";

/**
 * Run the full scanning + parsing + graph-building pipeline.
 */
export function analyzeDependencies(options: ScanOptions): DependencyGraph {
  const rootDir = path.resolve(options.path);

  // Merge CLI options with .depmaprc config
  const mergedOptions = mergeWithConfig(options, rootDir);

  // Detect monorepo
  const workspaceConfig = detectMonorepo(rootDir);

  // Step 1: Scan files
  const filePaths = scanFiles(rootDir, mergedOptions.exclude);

  // Step 2: Parse imports (with monorepo awareness)
  const parsedFiles = parseFiles(rootDir, filePaths, workspaceConfig.isMonorepo ? workspaceConfig : undefined);

  // Step 3: Build graph (with sizes and monorepo info)
  const graph = buildGraph(rootDir, parsedFiles, workspaceConfig.isMonorepo ? workspaceConfig : undefined);

  return graph;
}

export { scanFiles } from "./scanner";
export { parseFiles } from "./parser";
export { buildGraph } from "./graph";
export { startServer } from "./server";
export { loadConfig, mergeWithConfig } from "./config";
export { detectMonorepo } from "./monorepo";
export { analyzeFileSizes, formatBytes } from "./analyzer";
export type { FileNode, DependencyEdge, DependencyGraph, ScanOptions, MonorepoPackage } from "./types";
export type { DepMapConfig } from "./config";
export type { WorkspaceConfig } from "./monorepo";
