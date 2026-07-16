import { listDiscussions } from "../_lib/discussions.js";
import {
  handleError,
  HttpError,
  json,
  newId,
  readJson,
  text,
} from "../_lib/http.js";

export async function onRequestGet({ env }) {
  try {
    return json({ data: await listDiscussions(env.DB) });
  } catch (error) {
    return handleError(error);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await readJson(request);
    const message = text(body.text, 500);
    if (!message) throw new HttpError(400, "内容不能为空");

    const parentId = text(body.parentId, 80) || null;
    if (parentId) {
      const parent = await env.DB.prepare(
        `SELECT id FROM discussion_posts
         WHERE id = ?1 AND parent_id IS NULL`,
      )
        .bind(parentId)
        .first();
      if (!parent) throw new HttpError(404, "要回复的讨论不存在");
    }

    const id = newId(parentId ? "r" : "d");
    const name = text(body.name, 24) || "匿名玩家";
    const addedAt = new Date().toISOString();

    await env.DB.prepare(
      `INSERT INTO discussion_posts
       (id, parent_id, name, text, added_at)
       VALUES (?1, ?2, ?3, ?4, ?5)`,
    )
      .bind(id, parentId, name, message, addedAt)
      .run();

    return json({
      ok: true,
      data: await listDiscussions(env.DB),
    });
  } catch (error) {
    return handleError(error);
  }
}
