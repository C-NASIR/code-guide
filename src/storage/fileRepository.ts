import type { ProjectDatabase } from "./db.js";
import type { SourceFileRecord } from "../types/sourceFile.js";

type FileRow = {
  path: string;
  language: string;
  content: string;
  hash: string;
  size: number;
};

export function insertFiles(db: ProjectDatabase, files: SourceFileRecord[]): void {
  const statement = db.prepare(
    `INSERT INTO files (id, path, language, content, hash, size)
     VALUES (@id, @path, @language, @content, @hash, @size)`
  );

  for (const file of files) {
    statement.run(file);
  }
}

export function listFiles(db: ProjectDatabase): string[] {
  const rows = db.prepare("SELECT path FROM files ORDER BY path").all() as Array<{ path: string }>;
  return rows.map((row) => row.path);
}

export function getFileByPath(db: ProjectDatabase, filePath: string): FileRow | null {
  const row = db
    .prepare(
      `SELECT path, language, content, hash, size
       FROM files
       WHERE path = ?`
    )
    .get(filePath) as FileRow | undefined;

  return row ?? null;
}
