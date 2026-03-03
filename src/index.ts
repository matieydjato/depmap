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
export async function analyzeDependencies(options: ScanOptions): Promise<DependencyGraph> {
  const rootDir = path.resolve(options.path);

  // Merge CLI options with .depmaprc config
  const mergedOptions = await mergeWithConfig(options, rootDir);

  // Detect monorepo
  const workspaceConfig = await detectMonorepo(rootDir);

  // Step 1: Scan files
  const filePaths = await scanFiles(rootDir, mergedOptions.exclude);

  // Step 2: Parse imports (with monorepo awareness)
  const parsedFiles = await parseFiles(rootDir, filePaths, workspaceConfig.isMonorepo ? workspaceConfig : undefined);

  // Step 3: Build graph (with sizes and monorepo info)
  const graph = await buildGraph(rootDir, parsedFiles, workspaceConfig.isMonorepo ? workspaceConfig : undefined);

  return graph;
}

export { scanFiles } from "./scanner";
export { parseFiles } from "./parser";
export { buildGraph } from "./graph";
export { startServer } from "./server";
export { loadConfig, mergeWithConfig } from "./config";
export { detectMonorepo } from "./monorepo";
export { analyzeFileSizes, formatBytes } from "./analyzer";
export { logger, Logger } from "./logger";
export type { LogLevel } from "./logger";
export type { FileNode, DependencyEdge, DependencyGraph, ScanOptions, MonorepoPackage } from "./types";
export type { DepMapConfig } from "./config";
export type { WorkspaceConfig } from "./monorepo";
