import type { ParsedFile } from "../../types/parsedFile.js";
import { collectExpressTargets } from "./detectExpress.js";
import { extractExpressMiddleware } from "./extractExpressMiddleware.js";
import { extractExpressRoutes } from "./extractExpressRoutes.js";
import { resolveExpressMounts } from "./resolveExpressMounts.js";

/**
 * Populates the Express-specific route, middleware, and mount records for one
 * parsed file before cross-file resolution runs.
 */
export function analyzeExpress(parsedFile: ParsedFile): void {
  const targets = collectExpressTargets(parsedFile.sourceFile);
  const routeRecords = extractExpressRoutes(parsedFile.sourceFile, parsedFile.filePath, targets);
  const middlewareAnalysis = extractExpressMiddleware(parsedFile.sourceFile, parsedFile.filePath, targets);

  parsedFile.routes = routeRecords;
  parsedFile.middleware = middlewareAnalysis.middleware;
  parsedFile.expressMounts = middlewareAnalysis.mounts;
}

/**
 * Applies cross-file Express resolution after all files have been parsed so
 * mounted router paths can be joined into canonical full route paths.
 */
export function resolveParsedExpressArtifacts(parsedFiles: ParsedFile[]): void {
  resolveExpressMounts(parsedFiles);
}
