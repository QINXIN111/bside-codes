function json(body, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  return new Response(JSON.stringify(body, null, 2), { ...init, headers });
}

async function createBackup(env, requestedAt = Date.now(), trigger = "scheduled") {
  const createdAt = new Date(requestedAt).toISOString();
  const [codesResult, discussionsResult, votesResult] = await env.DB.batch([
    env.DB.prepare(
      `SELECT id, code, normalized_code, title, category, status, source, note, added_at
       FROM codes ORDER BY id ASC`,
    ),
    env.DB.prepare(
      `SELECT id, parent_id, name, text, added_at
       FROM discussion_posts ORDER BY added_at ASC, id ASC`,
    ),
    env.DB.prepare(
      `SELECT code, up_count, down_count, updated_at
       FROM votes ORDER BY code ASC`,
    ),
  ]);

  const snapshot = {
    schemaVersion: 1,
    createdAt,
    trigger,
    counts: {
      codes: codesResult.results.length,
      discussionPosts: discussionsResult.results.length,
      votes: votesResult.results.length,
    },
    tables: {
      codes: codesResult.results,
      discussion_posts: discussionsResult.results,
      votes: votesResult.results,
    },
  };
  const key = `daily/${createdAt.replaceAll(":", "-")}.json`;
  const body = JSON.stringify(snapshot, null, 2);
  const metadata = {
    createdAt,
    trigger,
    codes: String(snapshot.counts.codes),
    discussionPosts: String(snapshot.counts.discussionPosts),
    votes: String(snapshot.counts.votes),
  };

  await env.BACKUPS.put(key, body, {
    metadata,
  });
  await env.BACKUPS.put("latest.json", body, {
    metadata: { ...metadata, snapshotKey: key },
  });

  return { ok: true, key, createdAt, counts: snapshot.counts };
}

export default {
  async scheduled(controller, env, context) {
    context.waitUntil(createBackup(env, controller.scheduledTime));
  },

  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      const latest = await env.BACKUPS.getWithMetadata("latest.json", "text");
      return json({
        ok: true,
        storage: "KV",
        schedule: "daily",
        lastBackup: latest.value ? latest.metadata : null,
      });
    }

    return json({ ok: false, error: "Not found" }, { status: 404 });
  },
};
