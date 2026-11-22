// Transcrição de áudio por qualquer serviço compatível com /v1/audio/transcriptions.
import { config } from "./config.js";

export const transcribeEnabled = () => Boolean(config.transcribe.url && config.transcribe.key);

export async function transcribe(buffer, mime = "audio/ogg") {
  const form = new FormData();
  const ext = mime.includes("mpeg") ? "mp3" : mime.includes("mp4") ? "m4a" : "ogg";
  form.append("file", new Blob([buffer], { type: mime }), `audio.${ext}`);
  form.append("model", config.transcribe.model);
  form.append("language", "pt");
  const res = await fetch(config.transcribe.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.transcribe.key}` },
    body: form,
  });
  if (!res.ok) throw new Error(`transcrição falhou: ${res.status} ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return String(data.text || "").trim();
}
