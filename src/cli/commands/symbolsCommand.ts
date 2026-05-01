import type { Command } from "commander";
import { readIndexedSymbols } from "../../storage/projectQueries.js";
import { formatSymbolList } from "../formatters.js";
import { resolveReadProjectRoot } from "../options.js";

export function registerSymbolsCommand(program: Command): void {
  program
    .command("symbols")
    .description("Show functions, components, and routes")
    .option("--project <path>", "Indexed project root", process.cwd())
    .action((options: { project: string }) => {
      const projectRoot = resolveReadProjectRoot(options.project);
      const symbols = readIndexedSymbols(projectRoot);
      console.log(formatSymbolList(symbols));
    });
}
