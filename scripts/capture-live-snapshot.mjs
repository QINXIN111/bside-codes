import fs from "node:fs";

const baseUrl = (process.argv[2] || "https://bside-sharecode.pages.dev").replace(
  /\/$/,
  "",
);

async function get(path) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { accept: "application/json" },
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}.`);
  }
  return payload;
}

const [codes, discussions] = await Promise.all([
  get("/api/codes"),
  get("/api/discuss"),
]);
const replies = discussions.data.reduce(
  (total, thread) => total + (thread.replies || []).length,
  0,
);

if (codes.data.length < 322) {
  throw new Error(`Refusing to capture only ${codes.data.length} codes.`);
}
if (discussions.data.length < 10 || replies < 7) {
  throw new Error(
    `Refusing to capture only ${discussions.data.length} threads and ${replies} replies.`,
  );
}

fs.writeFileSync("codes.json", `${JSON.stringify(codes.data, null, 2)}\n`, "utf8");
fs.writeFileSync(
  "data/codes-production-2026-07-17.json",
  `${JSON.stringify(codes)}\n`,
  "utf8",
);
fs.writeFileSync(
  "data/discuss-production-2026-07-17.json",
  `${JSON.stringify(discussions)}\n`,
  "utf8",
);

console.log(
  JSON.stringify(
    {
      source: baseUrl,
      codes: codes.data.length,
      threads: discussions.data.length,
      replies,
    },
    null,
    2,
  ),
);
