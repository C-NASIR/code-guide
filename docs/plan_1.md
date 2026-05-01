# Phase 1 Implementation Plan

## Summary

Build Phase 1 as a greenfield TypeScript CLI at the repository root. The deliverable is a local `code-tour` tool that indexes a small TypeScript/React codebase into a single SQLite snapshot, extracts structural facts deterministically, generates one structured summary per indexed file, and exposes read-only inspection commands.

Chosen defaults:

- Implement directly in this repo root, not in a nested package.
- Use `code-tour` as the package and CLI command name.
- Store the index database at `<target-project>/.code-tour/index.sqlite`.
- Treat Phase 1 as full reindexing on each `index` run; keep file hashes for later incremental work, but do not implement incremental indexing yet.

## Key Changes

### 1. Project scaffold and runtime

- Add a root `package.json` with `type: module`, a `bin` entry for `code-tour`, and scripts for `dev`, `build`, `start`, and `test`.
- Add `tsconfig.json` using `module`/`moduleResolution: NodeNext`, `target: ES2022`, `strict: true`, and `outDir: dist`.
- Add `.gitignore` entries for `node_modules`, `dist`, `.code-tour`, and temporary test fixtures.
- Install runtime deps: `commander`, `ts-morph`, `better-sqlite3`, `zod`, `openai`, `fast-glob`.
- Install dev deps: `typescript`, `tsx`, and one test runner (`vitest`) for unit and integration coverage.

### 2. CLI contract

- Implement `code-tour index <projectPath>` to scan, parse, store, summarize, and print a final indexing report.
- Implement `code-tour files [--project <path>]` to list indexed file paths from the target project database.
- Implement `code-tour symbols [--project <path>]` to print name, kind, and file path for functions, components, and routes.
- Implement `code-tour explain <filePath> [--project <path>]` to show the file summary plus extracted imports, exports, symbols, routes, and API calls for one indexed file.
- Implement `code-tour imports <filePath> [--project <path>]` to show import source plus imported names for one indexed file.
- Resolve `--project` to the indexed project root; if omitted, default to the current working directory.
- Return clear errors when the database is missing, the file is not indexed, or the target path is not a directory.

### 3. Scanner and parsing pipeline

- Create `src/scanner`, `src/parser`, `src/storage`, `src/ai`, `src/cli`, and `src/types` as the primary source layout.
- Scanner behavior:
  - Include only `.ts`, `.tsx`, `.js`, `.jsx`.
  - Ignore `node_modules`, `dist`, `build`, `coverage`, `.git`, `.next`, `.vite`.
  - Ignore lockfiles, common binary/image extensions, and files larger than 300 KB.
  - Read content as UTF-8, store relative path from project root, file size, and SHA-256 hash.
- Parser behavior with `ts-morph`:
  - Use one `Project` per indexing run with `allowJs: true`, `skipAddingFilesFromTsConfig: true`, and JSX enabled.
  - Extract imports from ES module declarations.
  - Extract exports from named exports, default exports, and re-exports.
  - Extract functions from function declarations and named variable-assigned arrow/function expressions.
  - Classify React components as PascalCase functions or const components that return JSX or call `React.createElement`.
  - Detect Express routes from `app.METHOD(...)` and `router.METHOD(...)` with string-literal paths for `get`, `post`, `put`, `patch`, and `delete`.
  - Detect basic API calls from direct `fetch(...)` calls and `axios.<method>(...)` calls with string-literal first arguments when present.
- Skip unsupported or malformed files without failing the whole run; count them in the final report.

### 4. Storage and data model

- Use one SQLite database per indexed project at `.code-tour/index.sqlite`.
- Create tables: `metadata`, `files`, `imports`, `exports`, `symbols`, `routes`, `api_calls`, `file_summaries`.
- Keep one row per indexed file in `files`, storing relative path, language, content, hash, and size.
- Store `imports.imported_names` and `exports.exported_names` as JSON text arrays.
- Store `symbols.kind` as `function`, `component`, or `export`.
- Store summaries as JSON text plus `model`, `created_at`, and `file_path`.
- Add indexes on file path and symbol name fields used by CLI lookups.
- Add an FTS5 virtual table over file path and file content, rebuilt during each full index run to prepare for later search features.
- Wrap each `index` run in a transaction: clear content tables, insert the fresh snapshot, rebuild FTS, then commit.

### 5. AI summarization layer

- Require `OPENAI_API_KEY` and `OPENAI_MODEL` for summary generation.
- Implement a strict Zod schema for:
  - `purpose`
  - `mainExports`
  - `importantFunctions`
  - `externalDependencies`
  - `sideEffects`
- Use the current OpenAI TypeScript SDK structured-output flow with that schema; reject non-conforming responses and count them as summary failures.
- Summarize one file at a time after parsing and before commit; continue indexing if an individual summary fails.
- Keep the prompt grounded in file content only and set deterministic generation settings.

### 6. Output and reporting

- `index` should print:
  - indexed project path
  - files scanned
  - files parsed
  - imports found
  - exports found
  - functions found
  - components found
  - routes found
  - API calls found
  - summaries created
  - skipped/failed files
- `files`, `symbols`, `imports`, and `explain` should print plain text tables/lists only; no interactive UI and no rich formatting dependency.

## Test Plan

- Unit test ignore rules, extension filtering, and file-size rejection.
- Unit test hash generation and relative-path normalization.
- Unit test each extractor against fixed source snippets:
  - imports
  - exports
  - functions
  - React components
  - Express routes
  - `fetch` and `axios` API calls
- Integration test `index` on a small fixture app containing React UI, shared utilities, API client code, and Express routes.
- Integration test each read command against the fixture database output.
- Mock the AI client in tests so summary generation is deterministic and offline.
- Add one failure-path test each for malformed source files, missing database, and missing summary env vars.

## Assumptions and Acceptance

- Phase 1 remains CLI-only; no web UI, embeddings, vector DB, graph visualization, background jobs, or code-editing workflows.
- Commands operate on one indexed project at a time through that project’s local database; multi-project indexing is out of scope.
- Full reindexing is acceptable for Phase 1 performance because the target is a small repo.
- Phase 1 is complete when:
  1. `code-tour index <project>` builds a SQLite snapshot for a small TS/React codebase.
  2. All eligible source files are stored with content, hash, and metadata.
  3. Imports, exports, functions, components, routes, and basic API calls are extracted.
  4. One structured summary is stored for each successfully summarized indexed file.
  5. `files`, `symbols`, `imports`, and `explain` return data only from the stored index, never by rescanning the repo.
