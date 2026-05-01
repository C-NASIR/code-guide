import type { ProjectDatabase } from "./db.js";
import type { FileSummary, StoredFileSummary } from "../types/fileSummary.js";
import { createId } from "../utils/createId.js";

export function insertFileSummaries(
  db: ProjectDatabase,
  summaries: StoredFileSummary[]
): void {
  const statement = db.prepare(
    `INSERT INTO file_summaries (id, file_path, summary_json, model, created_at)
     VALUES (@id, @filePath, @summaryJson, @model, @createdAt)`
  );

  for (const summary of summaries) {
    statement.run({
      id: createId("summary", summary.filePath),
      filePath: summary.filePath,
      summaryJson: JSON.stringify(summary.summary),
      model: summary.model,
      createdAt: summary.createdAt
    });
  }
}

export function getFileSummary(db: ProjectDatabase, filePath: string): StoredFileSummary | null {
  const row = db
    .prepare(
      `SELECT file_path, summary_json, model, created_at
       FROM file_summaries
       WHERE file_path = ?`
    )
    .get(filePath) as
    | {
        file_path: string;
        summary_json: string;
        model: string;
        created_at: string;
      }
    | undefined;

  if (!row) {
    return null;
  }

  return {
    filePath: row.file_path,
    summary: JSON.parse(row.summary_json) as FileSummary,
    model: row.model,
    createdAt: row.created_at
  };
}
