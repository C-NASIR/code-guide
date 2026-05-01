export type ImportRecord = {
  id: string;
  sourceFile: string;
  importedFrom: string;
  importedNames: string[];
  startLine: number;
  endLine: number;
};

export type ExportKind = "named" | "default" | "reexport";

export type ExportRecord = {
  id: string;
  filePath: string;
  exportedNames: string[];
  exportKind: ExportKind;
  startLine: number;
  endLine: number;
};

export type FunctionRecord = {
  id: string;
  name: string;
  filePath: string;
  startLine: number;
  endLine: number;
};

export type ComponentRecord = {
  id: string;
  name: string;
  filePath: string;
  startLine: number;
  endLine: number;
};

export type SymbolKind = "function" | "component" | "export";

export type SymbolRecord = {
  id: string;
  filePath: string;
  name: string;
  kind: SymbolKind;
  startLine: number | null;
  endLine: number | null;
};

export type RouteMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type RouteRecord = {
  id: string;
  method: RouteMethod;
  path: string;
  filePath: string;
  startLine: number;
  endLine: number;
};

export type ApiCallClient = "fetch" | "axios";

export type ApiCallRecord = {
  id: string;
  client: ApiCallClient;
  method: string | null;
  url: string | null;
  filePath: string;
  startLine: number;
  endLine: number;
};
