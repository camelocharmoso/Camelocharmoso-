// Recebe cada mensagem (WhatsApp ou simulador) e decide o que fazer.
import { config } from "./config.js";
import { Actions, ADMIN_SIM_ID } from "./actions.js";
import { saveMedia } from "./art.js";
import { PLANS, planOf } from "./plans.js";
import { transcribe, transcribeEnabled } from "./transcribe.js";
import { RateLimiter, sniffImage } from "./security.js";
import { cutoutEnabled, removeBackground } from "./cutout.js";
import { Sales } from "./sales.js";

const digits = (s) => String(s || "").replace(/\D/g, "");
const MIN = 60_000;

export function createHandler({ store, brain, channels, adminChannel, limiter = new RateLimiter() }) {
  const L = config.limits;
  // Uma mensagem por vez para cada número, na ordem em que chegaram.
  const queues = new Map();
  const enqueue = (phone, job) => {
    const prev = queues.get(phone) || Promise.resolve();
    const next = prev.then(job, job);
    queues.set(phone, next.finally(() => { if (queues.get(phone) === next) queues.delete(phone); }));
    return next;
  };

  // Operador: no WhatsApp, só o ADMIN_PHONE (a Meta garante o remetente, e o webhook confere a assinatura).
  const isAdmin = (msg) =>
    (msg.channel === "whatsapp" && config.adminPhone && msg.from === config.adminPhone) || (msg.channel === "sim" && msg.from === ADMIN_SIM_ID);

  async function handle(msg) {
    if (!msg.id || !store.markProcessed(`${msg.channel}:${msg.id}`)) return;
    // Ignora mensagens antigas reenviadas (proteção contra repetição).
    if (msg.timestamp && Date.now() / 1000 - msg.timestamp > L.maxMessageAgeSec) return;
    const channel = channels[msg.channel];
    msg.from = msg.from === ADMIN_SIM_ID ? ADMIN_SIM_ID : digits(msg.from);
    if (isAdmin(msg) && (msg.text || "").trim().startsWith("/")) return enqueue(msg.from, () => admin(msg, channel));
    return enqueue(msg.from, () => process(msg, channel));
  }

  async function process(msg, channel) {
    const phone = msg.from;
    const client = store.getClient(phone);
    if (!client) return sell(msg, channel);
    if (!client.active) {
      await channel.sendText(phone, "Seu plano está pausado no momento. Fala com a equipe pra reativar 🙏");
      return;
    }

    store.ensurePeriod(phone);
    channel.markRead?.(msg.id);
    const actions = new Actions({ store, channel, adminChannel, phone, limiter });

    // Limite de mensagens: protege contra spam e contra conta invadida queimando créditos de IA.
    const recent = limiter.hit(`msg:${phone}`, 10 * MIN);
    if (recent > L.messagesPer10Min) {
      if (recent === L.messagesPer10Min + 1) {
        await actions.say("Opa, chegou muita mensagem de uma vez 😅 Me dá uns minutinhos e manda de novo?");
        await actions.notifyAdmin(`⚠️ ${client.business} (${phone}) passou de ${L.messagesPer10Min} mensagens em 10 minutos. Pausei as respostas por alguns minutos.`);
      }
      return;
    }

    try {
      if (msg.type === "button") return await button(actions, msg);

      let text = (msg.text || "").trim().slice(0, L.maxTextChars);
      let image = null;
      let label = text;

      if (msg.type === "image") {
        const media = await channel.downloadMedia(msg.mediaId);
        // O tipo vem dos bytes do arquivo, não do que foi declarado.
        const mime = sniffImage(media.buffer);
        if (!mime || media.buffer.length > L.maxImageBytes) {
          return await actions.say("Não consegui abrir essa imagem 😕 Manda como foto (JPG ou PNG), de até 5 MB?");
        }
        const file = saveMedia(media.buffer, { "image/png": "png", "image/webp": "webp" }[mime] || "jpg");
        const photoId = store.addPhoto(phone, file, mime);
        image = { data: media.buffer.toString("base64"), mime };
        // Recorta o fundo uma vez só, para as artes com o produto "solto" na frente do título.
        if (cutoutEnabled()) {
          try { store.setCutout(photoId, saveMedia(await removeBackground(media.buffer, mime), "png")); }
          catch (e) { console.error("[lia] recorte de fundo falhou:", e.message); }
        }
        label = `[foto]${text ? " " + text : ""}`;
      } else if (msg.type === "audio") {
        if (!transcribeEnabled()) {
          store.addMessage(phone, "user", "[áudio]");
          return await actions.say("Ainda não consigo ouvir áudio por aqui 🙈 Me manda por escrito?");
        }
        const media = await channel.downloadMedia(msg.mediaId);
        if (media.buffer.length > 16 * 1024 * 1024) return await actions.say("Esse áudio ficou muito longo 😅 Manda um mais curto?");
        text = (await transcribe(media.buffer, media.mime)).slice(0, L.maxTextChars);
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

      const turns = limiter.hit(`ai:${phone}`, 24 * 60 * MIN);
      if (turns > L.aiTurnsPerDay) {
        if (turns === L.aiTurnsPerDay + 1) {
          await actions.say("Hoje a gente já conversou bastante 😄 Amanhã cedo eu volto com tudo. Se for urgente, me fala que eu chamo alguém da equipe.");
          await actions.notifyAdmin(`⚠️ ${client.business} (${phone}) chegou ao limite diário de ${L.aiTurnsPerDay} conversas com a IA.`);
        }
        return;
      }

      const history = store.recentMessages(phone);
      store.addMessage(phone, "user", label);
      await brain.respond({ actions, history, text, image });
    } catch (e) {
      console.error(`[lia] erro com ${phone}:`, e.message);
      await actions.say("Tive um probleminha aqui 😓 Já avisei a equipe. Tenta de novo em 1 minutinho?").catch(() => {});
      await actions.notifyAdmin(`⚠️ Erro atendendo ${client.business} (${phone}): ${String(e.message || e).slice(0, 300)}`);
    }
  }

  /** Quem ainda não é cliente: a Lia vendedora. */
  async function sell(msg, channel) {
    const phone = msg.from;
    const actions = new Actions({ store, channel, adminChannel, phone, limiter });
    if (!config.sales) {
      if (store.shouldNotifyStranger(phone)) await channel.sendText(phone, `Oi! Eu sou a Lia, a equipe de marketing com IA 👋 Este número atende só clientes. ${config.salesContact}`);
      return;
    }
    // Limites: por número e no total do dia (spam não pode virar conta alta de IA).
    const mine = limiter.hit(`lead:${phone}`, 24 * 60 * MIN);
    const total = limiter.hit("lead:total", 24 * 60 * MIN);
    if (mine > L.leadTurnsPerDay || total > L.leadTurnsTotalPerDay) {
      if (mine === L.leadTurnsPerDay + 1 || total === L.leadTurnsTotalPerDay + 1) {
        await actions.say("Hoje a conversa rendeu! 😄 Amanhã eu continuo com você. Se quiser falar com alguém da equipe agora, é só pedir.");
        await actions.notifyAdmin(`⚠️ Limite de conversas de venda atingido (${mine > L.leadTurnsPerDay ? `número ${phone}` : "total do dia"}).`);
      }
      return;
    }
    const isNew = !store.getLead(phone);
    const sales = new Sales({ actions });
    channel.markRead?.(msg.id);
    try {
      if (isNew) await actions.notifyAdmin(`👀 Nova conversa de venda: ${phone}\nPrimeira mensagem: ${(msg.text || `[${msg.type}]`).slice(0, 200)}`);
      if (msg.type === "button") {
        store.addMessage(phone, "user", `[botão] ${msg.text || msg.buttonId}`);
        if (String(msg.buttonId).startsWith("lead:")) return await sales.button(msg.buttonId);
        return await actions.say("Me conta o que você precisa 🙂");
      }
      let text = (msg.text || "").trim().slice(0, L.maxTextChars);
      let image = null;
      if (msg.type === "image") {
        const media = await channel.downloadMedia(msg.mediaId);
        const mime = sniffImage(media.buffer);
        if (!mime || media.buffer.length > L.maxImageBytes) return await actions.say("Não consegui abrir essa imagem 😕 Manda como foto (JPG ou PNG)?");
        store.addPhoto(phone, saveMedia(media.buffer, { "image/png": "png", "image/webp": "webp" }[mime] || "jpg"), mime);
        image = { data: media.buffer.toString("base64"), mime };
      } else if (msg.type === "audio") {
        if (!transcribeEnabled()) return await actions.say("Ainda não consigo ouvir áudio por aqui 🙈 Me manda por escrito?");
        const media = await channel.downloadMedia(msg.mediaId);
        text = (await transcribe(media.buffer, media.mime)).slice(0, L.maxTextChars);
      } else if (msg.type !== "text") {
        return await actions.say("Me manda por texto, foto ou áudio que eu te respondo 🙂");
      }
      const history = store.recentMessages(phone);
      store.addMessage(phone, "user", image ? `[foto] ${text}` : text);
      await brain.sell({ sales, history, text, image });
    } catch (e) {
      console.error(`[lia] erro na venda com ${phone}:`, e.message);
      await actions.say("Tive um probleminha aqui 😓 Pode mandar de novo em 1 minutinho?").catch(() => {});
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
        const lead = store.getLead(tel);
        if (lead) {
          const d = lead.data;
          store.updateBrand(tel, { business_name: d.business_name, segment: d.segment, location: d.city, instagram: d.instagram, colors: d.colors });
          store.updateLead(tel, {}, "cliente");
          const a = new Actions({ store, channel: channels[msg.channel === "sim" ? "sim" : "whatsapp"], adminChannel, phone: tel, limiter });
          await a.say(`Pagamento confirmado! 🎉 Bem-vindo(a) ao plano ${planOf(plan).name}, você já tem ${c.credits} créditos.\n\nAgora vou montar o *Cérebro da sua marca*: são umas perguntas rápidas, uma por vez. Bora? Me responde com um "bora" 🙂`).catch((e) => console.error("[lia] boas-vindas falhou:", e.message));
        }
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
      case "/leads": {
        const list = store.listLeads(20);
        if (!list.length) return reply("Nenhuma conversa de venda ainda.");
        return reply(list.map((l) => `${l.stage === "fechando" ? "🤑" : l.stage === "cliente" ? "✅" : "💬"} ${l.data.business_name || "?"} · ${l.phone} · ${l.stage}${l.data.plan ? " · " + l.data.plan : ""}`).join("\n"));
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
          "/clientes · /leads (conversas de venda)",
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
