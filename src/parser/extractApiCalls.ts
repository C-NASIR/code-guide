import { Node, SyntaxKind, type ObjectLiteralExpression, type SourceFile } from "ts-morph";
import type { ApiCallRecord } from "../types/records.js";
import { createId } from "../utils/createId.js";

function getStringArgumentValue(node: Node | undefined): string | null {
  if (!node) {
    return null;
  }

  if (Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node)) {
    return node.getLiteralText();
  }

  return null;
}

function getFetchMethod(optionsNode: Node | undefined): string | null {
  if (!optionsNode || !Node.isObjectLiteralExpression(optionsNode)) {
    return null;
  }

  return getMethodFromOptions(optionsNode);
}

function getMethodFromOptions(optionsNode: ObjectLiteralExpression): string | null {
  const property = optionsNode.getProperty("method");

  if (!property || !Node.isPropertyAssignment(property)) {
    return null;
  }

  const initializer = property.getInitializer();
  const value = getStringArgumentValue(initializer);

  return value ? value.toUpperCase() : null;
}

/**
 * Extracts basic outbound API calls from direct `fetch(...)` and
 * `axios.<method>(...)` expressions.
 */
export function extractApiCalls(sourceFile: SourceFile, filePath: string): ApiCallRecord[] {
  const apiCalls: ApiCallRecord[] = [];

  for (const callExpression of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    const expression = callExpression.getExpression();

    if (Node.isIdentifier(expression) && expression.getText() === "fetch") {
      apiCalls.push({
        id: createId("api-call", filePath, "fetch", callExpression.getStartLineNumber()),
        client: "fetch",
        method: getFetchMethod(callExpression.getArguments()[1]),
        url: getStringArgumentValue(callExpression.getArguments()[0]),
        filePath,
        startLine: callExpression.getStartLineNumber(),
        endLine: callExpression.getEndLineNumber()
      });
    }

    if (Node.isPropertyAccessExpression(expression) && expression.getExpression().getText() === "axios") {
      apiCalls.push({
        id: createId("api-call", filePath, expression.getName(), callExpression.getStartLineNumber()),
        client: "axios",
        method: expression.getName().toUpperCase(),
        url: getStringArgumentValue(callExpression.getArguments()[0]),
        filePath,
        startLine: callExpression.getStartLineNumber(),
        endLine: callExpression.getEndLineNumber()
      });
    }
  }

  return apiCalls.sort((left, right) => left.startLine - right.startLine);
}
