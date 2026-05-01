import { listApiCallsForFile } from "./apiCallRepository.js";
import { openIndexedProjectDatabase } from "./db.js";
import { listExportsForFile } from "./exportRepository.js";
import { getFileByPath, listFiles } from "./fileRepository.js";
import { listImportsForFile } from "./importRepository.js";
import { listRoutes, listRoutesForFile } from "./routeRepository.js";
import { getFileSummary } from "./summaryRepository.js";
import { listSymbols, listSymbolsForFile } from "./symbolRepository.js";

export function readIndexedFiles(projectRoot: string): string[] {
  const db = openIndexedProjectDatabase(projectRoot);

  try {
    return listFiles(db);
  } finally {
    db.close();
  }
}

export function readIndexedSymbols(projectRoot: string): Array<{
  name: string;
  kind: string;
  filePath: string;
}> {
  const db = openIndexedProjectDatabase(projectRoot);

  try {
    const symbols = listSymbols(db).map((row) => ({
      name: row.name,
      kind: row.kind,
      filePath: row.filePath
    }));
    const routes = listRoutes(db).map((route) => ({
      name: `${route.method} ${route.path}`,
      kind: "route",
      filePath: route.filePath
    }));

    return [...symbols, ...routes].sort((left, right) => {
      const nameCompare = left.name.localeCompare(right.name);
      return nameCompare !== 0 ? nameCompare : left.filePath.localeCompare(right.filePath);
    });
  } finally {
    db.close();
  }
}

export function readImportsForFile(projectRoot: string, filePath: string): Array<{
  importedFrom: string;
  importedNames: string[];
}> {
  const db = openIndexedProjectDatabase(projectRoot);

  try {
    assertIndexedFile(db, filePath);
    return listImportsForFile(db, filePath).map((record) => ({
      importedFrom: record.importedFrom,
      importedNames: record.importedNames
    }));
  } finally {
    db.close();
  }
}

export function readExplainData(projectRoot: string, filePath: string): {
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
} {
  const db = openIndexedProjectDatabase(projectRoot);

  try {
    const file = assertIndexedFile(db, filePath);

    return {
      file: {
        path: file.path,
        language: file.language,
        hash: file.hash,
        size: file.size
      },
      imports: listImportsForFile(db, filePath).map((record) => ({
        importedFrom: record.importedFrom,
        importedNames: record.importedNames
      })),
      exports: listExportsForFile(db, filePath).map((record) => ({
        exportedNames: record.exportedNames,
        exportKind: record.exportKind
      })),
      symbols: listSymbolsForFile(db, filePath).map((record) => ({
        name: record.name,
        kind: record.kind
      })),
      routes: listRoutesForFile(db, filePath).map((record) => ({
        method: record.method,
        path: record.path
      })),
      apiCalls: listApiCallsForFile(db, filePath).map((record) => ({
        client: record.client,
        method: record.method,
        url: record.url
      })),
      summary: getFileSummary(db, filePath)?.summary ?? null
    };
  } finally {
    db.close();
  }
}

function assertIndexedFile(
  db: Parameters<typeof getFileByPath>[0],
  filePath: string
): NonNullable<ReturnType<typeof getFileByPath>> {
  const file = getFileByPath(db, filePath);

  if (!file) {
    throw new Error(`File is not indexed: ${filePath}`);
  }

  return file;
}
