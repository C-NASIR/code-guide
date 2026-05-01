import type { ProjectDatabase } from "./db.js";
import type { ImportRecord } from "../types/records.js";

type ImportRow = {
  importedFrom: string;
  importedNames: string[];
  startLine: number;
  endLine: number;
};

export function insertImports(db: ProjectDatabase, imports: ImportRecord[]): void {
  const statement = db.prepare(
    `INSERT INTO imports (id, source_file, imported_from, imported_names, start_line, end_line)
     VALUES (@id, @sourceFile, @importedFrom, @importedNamesJson, @startLine, @endLine)`
  );

  for (const record of imports) {
    statement.run({
      ...record,
      importedNamesJson: JSON.stringify(record.importedNames)
    });
  }
}

export function listImportsForFile(db: ProjectDatabase, filePath: string): ImportRow[] {
  const rows = db
    .prepare(
      `SELECT imported_from, imported_names, start_line, end_line
       FROM imports
       WHERE source_file = ?
       ORDER BY start_line`
    )
    .all(filePath) as Array<{
      imported_from: string;
      imported_names: string;
      start_line: number;
      end_line: number;
    }>;

  return rows.map((row) => ({
    importedFrom: row.imported_from,
    importedNames: JSON.parse(row.imported_names) as string[],
    startLine: row.start_line,
    endLine: row.end_line
  }));
}
