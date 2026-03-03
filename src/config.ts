/**
 * Config Module
 *
 * Loads configuration from .depmaprc, .depmaprc.json, or depmap.config.json.
 * Merges with CLI options (CLI options take precedence).
 */

import * as fs from "fs";
import * as path from "path";
import { ScanOptions } from "./types";
import { logger } from "./logger";

/** Configuration that can be set in .depmaprc */
export interface DepMapConfig {
  /** Directory to scan (relative to config file) */
  path?: string;
  /** Port for the web server */
  port?: number;
  /** Glob patterns to exclude */
  exclude?: string[];
  /** Additional file extensions to include */
  extensions?: string[];
  /** Folders to always treat as project boundaries */
  aliases?: Record<string, string>;
}

/** Config file names to search for (in priority order) */
const CONFIG_FILES = [
  ".depmaprc",
  ".depmaprc.json",
  "depmap.config.json",
];

/**
 * Load DepMap configuration from the project root.
 *
 * @param rootDir - Project root directory to search for config files
 * @returns Parsed config, or empty object if no config found
 */
export function loadConfig(rootDir: string): DepMapConfig {
  const absoluteRoot = path.resolve(rootDir);

  for (const configFile of CONFIG_FILES) {
    const configPath = path.join(absoluteRoot, configFile);

    if (fs.existsSync(configPath)) {
      try {
        const raw = fs.readFileSync(configPath, "utf-8");
        const config = JSON.parse(raw);
        return config as DepMapConfig;
      } catch (err) {
        logger.warn(`Failed to parse ${configFile}: ${(err as Error).message}`);
        return {};
      }
    }
  }

  return {};
}

/**
 * Merge config file settings with CLI options.
 * CLI options take precedence over config file values.
 */
export function mergeWithConfig(
  cliOptions: ScanOptions,
  rootDir: string
): ScanOptions {
  const config = loadConfig(rootDir);

  return {
    path: cliOptions.path || config.path || ".",
    port: cliOptions.port || config.port || 3000,
    exclude: [
      ...(config.exclude || []),
      ...(cliOptions.exclude || []),
    ],
    output: cliOptions.output,
  };
}
