// Canal de teste: guarda o que a Lia "enviaria" para mostrar no simulador web (/sim).
let seq = 0;
const outbox = [];
const inboundMedia = new Map();

export const sim = {
  name: "sim",
  async sendText(to, text) { outbox.push({ id: ++seq, to, type: "text", text }); },
  async sendButtons(to, body, buttons) { outbox.push({ id: ++seq, to, type: "buttons", text: body, buttons: buttons.slice(0, 3) }); },
  async sendImage(to, file, caption = "") { outbox.push({ id: ++seq, to, type: "image", file, text: caption }); },
  async downloadMedia(mediaId) {
    const m = inboundMedia.get(mediaId);
    if (!m) throw new Error("mídia não encontrada");
    return m;
  },
  async markRead() {},

  // usados pelo simulador
  storeMedia(buffer, mime) {
    const id = "sim-" + ++seq;
    inboundMedia.set(id, { buffer, mime });
    return id;
  },
  read(to, after = 0) { return outbox.filter((m) => m.to === to && m.id > after); },
  all(after = 0) { return outbox.filter((m) => m.id > after); },
  reset() { outbox.length = 0; },
};
