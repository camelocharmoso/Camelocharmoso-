// Recebe cada mensagem (WhatsApp ou simulador) e decide o que fazer.
import { config } from "./config.js";
import { Actions, ADMIN_SIM_ID } from "./actions.js";
import { saveMedia } from "./art.js";
import { PLANS, planOf } from "./plans.js";
import { transcribe, transcribeEnabled } from "./transcribe.js";

const digits = (s) => String(s || "").replace(/\D/g, "");
const MAX_IMAGE_BYTES = 4.5 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export function createHandler({ store, brain, channels, adminChannel }) {
  // Uma mensagem por vez para cada número, na ordem em que chegaram.
  const queues = new Map();
  const enqueue = (phone, job) => {
    const prev = queues.get(phone) || Promise.resolve();
    const next = prev.then(job, job);
    queues.set(phone, next.finally(() => { if (queues.get(phone) === next) queues.delete(phone); }));
    return next;
  };

  const isAdmin = (msg) =>
    (config.adminPhone && msg.from === config.adminPhone) || (msg.channel === "sim" && msg.from === ADMIN_SIM_ID);

  async function handle(msg) {
    if (!store.markProcessed(`${msg.channel}:${msg.id}`)) return;
    const channel = channels[msg.channel];
    msg.from = msg.from === ADMIN_SIM_ID ? ADMIN_SIM_ID : digits(msg.from);
    if (isAdmin(msg) && (msg.text || "").trim().startsWith("/")) return enqueue(msg.from, () => admin(msg, channel));
    return enqueue(msg.from, () => process(msg, channel));
  }

  async function process(msg, channel) {
    const phone = msg.from;
    const client = store.getClient(phone);
    if (!client) {
      await channel.sendText(phone, `Oi! Eu sou a Lia, a equipe de marketing com IA 👋 Este número atende só clientes. ${config.salesContact}`);
      if (store.shouldNotifyStranger(phone)) {
        const a = new Actions({ store, channel, adminChannel, phone });
        await a.notifyAdmin(`👀 Número novo falou com a Lia: ${phone}\nMensagem: ${(msg.text || `[${msg.type}]`).slice(0, 300)}\n\nPara cadastrar: /add ${phone} pro Nome do Negócio`);
      }
      return;
    }
    if (!client.active) {
      await channel.sendText(phone, "Seu plano está pausado no momento. Fala com a equipe pra reativar 🙏");
      return;
    }

    store.ensurePeriod(phone);
    channel.markRead?.(msg.id);
    const actions = new Actions({ store, channel, adminChannel, phone });

    try {
      if (msg.type === "button") return await button(actions, msg);

      let text = (msg.text || "").trim();
      let image = null;
      let label = text;

      if (msg.type === "image") {
        const media = await channel.downloadMedia(msg.mediaId);
        const mime = IMAGE_TYPES.has(media.mime) ? media.mime : "image/jpeg";
        const file = saveMedia(media.buffer, mime === "image/png" ? "png" : "jpg");
        store.addPhoto(phone, file, mime);
        if (media.buffer.length <= MAX_IMAGE_BYTES) image = { data: media.buffer.toString("base64"), mime };
        label = `[foto]${text ? " " + text : ""}`;
      } else if (msg.type === "audio") {
        if (!transcribeEnabled()) {
          store.addMessage(phone, "user", "[áudio]");
          return await actions.say("Ainda não consigo ouvir áudio por aqui 🙈 Me manda por escrito?");
        }
        const media = await channel.downloadMedia(msg.mediaId);
        text = await transcribe(media.buffer, media.mime);
        if (!text) return await actions.say("Não consegui entender o áudio 😕 Pode mandar de novo ou escrever?");
        label = `[áudio] ${text}`;
      } else if (msg.type === "video") {
        store.addMessage(phone, "user", "[vídeo]");
        await actions.callHuman("O cliente mandou um vídeo pelo WhatsApp para edição (6 créditos). Ver no celular da Lia.");
        return await actions.say("Recebi o vídeo! 🎬 A equipe edita com legenda e capa e te devolve aqui. A edição usa 6 créditos.");
      } else if (msg.type !== "text") {
        return await actions.say("Esse tipo de mensagem eu ainda não consigo abrir. Pode mandar em texto, foto ou áudio?");
      }

      // Cliente respondendo "Outro horário"
      const awaiting = store.getClient(phone).state.awaiting;
      if (awaiting?.type === "when" && msg.type !== "image") {
        store.addMessage(phone, "user", label);
        if (/^(cancela|cancelar|deixa|esquece)/i.test(text)) {
          store.patchState(phone, { awaiting: null });
          return await actions.say("Beleza, não agendei. A arte fica guardada aqui 👍");
        }
        return await actions.schedule(awaiting.group, text.slice(0, 80));
      }

      const history = store.recentMessages(phone);
      store.addMessage(phone, "user", label);
      await brain.respond({ actions, history, text, image });
    } catch (e) {
      console.error(`[lia] erro com ${phone}:`, e);
      await actions.say("Tive um probleminha aqui 😓 Já avisei a equipe. Tenta de novo em 1 minutinho?").catch(() => {});
      await actions.notifyAdmin(`⚠️ Erro atendendo ${client.business} (${phone}): ${String(e.message || e).slice(0, 300)}`);
    }
  }

  async function button(actions, msg) {
    store.addMessage(actions.phone, "user", `[botão] ${msg.text || msg.buttonId}`);
    const [kind, a, b] = String(msg.buttonId || "").split(":");
    if (kind === "pick") return actions.pick(a);
    if (kind === "redo") return actions.redo(a);
    if (kind === "when") return actions.when(a, b);
    if (kind === "buy") return actions.buy(a === "yes");
    return actions.say("Esse botão expirou. Me fala o que você precisa 🙂");
  }

  // ---------- comandos do operador ----------
  async function admin(msg, channel) {
    const reply = (t) => channel.sendText(msg.from, t);
    const [cmd, ...args] = msg.text.trim().split(/\s+/);
    const tel = digits(args[0]);
    const need = (c) => { const x = store.getClient(tel); if (!x) reply(`Não achei o cliente ${tel || "(sem número)"}.`); return x; };

    switch (cmd.toLowerCase()) {
      case "/add": {
        const plan = (args[1] || "").toLowerCase();
        const name = args.slice(2).join(" ");
        if (!tel || !PLANS[plan] || !name) return reply("Uso: /add 5581999998888 pro Nome do Negócio\nPlanos: start, pro, premium");
        const c = store.addClient(tel, name, plan);
        return reply(`✅ ${c.business} cadastrado no plano ${planOf(plan).name} com ${c.credits} créditos. Peça para o cliente mandar um "oi" para a Lia: ela começa o onboarding sozinha.`);
      }
      case "/plano": {
        const plan = (args[1] || "").toLowerCase();
        if (!PLANS[plan]) return reply("Uso: /plano 5581999998888 premium");
        if (!need()) return;
        store.setPlan(tel, plan);
        return reply(`✅ Plano trocado para ${planOf(plan).name}. Os créditos novos valem a partir do próximo mês; use /creditos para ajustar agora.`);
      }
      case "/creditos": {
        const n = parseInt(args[1], 10);
        if (!Number.isFinite(n)) return reply("Uso: /creditos 5581999998888 +10");
        if (!need()) return;
        store.grant(tel, n, "ajuste manual");
        return reply(`✅ Agora ${store.getClient(tel).business} tem ${store.getClient(tel).credits} créditos.`);
      }
      case "/pausar":
      case "/ativar": {
        if (!need()) return;
        store.setActive(tel, cmd.toLowerCase() === "/ativar");
        return reply(`✅ Cliente ${cmd.toLowerCase() === "/ativar" ? "ativado" : "pausado"}.`);
      }
      case "/clientes": {
        const list = store.listClients();
        if (!list.length) return reply("Nenhum cliente ainda. Use /add.");
        return reply(list.map((c) => `${c.active ? "🟢" : "⏸️"} ${c.business} · ${c.phone} · ${planOf(c.plan).name} · ${c.credits} créditos${c.onboarded ? "" : " · onboarding pendente"}`).join("\n"));
      }
      case "/fila": {
        const { posts, tasks } = store.pending();
        if (!posts.length && !tasks.length) return reply("Fila vazia 🎉");
        const lines = [
          ...posts.map((p) => `📌 p${p.id} · ${p.business} · ${p.when_text}`),
          ...tasks.map((t) => `🧩 t${t.id} · ${t.business} · ${t.kind}: ${t.description.slice(0, 80)}`),
        ];
        return reply(lines.join("\n") + "\n\nPara concluir: /feito p12 ou /feito t3");
      }
      case "/feito": {
        const m = /^([pt])(\d+)$/i.exec(args[0] || "");
        if (!m) return reply("Uso: /feito p12 (post) ou /feito t3 (tarefa)");
        return reply(store.finish(m[1].toLowerCase(), Number(m[2])) ? "✅ Feito." : "Não achei esse item pendente.");
      }
      case "/msg": {
        const text = args.slice(1).join(" ");
        if (!text || !need()) return text ? undefined : reply("Uso: /msg 5581999998888 sua mensagem");
        const a = new Actions({ store, channel: channels[msg.channel], adminChannel, phone: tel });
        await a.say(text);
        return reply("✅ Enviado como Lia.");
      }
      default:
        return reply([
          "Comandos da Lia:",
          "/add 5581999998888 pro Nome do Negócio",
          "/clientes",
          "/fila",
          "/feito p12 · /feito t3",
          "/creditos 5581999998888 +10",
          "/plano 5581999998888 premium",
          "/pausar 5581999998888 · /ativar 5581999998888",
          "/msg 5581999998888 texto (responde como Lia)",
        ].join("\n"));
    }
  }

  return { handle };
}
