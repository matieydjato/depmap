#!/usr/bin/env node

/**
 * DepMap CLI — Entry point
 *
 * Commands:
 *   depmap start [path]    Scan project and open interactive visualization
 *   depmap analyze [path]  Scan project and output JSON
 *   depmap check           Check for circular dependencies (CI-friendly)
 */

import { Command } from "commander";
import { startCommand } from "./commands/start";
import { analyzeCommand } from "./commands/analyze";
import { checkCommand } from "./commands/check";

const program = new Command();

program
  .name("depmap")
  .description("🗺️  DepMap — Live Dependency Visualizer for JS/TS projects")
  .version("0.1.0");

program
  .command("start")
  .description("Scan project and open interactive visualization in browser")
  .argument("[path]", "Directory to scan", ".")
  .option("-p, --port <number>", "Port for the web server", "3000")
  .option(
    "-e, --exclude <patterns...>",
    "Glob patterns to exclude",
    []
  )
  .action(async (path: string, options: { port: string; exclude: string[] }) => {
    await startCommand({
      path,
      port: parseInt(options.port, 10),
      exclude: options.exclude,
    });
  });

program
  .command("analyze")
  .description("Scan project and output dependency data as JSON")
  .argument("[path]", "Directory to scan", ".")
  .option(
    "-o, --output <file>",
    "Output file path (defaults to stdout)"
  )
  .option(
    "-e, --exclude <patterns...>",
    "Glob patterns to exclude",
    []
  )
  .action(async (path: string, options: { output?: string; exclude: string[] }) => {
    await analyzeCommand({
      path,
      port: 3000,
      exclude: options.exclude,
      output: options.output,
    });
  });

program
  .command("check")
  .description("Check for circular dependencies (exit code 1 if found)")
  .argument("[path]", "Directory to scan", ".")
  .option("--circular", "Check for circular dependencies", true)
  .option(
    "-e, --exclude <patterns...>",
    "Glob patterns to exclude",
    []
  )
  .action(async (path: string, options: { exclude: string[] }) => {
    await checkCommand({
      path,
      port: 3000,
      exclude: options.exclude,
    });
  });

program.parse();
