const baseUrl = process.argv[2]?.replace(/\/$/, "");
if (!baseUrl) {
  throw new Error("Usage: node scripts/smoke-write.mjs https://preview.example.com");
}

const marker = Date.now().toString(36).toUpperCase();
const code = `D1TEST_${marker}`;
const name = `D1测试_${marker}`;

async function request(path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(
      `${path} returned ${response.status}: ${JSON.stringify(payload)}`,
    );
  }
  return payload;
}

const before = await fetch(`${baseUrl}/api/health`).then((response) =>
  response.json(),
);
const created = await request("/api/codes", {
  code,
  title: "D1 写入测试",
  cat: "流行 · 其他",
  status: "ok",
  source: "release-gate",
  note: marker,
});
const updated = await request("/api/codes", {
  code: code.toLowerCase(),
  title: "D1 写入更新测试",
  cat: "流行 · 其他",
  status: "ok",
  source: "release-gate",
  note: `${marker}-updated`,
});
const threadResponse = await request("/api/discuss", {
  name,
  text: `D1 讨论写入测试 ${marker}`,
});
const thread = threadResponse.data.find((item) => item.name === name);
if (!thread) throw new Error("Created discussion thread was not returned.");

const replyResponse = await request("/api/discuss", {
  name,
  text: `D1 回复写入测试 ${marker}`,
  parentId: thread.id,
});
const repliedThread = replyResponse.data.find((item) => item.id === thread.id);
if (!repliedThread?.replies.some((reply) => reply.name === name)) {
  throw new Error("Created discussion reply was not returned.");
}

const vote = await request(`/api/votes/${encodeURIComponent(code)}`, {
  up: 1,
  down: 0,
});
const after = await fetch(`${baseUrl}/api/health`).then((response) =>
  response.json(),
);

if (created.updated !== false) {
  throw new Error("First code write should have created a row.");
}
if (updated.updated !== true) {
  throw new Error("Case-insensitive second write should have updated the row.");
}
if (after.counts.codes !== before.counts.codes + 1) {
  throw new Error("Code upsert created an unexpected number of rows.");
}
if (vote.tally.up !== 1 || vote.tally.down !== 0) {
  throw new Error("Vote tally did not update correctly.");
}

console.log(
  JSON.stringify(
    {
      ok: true,
      code,
      discussionId: thread.id,
      before: before.counts,
      after: after.counts,
      vote: vote.tally,
    },
    null,
    2,
  ),
);
