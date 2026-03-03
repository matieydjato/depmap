/**
 * `depmap check` command
 *
 * Checks for circular dependencies and exits with code 1 if found.
 * Designed for CI/CD pipelines.
 */

import { analyzeDependencies } from "../index";
import { ScanOptions } from "../types";
import { logger } from "../logger";

export async function checkCommand(options: Omit<ScanOptions, "output">): Promise<void> {
  logger.info("");
  logger.info("🗺️  DepMap checking for circular dependencies...");
  logger.info("");

  const graph = await analyzeDependencies({ ...options, exclude: options.exclude });

  logger.info(`📁 Scanned ${graph.stats.totalFiles} files (${graph.stats.totalSizeFormatted})`);
  logger.info(`🔗 Found ${graph.stats.totalEdges} import relationships`);

  if (graph.isMonorepo) {
    logger.info(`📦 Monorepo — ${graph.packages.length} packages`);
  }

  logger.info("");

  if (graph.circularDependencies.length === 0) {
    logger.success("No circular dependencies found!");
    logger.info("");
    process.exit(0);
  }

  logger.error(
    `Found ${graph.circularDependencies.length} circular dependenc${
      graph.circularDependencies.length === 1 ? "y" : "ies"
    }:`
  );
  logger.info("");

  for (let i = 0; i < graph.circularDependencies.length; i++) {
    const cycle = graph.circularDependencies[i];
    logger.info(`Cycle ${i + 1}:`);
    for (const file of cycle) {
      logger.info(`    → ${file}`);
    }
    logger.info(`    → ${cycle[0]} (back to start)`);
    logger.info("");
  }

  process.exit(1);
}
