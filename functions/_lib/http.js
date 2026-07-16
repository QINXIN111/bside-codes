export function json(payload, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extraHeaders,
    },
  });
}

export async function readJson(request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new HttpError(415, "请求必须使用 application/json");
  }

  try {
    return await request.json();
  } catch {
    throw new HttpError(400, "JSON 格式无效");
  }
}

export function text(value, maxLength, fallback = "") {
  const output = String(value ?? fallback).trim();
  return output.slice(0, maxLength);
}

export function statusValue(value) {
  return ["ok", "bad", "unk"].includes(value) ? value : "ok";
}

export function normalizeCode(value) {
  return text(value, 128).toUpperCase();
}

export function newId(prefix) {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomUUID().replaceAll("-", "").slice(0, 8);
  return `${prefix}_${timestamp}${random}`;
}

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function handleError(error) {
  if (error instanceof HttpError) {
    return json({ ok: false, error: error.message }, error.status);
  }

  console.error(error);
  return json({ ok: false, error: "服务器暂时不可用" }, 500);
}
