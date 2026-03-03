/**
 * Dependency Parser Module
 *
 * Uses ts-morph to parse JS/TS files and extract all import/require statements.
 * Resolves relative paths to actual file locations.
 * Supports tsconfig/jsconfig path aliases.
 */

import * as path from "path";
import * as fs from "fs/promises";
import { Project, SourceFile, SyntaxKind } from "ts-morph";
import { WorkspaceConfig, resolveMonorepoImport } from "./monorepo";

/** Represents a path alias mapping (e.g., "@/*" -> ["src/*"]) */
interface PathAlias {
  prefix: string;    // e.g., "@/"
  wildcard: boolean; // whether the pattern ends with *
  targets: string[]; // e.g., ["src/"]
}

/**
 * Load path aliases from tsconfig.json or jsconfig.json.
 */
async function loadPathAliases(rootDir: string): Promise<PathAlias[]> {
  const aliases: PathAlias[] = [];

  // Try tsconfig.json first, then jsconfig.json
  const configFiles = ["tsconfig.json", "jsconfig.json"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let config: Record<string, any> | null = null;

  for (const configFile of configFiles) {
    const configPath = path.join(rootDir, configFile);
    try {
      const raw = await fs.readFile(configPath, "utf-8");
      // Strip comments (simple approach for JSON with comments)
      const stripped = raw.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
      config = JSON.parse(stripped);
      break;
    } catch {
      continue;
    }
  }

  if (!config?.compilerOptions?.paths) {
    return aliases;
  }

  const baseUrl = config.compilerOptions.baseUrl || ".";
  const paths: Record<string, string[]> = config.compilerOptions.paths;

  for (const [pattern, targets] of Object.entries(paths)) {
    const hasWildcard = pattern.endsWith("/*");
    const prefix = hasWildcard ? pattern.slice(0, -1) : pattern; // "@/*" → "@/"

    const resolvedTargets = targets.map((t: string) => {
      const targetPath = hasWildcard ? t.slice(0, -1) : t; // "src/*" → "src/"
      // Resolve relative to baseUrl
      return path.join(baseUrl, targetPath).replace(/\\/g, "/");
    });

    aliases.push({
      prefix,
      wildcard: hasWildcard,
      targets: resolvedTargets,
    });
  }

  return aliases;
}

/** Parsed import information for a single file */
export interface ParsedFile {
  /** Relative path of this file */
  filePath: string;
  /** Resolved relative paths of imported files */
  imports: string[];
}

/** Extensions to try when resolving imports */
const RESOLVE_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  "",
];

/** Index files to try when resolving directory imports */
const INDEX_FILES = [
  "index.ts",
  "index.tsx",
  "index.js",
  "index.jsx",
];

/**
 * Resolve an import specifier to an actual file path relative to the project root.
 *
 * Handles: relative imports, index files, extension resolution, path aliases.
 */
function resolveImportPath(
  importSpecifier: string,
  importerPath: string,
  rootDir: string,
  knownFiles: Set<string>,
  pathAliases: PathAlias[],
  workspaceConfig?: WorkspaceConfig
): string | null {
  // 1. Try path aliases first (e.g., @/components/Button → src/components/Button)
  if (!importSpecifier.startsWith(".") && !importSpecifier.startsWith("/")) {
    for (const alias of pathAliases) {
      if (alias.wildcard && importSpecifier.startsWith(alias.prefix)) {
        const remainder = importSpecifier.slice(alias.prefix.length);
        for (const target of alias.targets) {
          const aliasResolved = target + remainder;
          const result = tryResolveFile(aliasResolved, knownFiles);
          if (result) return result;
        }
      } else if (!alias.wildcard && importSpecifier === alias.prefix.replace(/\/$/, "")) {
        for (const target of alias.targets) {
          const result = tryResolveFile(target.replace(/\/$/, ""), knownFiles);
          if (result) return result;
        }
      }
    }

    // 2. Try monorepo cross-package resolution
    if (workspaceConfig?.isMonorepo) {
      const monoResolved = resolveMonorepoImport(importSpecifier, workspaceConfig, knownFiles);
      if (monoResolved) return monoResolved;
    }

    // Not a relative import and no alias/monorepo match — skip (node_modules)
    return null;
  }

  // 2. Relative imports
  const importerDir = path.dirname(path.join(rootDir, importerPath));
  const absoluteTarget = path.resolve(importerDir, importSpecifier);
  const relativeTarget = path.relative(rootDir, absoluteTarget).replace(/\\/g, "/");

  return tryResolveFile(relativeTarget, knownFiles);
}

/**
 * Try to resolve a relative path to a known file, trying extensions and index files.
 */
