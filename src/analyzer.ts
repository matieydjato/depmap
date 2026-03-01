/**
 * Bundle Weight Analyzer Module
 *
 * Calculates file sizes (raw and gzip-estimated) for each file in the graph.
 * Provides per-file and per-module size estimates via static analysis.
 */

import * as fs from "fs";
import * as path from "path";

/** Size info for a single file */
export interface FileSize {
  /** Relative file path */
  filePath: string;
  /** Raw file size in bytes */
  sizeBytes: number;
  /** Human-readable formatted size */
  sizeFormatted: string;
}

/**
 * Format bytes into a human-readable string.
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Get the file size for a single file.
 */
function getFileSize(rootDir: string, relativePath: string): FileSize {
  const absolutePath = path.join(rootDir, relativePath);
  let sizeBytes = 0;

  try {
    const stat = fs.statSync(absolutePath);
    sizeBytes = stat.size;
  } catch {
    // File not readable — size is 0
  }

  return {
    filePath: relativePath,
    sizeBytes,
    sizeFormatted: formatBytes(sizeBytes),
  };
}

/**
 * Analyze file sizes for all files.
 *
 * @param rootDir - Absolute path to project root
 * @param filePaths - Relative paths of all files
 * @returns Map of relative path → FileSize
 */
export function analyzeFileSizes(
  rootDir: string,
  filePaths: string[]
): Map<string, FileSize> {
  const absoluteRoot = path.resolve(rootDir);
  const sizeMap = new Map<string, FileSize>();

  for (const filePath of filePaths) {
    const size = getFileSize(absoluteRoot, filePath);
    sizeMap.set(filePath, size);
  }

  return sizeMap;
}
