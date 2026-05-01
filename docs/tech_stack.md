## Best stack for this project

Use a **TypeScript first stack**.

This project is about understanding JavaScript, TypeScript, React, Node, imports, routes, functions, and API calls. So the best stack is the same ecosystem as the codebases you want to analyze.

## The stack I would choose

### 1. Language

```text
TypeScript
```

Use TypeScript for the whole system.

Why:

TypeScript gives you strong types while staying inside the JavaScript ecosystem. That matters because your system will inspect TypeScript, React, Node, and Express projects. The official TypeScript site describes it as JavaScript with syntax for types and tooling support at scale. ([TypeScript][1])

### 2. Runtime

```text
Node.js
```

Use Node because the tool will run locally against JavaScript and TypeScript repositories.

Your first version should be a CLI, not a web app.

```bash
code-tour index ./my-app
code-tour ask "Where is authentication handled?"
code-tour ask "What happens when the user submits the login form?"
```

### 3. CLI framework

```text
Commander
```

Use Commander for command line commands.

You only need:

```text
index
ask
explain-file
trace
plan-change
```

### 4. Code parser

```text
ts-morph
```

Use `ts-morph` first.

It wraps the TypeScript compiler API and makes it easier to navigate and manipulate the TypeScript AST. That is exactly what you need for extracting imports, exports, functions, components, routes, and call sites. ([ts-morph][2])

Do not start with raw TypeScript compiler API unless you want extra pain.

Use `ts-morph` to extract:

```text
imports
exports
functions
classes
React components
function calls
JSX usage
route definitions
API client functions
```

### 5. Storage

```text
SQLite
```

Use SQLite as the local database.

You need to store:

```text
files
symbols
edges
summaries
questions
answers
```

For search, use SQLite FTS5. FTS5 is SQLite’s full text search module for efficiently searching collections of documents. ([SQLite][3])

This lets you search code without adding a separate search engine.

### 6. AI layer

```text
OpenAI API
```

Use the model for:

```text
summarizing files
explaining flows
classifying questions
producing change plans
verifying claims
```

But do not use the model for everything.

The model should explain structure. Your deterministic indexer should discover structure.

### 7. Agent layer

For V1, use your own simple tool loop.

Later, use:

```text
OpenAI Agents SDK
```

The OpenAI Agents SDK for TypeScript supports function tools, Zod powered validation, MCP tool calling, sessions, guardrails, and tracing. Those features become useful once your system has multiple tools like `searchSymbols`, `getFile`, `getNeighbors`, and `traceFlow`. ([OpenAI GitHub][4])

But I would not start there.

Start simple. Then replace your homemade loop with Agents SDK once the tool boundaries are clear.

## The best V1 stack

This is what I would actually build first:

```text
TypeScript
Node.js
Commander
ts-morph
SQLite
SQLite FTS5
OpenAI API
Zod
```

That is the cleanest stack.

## Why this is better than Python for this project

Python is great for AI systems, but this particular project is code intelligence for TypeScript and React apps.

So TypeScript wins because:

1. You are analyzing TypeScript code.
2. The AST tooling is native to the ecosystem.
3. You can reuse types between the parser, database schema, tools, and CLI.
4. You can later add a React interface without changing language ecosystems.
5. It keeps the project focused.

Python would make sense if the project were mostly retrieval, data processing, or LangGraph experimentation.

But for a codebase tour guide, TypeScript is the better first choice.

## The architecture with this stack

```text
CLI
  calls
Indexer

Indexer
  scans files
  parses AST
  extracts symbols
  extracts edges
  stores data in SQLite

SQLite
  stores files
  stores symbols
  stores graph edges
  stores summaries
  supports full text search

AI layer
  summarizes files
  answers questions
  verifies claims
  writes change plans

Tool layer
  searchSymbols
  searchFiles
  getFile
  getSymbol
  getNeighbors
  traceFlow
```

## The main packages

```json
{
  "dependencies": {
    "commander": "latest",
    "ts-morph": "latest",
    "better-sqlite3": "latest",
    "zod": "latest",
    "openai": "latest",
    "fast-glob": "latest"
  },
  "devDependencies": {
    "typescript": "latest",
    "tsx": "latest"
  }
}
```

## What each package is for

### `commander`

For the CLI.

Example:

```bash
code-tour index ./repo
code-tour ask "What happens when submit is clicked?"
```

### `fast-glob`

For finding files.

Example:

```text
src/**/*.ts
src/**/*.tsx
app/**/*.ts
app/**/*.tsx
```

### `ts-morph`

For parsing source code.

This is how you detect:

```text
imports
exports
functions
components
routes
calls
```

### `better-sqlite3`

For local storage.

Simple, fast, and easy to use.

### `zod`

For structured AI outputs.

Every model response should match a schema.

Example:

```ts
const FileSummarySchema = z.object({
  filePath: z.string(),
  purpose: z.string(),
  keyFunctions: z.array(z.string()),
  externalEffects: z.array(z.string()),
  risks: z.array(z.string()),
});
```

### `openai`

For model calls.

Use it for summaries and final answers, not for raw repo discovery.

## Suggested folder structure

```text
code-tour/
  src/
    cli/
      main.ts
      commands/
        index.ts
        ask.ts
        explain-file.ts
        trace.ts

    scanner/
      scanFiles.ts
      ignoreRules.ts

    parser/
      parseFile.ts
      extractImports.ts
      extractSymbols.ts
      extractRoutes.ts
      extractApiCalls.ts

    graph/
      buildEdges.ts
      traceFlow.ts
      getNeighbors.ts

    storage/
      db.ts
      schema.ts
      filesRepo.ts
      symbolsRepo.ts
      edgesRepo.ts
      searchRepo.ts

    ai/
      client.ts
      summarizeFile.ts
      answerQuestion.ts
      verifyAnswer.ts
      createChangePlan.ts

    tools/
      searchSymbols.ts
      searchFiles.ts
      getFile.ts
      getSymbol.ts
      traceFlowTool.ts

    types/
      codeNode.ts
      codeEdge.ts
      parsedFile.ts
```

## The important design decision

Do not start with embeddings.

Start with:

```text
AST extraction
symbol search
full text search
graph traversal
file summaries
```

Embeddings can come later.

The reason is simple: embeddings help with fuzzy meaning, but your first problem is structure.

For example, if a user asks:

```text
What happens when the login form is submitted?
```

The best evidence is not semantic similarity.

The best evidence is a structural path:

```text
LoginForm
handleSubmit
loginUser
POST /api/login
auth route
AuthService.login
session creation
```

That path comes from parsing and graph edges, not just vector search.

## Final recommendation

Build it as:

```text
TypeScript CLI
Node runtime
ts-morph parser
SQLite database
SQLite FTS5 search
OpenAI for summaries and explanations
Zod for structured outputs
```

Then later add:

```text
React UI
graph visualization
embeddings
OpenAI Agents SDK
LangGraph version for comparison
```

The principle is:

```text
Use code to build the map.
Use AI to explain the map.
Use verification to prevent guessing.
```

[1]: https://www.typescriptlang.org/?utm_source=chatgpt.com "TypeScript: JavaScript With Syntax For Types."
[2]: https://ts-morph.com/?utm_source=chatgpt.com "ts-morph - Documentation"
[3]: https://www.sqlite.org/fts5.html?utm_source=chatgpt.com "SQLite FTS5 Extension"
[4]: https://openai.github.io/openai-agents-js/?utm_source=chatgpt.com "OpenAI Agents SDK TypeScript"
