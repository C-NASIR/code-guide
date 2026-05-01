import crypto from "node:crypto";

export function hashFile(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}
