// Envio e recebimento pela WhatsApp Cloud API (Meta).
import fs from "node:fs";
import { config } from "../config.js";
import { mediaPath } from "../art.js";

const base = () => `https://graph.facebook.com/${config.wa.graphVersion}`;
const auth = () => ({ Authorization: `Bearer ${config.wa.token}` });

async function call(url, init) {
  const res = await fetch(url, init);
  const body = await res.text();
  if (!res.ok) throw new Error(`WhatsApp API ${res.status}: ${body.slice(0, 500)}`);
  return body ? JSON.parse(body) : {};
}

function send(to, payload) {
  return call(`${base()}/${config.wa.phoneNumberId}/messages`, {
    method: "POST",
    headers: { ...auth(), "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to, ...payload }),
  });
}

/** Quebra textos longos respeitando parágrafos (limite do WhatsApp: 4096). */
export function chunks(text, max = 3800) {
  const out = [];
  let rest = String(text).trim();
  while (rest.length > max) {
    let cut = rest.lastIndexOf("\n", max);
    if (cut < max / 2) cut = rest.lastIndexOf(" ", max);
    if (cut < max / 2) cut = max;
    out.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) out.push(rest);
  return out;
}

export const whatsapp = {
  name: "whatsapp",

  async sendText(to, text) {
    for (const part of chunks(text)) await send(to, { type: "text", text: { body: part, preview_url: false } });
  },

  /** Até 3 botões; título com no máximo 20 caracteres. */
  async sendButtons(to, body, buttons) {
    await send(to, {
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: body.slice(0, 1024) },
        action: { buttons: buttons.slice(0, 3).map((b) => ({ type: "reply", reply: { id: b.id, title: b.title.slice(0, 20) } })) },
      },
    });
  },

  async sendImage(to, file, caption = "") {
    const form = new FormData();
    form.append("messaging_product", "whatsapp");
    form.append("type", "image/png");
    form.append("file", new Blob([fs.readFileSync(mediaPath(file))], { type: "image/png" }), file);
    const up = await call(`${base()}/${config.wa.phoneNumberId}/media`, { method: "POST", headers: auth(), body: form });
    await send(to, { type: "image", image: { id: up.id, caption: caption.slice(0, 1024) } });
  },

  async downloadMedia(mediaId) {
    const meta = await call(`${base()}/${mediaId}`, { headers: auth() });
    const res = await fetch(meta.url, { headers: auth() });
    if (!res.ok) throw new Error(`download de mídia falhou: ${res.status}`);
    return { buffer: Buffer.from(await res.arrayBuffer()), mime: meta.mime_type || "application/octet-stream" };
  },

  async markRead(messageId) {
    try {
      await call(`${base()}/${config.wa.phoneNumberId}/messages`, {
        method: "POST",
        headers: { ...auth(), "Content-Type": "application/json" },
        body: JSON.stringify({ messaging_product: "whatsapp", status: "read", message_id: messageId }),
      });
    } catch { /* não é crítico */ }
  },
};

/** Converte o payload do webhook da Meta em mensagens no formato interno. */
export function parseWebhook(body) {
  const out = [];
  for (const entry of body?.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value || {};
      for (const m of value.messages || []) {
        const base = { id: m.id, from: m.from, channel: "whatsapp" };
        if (m.type === "text") out.push({ ...base, type: "text", text: m.text?.body || "" });
        else if (m.type === "image") out.push({ ...base, type: "image", mediaId: m.image?.id, text: m.image?.caption || "" });
        else if (m.type === "audio") out.push({ ...base, type: "audio", mediaId: m.audio?.id });
        else if (m.type === "video") out.push({ ...base, type: "video", mediaId: m.video?.id });
        else if (m.type === "interactive" && m.interactive?.type === "button_reply")
          out.push({ ...base, type: "button", buttonId: m.interactive.button_reply.id, text: m.interactive.button_reply.title });
        else if (m.type === "button") out.push({ ...base, type: "text", text: m.button?.text || "" });
        else out.push({ ...base, type: "unsupported", text: "" });
      }
    }
  }
  return out;
}
