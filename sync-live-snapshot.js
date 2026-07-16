const fs = require("fs");
const path = require("path");

const repoDir = __dirname;
const recoveryDir = path.dirname(repoDir);
const livePath = path.join(recoveryDir, "final-codes.json");
const payload = JSON.parse(fs.readFileSync(livePath, "utf8"));

if (!Array.isArray(payload.data) || payload.data.length < 319) {
  throw new Error("The live production snapshot is unexpectedly incomplete.");
}

const codes = payload.data;
const snapshot = {
  backupAt: new Date().toISOString(),
  source: "https://bside-sharecode.pages.dev/api/codes",
  total: codes.length,
  uniqueCodes: new Set(
    codes.map((item) => String(item.code || "").toUpperCase()),
  ).size,
  data: codes,
};

fs.writeFileSync(
  path.join(repoDir, "codes.json"),
  `${JSON.stringify(codes, null, 2)}\n`,
  "utf8",
);
fs.writeFileSync(
  path.join(repoDir, "backup", "live_snapshot_2026-07-17.json"),
  `${JSON.stringify(snapshot, null, 2)}\n`,
  "utf8",
);

console.log(
  JSON.stringify(
    {
      total: snapshot.total,
      uniqueCodes: snapshot.uniqueCodes,
      latest: codes
        .map((item) => item.addedAt)
        .filter(Boolean)
        .sort()
        .at(-1),
    },
    null,
    2,
  ),
);
