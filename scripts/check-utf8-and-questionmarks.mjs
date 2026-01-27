import { readdirSync, readFileSync, statSync, existsSync } from "fs";
import { join, relative, extname, basename } from "path";

const roots = ["apps/web", "packages/shared"].filter((root) => existsSync(root));
const excludeDirs = new Set([
  ".git",
  "node_modules",
  ".next",
  ".turbo",
  "dist",
  "build",
  "out",
  "coverage",
]);

const textExtensions = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".css",
  ".scss",
  ".html",
  ".yml",
  ".yaml",
  ".txt",
  ".env",
]);

const textFilenames = new Set([".editorconfig"]);

const decoder = new TextDecoder("utf-8", { fatal: true });
const problems = [];

const isTextFile = (filePath) => {
  const ext = extname(filePath);
  if (textExtensions.has(ext)) return true;
  return textFilenames.has(basename(filePath));
};

const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (excludeDirs.has(entry.name)) continue;
      walk(fullPath);
      continue;
    }
    if (!entry.isFile()) continue;
    if (!isTextFile(fullPath)) continue;
    scanFile(fullPath);
  }
};

const scanFile = (filePath) => {
  const relPath = relative(process.cwd(), filePath);
  const buffer = readFileSync(filePath);
  let text;
  try {
    text = decoder.decode(buffer);
  } catch (error) {
    problems.push({ file: relPath, line: 0, type: "invalid-utf8" });
    return;
  }

  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (line.includes("????")) {
      problems.push({ file: relPath, line: index + 1, type: "literal-????" });
    }
    if (line.includes("\uFFFD")) {
      problems.push({ file: relPath, line: index + 1, type: "replacement-char" });
    }
  });
};

roots.forEach((root) => walk(root));

if (problems.length) {
  console.error("i18n/encoding check failed:");
  problems.forEach((problem) => {
    const lineLabel = problem.line ? `:${problem.line}` : "";
    console.error(`- ${problem.file}${lineLabel} [${problem.type}]`);
  });
  process.exitCode = 1;
} else {
  console.log("i18n/encoding check passed.");
}
