const baseUrl = process.argv[2]?.replace(/\/$/, "");
if (!baseUrl) {
  throw new Error("Usage: npm run test:smoke -- https://preview.example.com");
}

async function get(path) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { accept: "application/json" },
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}: ${JSON.stringify(body)}`);
  }
  return body;
}

const health = await get("/api/health");
const codes = await get("/api/codes");
const discussions = await get("/api/discuss");
const votes = await get("/api/votes");

if (health.counts.codes < 322 || codes.data.length < 322) {
  throw new Error("Preview code count is below the recovered baseline.");
}
if (discussions.data.length < 10) {
  throw new Error("Preview discussion count is below the recovered baseline.");
}
if (!votes.votes || typeof votes.votes !== "object") {
  throw new Error("Votes API returned an invalid response.");
}

console.log(
  JSON.stringify(
    {
      ok: true,
      health,
      codes: codes.data.length,
      threads: discussions.data.length,
      voteCodes: Object.keys(votes.votes).length,
    },
    null,
    2,
  ),
);
