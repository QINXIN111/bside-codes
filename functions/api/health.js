import { handleError, json } from "../_lib/http.js";

export async function onRequestGet({ env }) {
  try {
    const [codes, discussions, votes] = await env.DB.batch([
      env.DB.prepare("SELECT COUNT(*) AS count FROM codes"),
      env.DB.prepare("SELECT COUNT(*) AS count FROM discussion_posts"),
      env.DB.prepare("SELECT COUNT(*) AS count FROM votes"),
    ]);
    const codeCount = codes.results[0].count;
    const healthy = codeCount >= 300;

    return json(
      {
        ok: healthy,
        database: "D1",
        counts: {
          codes: codeCount,
          discussionPosts: discussions.results[0].count,
          votes: votes.results[0].count,
        },
        minimumCodeCount: 300,
      },
      healthy ? 200 : 503,
    );
  } catch (error) {
    return handleError(error);
  }
}