function tryResolveFile(relativeTarget: string, knownFiles: Set<string>): string | null {
  // 1. Exact match
  if (knownFiles.has(relativeTarget)) {
    return relativeTarget;
  }

  // 2. Try with extensions
  for (const ext of RESOLVE_EXTENSIONS) {
    const withExt = relativeTarget + ext;
    if (knownFiles.has(withExt)) {
      return withExt;
    }
  }

  // 3. Try as directory with index file
  for (const indexFile of INDEX_FILES) {
    const withIndex = relativeTarget + "/" + indexFile;
    if (knownFiles.has(withIndex)) {
      return withIndex;
    }
  }

  return null;
}

/**
 * Extract all import specifiers from a source file using ts-morph.
 * Handles ES6 imports, dynamic imports, re-exports, and CommonJS require.
 */
function extractImportSpecifiers(sourceFile: SourceFile): string[] {
  const specifiers: string[] = [];

  // ES6 import declarations: import x from './foo'
  for (const decl of sourceFile.getImportDeclarations()) {
    const moduleSpecifier = decl.getModuleSpecifierValue();
    if (moduleSpecifier) {
      specifiers.push(moduleSpecifier);
    }
  }

  // ES6 export declarations: export { x } from './foo'
  for (const decl of sourceFile.getExportDeclarations()) {
    const moduleSpecifier = decl.getModuleSpecifierValue();
    if (moduleSpecifier) {
      specifiers.push(moduleSpecifier);
    }
  }

  // CommonJS require() calls: const x = require('./foo')
  const callExpressions = sourceFile.getDescendantsOfKind(
    SyntaxKind.CallExpression
  );
  for (const call of callExpressions) {
    const expression = call.getExpression();

    // require('...')
    if (expression.getText() === "require") {
      const args = call.getArguments();
      if (args.length > 0) {
        const firstArg = args[0];
        if (firstArg.getKind() === SyntaxKind.StringLiteral) {
          specifiers.push(firstArg.getText().slice(1, -1)); // Remove quotes
        }
      }
    }

    // Dynamic import: import('./foo')
    if (expression.getKind() === SyntaxKind.ImportKeyword) {
      const args = call.getArguments();
      if (args.length > 0) {
        const firstArg = args[0];
        if (firstArg.getKind() === SyntaxKind.StringLiteral) {
          specifiers.push(firstArg.getText().slice(1, -1));
        }
      }
    }
  }

  return specifiers;
}

/**
 * Parse all files and extract their dependency information.
 *
 * @param rootDir - Absolute path to the project root
 * @param filePaths - Relative file paths to parse
 * @returns Array of parsed file data with resolved imports
 */
export async function parseFiles(
  rootDir: string,
  filePaths: string[],
  workspaceConfig?: WorkspaceConfig
): Promise<ParsedFile[]> {
  const absoluteRoot = path.resolve(rootDir);
  const knownFiles = new Set(filePaths);

  // Load path aliases from tsconfig/jsconfig
  const pathAliases = await loadPathAliases(absoluteRoot);
  if (pathAliases.length > 0) {
    // Log for debugging (visible in CLI output)
  }

  // Read all file contents in parallel
  const fileContents = await Promise.all(
    filePaths.map(async (filePath) => {
      const absolutePath = path.join(absoluteRoot, filePath);
      try {
        const content = await fs.readFile(absolutePath, "utf-8");
        return { filePath, content };
      } catch {
        return { filePath, content: null };
      }
    })
  );

  // Create a ts-morph project (non-strict, skip type checking)
  const project = new Project({
    compilerOptions: {
      allowJs: true,
      jsx: 1, // JsxEmit.Preserve
      noEmit: true,
      skipLibCheck: true,
    },
    skipAddingFilesFromTsConfig: true,
    skipFileDependencyResolution: true,
  });

  const results: ParsedFile[] = [];

  for (const { filePath, content } of fileContents) {
    if (content === null) {
      // Skip files we can't read
      continue;
    }

    const absolutePath = path.join(absoluteRoot, filePath);

    // Create a source file in the ts-morph project
    const sourceFile = project.createSourceFile(absolutePath, content, {
      overwrite: true,
    });

    try {
      const specifiers = extractImportSpecifiers(sourceFile);

      // Resolve each import specifier to an actual file
      const resolvedImports: string[] = [];
      for (const specifier of specifiers) {
        const resolved = resolveImportPath(
          specifier,
          filePath,
          absoluteRoot,
          knownFiles,
          pathAliases,
          workspaceConfig
        );
        if (resolved) {
          resolvedImports.push(resolved);
        }
      }

      results.push({
        filePath,
        imports: [...new Set(resolvedImports)], // Deduplicate
      });
    } catch {
      // If parsing fails, record file with no imports
      results.push({
        filePath,
        imports: [],
      });
    }

    // Remove the source file to free memory
    project.removeSourceFile(sourceFile);
  }

  return results;
}
