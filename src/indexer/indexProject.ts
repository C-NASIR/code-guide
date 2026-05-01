import type { FileSummarizer } from "../ai/summarizeFile.js";
import { createParserProject, parseSourceFile } from "../parser/parseSourceFile.js";
import { scanProject } from "../scanner/scanProject.js";
import { openProjectDatabase } from "../storage/db.js";
import { replaceProjectIndex } from "../storage/projectIndexRepository.js";
import type { StoredFileSummary } from "../types/fileSummary.js";
import type { IndexingReport } from "../types/indexing.js";
import type { ParsedFile } from "../types/parsedFile.js";
import { resolveProjectRoot } from "../utils/pathUtils.js";

type IndexProjectOptions = {
  projectPath: string;
  summarizeFile: FileSummarizer;
  summaryModel: string;
};

export async function indexProject({
  projectPath,
  summarizeFile,
  summaryModel
}: IndexProjectOptions): Promise<IndexingReport> {
  const projectRoot = resolveProjectRoot(projectPath);
  const scanResult = await scanProject(projectRoot);
  const parserProject = createParserProject();
  const parsedFiles: ParsedFile[] = [];
  const summaries: StoredFileSummary[] = [];
  let skippedFiles = scanResult.skippedFiles;

  for (const file of scanResult.files) {
    const parsedFile = parseSourceFile(parserProject, file);

    if (!parsedFile) {
      skippedFiles += 1;
      continue;
    }

    parsedFiles.push(parsedFile);

    try {
      const summary = await summarizeFile({
        filePath: file.path,
        content: file.content
      });

      summaries.push({
        filePath: file.path,
        summary,
        model: summaryModel,
        createdAt: new Date().toISOString()
      });
    } catch {
      continue;
    }
  }

  const db = openProjectDatabase(projectRoot);

  try {
    replaceProjectIndex(db, scanResult.files, parsedFiles, summaries);
  } finally {
    db.close();
  }

  return {
    projectPath: projectRoot,
    filesScanned: scanResult.files.length,
    filesParsed: parsedFiles.length,
    importsFound: parsedFiles.reduce((total, file) => total + file.imports.length, 0),
    exportsFound: parsedFiles.reduce((total, file) => total + file.exports.length, 0),
    functionsFound: parsedFiles.reduce((total, file) => total + file.functions.length, 0),
    componentsFound: parsedFiles.reduce((total, file) => total + file.components.length, 0),
    routesFound: parsedFiles.reduce((total, file) => total + file.routes.length, 0),
    apiCallsFound: parsedFiles.reduce((total, file) => total + file.apiCalls.length, 0),
    summariesCreated: summaries.length,
    skippedFiles
  };
}
