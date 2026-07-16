import { handleError, json } from "../_lib/http.js";

export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      `SELECT code, up_count AS up, down_count AS down
       FROM votes
       ORDER BY code`,
    ).all();
    const votes = Object.fromEntries(
      results.map((row) => [row.code, { up: row.up, down: row.down }]),
    );
    return json({ votes });
  } catch (error) {
    return handleError(error);
  }
}
