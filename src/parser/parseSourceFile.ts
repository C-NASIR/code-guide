import { Project, ScriptKind, type SourceFile } from "ts-morph";
import { extractApiCalls } from "./extractApiCalls.js";
import { extractComponents } from "./extractComponents.js";
import { extractExports } from "./extractExports.js";
import { extractFunctions } from "./extractFunctions.js";
import { extractImports } from "./extractImports.js";
import { extractRoutes } from "./extractRoutes.js";
import type { ParsedFile } from "../types/parsedFile.js";
import type { SourceFileRecord } from "../types/sourceFile.js";
import type { SymbolRecord } from "../types/records.js";
import { createId } from "../utils/createId.js";

function getScriptKind(filePath: string): ScriptKind {
  if (filePath.endsWith(".tsx")) {
    return ScriptKind.TSX;
  }

  if (filePath.endsWith(".jsx")) {
    return ScriptKind.JSX;
  }

  if (filePath.endsWith(".ts")) {
    return ScriptKind.TS;
  }

  return ScriptKind.JS;
}

export function createParserProject(): Project {
  return new Project({
    compilerOptions: {
      allowJs: true,
      jsx: 1
    },
    skipAddingFilesFromTsConfig: true,
    useInMemoryFileSystem: true
  });
}

function hasParseErrors(sourceFile: SourceFile): boolean {
  const compilerNode = sourceFile.compilerNode as { parseDiagnostics?: unknown[] };
  return (compilerNode.parseDiagnostics?.length ?? 0) > 0;
}

/**
 * Parses one source file into the normalized structural records stored by the
 * index.
 *
 * Files with parse diagnostics return `null` so the indexer can skip them
 * without failing the rest of the run.
 */
export function parseSourceFile(project: Project, file: SourceFileRecord): ParsedFile | null {
  const sourceFile = project.createSourceFile(file.path, file.content, {
    overwrite: true,
    scriptKind: getScriptKind(file.path)
  });

  if (hasParseErrors(sourceFile)) {
    project.removeSourceFile(sourceFile);
    return null;
  }

  const imports = extractImports(sourceFile, file.path);
  const exports = extractExports(sourceFile, file.path);
  const components = extractComponents(sourceFile, file.path);
  const componentNames = new Set(components.map((component) => component.name));
  const functions = extractFunctions(sourceFile, file.path).filter((record) => !componentNames.has(record.name));
  const routes = extractRoutes(sourceFile, file.path);
  const apiCalls = extractApiCalls(sourceFile, file.path);
  const symbols: SymbolRecord[] = [
    ...functions.map((record) => ({
      id: createId("symbol", file.path, "function", record.name, record.startLine),
      filePath: file.path,
      name: record.name,
      kind: "function" as const,
      startLine: record.startLine,
      endLine: record.endLine
    })),
    ...components.map((record) => ({
      id: createId("symbol", file.path, "component", record.name, record.startLine),
      filePath: file.path,
      name: record.name,
      kind: "component" as const,
      startLine: record.startLine,
      endLine: record.endLine
    })),
    ...exports.flatMap((record) =>
      record.exportedNames.map((name) => ({
        id: createId("symbol", file.path, "export", name, record.startLine),
        filePath: file.path,
        name,
        kind: "export" as const,
        startLine: record.startLine,
        endLine: record.endLine
      }))
    )
  ];

  project.removeSourceFile(sourceFile);

  return {
    filePath: file.path,
    imports,
    exports,
    functions,
    components,
    routes,
    apiCalls,
    symbols
  };
}
