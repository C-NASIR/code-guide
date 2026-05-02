import {
  Node,
  SyntaxKind,
  type ArrowFunction,
  type FunctionDeclaration,
  type FunctionExpression,
  type Node as MorphNode,
  type SourceFile
} from "ts-morph";
import type { ComponentRecord } from "../types/records.js";
import { createId } from "../utils/createId.js";

function isPascalCase(name: string): boolean {
  return /^[A-Z][A-Za-z0-9]*$/.test(name);
}

function referencesReactCreateElement(node: MorphNode): boolean {
  return node.getDescendantsOfKind(SyntaxKind.CallExpression).some((callExpression) => {
    const expression = callExpression.getExpression();

    return Node.isPropertyAccessExpression(expression) && expression.getText() === "React.createElement";
  });
}

function returnsJsx(node: FunctionDeclaration | ArrowFunction | FunctionExpression): boolean {
  const body = node.getBody();

  if (!body) {
    return false;
  }

  return (
    body.getDescendantsOfKind(SyntaxKind.JsxElement).length > 0 ||
    body.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).length > 0 ||
    body.getDescendantsOfKind(SyntaxKind.JsxFragment).length > 0 ||
    referencesReactCreateElement(body)
  );
}

/**
 * Detects React component definitions using a simple Phase 1 heuristic:
 * PascalCase names that return JSX or call `React.createElement`.
 */
export function extractComponents(sourceFile: SourceFile, filePath: string): ComponentRecord[] {
  const records = new Map<string, ComponentRecord>();

  for (const declaration of sourceFile.getFunctions()) {
    const name = declaration.getName();

    if (!name || !isPascalCase(name) || !returnsJsx(declaration)) {
      continue;
    }

    const record: ComponentRecord = {
      id: createId("component", filePath, name, declaration.getStartLineNumber()),
      name,
      filePath,
      startLine: declaration.getStartLineNumber(),
      endLine: declaration.getEndLineNumber()
    };

    records.set(record.id, record);
  }

  for (const declaration of sourceFile.getVariableDeclarations()) {
    const name = declaration.getName();
    const initializer = declaration.getInitializer();

    if (!name || !isPascalCase(name) || !initializer) {
      continue;
    }

    if (!(Node.isArrowFunction(initializer) || Node.isFunctionExpression(initializer))) {
      continue;
    }

    if (!returnsJsx(initializer)) {
      continue;
    }

    const record: ComponentRecord = {
      id: createId("component", filePath, name, declaration.getStartLineNumber()),
      name,
      filePath,
      startLine: declaration.getStartLineNumber(),
      endLine: declaration.getEndLineNumber()
    };

    records.set(record.id, record);
  }

  return Array.from(records.values()).sort((left, right) => left.startLine - right.startLine);
}
