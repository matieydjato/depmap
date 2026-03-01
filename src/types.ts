/**
 * DepMap — Core Type Definitions
 */

/** Represents a single file node in the dependency graph */
export interface FileNode {
  /** Unique ID — relative path from project root */
  id: string;
  /** Filename (e.g., "index.ts") */
  name: string;
  /** Relative path from project root */
  path: string;
  /** File extension (e.g., ".ts", ".tsx") */
  extension: string;
  /** Relative paths of files this file imports */
  imports: string[];
  /** Relative paths of files that import this file */
  importedBy: string[];
  /** Whether this file participates in a circular dependency */
  isCircular: boolean;
  /** Files that form circular dependencies with this file */
  circularWith: string[];
  /** File size in bytes */
  sizeBytes: number;
  /** Formatted file size (e.g., "2.4 KB") */
  sizeFormatted: string;
  /** Package name this file belongs to (monorepo) */
  package?: string;
}

/** An edge in the dependency graph */
export interface DependencyEdge {
  /** Source file (importer) */
  from: string;
  /** Target file (imported) */
  to: string;
  /** Whether this is a cross-package edge (monorepo) */
  isCrossPackage?: boolean;
}

/** Represents a package in a monorepo */
export interface MonorepoPackage {
  /** Package name from package.json */
  name: string;
  /** Relative path from workspace root to package dir */
  path: string;
  /** Number of files in this package */
  fileCount: number;
  /** Total size in bytes */
  totalSizeBytes: number;
  /** Formatted total size */
  totalSizeFormatted: string;
}

/** The complete dependency graph */
export interface DependencyGraph {
  /** Project root directory */
  root: string;
  /** All file nodes */
  files: FileNode[];
  /** All dependency edges */
  edges: DependencyEdge[];
  /** Groups of files involved in circular dependencies */
  circularDependencies: string[][];
  /** Summary statistics */
  stats: {
    totalFiles: number;
    totalEdges: number;
    circularCount: number;
    totalSizeBytes: number;
    totalSizeFormatted: string;
  };
  /** Monorepo packages (empty array if not a monorepo) */
  packages: MonorepoPackage[];
  /** Whether the project is a monorepo */
  isMonorepo: boolean;
}

/** CLI options passed to depmap commands */
export interface ScanOptions {
  /** Directory to scan (defaults to cwd) */
  path: string;
  /** Port for the web server */
  port: number;
  /** Glob patterns to exclude */
  exclude: string[];
  /** Output file for JSON export */
  output?: string;
}
