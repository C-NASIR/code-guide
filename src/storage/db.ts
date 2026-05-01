import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { SCHEMA_STATEMENTS } from "./schema.js";

export type ProjectDatabase = Database.Database;

export function getDatabasePath(projectRoot: string): string {
  return path.join(projectRoot, ".code-tour", "index.sqlite");
}

function initializeDatabase(db: ProjectDatabase): void {
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  for (const statement of SCHEMA_STATEMENTS) {
    db.exec(statement);
  }
}

export function openProjectDatabase(projectRoot: string): ProjectDatabase {
  const databasePath = getDatabasePath(projectRoot);
  fs.mkdirSync(path.dirname(databasePath), {
    recursive: true
  });

  const db = new Database(databasePath);
  initializeDatabase(db);
  return db;
}

export function openIndexedProjectDatabase(projectRoot: string): ProjectDatabase {
  const databasePath = getDatabasePath(projectRoot);

  if (!fs.existsSync(databasePath)) {
    throw new Error(`No index database found for project: ${projectRoot}`);
  }

  const db = new Database(databasePath);
  initializeDatabase(db);
  return db;
}
