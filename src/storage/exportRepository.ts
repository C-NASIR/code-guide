import type { ProjectDatabase } from "./db.js";
import type { ExportRecord } from "../types/records.js";

type ExportRow = {
  exportedNames: string[];
  exportKind: string;
  startLine: number;
  endLine: number;
};

export function insertExports(db: ProjectDatabase, exports: ExportRecord[]): void {
  const statement = db.prepare(
    `INSERT INTO exports (id, file_path, exported_names, export_kind, start_line, end_line)
     VALUES (@id, @filePath, @exportedNamesJson, @exportKind, @startLine, @endLine)`
  );

  for (const record of exports) {
    statement.run({
      ...record,
      exportedNamesJson: JSON.stringify(record.exportedNames)
    });
  }
}

export function listExportsForFile(db: ProjectDatabase, filePath: string): ExportRow[] {
  const rows = db
    .prepare(
      `SELECT exported_names, export_kind, start_line, end_line
       FROM exports
       WHERE file_path = ?
       ORDER BY start_line`
    )
    .all(filePath) as Array<{
      exported_names: string;
      export_kind: string;
      start_line: number;
      end_line: number;
    }>;

  return rows.map((row) => ({
    exportedNames: JSON.parse(row.exported_names) as string[],
    exportKind: row.export_kind,
    startLine: row.start_line,
    endLine: row.end_line
  }));
}
