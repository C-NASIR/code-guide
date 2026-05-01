import { describe, expect, it } from "vitest";
import { createParserProject, parseSourceFile } from "../src/parser/parseSourceFile.js";
import { hashFile } from "../src/scanner/hashFile.js";
import type { SourceFileRecord } from "../src/types/sourceFile.js";

function createSourceFileRecord(filePath: string, content: string): SourceFileRecord {
  return {
    id: filePath,
    path: filePath,
    absolutePath: filePath,
    language: filePath.endsWith(".tsx") ? "tsx" : "ts",
    content,
    hash: hashFile(content),
    size: Buffer.byteLength(content, "utf8")
  };
}

describe("parser", () => {
  it("extracts imports, exports, functions, components, routes, and api calls", () => {
    const content = `
      import axios from "axios";
      import { Router } from "express";

      export const helper = () => 42;

      export function LoginForm() {
        const handleSubmit = async () => {
          await axios.post("/api/login");
          await fetch("/api/session", { method: "POST" });
        };

        return <button onClick={handleSubmit}>Submit</button>;
      }

      const router = Router();
      router.post("/login", () => {});
    `;
    const project = createParserProject();
    const parsedFile = parseSourceFile(project, createSourceFileRecord("src/example.tsx", content));

    expect(parsedFile).not.toBeNull();
    expect(parsedFile?.imports).toHaveLength(2);
    expect(parsedFile?.exports.some((record) => record.exportedNames.includes("helper"))).toBe(true);
    expect(parsedFile?.functions.map((record) => record.name)).toContain("helper");
    expect(parsedFile?.components.map((record) => record.name)).toContain("LoginForm");
    expect(parsedFile?.routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          method: "POST",
          path: "/login"
        })
      ])
    );
    expect(parsedFile?.apiCalls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          client: "axios",
          method: "POST",
          url: "/api/login"
        }),
        expect.objectContaining({
          client: "fetch",
          method: "POST",
          url: "/api/session"
        })
      ])
    );
  });

  it("skips malformed files", () => {
    const project = createParserProject();
    const parsedFile = parseSourceFile(project, createSourceFileRecord("src/broken.ts", "export const broken = ("));

    expect(parsedFile).toBeNull();
  });
});
