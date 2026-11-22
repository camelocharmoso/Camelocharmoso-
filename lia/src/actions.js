// Tudo que a Lia faz de verdade: mandar mensagens, gerar e enviar artes, debitar créditos,
// criar posts e tarefas para a equipe. Usado pelo cérebro (ferramentas) e pelos botões.
import crypto from "node:crypto";
import { config } from "./config.js";
import { COSTS, EXTRA_PACK, planOf } from "./plans.js";
import { postSVG, carouselSVGs, renderPng, saveMedia, photoDataUri } from "./art.js";

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const newGroup = () => "g" + crypto.randomBytes(5).toString("hex");
export const ADMIN_SIM_ID = "admin";

export class Actions {
  /**
   * @param {object} deps { store, channel, adminChannel, phone }
   */
  constructor({ store, channel, adminChannel, phone, limiter }) {
    this.limiter = limiter;
    this.store = store;
    this.channel = channel;
    this.adminChannel = adminChannel || channel;
    this.phone = phone;
    this.sentArt = false;
  }

  get client() { return this.store.getClient(this.phone); }

  // ---------- envio ----------
  async say(text) {
    if (!text || !text.trim()) return;
    await this.channel.sendText(this.phone, text.trim());
    this.store.addMessage(this.phone, "assistant", text.trim());
  }
  async buttons(body, buttons) {
    await this.channel.sendButtons(this.phone, body, buttons);
    this.store.addMessage(this.phone, "assistant", `${body} [botões: ${buttons.map((b) => b.title).join(" | ")}]`);
  }
  async notifyAdmin(text, files = []) {
    // No simulador o operador aparece como "admin"; no WhatsApp, é o seu número.
    const to = this.adminChannel.name === "sim" ? ADMIN_SIM_ID : config.adminPhone;
    if (!to) return;
    try {
      for (const f of files) await this.adminChannel.sendImage(to, f, "");
      await this.adminChannel.sendText(to, text);
    } catch (e) {
      console.error("[lia] falha ao avisar o operador:", e.message);
    }
  }

  // ---------- artes ----------
  costFor(kind) {
    return this.client.onboarded ? COSTS[kind] : 0; // amostras do onboarding são grátis
  }

  photoFor(usePhoto) {
    if (!usePhoto) return null;
    return photoDataUri(this.store.latestPhoto(this.phone));
  }

  /** spec: { format: "feed"|"story", title, badge, subtitle, caption, use_photo } */
  async createArt(spec, { redo = 0, free } = {}) {
    const client = this.client;
    const kind = spec.format === "story" ? "story" : "feed";
    const cost = free ? 0 : this.costFor(kind);
    if (client.credits < cost) return this.insufficient(cost);

    const photo = this.photoFor(spec.use_photo);
    const cycles = kind === "feed" ? [["A", "B"], ["C", "D"], ["B", "A"]] : [["D"], ["A"], ["C"]];
    const variants = cycles[redo % cycles.length];
    const group = newGroup();
    const ids = [];
    for (const v of variants) {
      const file = saveMedia(renderPng(postSVG(client, spec, kind, v, photo)));
      ids.push(this.store.addArt({ phone: this.phone, group, kind, variant: v, file, spec: { ...spec, format: kind, free: cost === 0, redo } }));
    }
    for (let i = 0; i < ids.length; i++) {
      const art = this.store.getArt(ids[i]);
      await this.channel.sendImage(this.phone, art.file, ids.length > 1 ? `Opção ${i + 1}` : "");
    }
    this.store.addMessage(this.phone, "assistant", `[Lia enviou ${plural(ids.length, "opção", "opções")} de ${kind === "feed" ? "arte de feed" : "story"}: "${spec.title}" ${spec.badge || ""}]`);

    const price = cost ? `Aprovar usa ${plural(cost, "crédito", "créditos")}.` : "Essa é por nossa conta 🎁";
    const btns = kind === "feed"
      ? [{ id: `pick:${ids[0]}`, title: "Quero a 1" }, { id: `pick:${ids[1]}`, title: "Quero a 2" }, { id: `redo:${group}`, title: "Refazer" }]
      : [{ id: `pick:${ids[0]}`, title: "Aprovar" }, { id: `redo:${group}`, title: "Refazer" }];
    await this.buttons(kind === "feed" ? `Qual você prefere? ${price}` : `Gostou? ${price}`, btns);
    this.sentArt = true;
    return { ok: true, message: "Artes enviadas com botões de escolha. Não escreva mais nada neste turno." };
  }

