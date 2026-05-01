import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getDatabasePath } from "../src/storage/db.js";
import { readExplainData, readIndexedFiles } from "../src/storage/projectQueries.js";
import { indexProject } from "../src/indexer/indexProject.js";
import { createOpenAIFileSummarizer } from "../src/ai/openaiClient.js";
import type { FileSummarizer } from "../src/ai/summarizeFile.js";
import { createTempFixtureCopy } from "./helpers.js";

function createMockSummarizer(): { model: string; summarizeFile: FileSummarizer } {
  return {
    model: "test-model",
    summarizeFile: async ({ filePath }) => ({
      purpose: `Summary for ${filePath}`,
      mainExports: ["default"],
      importantFunctions: ["handleSubmit"],
      externalDependencies: [],
      sideEffects: []
    })
  };
}

describe("indexer", () => {
  it("indexes a fixture project into SQLite", async () => {
    const projectRoot = await createTempFixtureCopy("example-app");
    const mock = createMockSummarizer();
    const report = await indexProject({
      projectPath: projectRoot,
      summarizeFile: mock.summarizeFile,
      summaryModel: mock.model
    });

    expect(report.filesScanned).toBe(5);
    expect(report.filesParsed).toBe(5);
    expect(report.routesFound).toBe(1);
    expect(report.apiCallsFound).toBe(1);
    expect(report.summariesCreated).toBe(5);

    const indexedFiles = readIndexedFiles(projectRoot);
    expect(indexedFiles).toContain("src/App.tsx");
    expect(indexedFiles).toContain("src/server/routes/auth.ts");

    const explained = readExplainData(projectRoot, "src/api/auth.ts");
    expect(explained.summary?.purpose).toBe("Summary for src/api/auth.ts");
    expect(explained.apiCalls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          client: "fetch",
          method: "POST",
          url: "/api/login"
        })
      ])
    );

    const databasePath = getDatabasePath(projectRoot);
    await expect(fs.stat(databasePath)).resolves.toBeDefined();
  });

  it("counts malformed files as skipped without failing the run", async () => {
    const projectRoot = await createTempFixtureCopy("example-app");
    await fs.writeFile(path.join(projectRoot, "src", "broken.ts"), "export const broken = (", "utf8");
    const mock = createMockSummarizer();

    const report = await indexProject({
      projectPath: projectRoot,
      summarizeFile: mock.summarizeFile,
      summaryModel: mock.model
    });

    expect(report.filesScanned).toBe(6);
    expect(report.filesParsed).toBe(5);
    expect(report.skippedFiles).toBe(1);
  });

  it("fails fast when summary env vars are missing", () => {
    expect(() => createOpenAIFileSummarizer({})).toThrow("OPENAI_API_KEY is required");
  });
});
