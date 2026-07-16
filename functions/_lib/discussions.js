export async function listDiscussions(db) {
  const { results } = await db
    .prepare(
      `SELECT id, parent_id AS parentId, name, text, added_at AS addedAt
       FROM discussion_posts
       ORDER BY added_at ASC, id ASC`,
    )
    .all();

  const threads = [];
  const byId = new Map();

  for (const row of results) {
    if (!row.parentId) {
      const thread = {
        id: row.id,
        name: row.name,
        text: row.text,
        addedAt: row.addedAt,
        replies: [],
      };
      threads.push(thread);
      byId.set(row.id, thread);
    }
  }

  for (const row of results) {
    if (!row.parentId) continue;
    const parent = byId.get(row.parentId);
    if (!parent) continue;
    parent.replies.push({
      id: row.id,
      name: row.name,
      text: row.text,
      addedAt: row.addedAt,
    });
  }

  return threads.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
}
