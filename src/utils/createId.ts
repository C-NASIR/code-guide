import crypto from "node:crypto";

export function createId(...parts: Array<string | number | null | undefined>): string {
  const normalized = parts
    .filter((part) => part !== null && part !== undefined)
    .map((part) => String(part))
    .join("|");

  return crypto.createHash("sha256").update(normalized).digest("hex");
}
