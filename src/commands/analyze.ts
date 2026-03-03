/**
 * `depmap analyze` command
 *
 * Scans the project and outputs dependency data as JSON.
 */

import * as fs from "fs/promises";
import { analyzeDependencies } from "../index";
import { ScanOptions } from "../types";
import { logger } from "../logger";

export async function analyzeCommand(options: ScanOptions): Promise<void> {
  logger.info("");
  logger.info("🗺️  DepMap analyzing...");
  logger.info("");

  let graph;
  try {
    graph = await analyzeDependencies(options);
  } catch (err) {
    logger.error(`Analysis failed: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
  const jsonOutput = JSON.stringify(graph, null, 2);

  if (options.output) {
    await fs.writeFile(options.output, jsonOutput, "utf-8");
    logger.success(`Dependency data written to ${options.output}`);
  } else {
    // Raw JSON to stdout — don't wrap with logger prefix
    console.log(jsonOutput);
  }

  logger.info("");
  logger.info(
    `📊 ${graph.stats.totalFiles} files (${graph.stats.totalSizeFormatted}), ${graph.stats.totalEdges} edges, ${graph.stats.circularCount} circular deps`
  );

  if (graph.isMonorepo) {
    logger.info(`📦 Monorepo — ${graph.packages.length} packages`);
    for (const pkg of graph.packages) {
      logger.info(`    • ${pkg.name} (${pkg.fileCount} files, ${pkg.totalSizeFormatted})`);
    }
  }

  logger.info("");
}
