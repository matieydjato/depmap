/**
 * File Scanner Module
 *
 * Walks the directory tree, filters by JS/TS extensions,
 * respects .gitignore and user-specified excludes.
 */

import * as fs from "fs/promises";
import * as path from "path";
import ignore, { Ignore } from "ignore";

const SUPPORTED_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]);

/** Default directories/patterns to always exclude */
const DEFAULT_EXCLUDES = [
  "node_modules",
  "dist",
  "build",
  ".git",
  "coverage",
  ".next",
  ".nuxt",
  "__pycache__",
];

/**
 * Load and parse the project's .gitignore file (if it exists)
 */
async function loadGitignore(rootDir: string): Promise<Ignore> {
  const ig = ignore();
  const gitignorePath = path.join(rootDir, ".gitignore");

  try {
    const content = await fs.readFile(gitignorePath, "utf-8");
    ig.add(content);
  } catch {
    // No .gitignore — that's fine
  }

  return ig;
}

/**
 * Scan a directory tree and return all JS/TS file paths (relative to root).
 *
 * @param rootDir - Absolute path to the project root
 * @param userExcludes - Additional glob patterns to exclude
 * @returns Array of relative file paths
 */
export async function scanFiles(rootDir: string, userExcludes: string[] = []): Promise<string[]> {
  const absoluteRoot = path.resolve(rootDir);
  const ig = await loadGitignore(absoluteRoot);

  // Add default excludes
  ig.add(DEFAULT_EXCLUDES);

  // Add user-specified excludes
  if (userExcludes.length > 0) {
    ig.add(userExcludes);
  }

  const results: string[] = [];

  async function walkDir(dir: string): Promise<void> {
    let entries: import("fs").Dirent[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      // Skip directories we can't read
      return;
    }

    const subdirs: Promise<void>[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(absoluteRoot, fullPath).replace(/\\/g, "/");

      // Check if this path should be ignored
      if (ig.ignores(relativePath)) {
        continue;
      }

      if (entry.isDirectory()) {
        subdirs.push(walkDir(fullPath));
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (SUPPORTED_EXTENSIONS.has(ext)) {
          results.push(relativePath);
        }
      }
    }

    await Promise.all(subdirs);
  }

  await walkDir(absoluteRoot);
  return results.sort();
}
