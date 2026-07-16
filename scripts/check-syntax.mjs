import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const roots = ["functions", "scripts", "backup-worker/src"];
const extensions = new Set([".js", ".mjs"]);
const files = [];

function collect(directory) {
  if (!fs.existsSync(directory)) return;

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collect(fullPath);
    } else if (extensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
}

for (const root of roots) collect(root);

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    encoding: "utf8",
  });
  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    throw new Error(`Syntax check failed: ${file}`);
  }
}

console.log(JSON.stringify({ ok: true, checkedFiles: files.length }, null, 2));
