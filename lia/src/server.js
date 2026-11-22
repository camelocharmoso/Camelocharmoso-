import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { config, waEnabled } from "./config.js";
import { openDb } from "./db.js";
import { createBrain } from "./brain.js";
import { createHandler } from "./handler.js";
import { whatsapp, parseWebhook } from "./channels/whatsapp.js";
import { sim } from "./channels/sim.js";
import { mediaPath, MEDIA_NAME } from "./art.js";
import { ADMIN_SIM_ID } from "./actions.js";
import { planOf } from "./plans.js";
import { RateLimiter, safeEqual, securityHeaders, configProblems, sniffImage } from "./security.js";

// ---------- checagem de configuração: em produção, não sobe inseguro ----------
const problems = configProblems();
if (problems.length) {
  console.error("[lia] Configuração insegura, corrija antes de subir:\n - " + problems.join("\n - "));
  process.exit(1);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const store = openDb();
const handler = createHandler({
  store,
  brain: createBrain(),
  channels: { whatsapp, sim },
  adminChannel: waEnabled() && config.adminPhone ? whatsapp : sim,
});

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", config.trustProxy);
app.use(securityHeaders);

const limiter = new RateLimiter();
const MIN = 60_000;

app.get("/health", (_req, res) => res.json({ ok: true }));

// ---------- WhatsApp ----------
app.get("/webhook", (req, res) => {
  const ok = req.query["hub.mode"] === "subscribe" && config.wa.verifyToken && safeEqual(req.query["hub.verify_token"], config.wa.verifyToken);
  if (ok) return res.type("text/plain").status(200).send(String(req.query["hub.challenge"]).slice(0, 200));
  res.sendStatus(403);
});

function validSignature(raw, header) {
  if (!config.wa.appSecret) return !waEnabled(); // só aceita sem assinatura em teste local
  if (typeof header !== "string" || !header.startsWith("sha256=")) return false;
  const expected = crypto.createHmac("sha256", config.wa.appSecret).update(raw).digest("hex");
  return safeEqual(header.slice(7), expected);
}

app.post("/webhook", express.raw({ type: "*/*", limit: "1mb" }), (req, res) => {
  const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
  if (!validSignature(raw, req.get("x-hub-signature-256"))) {
    if (limiter.hit(`badsig:${req.ip}`, 10 * MIN) === 1) console.warn(`[lia] webhook com assinatura inválida de ${req.ip}`);
    return res.sendStatus(401);
  }
  res.sendStatus(200); // a Meta reenvia se demorarmos; respondemos já e processamos depois
  let body;
  try { body = JSON.parse(raw.toString("utf8")); } catch { return; }
  for (const msg of parseWebhook(body)) {
    handler.handle(msg).catch((e) => console.error("[lia] erro no webhook:", e.message));
  }
});

// ---------- Simulador e painel ----------
// Sem ADMIN_TOKEN, só funciona no próprio computador (localhost). Com token, exige o cabeçalho x-admin-token.
const isLoopback = (ip) => ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1";

function guard(req, res, next) {
  const ipKey = `auth:${req.ip}`;
  if (limiter.peek(ipKey, 15 * MIN) >= 10) return res.status(429).json({ error: "Muitas tentativas. Espere 15 minutos." });
  if (limiter.hit(`api:${req.ip}`, MIN) > 300) return res.status(429).json({ error: "Muitas requisições." });

  if (!config.adminToken) {
    if (isLoopback(req.socket.remoteAddress) && !req.get("x-forwarded-for")) return next();
    return res.status(403).json({ error: "Defina ADMIN_TOKEN para usar o simulador fora do seu computador." });
  }
  if (safeEqual(req.get("x-admin-token") || "", config.adminToken)) return next();
  limiter.hit(ipKey, 15 * MIN);
  res.status(401).json({ error: "Senha inválida." });
}

// As páginas do simulador não têm segredo nenhum; os dados só saem pela API protegida.
app.get("/sim", (_req, res) => res.sendFile(path.join(here, "..", "public", "sim.html")));
app.get("/sim.js", (_req, res) => res.sendFile(path.join(here, "..", "public", "sim.js")));
app.get("/sim.css", (_req, res) => res.sendFile(path.join(here, "..", "public", "sim.css")));

app.get("/media/:name", guard, (req, res) => {
  if (!MEDIA_NAME.test(req.params.name)) return res.sendStatus(404);
  const file = mediaPath(req.params.name);
  if (!fs.existsSync(file)) return res.sendStatus(404);
  res.set("Cache-Control", "private, max-age=3600").sendFile(file);
});

app.post("/sim/send", guard, express.json({ limit: "8mb" }), async (req, res) => {
  const { from, text, buttonId, buttonTitle, image, asAdmin } = req.body || {};
  const msg = { id: crypto.randomUUID(), channel: "sim", from: asAdmin ? ADMIN_SIM_ID : String(from || "").replace(/\D/g, "").slice(0, 20) };
  if (!msg.from) return res.status(400).json({ error: "from obrigatório" });
  if (typeof buttonId === "string" && buttonId) Object.assign(msg, { type: "button", buttonId: buttonId.slice(0, 100), text: String(buttonTitle || "").slice(0, 40) });
  else if (image?.base64) {
    const buf = Buffer.from(String(image.base64), "base64");
    const mime = sniffImage(buf);
    if (!mime) return res.status(400).json({ error: "Envie JPG, PNG ou WEBP." });
    Object.assign(msg, { type: "image", mediaId: sim.storeMedia(buf, mime), text: String(text || "").slice(0, 1000) });
  } else Object.assign(msg, { type: "text", text: String(text || "").slice(0, 4000) });
  handler.handle(msg).catch((e) => console.error("[lia] erro no simulador:", e.message));
  res.json({ ok: true });
});

app.get("/sim/outbox", guard, (req, res) => res.json(sim.all(Number(req.query.after || 0))));

app.get("/sim/clients", guard, (_req, res) => {
  res.json(store.listClients().map((c) => ({ phone: c.phone, business: c.business, plan: planOf(c.plan).name, credits: c.credits, onboarded: c.onboarded })));
});

app.get("/sim/queue", guard, (_req, res) => res.json(store.pending()));

// Qualquer outra rota: 404 sem revelar nada; erros sem stack trace.
app.use((_req, res) => res.sendStatus(404));
app.use((err, _req, res, _next) => {
  console.error("[lia] erro HTTP:", err.message);
  res.sendStatus(err.status && err.status < 500 ? err.status : 500);
});

// Limpeza diária: mensagens já processadas e artes descartadas antigas.
setInterval(() => { try { store.cleanup(); } catch (e) { console.error("[lia] limpeza falhou:", e.message); } }, 24 * 60 * MIN).unref();
store.cleanup();

app.listen(config.port, () => {
  console.log(`[lia] no ar na porta ${config.port}`);
  console.log(`[lia] WhatsApp: ${waEnabled() ? "conectado" : "não configurado (use o simulador em /sim)"}`);
  console.log(`[lia] simulador: ${config.adminToken ? "protegido por ADMIN_TOKEN" : "só neste computador (localhost)"}`);
  if (!process.env.ANTHROPIC_API_KEY) console.log("[lia] aviso: ANTHROPIC_API_KEY não definida");
});
