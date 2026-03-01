/**
 * `depmap start` command
 *
 * Scans the project, starts a local web server, and opens the browser.
 */

import { analyzeDependencies } from "../index";
import { startServer } from "../server";
import { ScanOptions } from "../types";

export async function startCommand(
  options: Omit<ScanOptions, "output">
): Promise<void> {
  console.log("");
  console.log("  🗺️  DepMap scanning...");
  console.log("");

  const startTime = Date.now();
  const graph = analyzeDependencies({ ...options, exclude: options.exclude });
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`  ✓ Found ${graph.stats.totalFiles} files (${graph.stats.totalSizeFormatted})`);
  console.log(`  ✓ Parsed ${graph.stats.totalEdges} imports`);

  if (graph.isMonorepo) {
    console.log(`  ✓ Monorepo detected — ${graph.packages.length} packages`);
    for (const pkg of graph.packages) {
      console.log(`    • ${pkg.name} (${pkg.fileCount} files, ${pkg.totalSizeFormatted})`);
    }
  }

  if (graph.stats.circularCount > 0) {
    console.log(
      `  ⚠ ${graph.stats.circularCount} circular dependenc${graph.stats.circularCount === 1 ? "y" : "ies"} detected`
    );
  } else {
    console.log("  ✓ No circular dependencies found");
  }

  console.log(`  ⏱ Completed in ${elapsed}s`);
  console.log("");

  // Start server
  startServer(graph, options.port);

  const url = `http://localhost:${options.port}`;
  console.log(`  🌐 Open ${url}`);
  console.log("  Press Ctrl+C to stop");
  console.log("");

  // Try to open browser
  try {
    const openModule = await import("open");
    await openModule.default(url);
  } catch {
    // If open fails, user can manually navigate
  }
}
