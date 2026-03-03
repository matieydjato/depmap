/**
 * Tests for the parser module.
 */
import { describe, it, expect } from "vitest";
import * as path from "path";
import { scanFiles } from "../src/scanner";
import { parseFiles } from "../src/parser";

const SIMPLE_FIXTURE = path.resolve(__dirname, "fixtures/simple-project");
const CIRCULAR_FIXTURE = path.resolve(__dirname, "fixtures/circular-project");

describe("parseFiles", () => {
  it("extracts import relationships from simple project", async () => {
    const filePaths = await scanFiles(SIMPLE_FIXTURE);
    const parsed = await parseFiles(SIMPLE_FIXTURE, filePaths);

    const indexFile = parsed.find((f) => f.filePath === "src/index.ts");
    expect(indexFile).toBeDefined();
    expect(indexFile!.imports).toContain("src/foo.ts");
    expect(indexFile!.imports).toContain("src/bar.ts");
    expect(indexFile!.imports).toHaveLength(2);
  });

  it("resolves imports to foo and bar from index", async () => {
    const filePaths = await scanFiles(SIMPLE_FIXTURE);
    const parsed = await parseFiles(SIMPLE_FIXTURE, filePaths);

    const fooFile = parsed.find((f) => f.filePath === "src/foo.ts");
    expect(fooFile).toBeDefined();
    expect(fooFile!.imports).toContain("src/utils.ts");
    expect(fooFile!.imports).toHaveLength(1);

    const barFile = parsed.find((f) => f.filePath === "src/bar.ts");
    expect(barFile).toBeDefined();
    expect(barFile!.imports).toContain("src/utils.ts");
    expect(barFile!.imports).toHaveLength(1);
  });

  it("identifies leaf nodes (no imports)", async () => {
    const filePaths = await scanFiles(SIMPLE_FIXTURE);
    const parsed = await parseFiles(SIMPLE_FIXTURE, filePaths);

    const utilsFile = parsed.find((f) => f.filePath === "src/utils.ts");
    expect(utilsFile).toBeDefined();
    expect(utilsFile!.imports).toHaveLength(0);
  });

  it("extracts mutual imports in circular project", async () => {
    const filePaths = await scanFiles(CIRCULAR_FIXTURE);
    const parsed = await parseFiles(CIRCULAR_FIXTURE, filePaths);

    const aFile = parsed.find((f) => f.filePath === "src/a.ts");
    expect(aFile).toBeDefined();
    expect(aFile!.imports).toContain("src/b.ts");

    const bFile = parsed.find((f) => f.filePath === "src/b.ts");
    expect(bFile).toBeDefined();
    expect(bFile!.imports).toContain("src/a.ts");
  });

  it("parses all files even when empty list provided", async () => {
    const parsed = await parseFiles(SIMPLE_FIXTURE, []);
    expect(parsed).toEqual([]);
  });
});
