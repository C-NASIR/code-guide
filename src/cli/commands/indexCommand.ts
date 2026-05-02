import type { Command } from "commander";
import { createOpenAIFileSummarizer } from "../../ai/openaiClient.js";
import { indexProject } from "../../indexer/indexProject.js";
import { formatIndexReport } from "../formatters.js";

export type IndexCommandDependencies = {
  createSummarizer?: typeof createOpenAIFileSummarizer;
};

/**
 * Registers the `index` command, which runs the full indexing pipeline and
 * prints the aggregate report for the target project.
 */
export function registerIndexCommand(
  program: Command,
  dependencies: IndexCommandDependencies = {},
): void {
  const createSummarizer =
    dependencies.createSummarizer ?? createOpenAIFileSummarizer;

  program
    .command("index")
    .argument("<projectPath>", "Path to the project to index")
    .description("Scan, parse, store, and summarize a project")
    .action(async (projectPath: string) => {
      const { model, summarizeFile } = createSummarizer();
      const report = await indexProject({
        projectPath,
        summarizeFile,
        summaryModel: model,
      });

      console.log(formatIndexReport(report));
    });
}
