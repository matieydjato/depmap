/**
 * Tests for the scanner module.
 */
import { describe, it, expect } from "vitest";
import * as path from "path";
import { scanFiles } from "../src/scanner";

const SIMPLE_FIXTURE = path.resolve(__dirname, "fixtures/simple-project");
const CIRCULAR_FIXTURE = path.resolve(__dirname, "fixtures/circular-project");

describe("scanFiles", () => {
  it("discovers all TypeScript files in a project", async () => {
    const files = await scanFiles(SIMPLE_FIXTURE);
    expect(files).toContain("src/index.ts");
    expect(files).toContain("src/foo.ts");
    expect(files).toContain("src/bar.ts");
    expect(files).toContain("src/utils.ts");
    expect(files).toHaveLength(4);
  });

  it("returns sorted file paths", async () => {
    const files = await scanFiles(SIMPLE_FIXTURE);
    const sorted = [...files].sort();
    expect(files).toEqual(sorted);
  });

  it("discovers files in the circular fixture", async () => {
    const files = await scanFiles(CIRCULAR_FIXTURE);
    expect(files).toContain("src/a.ts");
    expect(files).toContain("src/b.ts");
    expect(files).toHaveLength(2);
  });

  it("respects user exclude patterns", async () => {
    const files = await scanFiles(SIMPLE_FIXTURE, ["**/utils*"]);
    expect(files).not.toContain("src/utils.ts");
    expect(files).toHaveLength(3);
  });

  it("returns empty array for non-existent directory", async () => {
    const files = await scanFiles(path.resolve(__dirname, "fixtures/nope"));
    expect(files).toEqual([]);
  });
});
