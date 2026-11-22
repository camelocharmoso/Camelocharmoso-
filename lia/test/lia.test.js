// Testa o fluxo completo com um Claude de mentira (sem gastar API).
import { test, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "lia-test-"));
process.env.ADMIN_PHONE = "";

const { openDb } = await import("../src/db.js");
const { createHandler } = await import("../src/handler.js");
const { createBrain, buildHistory } = await import("../src/brain.js");
const { sim } = await import("../src/channels/sim.js");
const { parseWebhook, chunks } = await import("../src/channels/whatsapp.js");

const PHONE = "5581999990000";
let store, handler, calls, script;
let n = 0;
const send = (m) => handler.handle({ id: String(++n), channel: "sim", ...m });
const out = () => sim.read(PHONE);
const admin = () => sim.read("admin");
const toolUse = (name, input) => ({ stop_reason: "tool_use", content: [{ type: "tool_use", id: "tu" + ++n, name, input }] });
const text = (t) => ({ stop_reason: "end_turn", content: [{ type: "text", text: t }] });

before(() => {
  store = openDb(path.join(process.env.DATA_DIR, "t.db"));
  calls = [];
  const fake = { beta: { messages: { create: async (p) => { calls.push(p); const next = script.shift(); assert.ok(next, "chamada extra ao modelo"); return typeof next === "function" ? next(p) : next; } } } };
  handler = createHandler({ store, brain: createBrain({ anthropic: fake }), channels: { sim }, adminChannel: sim });
});

const reset = (s) => { sim.reset(); calls.length = 0; script = s; };

test("número desconhecido recebe apresentação e o operador é avisado", async () => {
  reset([]);
  await send({ from: "5511000000000", type: "text", text: "oi" });
  assert.match(sim.read("5511000000000")[0].text, /só clientes/);
  assert.match(admin()[0].text, /\/add 5511000000000/);
});

test("operador cadastra cliente pelo comando /add", async () => {
  reset([]);
  await send({ from: "admin", type: "text", text: `/add ${PHONE} pro Brasa Burger` });
  const c = store.getClient(PHONE);
  assert.equal(c.business, "Brasa Burger");
  assert.equal(c.credits, 60);
  assert.match(admin()[0].text, /cadastrado/);
});

test("conversa simples: texto do modelo vai para o cliente", async () => {
  reset([text("Oi! Bora começar?")]);
  await send({ from: PHONE, type: "text", text: "oi" });
  assert.equal(out()[0].text, "Oi! Bora começar?");
  const req = calls[0];
  assert.equal(req.model, "claude-opus-5-5");
  assert.deepEqual(req.betas, ["server-side-fallback-2026-07-01"]);
  assert.equal(req.fallbacks, "default");
  assert.match(req.system[1].text, /onboarding pendente/);
});

test("onboarding salva a marca e conclui", async () => {
  reset([
    toolUse("save_brand", { business_name: "Brasa Burger", segment: "hamburgueria", audience: "", differentials: "", tone: "descontraído", colors: ["#c2410c", "#f4b41a"], products: "X-Bacon R$ 32", location: "", hours: "", instagram: "", avoid: "" }),
    toolUse("finish_onboarding", { summary: "Hamburgueria artesanal descontraída." }),
    text("Prontinho! Quer uma arte de amostra?"),
  ]);
  await send({ from: PHONE, type: "text", text: "cores vermelho e amarelo, tom descontraído" });
  const c = store.getClient(PHONE);
  assert.equal(c.onboarded, true);
  assert.deepEqual(c.brand.colors, ["#c2410c", "#f4b41a"]);
  assert.equal(c.brand.audience, undefined, "campos vazios não são salvos");
  assert.ok(calls[1].messages.at(-1).content[0].type === "tool_result");
});

const ART = { format: "feed", title: "X-Bacon", badge: "20% OFF", subtitle: "só até domingo", caption: "X-Bacon na brasa 🔥 #burger", use_photo: false };

test("pedido de arte: 2 opções + botões, sem chamar o modelo de novo", async () => {
  reset([toolUse("create_art", ART)]);
  await send({ from: PHONE, type: "text", text: "faz uma arte do X-Bacon 20% off" });
  assert.equal(calls.length, 1);
  const msgs = out();
  assert.deepEqual(msgs.map((m) => m.type), ["image", "image", "buttons"]);
  assert.match(msgs[2].text, /2 créditos/);
  assert.ok(fs.existsSync(path.join(process.env.DATA_DIR, "media", msgs[0].file)));
});

