/**
 * File Scanner Module
 *
 * Walks the directory tree, filters by JS/TS extensions,
 * respects .gitignore and user-specified excludes.
 */

import * as fs from "fs";
import * as path from "path";
import ignore, { Ignore } from "ignore";

const SUPPORTED_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
]);

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
function loadGitignore(rootDir: string): Ignore {
  const ig = ignore();
  const gitignorePath = path.join(rootDir, ".gitignore");

  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, "utf-8");
    ig.add(content);
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
export function scanFiles(
  rootDir: string,
  userExcludes: string[] = []
): string[] {
  const absoluteRoot = path.resolve(rootDir);
  const ig = loadGitignore(absoluteRoot);

  // Add default excludes
  ig.add(DEFAULT_EXCLUDES);

  // Add user-specified excludes
  if (userExcludes.length > 0) {
    ig.add(userExcludes);
  }

  const results: string[] = [];

  function walkDir(dir: string): void {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      // Skip directories we can't read
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(absoluteRoot, fullPath).replace(/\\/g, "/");

      // Check if this path should be ignored
      if (ig.ignores(relativePath)) {
        continue;
      }

      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (SUPPORTED_EXTENSIONS.has(ext)) {
          results.push(relativePath);
        }
      }
    }
  }

  walkDir(absoluteRoot);
  return results.sort();
}
