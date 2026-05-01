import type { FileSummary } from "../types/fileSummary.js";

export type SummarizeFileInput = {
  filePath: string;
  content: string;
};

export type FileSummarizer = (input: SummarizeFileInput) => Promise<FileSummary>;
