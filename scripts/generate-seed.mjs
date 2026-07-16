import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const codesPayload = JSON.parse(
  fs.readFileSync(
    path.join(root, "data", "codes-production-2026-07-17.json"),
    "utf8",
  ),
);
const discussionPayload = JSON.parse(
  fs.readFileSync(
    path.join(root, "data", "discuss-production-2026-07-17.json"),
    "utf8",
  ),
);
const codes = codesPayload.data;
const threads = discussionPayload.data;

if (codes.length < 320) {
  throw new Error(`Refusing to seed only ${codes.length} codes.`);
}

function sql(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value)
    .replace(/[ \t]+(?=\r?\n|$)/g, "")
    .replaceAll("'", "''")}'`;
}

const lines = [
  "-- Generated from the verified production snapshots.",
  "-- Do not edit manually; run npm run generate:seed.",
  "",
];

for (const item of codes) {
  lines.push(
    `INSERT INTO codes ` +
      `(code, normalized_code, title, category, status, source, note, added_at) VALUES (` +
      [
        sql(item.code),
        sql(String(item.code).toUpperCase()),
        sql(item.title || ""),
        sql(item.cat || "流行 · 其他"),
        sql(item.status || "ok"),
        sql(item.source || ""),
        sql(item.note || ""),
        sql(item.addedAt),
      ].join(", ") +
      ");",
  );
}

for (const thread of threads) {
  lines.push(
    `INSERT INTO discussion_posts (id, parent_id, name, text, added_at) VALUES (` +
      [
        sql(thread.id),
        "NULL",
        sql(thread.name || "匿名玩家"),
        sql(thread.text),
        sql(thread.addedAt),
      ].join(", ") +
      ");",
  );
  for (const reply of thread.replies || []) {
    lines.push(
      `INSERT INTO discussion_posts (id, parent_id, name, text, added_at) VALUES (` +
        [
          sql(reply.id),
          sql(thread.id),
          sql(reply.name || "匿名玩家"),
          sql(reply.text),
          sql(reply.addedAt),
        ].join(", ") +
        ");",
    );
  }
}

fs.writeFileSync(
  path.join(root, "migrations", "0002_seed.sql"),
  `${lines.join("\n")}\n`,
  "utf8",
);

console.log(
  JSON.stringify(
    {
      codes: codes.length,
      threads: threads.length,
      replies: threads.reduce(
        (total, thread) => total + (thread.replies || []).length,
        0,
      ),
    },
    null,
    2,
  ),
);
