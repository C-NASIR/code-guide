import { Node, SyntaxKind, type SourceFile } from "ts-morph";
import type { RouteMethod, RouteRecord } from "../types/records.js";
import { createId } from "../utils/createId.js";

const ROUTE_METHODS = new Map<string, RouteMethod>([
  ["get", "GET"],
  ["post", "POST"],
  ["put", "PUT"],
  ["patch", "PATCH"],
  ["delete", "DELETE"]
]);

function getStringLiteralValue(node: Node | undefined): string | null {
  if (!node) {
    return null;
  }

  if (Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node)) {
    return node.getLiteralText();
  }

  return null;
}

export function extractRoutes(sourceFile: SourceFile, filePath: string): RouteRecord[] {
  const routes: RouteRecord[] = [];

  for (const callExpression of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    const expression = callExpression.getExpression();

    if (!Node.isPropertyAccessExpression(expression)) {
      continue;
    }

    const target = expression.getExpression().getText();
    const methodName = expression.getName().toLowerCase();
    const method = ROUTE_METHODS.get(methodName);

    if (!method || (target !== "app" && target !== "router")) {
      continue;
    }

    const routePath = getStringLiteralValue(callExpression.getArguments()[0]);

    if (!routePath) {
      continue;
    }

    routes.push({
      id: createId("route", filePath, method, routePath, callExpression.getStartLineNumber()),
      method,
      path: routePath,
      filePath,
      startLine: callExpression.getStartLineNumber(),
      endLine: callExpression.getEndLineNumber()
    });
  }

  return routes.sort((left, right) => left.startLine - right.startLine);
}
