import { afterEach, describe, expect, it, vi } from "vitest";
import { createProgram } from "../src/cli/program.js";
import type { FileSummarizer } from "../src/ai/summarizeFile.js";
import { createTempFixtureCopy, stripAnsi } from "./helpers.js";

function createMockSummarizer(): { model: string; summarizeFile: FileSummarizer } {
  return {
    model: "test-model",
    summarizeFile: async ({ filePath }) => ({
      purpose: `Summary for ${filePath}`,
      mainExports: ["default"],
      importantFunctions: ["handleSubmit"],
      externalDependencies: ["react"],
      sideEffects: []
    })
  };
}

async function runCli(args: string[]): Promise<{ stdout: string; stderr: string }> {
  const logs: string[] = [];
  const errors: string[] = [];
  const logSpy = vi.spyOn(console, "log").mockImplementation((message?: unknown) => {
    logs.push(String(message ?? ""));
  });
  const errorSpy = vi.spyOn(console, "error").mockImplementation((message?: unknown) => {
    errors.push(String(message ?? ""));
  });

  try {
    const program = createProgram({
      indexCommand: {
        createSummarizer: () => createMockSummarizer()
      }
    });
    try {
      await program.parseAsync(["node", "code-tour", ...args]);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  } finally {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  }

  return {
    stdout: stripAnsi(logs.join("\n")),
    stderr: stripAnsi(errors.join("\n"))
  };
}

describe("cli", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("runs index and the read commands against the generated database", async () => {
    const projectRoot = await createTempFixtureCopy("example-app");

    const indexResult = await runCli(["index", projectRoot]);
    expect(indexResult.stdout).toContain("Indexed project:");
    expect(indexResult.stdout).toContain("Files scanned: 5");

    const filesResult = await runCli(["files", "--project", projectRoot]);
    expect(filesResult.stdout).toContain("src/App.tsx");
    expect(filesResult.stdout).toContain("src/components/LoginForm.tsx");

    const symbolsResult = await runCli(["symbols", "--project", projectRoot]);
    expect(symbolsResult.stdout).toContain("LoginForm\tcomponent\tsrc/components/LoginForm.tsx");
    expect(symbolsResult.stdout).toContain("POST /login\troute\tsrc/server/routes/auth.ts");

    const importsResult = await runCli(["imports", "src/components/LoginForm.tsx", "--project", projectRoot]);
    expect(importsResult.stdout).toContain("react\tuseState");
    expect(importsResult.stdout).toContain("../api/auth\tloginUser");

    const explainResult = await runCli(["explain", "src/api/auth.ts", "--project", projectRoot]);
    expect(explainResult.stdout).toContain("Summary for src/api/auth.ts");
    expect(explainResult.stdout).toContain("fetch\tPOST\t/api/login");
  });

  it("returns a clear error when the database is missing", async () => {
    const projectRoot = await createTempFixtureCopy("example-app");
    const result = await runCli(["files", "--project", projectRoot]);

    expect(result.stderr).toContain("No index database found");
  });
});
