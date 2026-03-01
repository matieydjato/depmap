/**
 * `depmap check` command
 *
 * Checks for circular dependencies and exits with code 1 if found.
 * Designed for CI/CD pipelines.
 */

import { analyzeDependencies } from "../index";
import { ScanOptions } from "../types";

export async function checkCommand(
  options: Omit<ScanOptions, "output">
): Promise<void> {
  console.log("");
  console.log("  🗺️  DepMap checking for circular dependencies...");
  console.log("");

  const graph = analyzeDependencies({ ...options, exclude: options.exclude });

  console.log(`  📁 Scanned ${graph.stats.totalFiles} files (${graph.stats.totalSizeFormatted})`);
  console.log(`  🔗 Found ${graph.stats.totalEdges} import relationships`);

  if (graph.isMonorepo) {
    console.log(`  📦 Monorepo — ${graph.packages.length} packages`);
  }

  console.log("");

  if (graph.circularDependencies.length === 0) {
    console.log("  ✅ No circular dependencies found!");
    console.log("");
    process.exit(0);
  }

  console.log(
    `  ❌ Found ${graph.circularDependencies.length} circular dependenc${
      graph.circularDependencies.length === 1 ? "y" : "ies"
    }:`
  );
  console.log("");

  for (let i = 0; i < graph.circularDependencies.length; i++) {
    const cycle = graph.circularDependencies[i];
    console.log(`  Cycle ${i + 1}:`);
    for (const file of cycle) {
      console.log(`    → ${file}`);
    }
    console.log(`    → ${cycle[0]} (back to start)`);
    console.log("");
  }

  process.exit(1);
}
