## Phase 1: Build the codebase map

Phase 1 should not try to be a full AI agent yet.

The goal is simpler:

```text
Take a small TypeScript or React codebase and turn it into a searchable structural map.
```

By the end of Phase 1, your system should answer basic questions like:

```text
What files exist in this project?

What does each file import?

What does each file export?

Where are the React components?

Where are the Express routes?

What files seem important?
```

The AI part should be small. Most of Phase 1 is deterministic code analysis.

## Phase 1 goal

Build a local CLI tool that can index a project.

Example usage:

```bash
codeTour index ./exampleApp
codeTour files
codeTour explain src/App.tsx
codeTour symbols
```

The system should scan the repo, parse source files, extract important facts, save them in SQLite, and produce simple summaries.

## What Phase 1 includes

### 1. File scanner

The scanner walks through a project folder and finds source files.

It should include:

```text
.ts
.tsx
.js
.jsx
```

It should ignore:

```text
node_modules
dist
build
coverage
.git
.next
.vite
package lock files
images
large generated files
```

The scanner produces:

```ts
type SourceFile = {
  id: string;
  path: string;
  language: "ts" | "tsx" | "js" | "jsx";
  content: string;
  hash: string;
  size: number;
};
```

The `hash` matters because later you can avoid reindexing unchanged files.

## 2. File parser

The parser reads each source file and extracts structural facts.

For Phase 1, extract only:

```text
imports
exports
functions
React components
Express routes
basic API calls
```

Do not try to understand everything yet.

The parser produces:

```ts
type ParsedFile = {
  filePath: string;
  imports: ImportRecord[];
  exports: ExportRecord[];
  functions: FunctionRecord[];
  components: ComponentRecord[];
  routes: RouteRecord[];
  apiCalls: ApiCallRecord[];
};
```

Example records:

```ts
type ImportRecord = {
  sourceFile: string;
  importedFrom: string;
  importedNames: string[];
};

type FunctionRecord = {
  name: string;
  filePath: string;
  startLine: number;
  endLine: number;
};

type ComponentRecord = {
  name: string;
  filePath: string;
  startLine: number;
  endLine: number;
};

type RouteRecord = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  filePath: string;
  startLine: number;
  endLine: number;
};
```

## 3. SQLite storage

Use SQLite as the local project memory.

You need these tables:

```sql
CREATE TABLE files (
  id TEXT PRIMARY KEY,
  path TEXT NOT NULL,
  language TEXT NOT NULL,
  content TEXT NOT NULL,
  hash TEXT NOT NULL,
  size INTEGER NOT NULL
);
```

```sql
CREATE TABLE imports (
  id TEXT PRIMARY KEY,
  source_file TEXT NOT NULL,
  imported_from TEXT NOT NULL,
  imported_names TEXT NOT NULL
);
```

```sql
CREATE TABLE symbols (
  id TEXT PRIMARY KEY,
  file_path TEXT NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  start_line INTEGER,
  end_line INTEGER
);
```

```sql
CREATE TABLE routes (
  id TEXT PRIMARY KEY,
  file_path TEXT NOT NULL,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  start_line INTEGER,
  end_line INTEGER
);
```

```sql
CREATE TABLE file_summaries (
  id TEXT PRIMARY KEY,
  file_path TEXT NOT NULL,
  summary TEXT NOT NULL
);
```

This gives you the foundation for later retrieval.

## 4. Simple file summaries

After parsing each file, call the model to create a short summary.

The prompt should be strict.

```text
You are summarizing a source code file.

Use only the code provided.

Return JSON with:

purpose
main_exports
important_functions
external_dependencies
side_effects
```

The output shape should be:

```ts
type FileSummary = {
  purpose: string;
  mainExports: string[];
  importantFunctions: string[];
  externalDependencies: string[];
  sideEffects: string[];
};
```

Example output:

```json
{
  "purpose": "Defines the login form UI and submits credentials to the auth API.",
  "mainExports": ["LoginForm"],
  "importantFunctions": ["handleSubmit"],
  "externalDependencies": ["react", "../api/auth"],
  "sideEffects": ["Sends login request when the form is submitted"]
}
```

This is your first AI feature.

The model is not discovering the codebase. The parser discovers. The model explains.

## 5. CLI commands

Phase 1 should expose five commands.

### `index`

```bash
codeTour index ./exampleApp
```

Scans, parses, stores, and summarizes the project.

### `files`

```bash
codeTour files
```

Shows indexed files.

Example:

```text
src/App.tsx
src/components/LoginForm.tsx
src/api/auth.ts
src/server/routes/auth.ts
```

### `symbols`

```bash
codeTour symbols
```

Shows functions, components, and routes.

Example:

```text
LoginForm        component    src/components/LoginForm.tsx
handleSubmit     function     src/components/LoginForm.tsx
POST /login      route        src/server/routes/auth.ts
```

### `explain`

```bash
codeTour explain src/components/LoginForm.tsx
```

Shows the file summary and important extracted facts.

### `imports`

```bash
codeTour imports src/components/LoginForm.tsx
```

Shows what the file imports.

## 6. Folder structure

Use this structure:

```text
codeTour/
  src/
    cli/
      main.ts
      commands/
        indexCommand.ts
        filesCommand.ts
        symbolsCommand.ts
        explainCommand.ts
        importsCommand.ts

    scanner/
      scanProject.ts
      shouldIgnoreFile.ts
      hashFile.ts

    parser/
      parseSourceFile.ts
      extractImports.ts
      extractExports.ts
      extractFunctions.ts
      extractComponents.ts
      extractRoutes.ts
      extractApiCalls.ts

    storage/
      db.ts
      schema.ts
      fileRepository.ts
      symbolRepository.ts
      importRepository.ts
      routeRepository.ts
      summaryRepository.ts

    ai/
      openaiClient.ts
      summarizeFile.ts
      summarySchema.ts

    types/
      sourceFile.ts
      parsedFile.ts
      records.ts
```

## 7. Phase 1 data flow

The indexing flow should look like this:

```text
User runs index command

Scanner finds source files

Parser extracts structure from each file

Storage saves files, symbols, imports, routes, and API calls

AI creates file summaries

Storage saves summaries

CLI prints indexing report
```

Example indexing report:

```text
Indexed project: exampleApp

Files scanned: 42
Files parsed: 39
Imports found: 118
Functions found: 76
Components found: 18
Routes found: 9
Summaries created: 39
```

## 8. What not to build in Phase 1

Avoid these for now:

```text
Embeddings
Vector database
Graph visualization
Multi agent workflow
Automatic code editing
Deep call graph tracing
Authentication
Web UI
Background jobs
```

Those are later phases.

Phase 1 should be boring and solid.

## 9. Acceptance criteria

Phase 1 is complete when:

1. You can point the tool at a small TypeScript project.

2. It stores all source files in SQLite.

3. It extracts imports from each file.

4. It extracts functions and React components.

5. It detects basic Express routes.

6. It generates one summary per file.

7. You can inspect files, symbols, imports, and summaries from the CLI.

8. The system does not hallucinate file names because every file comes from the index.

## 10. The most important principle

Phase 1 is about building the map.

Not the agent.

Not the chat interface.

Not the perfect retrieval system.

Just the map.

The mental model is:

```text
Raw code becomes structured facts.
Structured facts become searchable memory.
Searchable memory later becomes code understanding.
```

Once this exists, Phase 2 can become much more interesting because the AI will have something real to reason over.
