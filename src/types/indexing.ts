export type IndexingReport = {
  projectPath: string;
  filesScanned: number;
  filesParsed: number;
  importsFound: number;
  exportsFound: number;
  functionsFound: number;
  componentsFound: number;
  routesFound: number;
  apiCallsFound: number;
  summariesCreated: number;
  skippedFiles: number;
};
