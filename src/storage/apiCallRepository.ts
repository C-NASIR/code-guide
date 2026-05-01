import type { ProjectDatabase } from "./db.js";
import type { ApiCallRecord } from "../types/records.js";

type ApiCallRow = {
  client: string;
  method: string | null;
  url: string | null;
  startLine: number;
  endLine: number;
};

export function insertApiCalls(db: ProjectDatabase, apiCalls: ApiCallRecord[]): void {
  const statement = db.prepare(
    `INSERT INTO api_calls (id, client, method, url, file_path, start_line, end_line)
     VALUES (@id, @client, @method, @url, @filePath, @startLine, @endLine)`
  );

  for (const record of apiCalls) {
    statement.run(record);
  }
}

export function listApiCallsForFile(db: ProjectDatabase, filePath: string): ApiCallRow[] {
  return db
    .prepare(
      `SELECT client, method, url, start_line, end_line
       FROM api_calls
       WHERE file_path = ?
       ORDER BY start_line`
    )
    .all(filePath) as ApiCallRow[];
}
