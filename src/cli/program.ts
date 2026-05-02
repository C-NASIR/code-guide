import { Command } from "commander";
import { registerExplainCommand } from "./commands/explainCommand.js";
import { registerFilesCommand } from "./commands/filesCommand.js";
import { registerImportsCommand } from "./commands/importsCommand.js";
import {
  registerIndexCommand,
  type IndexCommandDependencies,
} from "./commands/indexCommand.js";
import { registerSymbolsCommand } from "./commands/symbolsCommand.js";

export type ProgramDependencies = {
  indexCommand?: IndexCommandDependencies;
};

/**
 * Creates the top-level Commander program and registers all Phase 1 commands.
 *
 * Dependencies are injectable so tests can replace the production summarizer
 * with deterministic mocks.
 */
export function createProgram(dependencies: ProgramDependencies = {}): Command {
  const program = new Command();

  program
    .name("code-tour")
    .description(
      "Build a searchable structural map of a TypeScript or React codebase",
    )
    .showHelpAfterError();

  registerIndexCommand(program, dependencies.indexCommand);
  registerFilesCommand(program);
  registerSymbolsCommand(program);
  registerExplainCommand(program);
  registerImportsCommand(program);

  return program;
}
