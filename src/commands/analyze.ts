/**
 * `depmap analyze` command
 *
 * Scans the project and outputs dependency data as JSON.
 */

import * as fs from "fs";
import { analyzeDependencies } from "../index";
import { ScanOptions } from "../types";

export async function analyzeCommand(options: ScanOptions): Promise<void> {
  console.log("");
  console.log("  🗺️  DepMap analyzing...");
  console.log("");

  const graph = analyzeDependencies(options);
  const jsonOutput = JSON.stringify(graph, null, 2);

  if (options.output) {
    fs.writeFileSync(options.output, jsonOutput, "utf-8");
    console.log(`  ✓ Dependency data written to ${options.output}`);
  } else {
    console.log(jsonOutput);
  }

  console.log("");
  console.log(`  📊 ${graph.stats.totalFiles} files (${graph.stats.totalSizeFormatted}), ${graph.stats.totalEdges} edges, ${graph.stats.circularCount} circular deps`);

  if (graph.isMonorepo) {
    console.log(`  📦 Monorepo — ${graph.packages.length} packages`);
    for (const pkg of graph.packages) {
      console.log(`    • ${pkg.name} (${pkg.fileCount} files, ${pkg.totalSizeFormatted})`);
    }
  }

  console.log("");
}
