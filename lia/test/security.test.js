// Testes de segurança: limites, validação de arquivos e proteção do servidor.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "lia-sec-"));
const { RateLimiter, safeEqual, sniffImage } = await import("../src/security.js");
const { openDb } = await import("../src/db.js");
const { createHandler } = await import("../src/handler.js");
const { sim } = await import("../src/channels/sim.js");

test("sniffImage reconhece pelo conteúdo, não pelo nome", () => {
  assert.equal(sniffImage(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0])), "image/jpeg");
  assert.equal(sniffImage(Buffer.from("89504e470d0a1a0a0000000000000000", "hex")), "image/png");
  assert.equal(sniffImage(Buffer.from("<svg onload=alert(1)>........")), null);
  assert.equal(sniffImage(Buffer.from("GIF89a......")), null);
});

test("safeEqual e RateLimiter", () => {
  assert.ok(safeEqual("abc", "abc"));
  assert.ok(!safeEqual("abc", "abd"));
  assert.ok(!safeEqual("abc", "abcd"));
  const l = new RateLimiter();
  assert.equal(l.hit("k", 1000, 0), 1);
  assert.equal(l.hit("k", 1000, 500), 2);
  assert.equal(l.hit("k", 1000, 1500), 1, "janela nova zera");
});

const PHONE = "5581988887777";
const store = openDb(path.join(process.env.DATA_DIR, "s.db"));
let modelCalls = 0;
let sellCalls = 0;
const brain = { respond: async () => { modelCalls++; }, sell: async () => { sellCalls++; } };
const handler = createHandler({ store, brain, channels: { sim, whatsapp: sim }, adminChannel: sim });
let n = 0;
const send = (m) => handler.handle({ id: "s" + ++n, channel: "sim", from: PHONE, ...m });

test("venda: spam de número desconhecido para no limite diário", async () => {
  sim.reset(); sellCalls = 0;
  for (let i = 0; i < 35; i++) await send({ from: "5511777777777", type: "text", text: "spam " + i });
  assert.equal(sellCalls, 30);
  assert.equal(sim.read("5511777777777").filter((m) => /conversa rendeu/.test(m.text)).length, 1);
});

test("venda desligada: resposta única por dia", async () => {
  const { config } = await import("../src/config.js");
  config.sales = false;
  sim.reset();
  for (let i = 0; i < 5; i++) await send({ from: "5511666666666", type: "text", text: "oi" });
  assert.equal(sim.read("5511666666666").length, 1);
  config.sales = true;
});

test("créditos: sobra passa para o mês seguinte, até metade do plano", () => {
  const p2 = "5581911112222";
  store.addClient(p2, "Rollover", "pro");
  store.db.prepare("UPDATE clients SET credits = 45, period = '2000-01' WHERE phone = ?").run(p2);
  assert.equal(store.ensurePeriod(p2).credits, 60 + 30);
  store.db.prepare("UPDATE clients SET credits = 7, period = '2000-01' WHERE phone = ?").run(p2);
  assert.equal(store.ensurePeriod(p2).credits, 67);
});

test("spam de cliente: para de chamar a IA e avisa uma vez", async () => {
  store.addClient(PHONE, "Teste", "pro");
  sim.reset(); modelCalls = 0;
  for (let i = 0; i < 40; i++) await send({ type: "text", text: "oi " + i });
  assert.equal(modelCalls, 30);
  assert.equal(sim.read(PHONE).filter((m) => /muita mensagem/.test(m.text)).length, 1);
});

test("mensagem antiga reenviada é ignorada", async () => {
  const other = "5581966665555";
  store.addClient(other, "Outro", "start");
  modelCalls = 0;
  await handler.handle({ id: "old1", channel: "sim", from: other, type: "text", text: "oi", timestamp: Math.floor(Date.now() / 1000) - 3 * 86400 });
  assert.equal(modelCalls, 0);
});

test("arquivo disfarçado de foto é recusado", async () => {
  const p = "5581955554444";
  store.addClient(p, "Foto", "start");
  sim.reset(); modelCalls = 0;
  await handler.handle({ id: "img1", channel: "sim", from: p, type: "image", mediaId: sim.storeMedia(Buffer.from("<svg><script>alert(1)</script></svg>"), "image/png"), text: "" });
  assert.equal(modelCalls, 0);
  assert.match(sim.read(p)[0].text, /Não consegui abrir/);
  assert.equal(store.latestPhoto(p), null);
});