  /** { cover_title, slides: [{heading, body}], caption } */
  async createCarousel(spec, { redo = 0, free } = {}) {
    const client = this.client;
    const slides = (spec.slides || []).filter((s) => s && (s.heading || s.body)).slice(0, 6);
    if (slides.length < 2) return { ok: false, message: "O carrossel precisa de 2 a 6 slides além da capa." };
    const cost = free ? 0 : this.costFor("carousel");
    if (client.credits < cost) return this.insufficient(cost);

    const svgs = carouselSVGs(client, spec.cover_title, slides, this.photoFor(true), redo % 2 === 1);
    const group = newGroup();
    const ids = svgs.map((svg, i) => this.store.addArt({
      phone: this.phone, group, kind: "carousel", variant: `${redo % 2}-${i}`,
      file: saveMedia(renderPng(svg)), spec: { ...spec, slides, free: cost === 0, redo },
    }));
    for (let i = 0; i < ids.length; i++) {
      await this.channel.sendImage(this.phone, this.store.getArt(ids[i]).file, `${i + 1}/${ids.length}`);
    }
    this.store.addMessage(this.phone, "assistant", `[Lia enviou um carrossel de ${ids.length} slides: "${spec.cover_title}"]`);
    const price = cost ? `Aprovar usa ${plural(cost, "crédito", "créditos")}.` : "Esse é por nossa conta 🎁";
    await this.buttons(`Carrossel pronto! ${price}`, [{ id: `pick:${ids[0]}`, title: "Aprovar" }, { id: `redo:${group}`, title: "Trocar as cores" }]);
    this.sentArt = true;
    return { ok: true, message: "Carrossel enviado com botões. Não escreva mais nada neste turno." };
  }

  insufficient(cost) {
    const c = this.client;
    return {
      ok: false,
      message: `Créditos insuficientes: o cliente tem ${c.credits} e esta entrega custa ${cost}. Explique com leveza e ofereça o pacote extra chamando buy_credits. Lembre que legendas, ideias e roteiros continuam livres.`,
    };
  }

  /** Botão "Quero a N" / "Aprovar". */
  async pick(artId) {
    const art = this.store.getArt(Number(artId));
    if (!art || art.phone !== this.phone) return this.say("Não achei essa arte 🤔 Me pede de novo?");
    if (art.status !== "option") return this.say("Essa escolha já foi feita 👍");
    const cost = art.spec.free ? 0 : COSTS[art.kind];
    if (!this.store.spend(this.phone, cost, `${art.kind} aprovado (${art.group_id})`)) {
      await this.say(`Seus créditos acabaram 😅 Essa entrega usa ${plural(cost, "crédito", "créditos")} e você tem ${this.client.credits}.`);
      return this.offerPack();
    }
    if (art.kind === "carousel") this.store.setGroupStatus(art.group_id, "approved");
    else { this.store.setGroupStatus(art.group_id, "discarded"); this.store.setArtStatus(art.id, "approved"); }

    const caption = (art.spec.caption || "").trim();
    await this.say(caption ? `Fechado! ✅ Legenda pronta:\n\n${caption}` : "Fechado! ✅");
    await this.buttons("Quando eu agendo?", [
      { id: `when:${art.group_id}:hoje`, title: "Hoje 18h" },
      { id: `when:${art.group_id}:amanha`, title: "Amanhã 11h" },
      { id: `when:${art.group_id}:outro`, title: "Outro horário" },
    ]);
  }

  /** Botão "Refazer" / "Trocar as cores": grátis, até 3 vezes. */
  async redo(group) {
    const arts = this.store.groupArts(group, "option");
    if (!arts.length || arts[0].phone !== this.phone) return this.say("Essa arte já foi aprovada ou trocada 👍");
    const spec = arts[0].spec;
    const redo = (spec.redo || 0) + 1;
    this.store.setGroupStatus(group, "discarded");
    if (redo > 3) {
      await this.callHuman("Cliente refez a mesma arte 3 vezes e não gostou. Fazer uma versão manual.");
      return this.say("Vou pedir pra alguém da equipe caprichar numa versão feita à mão. Te mando ainda hoje 🙌");
    }
    await this.say("Bora! Testei outra combinação 👇");
    if (arts[0].kind === "carousel") return this.createCarousel(spec, { redo, free: spec.free });
    return this.createArt(spec, { redo, free: spec.free });
  }

