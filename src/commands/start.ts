/**
 * `depmap start` command
 *
 * Scans the project, starts a local web server, and opens the browser.
 */

import { analyzeDependencies } from "../index";
import { startServer } from "../server";
import { ScanOptions } from "../types";
import { logger } from "../logger";

export async function startCommand(
  options: Omit<ScanOptions, "output">
): Promise<void> {
  logger.info("");
  logger.info("🗺️  DepMap scanning...");
  logger.info("");

  const startTime = Date.now();
  const graph = await analyzeDependencies({ ...options, exclude: options.exclude });
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  logger.success(`Found ${graph.stats.totalFiles} files (${graph.stats.totalSizeFormatted})`);
  logger.success(`Parsed ${graph.stats.totalEdges} imports`);

  if (graph.isMonorepo) {
    logger.success(`Monorepo detected — ${graph.packages.length} packages`);
    for (const pkg of graph.packages) {
      logger.info(`    • ${pkg.name} (${pkg.fileCount} files, ${pkg.totalSizeFormatted})`);
    }
  }

  if (graph.stats.circularCount > 0) {
    logger.warn(
      `${graph.stats.circularCount} circular dependenc${graph.stats.circularCount === 1 ? "y" : "ies"} detected`
    );
  } else {
    logger.success("No circular dependencies found");
  }

  logger.info(`⏱ Completed in ${elapsed}s`);
  logger.info("");

  // Start server
  startServer(graph, options.port);

  const url = `http://localhost:${options.port}`;
  logger.info(`🌐 Open ${url}`);
  logger.info("Press Ctrl+C to stop");
  logger.info("");

  // Try to open browser
  try {
    const openModule = await import("open");
    await openModule.default(url);
  } catch {
    // If open fails, user can manually navigate
  }
}
