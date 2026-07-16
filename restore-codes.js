const fs = require("fs");
const path = require("path");

const repoDir = __dirname;
const recoveryDir = path.dirname(repoDir);
const sourcePath = path.join(
  recoveryDir,
  "recovered-community-codes-eda2cd5a.json",
);
const payload = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

if (!Array.isArray(payload.data) || payload.data.length !== 319) {
  throw new Error("The recovered snapshot did not contain the expected 319 rows.");
}

const codes = payload.data;
const backup = {
  backupAt: new Date().toISOString(),
  source: "Cloudflare Pages deployment eda2cd5a-b88e-4c1e-89e7-4654591f7aac",
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
  path.join(repoDir, "backup", "recovery_2026-07-17.json"),
  `${JSON.stringify(backup, null, 2)}\n`,
  "utf8",
);

console.log(
  JSON.stringify(
    {
      codes: codes.length,
      uniqueCodes: backup.uniqueCodes,
      backup: "backup/recovery_2026-07-17.json",
    },
    null,
    2,
  ),
);
