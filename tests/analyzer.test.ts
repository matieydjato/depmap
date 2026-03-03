/**
 * Tests for the analyzer module — formatBytes and file size analysis.
 */
import { describe, it, expect } from "vitest";
import * as path from "path";
import { formatBytes, analyzeFileSizes } from "../src/analyzer";

describe("formatBytes", () => {
  it("returns '0 B' for 0 bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("formats bytes correctly", () => {
    expect(formatBytes(500)).toBe("500 B");
    expect(formatBytes(1)).toBe("1 B");
    expect(formatBytes(1023)).toBe("1023 B");
  });

  it("formats kilobytes correctly", () => {
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(10240)).toBe("10.0 KB");
  });

  it("formats megabytes correctly", () => {
    expect(formatBytes(1048576)).toBe("1.0 MB");
    expect(formatBytes(5242880)).toBe("5.0 MB");
  });

  it("formats gigabytes correctly", () => {
    expect(formatBytes(1073741824)).toBe("1.0 GB");
  });
});

describe("analyzeFileSizes", () => {
  const SIMPLE_FIXTURE = path.resolve(__dirname, "fixtures/simple-project");

  it("returns a map of file sizes", async () => {
    const files = ["src/index.ts", "src/foo.ts", "src/bar.ts", "src/utils.ts"];
    const sizeMap = await analyzeFileSizes(SIMPLE_FIXTURE, files);

    expect(sizeMap.size).toBe(4);
    for (const file of files) {
      const entry = sizeMap.get(file);
      expect(entry).toBeDefined();
      expect(entry!.sizeBytes).toBeGreaterThan(0);
      expect(entry!.sizeFormatted).toBeDefined();
    }
  });

  it("returns 0 bytes for non-existent files", async () => {
    const sizeMap = await analyzeFileSizes(SIMPLE_FIXTURE, ["src/doesnt-exist.ts"]);
    const entry = sizeMap.get("src/doesnt-exist.ts");
    expect(entry).toBeDefined();
    expect(entry!.sizeBytes).toBe(0);
    expect(entry!.sizeFormatted).toBe("0 B");
  });

  it("handles empty file list", async () => {
    const sizeMap = await analyzeFileSizes(SIMPLE_FIXTURE, []);
    expect(sizeMap.size).toBe(0);
  });
});
