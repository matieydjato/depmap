/**
 * Tests for the graph module — circular dependency detection and graph building.
 */
import { describe, it, expect } from "vitest";
import * as path from "path";
import { scanFiles } from "../src/scanner";
import { parseFiles } from "../src/parser";
import { buildGraph } from "../src/graph";

const SIMPLE_FIXTURE = path.resolve(__dirname, "fixtures/simple-project");
const CIRCULAR_FIXTURE = path.resolve(__dirname, "fixtures/circular-project");

describe("buildGraph", () => {
  it("builds a graph with correct file count and edges", async () => {
    const filePaths = await scanFiles(SIMPLE_FIXTURE);
    const parsed = await parseFiles(SIMPLE_FIXTURE, filePaths);
    const graph = await buildGraph(SIMPLE_FIXTURE, parsed);

    expect(graph.stats.totalFiles).toBe(4);
    expect(graph.stats.totalEdges).toBe(4); // index→foo, index→bar, foo→utils, bar→utils
    expect(graph.isMonorepo).toBe(false);
  });

  it("has no circular dependencies in simple project", async () => {
    const filePaths = await scanFiles(SIMPLE_FIXTURE);
    const parsed = await parseFiles(SIMPLE_FIXTURE, filePaths);
    const graph = await buildGraph(SIMPLE_FIXTURE, parsed);

    expect(graph.circularDependencies).toHaveLength(0);
    expect(graph.stats.circularCount).toBe(0);

    // No files should be marked circular
    for (const file of graph.files) {
      expect(file.isCircular).toBe(false);
      expect(file.circularWith).toHaveLength(0);
    }
  });

  it("detects circular dependencies", async () => {
    const filePaths = await scanFiles(CIRCULAR_FIXTURE);
    const parsed = await parseFiles(CIRCULAR_FIXTURE, filePaths);
    const graph = await buildGraph(CIRCULAR_FIXTURE, parsed);

    expect(graph.circularDependencies.length).toBeGreaterThan(0);
    expect(graph.stats.circularCount).toBeGreaterThan(0);

    // Both files should be marked circular
    const aFile = graph.files.find((f) => f.id === "src/a.ts");
    const bFile = graph.files.find((f) => f.id === "src/b.ts");
    expect(aFile?.isCircular).toBe(true);
    expect(bFile?.isCircular).toBe(true);
  });

  it("correctly builds importedBy reverse map", async () => {
    const filePaths = await scanFiles(SIMPLE_FIXTURE);
    const parsed = await parseFiles(SIMPLE_FIXTURE, filePaths);
    const graph = await buildGraph(SIMPLE_FIXTURE, parsed);

    const utils = graph.files.find((f) => f.id === "src/utils.ts");
    expect(utils).toBeDefined();
    // utils is imported by both foo and bar
    expect(utils!.importedBy).toContain("src/foo.ts");
    expect(utils!.importedBy).toContain("src/bar.ts");
    expect(utils!.importedBy).toHaveLength(2);
  });

  it("includes file size data for all nodes", async () => {
    const filePaths = await scanFiles(SIMPLE_FIXTURE);
    const parsed = await parseFiles(SIMPLE_FIXTURE, filePaths);
    const graph = await buildGraph(SIMPLE_FIXTURE, parsed);

    for (const file of graph.files) {
      expect(file.sizeBytes).toBeGreaterThan(0);
      expect(file.sizeFormatted).toBeDefined();
      expect(file.sizeFormatted).not.toBe("0 B");
    }

    expect(graph.stats.totalSizeBytes).toBeGreaterThan(0);
    expect(graph.stats.totalSizeFormatted).toBeDefined();
  });

  it("populates correct FileNode fields", async () => {
    const filePaths = await scanFiles(SIMPLE_FIXTURE);
    const parsed = await parseFiles(SIMPLE_FIXTURE, filePaths);
    const graph = await buildGraph(SIMPLE_FIXTURE, parsed);

    const indexNode = graph.files.find((f) => f.id === "src/index.ts");
    expect(indexNode).toBeDefined();
    expect(indexNode!.name).toBe("index.ts");
    expect(indexNode!.path).toBe("src/index.ts");
    expect(indexNode!.extension).toBe(".ts");
    expect(indexNode!.imports).toHaveLength(2);
  });
});
