import type { IndexingReport } from "../types/indexing.js";

export function formatIndexReport(report: IndexingReport): string {
  return [
    `Indexed project: ${report.projectPath}`,
    "",
    `Files scanned: ${report.filesScanned}`,
    `Files parsed: ${report.filesParsed}`,
    `Imports found: ${report.importsFound}`,
    `Exports found: ${report.exportsFound}`,
    `Functions found: ${report.functionsFound}`,
    `Components found: ${report.componentsFound}`,
    `Routes found: ${report.routesFound}`,
    `API calls found: ${report.apiCallsFound}`,
    `Summaries created: ${report.summariesCreated}`,
    `Skipped/failed files: ${report.skippedFiles}`
  ].join("\n");
}

export function formatFileList(files: string[]): string {
  return files.join("\n");
}

export function formatSymbolList(
  symbols: Array<{
    name: string;
    kind: string;
    filePath: string;
  }>
): string {
  return symbols.map((symbol) => `${symbol.name}\t${symbol.kind}\t${symbol.filePath}`).join("\n");
}

export function formatImports(
  records: Array<{
    importedFrom: string;
    importedNames: string[];
  }>
): string {
  return records
    .map((record) => {
      const names = record.importedNames.length > 0 ? record.importedNames.join(", ") : "(side effect only)";
      return `${record.importedFrom}\t${names}`;
    })
    .join("\n");
}

export function formatExplain(data: {
  file: {
    path: string;
    language: string;
    hash: string;
    size: number;
  };
  imports: Array<{ importedFrom: string; importedNames: string[] }>;
  exports: Array<{ exportedNames: string[]; exportKind: string }>;
  symbols: Array<{ name: string; kind: string }>;
  routes: Array<{ method: string; path: string }>;
  apiCalls: Array<{ client: string; method: string | null; url: string | null }>;
  summary: {
    purpose: string;
    mainExports: string[];
    importantFunctions: string[];
    externalDependencies: string[];
    sideEffects: string[];
  } | null;
}): string {
  const lines: string[] = [
    `File: ${data.file.path}`,
    `Language: ${data.file.language}`,
    `Hash: ${data.file.hash}`,
    `Size: ${data.file.size}`
  ];

  if (data.summary) {
    lines.push("");
    lines.push("Summary:");
    lines.push(`Purpose: ${data.summary.purpose}`);
    lines.push(`Main exports: ${data.summary.mainExports.join(", ") || "(none)"}`);
    lines.push(`Important functions: ${data.summary.importantFunctions.join(", ") || "(none)"}`);
    lines.push(`External dependencies: ${data.summary.externalDependencies.join(", ") || "(none)"}`);
    lines.push(`Side effects: ${data.summary.sideEffects.join(", ") || "(none)"}`);
  }

  lines.push("");
  lines.push("Imports:");
  lines.push(data.imports.length > 0 ? formatImports(data.imports) : "(none)");

  lines.push("");
  lines.push("Exports:");
  lines.push(
    data.exports.length > 0
      ? data.exports.map((record) => `${record.exportKind}\t${record.exportedNames.join(", ")}`).join("\n")
      : "(none)"
  );

  lines.push("");
  lines.push("Symbols:");
  lines.push(
    data.symbols.length > 0 ? data.symbols.map((record) => `${record.name}\t${record.kind}`).join("\n") : "(none)"
  );

  lines.push("");
  lines.push("Routes:");
  lines.push(
    data.routes.length > 0 ? data.routes.map((record) => `${record.method}\t${record.path}`).join("\n") : "(none)"
  );

  lines.push("");
  lines.push("API calls:");
  lines.push(
    data.apiCalls.length > 0
      ? data.apiCalls
          .map((record) => `${record.client}\t${record.method ?? "(unknown)"}\t${record.url ?? "(dynamic)"}`)
          .join("\n")
      : "(none)"
  );

  return lines.join("\n");
}
