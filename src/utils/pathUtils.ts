import path from "node:path";

export function normalizeProjectPath(filePath: string): string {
  return filePath.split(path.sep).join(path.posix.sep);
}

export function resolveProjectRoot(projectPath: string): string {
  return path.resolve(projectPath);
}

export function toRelativeProjectPath(projectRoot: string, absolutePath: string): string {
  return normalizeProjectPath(path.relative(projectRoot, absolutePath));
}
