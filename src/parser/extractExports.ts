import { Node, type SourceFile } from "ts-morph";
import type { ExportKind, ExportRecord } from "../types/records.js";
import { createId } from "../utils/createId.js";

function createExportRecord(
  filePath: string,
  exportedNames: string[],
  exportKind: ExportKind,
  startLine: number,
  endLine: number
): ExportRecord {
  return {
    id: createId("export", filePath, exportKind, startLine, exportedNames.join(",")),
    filePath,
    exportedNames,
    exportKind,
    startLine,
    endLine
  };
}

/**
 * Extracts named exports, default exports, and re-exports from a source file
 * into a single normalized record shape.
 */
export function extractExports(sourceFile: SourceFile, filePath: string): ExportRecord[] {
  const records = new Map<string, ExportRecord>();

  for (const [name, declarations] of sourceFile.getExportedDeclarations()) {
    const declaration = declarations[0];
    const startLine = declaration?.getStartLineNumber() ?? 1;
    const endLine = declaration?.getEndLineNumber() ?? startLine;
    const exportKind: ExportKind = name === "default" ? "default" : "named";
    const record = createExportRecord(filePath, [name], exportKind, startLine, endLine);

    records.set(record.id, record);
  }

  for (const declaration of sourceFile.getExportDeclarations()) {
    const namedExports = declaration.getNamedExports().map((namedExport) => namedExport.getNameNode().getText());

    if (namedExports.length > 0) {
      const record = createExportRecord(
        filePath,
        namedExports,
        "reexport",
        declaration.getStartLineNumber(),
        declaration.getEndLineNumber()
      );

      records.set(record.id, record);
    }

    const namespaceExport = declaration.getNamespaceExport();

    if (namespaceExport || declaration.isNamespaceExport()) {
      const record = createExportRecord(
        filePath,
        [namespaceExport?.getText() ?? "*"],
        "reexport",
        declaration.getStartLineNumber(),
        declaration.getEndLineNumber()
      );

      records.set(record.id, record);
    }
  }

  for (const statement of sourceFile.getStatements()) {
    if (Node.isExportAssignment(statement)) {
      const record = createExportRecord(
        filePath,
        ["default"],
        "default",
        statement.getStartLineNumber(),
        statement.getEndLineNumber()
      );

      records.set(record.id, record);
    }
  }

  return Array.from(records.values()).sort((left, right) => left.startLine - right.startLine);
}
