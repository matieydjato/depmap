/**
 * Graph Builder Module
 *
 * Takes parsed file data and constructs the full DependencyGraph,
 * including circular dependency detection, file sizes, and monorepo info.
 */

import * as path from "path";
import {
  FileNode,
  DependencyEdge,
  DependencyGraph,
  MonorepoPackage,
} from "./types";
import { ParsedFile } from "./parser";
import { analyzeFileSizes, formatBytes, FileSize } from "./analyzer";
import { WorkspaceConfig, getFilePackage, buildPackageSummaries } from "./monorepo";

/**
 * Detect all circular dependencies in the graph using DFS.
 *
 * Returns an array of cycles, where each cycle is an array of file paths
 * forming a circular dependency chain.
 */
function detectCircularDependencies(
  adjacencyList: Map<string, string[]>
): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const inStack = new Set<string>();
  const stack: string[] = [];

  function dfs(node: string): void {
    if (inStack.has(node)) {
      // Found a cycle — extract it from the stack
      const cycleStart = stack.indexOf(node);
      if (cycleStart !== -1) {
        const cycle = stack.slice(cycleStart);
        cycles.push([...cycle]);
      }
      return;
    }

    if (visited.has(node)) {
      return;
    }

    visited.add(node);
    inStack.add(node);
    stack.push(node);

    const neighbors = adjacencyList.get(node) || [];
    for (const neighbor of neighbors) {
      dfs(neighbor);
    }

    stack.pop();
    inStack.delete(node);
  }

  // Run DFS from every node to catch all cycles
  for (const node of adjacencyList.keys()) {
    dfs(node);
  }

  // Deduplicate cycles (same cycle might be found from different starting points)
  return deduplicateCycles(cycles);
}

/**
 * Deduplicate cycles — two cycles are the same if they contain
 * the same set of nodes regardless of starting position.
 */
function deduplicateCycles(cycles: string[][]): string[][] {
  const seen = new Set<string>();
  const unique: string[][] = [];

  for (const cycle of cycles) {
    // Normalize: sort the nodes to create a canonical key
    const key = [...cycle].sort().join("|");
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(cycle);
    }
  }

  return unique;
}

/**
 * Build a complete DependencyGraph from parsed file data.
 *
 * @param rootDir - Absolute path to the project root
 * @param parsedFiles - Array of parsed file data from the parser
 * @param workspaceConfig - Monorepo workspace configuration (optional)
 * @returns Complete DependencyGraph
 */
export function buildGraph(
  rootDir: string,
  parsedFiles: ParsedFile[],
  workspaceConfig?: WorkspaceConfig
): DependencyGraph {
  const absoluteRoot = path.resolve(rootDir);

  // Analyze file sizes
  const filePaths = parsedFiles.map((pf) => pf.filePath);
  const fileSizes = analyzeFileSizes(absoluteRoot, filePaths);

  // Build adjacency list
  const adjacencyList = new Map<string, string[]>();
  const importedByMap = new Map<string, string[]>();

  for (const file of parsedFiles) {
    adjacencyList.set(file.filePath, file.imports);

    // Build reverse mapping (importedBy)
    for (const imp of file.imports) {
      if (!importedByMap.has(imp)) {
        importedByMap.set(imp, []);
      }
      importedByMap.get(imp)!.push(file.filePath);
    }
  }

  // Detect circular dependencies
  const circularDependencies = detectCircularDependencies(adjacencyList);

  // Build set of files involved in cycles for quick lookup
  const circularFiles = new Set<string>();
  const circularWithMap = new Map<string, Set<string>>();

  for (const cycle of circularDependencies) {
    for (const file of cycle) {
      circularFiles.add(file);
      if (!circularWithMap.has(file)) {
        circularWithMap.set(file, new Set());
      }
      for (const other of cycle) {
        if (other !== file) {
          circularWithMap.get(file)!.add(other);
        }
      }
    }
  }

  // Determine monorepo info
  const isMonorepo = workspaceConfig?.isMonorepo ?? false;
  const monoPackages = workspaceConfig?.packages ?? [];

  // Build edges (with cross-package detection)
  const edges: DependencyEdge[] = [];
  for (const file of parsedFiles) {
    for (const imp of file.imports) {
      let isCrossPackage = false;
      if (isMonorepo) {
        const fromPkg = getFilePackage(file.filePath, monoPackages);
        const toPkg = getFilePackage(imp, monoPackages);
        isCrossPackage = !!(fromPkg && toPkg && fromPkg !== toPkg);
      }
      edges.push({ from: file.filePath, to: imp, isCrossPackage });
    }
  }

  // Build FileNode objects with sizes and package info
  let totalSizeBytes = 0;
  const files: FileNode[] = parsedFiles.map((pf) => {
    const size = fileSizes.get(pf.filePath);
    const sizeBytes = size?.sizeBytes ?? 0;
    totalSizeBytes += sizeBytes;

    return {
      id: pf.filePath,
      name: path.basename(pf.filePath),
      path: pf.filePath,
      extension: path.extname(pf.filePath),
      imports: pf.imports,
      importedBy: importedByMap.get(pf.filePath) || [],
      isCircular: circularFiles.has(pf.filePath),
      circularWith: circularWithMap.has(pf.filePath)
        ? [...circularWithMap.get(pf.filePath)!]
        : [],
      sizeBytes,
      sizeFormatted: size?.sizeFormatted ?? "0 B",
      package: isMonorepo
        ? getFilePackage(pf.filePath, monoPackages)
        : undefined,
    };
  });

  // Build package summaries for monorepos
  const packages: MonorepoPackage[] = isMonorepo
    ? buildPackageSummaries(workspaceConfig!, fileSizes)
    : [];

  return {
    root: absoluteRoot,
    files,
    edges,
    circularDependencies,
    stats: {
      totalFiles: files.length,
      totalEdges: edges.length,
      circularCount: circularDependencies.length,
      totalSizeBytes,
      totalSizeFormatted: formatBytes(totalSizeBytes),
    },
    packages,
    isMonorepo,
  };
}
