# code-tour

`code-tour` is a local TypeScript CLI that indexes a small JavaScript or TypeScript codebase into a searchable structural snapshot.

Phase 1 focuses on building the map, not an agent. The tool scans source files, extracts structural facts with `ts-morph`, stores them in SQLite, generates one structured summary per file with the OpenAI API, and exposes read-only inspection commands.

## What it does

- Scans `.ts`, `.tsx`, `.js`, and `.jsx` files
- Ignores common build and dependency directories such as `node_modules`, `dist`, `build`, `.git`, `.next`, and `.vite`
- Extracts:
  - imports
  - exports
  - functions
  - React components
  - Express-style routes
  - basic API calls (`fetch` and `axios`)
- Stores the index in SQLite at `<project>/.code-tour/index.sqlite`
- Generates one structured summary per parsed file

## Tech stack

- TypeScript
- Node.js
- Commander
- ts-morph
- better-sqlite3
- OpenAI API
- Zod

## Requirements

- Node.js 18+
- npm
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

## Install

```bash
npm install
```

## Development

Run the CLI directly from source:

```bash
npm run dev -- --help
```

Build the compiled CLI:

```bash
npm run build
```

Run tests:

```bash
npm test
```

## Environment

Set these before running `index`:

```bash
export OPENAI_API_KEY=your_key_here
export OPENAI_MODEL=gpt-4.1-mini
```

The read-only commands do not require OpenAI credentials if the target project has already been indexed.

## Usage

Index a project:

```bash
npm run dev -- index ./path-to-project
```

Or after building:

```bash
node dist/cli/main.js index ./path-to-project
```

List indexed files:

```bash
npm run dev -- files --project ./path-to-project
```

List symbols and routes:

```bash
npm run dev -- symbols --project ./path-to-project
```

Show imports for one indexed file:

```bash
npm run dev -- imports src/components/LoginForm.tsx --project ./path-to-project
```

Explain one indexed file:

```bash
npm run dev -- explain src/components/LoginForm.tsx --project ./path-to-project
```

## Commands

### `index <projectPath>`

Scans, parses, summarizes, and writes a fresh SQLite snapshot for the target project.

Example output:

```text
Indexed project: /absolute/path/to/project

Files scanned: 42
Files parsed: 39
Imports found: 118
Exports found: 27
Functions found: 76
Components found: 18
Routes found: 9
API calls found: 14
Summaries created: 39
Skipped/failed files: 3
```

### `files [--project <path>]`

Prints all indexed file paths from the stored snapshot.

### `symbols [--project <path>]`

Prints extracted functions, components, and routes.

### `imports <filePath> [--project <path>]`

Prints the import source and imported names for one indexed file.

### `explain <filePath> [--project <path>]`

Prints:

- file metadata
- stored summary
- imports
- exports
- symbols
- routes
- API calls

## Project structure

```text
src/
  ai/
  cli/
  indexer/
  parser/
  scanner/
  storage/
  types/
  utils/

test/
  fixtures/
```

## How it works

1. The scanner finds eligible source files and reads them into memory.
2. The parser uses `ts-morph` to extract structural facts from each file.
3. The AI layer generates a structured file summary using the OpenAI Responses API.
4. The storage layer replaces the project’s SQLite snapshot in one transaction.
5. Read commands query the stored snapshot instead of rescanning the repo.

## Current scope

Phase 1 intentionally does not include:

- embeddings
- vector search
- graph visualization
- automatic code editing
- multi-agent workflows
- a web UI

## Notes

- Indexing is full refresh, not incremental.
- Malformed or unsupported files are skipped instead of failing the whole run.
- The SQLite FTS table is prepared for future search features, but not exposed yet in the CLI.
# code-guide
