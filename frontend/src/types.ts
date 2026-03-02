/** Shared types matching the backend DependencyGraph API response */

export interface FileNode {
  id: string;
  name: string;
  path: string;
  extension: string;
  imports: string[];
  importedBy: string[];
  isCircular: boolean;
  circularWith: string[];
  sizeBytes: number;
  sizeFormatted: string;
  package?: string;
}

export interface DependencyEdge {
  from: string;
  to: string;
  isCrossPackage?: boolean;
}

export interface MonorepoPackage {
  name: string;
  path: string;
  fileCount: number;
  totalSizeBytes: number;
  totalSizeFormatted: string;
}

export interface DependencyGraph {
  root: string;
  files: FileNode[];
  edges: DependencyEdge[];
  circularDependencies: string[][];
  stats: {
    totalFiles: number;
    totalEdges: number;
    circularCount: number;
    totalSizeBytes: number;
    totalSizeFormatted: string;
  };
  packages: MonorepoPackage[];
  isMonorepo: boolean;
}

export interface DeleteSimResult {
  deletedFile: string;
  directlyAffected: string[];
  transitivelyAffected: string[];
  totalAffected: number;
  brokenImports: Array<{ file: string; brokenImport: string }>;
}
