/**
 * Monorepo Support Module
 *
 * Detects monorepo configurations, discovers packages/workspaces,
 * and resolves cross-package imports.
 */

import * as fs from "fs/promises";
import * as path from "path";
import YAML from "yaml";
import { MonorepoPackage } from "./types";
import { formatBytes } from "./analyzer";

/** Workspace configuration from package.json or pnpm-workspace.yaml */
export interface WorkspaceConfig {
  /** Whether this is a monorepo */
  isMonorepo: boolean;
  /** Workspace glob patterns (e.g., ["packages/*", "apps/*"]) */
  workspacePatterns: string[];
  /** Discovered packages */
  packages: DiscoveredPackage[];
  /** Map of package name → relative directory path */
  packageNameToPath: Map<string, string>;
}

/** A discovered package in the monorepo */
interface DiscoveredPackage {
  /** Package name from package.json */
  name: string;
  /** Relative path from workspace root */
  dir: string;
  /** Absolute path */
  absoluteDir: string;
}

/**
 * Detect if the given directory is a monorepo and discover packages.
 */
export async function detectMonorepo(rootDir: string): Promise<WorkspaceConfig> {
  const absoluteRoot = path.resolve(rootDir);
  const result: WorkspaceConfig = {
    isMonorepo: false,
    workspacePatterns: [],
    packages: [],
    packageNameToPath: new Map(),
  };

  // 1. Try reading root package.json for "workspaces" field
  const packageJsonPath = path.join(absoluteRoot, "package.json");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let rootPackageJson: Record<string, any>;
  try {
    const raw = await fs.readFile(packageJsonPath, "utf-8");
    rootPackageJson = JSON.parse(raw);
  } catch {
    return result;
  }

  // Check for npm/yarn workspaces
  if (rootPackageJson.workspaces) {
    const workspaces = rootPackageJson.workspaces;
    if (Array.isArray(workspaces)) {
      result.workspacePatterns = workspaces;
    } else if (workspaces.packages && Array.isArray(workspaces.packages)) {
      // Yarn v2+ format: { packages: [...] }
      result.workspacePatterns = workspaces.packages;
    }
  }

  // 2. Try reading pnpm-workspace.yaml
  if (result.workspacePatterns.length === 0) {
    const pnpmWorkspacePath = path.join(absoluteRoot, "pnpm-workspace.yaml");
    try {
      const raw = await fs.readFile(pnpmWorkspacePath, "utf-8");
      const parsed = YAML.parse(raw);
      if (parsed?.packages && Array.isArray(parsed.packages)) {
        result.workspacePatterns = parsed.packages.map((p: unknown) =>
          typeof p === "string" ? p : String(p)
        );
      }
    } catch {
      // No pnpm-workspace.yaml or parse error
    }
  }

  // 3. Try reading lerna.json
  if (result.workspacePatterns.length === 0) {
    const lernaPath = path.join(absoluteRoot, "lerna.json");
    try {
      const raw = await fs.readFile(lernaPath, "utf-8");
      const lernaConfig = JSON.parse(raw);
      if (lernaConfig.packages && Array.isArray(lernaConfig.packages)) {
        result.workspacePatterns = lernaConfig.packages;
      }
    } catch {
      // No lerna.json or parse error
    }
  }

  if (result.workspacePatterns.length === 0) {
    return result;
  }

  result.isMonorepo = true;

  // 4. Discover actual packages by expanding workspace patterns
  for (const pattern of result.workspacePatterns) {
    const cleanPattern = pattern.replace(/\*\*?/g, "");
    const searchDir = path.join(absoluteRoot, cleanPattern);

    try {
      const entries = await fs.readdir(searchDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const pkgDir = path.join(searchDir, entry.name);
        const pkgJsonPath = path.join(pkgDir, "package.json");

        try {
          const pkgRaw = await fs.readFile(pkgJsonPath, "utf-8");
          const pkgJson = JSON.parse(pkgRaw);
          const pkgName = pkgJson.name || entry.name;
          const relativeDir = path.relative(absoluteRoot, pkgDir).replace(/\\/g, "/");

          result.packages.push({
            name: pkgName,
            dir: relativeDir,
            absoluteDir: pkgDir,
          });

          result.packageNameToPath.set(pkgName, relativeDir);
        } catch {
          // Skip packages with invalid/missing package.json
        }
      }
    } catch {
      // Skip unreadable directories
    }
  }

  return result;
}

/**
 * Determine which package a file belongs to.
 */
export function getFilePackage(
  filePath: string,
  packages: DiscoveredPackage[]
): string | undefined {
  for (const pkg of packages) {
    if (filePath.startsWith(pkg.dir + "/") || filePath === pkg.dir) {
      return pkg.name;
    }
  }
  return undefined;
}

/**
 * Build MonorepoPackage summary objects from discovered packages and file data.
 */
export function buildPackageSummaries(
  workspaceConfig: WorkspaceConfig,
  fileSizes: Map<string, { sizeBytes: number }>
): MonorepoPackage[] {
  return workspaceConfig.packages.map((pkg) => {
    let fileCount = 0;
    let totalSizeBytes = 0;

    for (const [filePath, size] of fileSizes) {
      if (filePath.startsWith(pkg.dir + "/")) {
        fileCount++;
        totalSizeBytes += size.sizeBytes;
      }
    }

    return {
      name: pkg.name,
      path: pkg.dir,
      fileCount,
      totalSizeBytes,
      totalSizeFormatted: formatBytes(totalSizeBytes),
    };
  });
}

/**
 * Resolve a bare package import (e.g., "@myorg/shared") to a file path
 * within the monorepo.
 */
export function resolveMonorepoImport(
  importSpecifier: string,
  workspaceConfig: WorkspaceConfig,
  knownFiles: Set<string>
): string | null {
  // Check if the import matches a known package name
  for (const [pkgName, pkgDir] of workspaceConfig.packageNameToPath) {
    if (importSpecifier === pkgName || importSpecifier.startsWith(pkgName + "/")) {
      // Get the sub-path after the package name
      const subPath = importSpecifier === pkgName ? "" : importSpecifier.slice(pkgName.length + 1);

      // Try to resolve to a file
      const basePath = subPath ? `${pkgDir}/${subPath}` : `${pkgDir}/src/index`;

      // Try exact match, then with extensions, then index files
      const extensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ""];
      const indexFiles = ["index.ts", "index.tsx", "index.js", "index.jsx"];

      // Try with extensions
      for (const ext of extensions) {
        const candidate = basePath + ext;
        if (knownFiles.has(candidate)) return candidate;
      }

      // Try as directory with index
      for (const indexFile of indexFiles) {
        const candidate = basePath + "/" + indexFile;
        if (knownFiles.has(candidate)) return candidate;
      }

      // Try package root src/index
      if (subPath === "") {
        for (const indexFile of indexFiles) {
          const candidate = `${pkgDir}/src/${indexFile}`;
          if (knownFiles.has(candidate)) return candidate;
        }
        // Also try package root index
        for (const indexFile of indexFiles) {
          const candidate = `${pkgDir}/${indexFile}`;
          if (knownFiles.has(candidate)) return candidate;
        }
      }
    }
  }

  return null;
}
