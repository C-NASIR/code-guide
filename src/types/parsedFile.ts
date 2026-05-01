import type {
  ApiCallRecord,
  ComponentRecord,
  ExportRecord,
  FunctionRecord,
  ImportRecord,
  RouteRecord,
  SymbolRecord
} from "./records.js";

export type ParsedFile = {
  filePath: string;
  imports: ImportRecord[];
  exports: ExportRecord[];
  functions: FunctionRecord[];
  components: ComponentRecord[];
  routes: RouteRecord[];
  apiCalls: ApiCallRecord[];
  symbols: SymbolRecord[];
};
