import { json } from "../_lib/http.js";

export async function onRequestPost() {
  return json(
    {
      ok: false,
      error: "音频转 MIDI 服务尚未接入云端，请使用页面提供的在线工具。",
    },
    501,
  );
}
