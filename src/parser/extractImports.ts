import type { SourceFile } from "ts-morph";
import type { ImportRecord } from "../types/records.js";
import { createId } from "../utils/createId.js";

export function extractImports(sourceFile: SourceFile, filePath: string): ImportRecord[] {
  return sourceFile.getImportDeclarations().map((declaration) => {
    const importedNames: string[] = [];
    const defaultImport = declaration.getDefaultImport();
    const namespaceImport = declaration.getNamespaceImport();

    if (defaultImport) {
      importedNames.push(defaultImport.getText());
    }

    if (namespaceImport) {
      importedNames.push(`* as ${namespaceImport.getText()}`);
    }

    for (const namedImport of declaration.getNamedImports()) {
      importedNames.push(namedImport.getNameNode().getText());
    }

    return {
      id: createId("import", filePath, declaration.getStartLineNumber(), declaration.getText()),
      sourceFile: filePath,
      importedFrom: declaration.getModuleSpecifierValue(),
      importedNames,
      startLine: declaration.getStartLineNumber(),
      endLine: declaration.getEndLineNumber()
    };
  });
}
