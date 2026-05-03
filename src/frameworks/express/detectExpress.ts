import { Node, type SourceFile } from "ts-morph";

/**
 * Finds the local identifiers that behave as Express app or router instances
 * so downstream extraction only inspects relevant call sites.
 */
export function collectExpressTargets(sourceFile: SourceFile): Set<string> {
  const targets = new Set<string>(["app", "router"]);

  for (const declaration of sourceFile.getVariableDeclarations()) {
    const initializer = declaration.getInitializer();

    if (!initializer || !Node.isCallExpression(initializer)) {
      continue;
    }

    const expressionText = initializer.getExpression().getText();

    if (expressionText === "express" || expressionText === "Router" || expressionText.endsWith(".Router")) {
      targets.add(declaration.getName());
    }
  }

  return targets;
}
