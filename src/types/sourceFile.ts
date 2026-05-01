export type SourceLanguage = "ts" | "tsx" | "js" | "jsx";

export type SourceFileRecord = {
  id: string;
  path: string;
  absolutePath: string;
  language: SourceLanguage;
  content: string;
  hash: string;
  size: number;
};

export type ScanProjectResult = {
  files: SourceFileRecord[];
  skippedFiles: number;
};
