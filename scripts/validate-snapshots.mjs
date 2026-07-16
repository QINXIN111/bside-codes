import fs from "node:fs";

const codes = JSON.parse(
  fs.readFileSync("data/codes-production-2026-07-17.json", "utf8"),
).data;
const repositoryCodes = JSON.parse(fs.readFileSync("codes.json", "utf8"));
const discussions = JSON.parse(
  fs.readFileSync("data/discuss-production-2026-07-17.json", "utf8"),
).data;
const uniqueCodes = new Set(
  codes.map((item) => String(item.code).toUpperCase()),
);
const replies = discussions.reduce(
  (total, thread) => total + (thread.replies || []).length,
  0,
);

if (codes.length < 322) throw new Error(`Expected at least 322 codes, got ${codes.length}`);
if (uniqueCodes.size !== codes.length - 1) {
  throw new Error(
    `Expected one preserved case-only duplicate, got ${codes.length - uniqueCodes.size}.`,
  );
}
if (JSON.stringify(codes) !== JSON.stringify(repositoryCodes)) {
  throw new Error("codes.json does not match the verified D1 seed snapshot.");
}
if (discussions.length !== 10 || replies !== 7) {
  throw new Error(
    `Expected 10 threads and 7 replies, got ${discussions.length}/${replies}`,
  );
}

console.log(
  JSON.stringify(
    {
      codes: codes.length,
      uniqueCodes: uniqueCodes.size,
      threads: discussions.length,
      replies,
    },
    null,
    2,
  ),
);