test("aprovar debita créditos, mostra legenda e agenda; operador recebe o post", async () => {
  const pick = out()[2].buttons[1];
  reset([]);
  await send({ from: PHONE, type: "button", buttonId: pick.id, text: pick.title });
  assert.equal(store.getClient(PHONE).credits, 58);
  assert.match(out()[0].text, /Legenda pronta/);
  const when = out()[1].buttons[0];
  assert.equal(when.title, "Hoje 18h");

  sim.reset();
  await send({ from: PHONE, type: "button", buttonId: when.id, text: when.title });
  assert.match(out()[0].text, /hoje às 18h/);
  assert.equal(store.pending().posts.length, 1);
  assert.deepEqual(admin().map((m) => m.type), ["image", "text"]);
  assert.match(admin()[1].text, /\/feito p1/);

  // clicar de novo não debita nem duplica
  sim.reset();
  await send({ from: PHONE, type: "button", buttonId: pick.id, text: pick.title });
  assert.match(out()[0].text, /já foi feita/);
  assert.equal(store.getClient(PHONE).credits, 58);
});

test("refazer é grátis e troca as cores", async () => {
  reset([toolUse("create_art", { ...ART, format: "story" })]);
  await send({ from: PHONE, type: "text", text: "faz um story" });
  const redo = out().at(-1).buttons[1];
  assert.equal(redo.title, "Refazer");
  sim.reset();
  await send({ from: PHONE, type: "button", buttonId: redo.id, text: redo.title });
  assert.deepEqual(out().map((m) => m.type), ["text", "image", "buttons"]);
  assert.equal(store.getClient(PHONE).credits, 58);
});

test("outro horário: a próxima mensagem vira o horário do post", async () => {
  reset([toolUse("create_art", ART)]);
  await send({ from: PHONE, type: "text", text: "outra arte" });
  const pick = out()[2].buttons[0];
  await send({ from: PHONE, type: "button", buttonId: pick.id, text: pick.title });
  const other = out().at(-1).buttons[2];
  await send({ from: PHONE, type: "button", buttonId: other.id, text: other.title });
  sim.reset();
  await send({ from: PHONE, type: "text", text: "sexta às 19h" });
  assert.match(out()[0].text, /sexta às 19h/);
  assert.equal(calls.length, 1, "não chamou o modelo para o horário");
});

test("sem créditos: o modelo recebe o erro e oferece o pacote", async () => {
  store.grant(PHONE, -store.getClient(PHONE).credits, "teste");
  reset([
    toolUse("create_art", ART),
    (p) => { assert.match(p.messages.at(-1).content[0].content, /insuficientes/); return toolUse("buy_credits", {}); },
  ]);
  await send({ from: PHONE, type: "text", text: "mais uma arte" });
  const offer = out().at(-1);
  assert.equal(offer.buttons[0].title, "Quero o pacote");
  sim.reset();
  await send({ from: PHONE, type: "button", buttonId: "buy:yes", text: "Quero o pacote" });
  assert.equal(store.getClient(PHONE).credits, 20);
  assert.match(admin().at(-1).text, /cobrar R\$ 49/);
});

test("carrossel gera capa + slides", async () => {
  reset([toolUse("create_carousel", { cover_title: "Como nasce o smash", slides: [{ heading: "Blend", body: "160g moído na hora" }, { heading: "Chapa", body: "250 graus" }], caption: "#smash" })]);
  await send({ from: PHONE, type: "text", text: "faz um carrossel" });
  assert.deepEqual(out().map((m) => m.type), ["image", "image", "image", "buttons"]);
  const approve = out().at(-1).buttons[0];
  sim.reset();
  await send({ from: PHONE, type: "button", buttonId: approve.id, text: "Aprovar" });
  assert.equal(store.getClient(PHONE).credits, 16);
});

test("foto do cliente é salva e vai para o modelo como imagem", async () => {
  const png = fs.readFileSync(path.join(process.env.DATA_DIR, "media", fs.readdirSync(path.join(process.env.DATA_DIR, "media"))[0]));
  reset([text("Que foto linda!")]);
  await send({ from: PHONE, type: "image", mediaId: sim.storeMedia(png, "image/png"), text: "" });
  assert.equal(calls[0].messages.at(-1).content[0].type, "image");
  assert.ok(store.latestPhoto(PHONE));
});

test("histórico alterna papéis e começa pelo usuário", () => {
  const h = buildHistory([{ role: "assistant", text: "a" }, { role: "user", text: "b" }, { role: "user", text: "c" }, { role: "assistant", text: "d" }]);
  assert.deepEqual(h, [{ role: "user", content: "b\nc" }, { role: "assistant", content: "d" }]);
});

test("webhook da Meta vira mensagens internas", () => {
  const body = { entry: [{ changes: [{ value: { messages: [
    { id: "a", from: "5581", type: "text", text: { body: "oi" } },
    { id: "b", from: "5581", type: "interactive", interactive: { type: "button_reply", button_reply: { id: "pick:1", title: "Quero a 1" } } },
    { id: "c", from: "5581", type: "image", image: { id: "m1", caption: "x" } },
  ] } }] }] };
  const m = parseWebhook(body);
  assert.deepEqual(m.map((x) => x.type), ["text", "button", "image"]);
  assert.equal(m[1].buttonId, "pick:1");
});

test("textos longos são quebrados em partes", () => {
  const parts = chunks("a ".repeat(5000));
  assert.ok(parts.length >= 3 && parts.every((p) => p.length <= 3800));
});