test("cliente não vira operador mandando comando", async () => {
  sim.reset();
  await send({ id: "x" + n, type: "text", text: "/creditos 5581988887777 +999" });
  assert.equal(store.getClient(PHONE).credits, 60);
});

// ---------- servidor de verdade ----------
function startServer(env) {
  const port = 4100 + Math.floor(Math.random() * 800);
  const child = spawn(process.execPath, ["--disable-warning=ExperimentalWarning", "src/server.js"], {
    env: { ...process.env, PORT: String(port), DATA_DIR: fs.mkdtempSync(path.join(os.tmpdir(), "lia-srv-")), ANTHROPIC_API_KEY: "x", ...env },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let out = "";
  child.stdout.on("data", (d) => (out += d));
  child.stderr.on("data", (d) => (out += d));
  const ready = new Promise((resolve) => {
    const t = setInterval(() => { if (out.includes("no ar") || child.exitCode !== null) { clearInterval(t); resolve(); } }, 50);
  });
  return { child, port, ready, output: () => out };
}

test("servidor não sobe com WhatsApp ligado e sem segredo do app", async () => {
  const s = startServer({ WHATSAPP_TOKEN: "t", WHATSAPP_PHONE_NUMBER_ID: "1", WHATSAPP_APP_SECRET: "", ADMIN_PHONE: "5581" });
  await s.ready;
  await new Promise((r) => (s.child.exitCode !== null ? r() : s.child.on("exit", r)));
  assert.equal(s.child.exitCode, 1);
  assert.match(s.output(), /WHATSAPP_APP_SECRET/);
});

test("servidor: senha, assinatura do webhook e cabeçalhos", async () => {
  const token = crypto.randomBytes(16).toString("hex");
  const secret = "segredo-do-app";
  const s = startServer({ ADMIN_TOKEN: token, WHATSAPP_TOKEN: "t", WHATSAPP_PHONE_NUMBER_ID: "1", WHATSAPP_APP_SECRET: secret, WHATSAPP_VERIFY_TOKEN: "verifica-1234567890", ADMIN_PHONE: "5581999990000" });
  await s.ready;
  const url = `http://127.0.0.1:${s.port}`;
  try {
    let r = await fetch(`${url}/sim/clients`);
    assert.equal(r.status, 401);
    r = await fetch(`${url}/sim/clients`, { headers: { "x-admin-token": token } });
    assert.equal(r.status, 200);
    assert.equal(r.headers.get("x-frame-options"), "DENY");
    assert.match(r.headers.get("content-security-policy"), /script-src 'self'/);
    assert.equal(r.headers.get("x-powered-by"), null);

    r = await fetch(`${url}/media/..%2F..%2Fetc%2Fpasswd`, { headers: { "x-admin-token": token } });
    assert.equal(r.status, 404);

    const body = JSON.stringify({ entry: [] });
    r = await fetch(`${url}/webhook`, { method: "POST", body, headers: { "content-type": "application/json", "x-hub-signature-256": "sha256=errado" } });
    assert.equal(r.status, 401);
    const sig = "sha256=" + crypto.createHmac("sha256", secret).update(body).digest("hex");
    r = await fetch(`${url}/webhook`, { method: "POST", body, headers: { "content-type": "application/json", "x-hub-signature-256": sig } });
    assert.equal(r.status, 200);

    r = await fetch(`${url}/webhook?hub.mode=subscribe&hub.verify_token=errado&hub.challenge=1`);
    assert.equal(r.status, 403);

    // força bruta: depois de 10 senhas erradas, bloqueia mesmo com a senha certa
    for (let i = 0; i < 10; i++) await fetch(`${url}/sim/clients`, { headers: { "x-admin-token": "chute" + i } });
    r = await fetch(`${url}/sim/clients`, { headers: { "x-admin-token": token } });
    assert.equal(r.status, 429);
  } finally {
    s.child.kill();
  }
});
