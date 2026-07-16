import {
  handleError,
  HttpError,
  json,
  normalizeCode,
  readJson,
  statusValue,
  text,
} from "../_lib/http.js";

export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      `SELECT code, title, category AS cat, status, source, note,
              added_at AS addedAt
       FROM codes
       ORDER BY added_at ASC, id ASC`,
    ).all();
    return json({ data: results });
  } catch (error) {
    return handleError(error);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await readJson(request);
    const code = text(body.code, 128);
    if (!code) throw new HttpError(400, "分享码不能为空");

    const normalizedCode = normalizeCode(code);
    const item = {
      code,
      normalizedCode,
      title: text(body.title, 200),
      category: text(body.cat, 100, "流行 · 其他") || "流行 · 其他",
      status: statusValue(text(body.status, 16, "ok")),
      source: text(body.source, 500),
      note: text(body.note, 4000),
      addedAt: new Date().toISOString(),
    };

    const existing = await env.DB.prepare(
      `SELECT id FROM codes
       WHERE normalized_code = ?1
       ORDER BY added_at DESC, id DESC
       LIMIT 1`,
    )
      .bind(normalizedCode)
      .first();

    if (existing) {
      await env.DB.prepare(
        `UPDATE codes
         SET code = ?1, title = ?2, category = ?3, status = ?4,
             source = ?5, note = ?6, added_at = ?7,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?8`,
      )
        .bind(
          item.code,
          item.title,
          item.category,
          item.status,
          item.source,
          item.note,
          item.addedAt,
          existing.id,
        )
        .run();
      return json({ ok: true, updated: true, data: item });
    }

    await env.DB.prepare(
      `INSERT INTO codes
       (code, normalized_code, title, category, status, source, note, added_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`,
    )
      .bind(
        item.code,
        item.normalizedCode,
        item.title,
        item.category,
        item.status,
        item.source,
        item.note,
        item.addedAt,
      )
      .run();

    return json({ ok: true, updated: false, data: item }, 201);
  } catch (error) {
    return handleError(error);
  }
}
