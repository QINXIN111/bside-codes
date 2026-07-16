import {
  handleError,
  HttpError,
  json,
  readJson,
  text,
} from "../../_lib/http.js";

function delta(value) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < -1 || number > 1) {
    throw new HttpError(400, "投票增量必须是 -1、0 或 1");
  }
  return number;
}

export async function onRequestPost({ request, env, params }) {
  try {
    const code = text(decodeURIComponent(params.code || ""), 128);
    if (!code) throw new HttpError(400, "分享码不能为空");

    const body = await readJson(request);
    const up = delta(body.up ?? 0);
    const down = delta(body.down ?? 0);

    await env.DB.prepare(
      `INSERT INTO votes (code, up_count, down_count, updated_at)
       VALUES (?1, MAX(0, ?2), MAX(0, ?3), CURRENT_TIMESTAMP)
       ON CONFLICT(code) DO UPDATE SET
         up_count = MAX(0, votes.up_count + ?2),
         down_count = MAX(0, votes.down_count + ?3),
         updated_at = CURRENT_TIMESTAMP`,
    )
      .bind(code, up, down)
      .run();

    const tally = await env.DB.prepare(
      `SELECT up_count AS up, down_count AS down
       FROM votes WHERE code = ?1`,
    )
      .bind(code)
      .first();

    return json({ ok: true, tally: tally || { up: 0, down: 0 } });
  } catch (error) {
    return handleError(error);
  }
}
