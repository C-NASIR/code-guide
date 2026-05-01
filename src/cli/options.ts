import { resolveProjectRoot } from "../utils/pathUtils.js";

export function resolveReadProjectRoot(projectOption: string | undefined): string {
  return resolveProjectRoot(projectOption ?? process.cwd());
}