  /** Botões de horário. */
  async when(group, slot) {
    const approved = this.store.groupArts(group, "approved");
    if (!approved.length || approved[0].phone !== this.phone) return this.say("Não achei essa arte aprovada 🤔");
    if (this.store.postForGroup(group)) return this.say("Esse post já está agendado 👍");
    if (slot === "outro") {
      this.store.patchState(this.phone, { awaiting: { type: "when", group } });
      return this.say("Me fala o dia e o horário que eu agendo 🙂");
    }
    return this.schedule(group, slot === "hoje" ? "hoje às 18h" : "amanhã às 11h");
  }

  async schedule(group, whenText) {
    const approved = this.store.groupArts(group, "approved");
    this.store.patchState(this.phone, { awaiting: null });
    if (!approved.length) return this.say("Não achei a arte aprovada pra agendar 🤔");
    const caption = approved[0].spec.caption || "";
    const id = this.store.addPost(this.phone, group, caption, whenText);
    const c = this.client;
    await this.say(`Agendado pra *${whenText}* ✅ A equipe publica no seu Instagram nesse horário. Você tem ${plural(c.credits, "crédito", "créditos")} pro resto do mês.`);
    await this.notifyAdmin(
      `📌 *Post #${id}* · ${c.business} (${c.phone})\nQuando: ${whenText}\nTipo: ${approved[0].kind}, ${approved.length} imagem(ns)\n\nLegenda:\n${caption}\n\nDepois de publicar: /feito p${id}`,
      approved.map((a) => a.file),
    );
  }

  // ---------- créditos ----------
  async offerPack() {
    await this.buttons(
      `Pacote extra: +${EXTRA_PACK.credits} créditos por R$ ${EXTRA_PACK.price}, cobrado junto com a próxima mensalidade. Quer?`,
      [{ id: "buy:yes", title: "Quero o pacote" }, { id: "buy:no", title: "Agora não" }],
    );
    return { ok: true, message: "Oferta do pacote enviada com botões. Não escreva mais nada neste turno." };
  }

  async buy(yes) {
    if (!yes) return this.say("Tranquilo! Legendas, ideias, roteiros e respostas de avaliação continuam liberados 😉");
    this.store.grant(this.phone, EXTRA_PACK.credits, `pacote extra R$ ${EXTRA_PACK.price}`);
    const c = this.client;
    await this.say(`Pronto! Agora você tem ${plural(c.credits, "crédito", "créditos")} 🚀`);
    await this.notifyAdmin(`💰 ${c.business} (${c.phone}) comprou o pacote extra: cobrar R$ ${EXTRA_PACK.price} na próxima fatura.`);
  }

  creditsInfo() {
    const c = this.client;
    const plan = planOf(c.plan);
    return { ok: true, message: `Plano ${plan.name} (R$ ${plan.price}/mês). Créditos disponíveis: ${c.credits} de ${plan.credits}. Renova no dia 1º de cada mês. Custos: story ${COSTS.story}, arte de feed ${COSTS.feed}, alteração no site ${COSTS.site}, carrossel ${COSTS.carousel}, vídeo editado ${COSTS.video}. Legendas, ideias, roteiros e respostas de avaliação são livres.` };
  }

  // ---------- equipe ----------
  async siteChange(description) {
    const cost = COSTS.site;
    if (!this.store.spend(this.phone, cost, "alteração no site")) return this.insufficient(cost);
    const id = this.store.addTask(this.phone, "site", description);
    const c = this.client;
    await this.notifyAdmin(`🌐 *Tarefa t${id}* · site de ${c.business} (${c.phone})\n${description}\n\nQuando terminar: /feito t${id}`);
    return { ok: true, message: `Pedido registrado (${cost} créditos debitados, restam ${c.credits}). A equipe faz em até 1 dia útil e avisa por aqui.` };
  }

  async callHuman(reason) {
    // Evita que alguém use a Lia para encher seu WhatsApp de avisos.
    if (this.limiter && this.limiter.hit(`human:${this.phone}`, 60 * 60_000) > config.limits.humanCallsPerHour) {
      return { ok: true, message: "A equipe já foi avisada e vai responder por aqui. Diga isso ao cliente." };
    }
    const id = this.store.addTask(this.phone, "humano", reason);
    const c = this.client;
    await this.notifyAdmin(`🙋 *Tarefa t${id}* · ${c.business} (${c.phone}) quer falar com a equipe:\n${reason}\n\nResponder: /msg ${c.phone} sua mensagem\nEncerrar: /feito t${id}`);
    return { ok: true, message: "A equipe foi avisada e responde por aqui em até 1 hora útil (seg a sex, 9h às 18h)." };
  }
}
