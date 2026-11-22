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
import { mediaPath } from "./art.js";
import { ADMIN_SIM_ID } from "./actions.js";
import { planOf } from "./plans.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const store = openDb();
const brain = createBrain();
const handler = createHandler({
  store,
  brain,
  channels: { whatsapp, sim },
  adminChannel: waEnabled() && config.adminPhone ? whatsapp : sim,
});

const app = express();

app.get("/health", (_req, res) => res.json({ ok: true, whatsapp: waEnabled() }));

// ---------- WhatsApp ----------
app.get("/webhook", (req, res) => {
  const ok = req.query["hub.mode"] === "subscribe" && config.wa.verifyToken && req.query["hub.verify_token"] === config.wa.verifyToken;
  if (ok) return res.status(200).send(String(req.query["hub.challenge"]));
  res.sendStatus(403);
});

function validSignature(raw, header) {
  if (!config.wa.appSecret) return true; // sem segredo configurado: aceita (só para testes)
  if (!header?.startsWith("sha256=")) return false;
  const expected = crypto.createHmac("sha256", config.wa.appSecret).update(raw).digest("hex");
  const given = header.slice(7);
  return given.length === expected.length && crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

app.post("/webhook", express.raw({ type: "*/*", limit: "2mb" }), (req, res) => {
  const raw = req.body instanceof Buffer ? req.body : Buffer.from("");
  if (!validSignature(raw, req.get("x-hub-signature-256"))) return res.sendStatus(401);
  res.sendStatus(200); // a Meta reenvia se demorarmos; respondemos já e processamos depois
  let body;
  try { body = JSON.parse(raw.toString("utf8")); } catch { return; }
  for (const msg of parseWebhook(body)) {
    handler.handle(msg).catch((e) => console.error("[lia] erro no webhook:", e));
  }
});

// ---------- Simulador e painel (protegidos por ADMIN_TOKEN) ----------
const simOpen = () => !config.adminToken && !waEnabled(); // sem senha só em teste local
function guard(req, res, next) {
  if (simOpen()) return next();
  const token = req.get("x-admin-token") || req.query.token;
  if (config.adminToken && token === config.adminToken) return next();
  res.status(401).send("Informe ?token=SEU_ADMIN_TOKEN");
}

app.get("/sim", guard, (_req, res) => res.sendFile(path.join(here, "..", "public", "sim.html")));
app.get("/media/:name", guard, (req, res) => {
  const file = mediaPath(req.params.name);
  if (!fs.existsSync(file)) return res.sendStatus(404);
  res.sendFile(file);
});

app.post("/sim/send", guard, express.json({ limit: "12mb" }), async (req, res) => {
  const { from, text, buttonId, buttonTitle, image, asAdmin } = req.body || {};
  const msg = { id: crypto.randomUUID(), channel: "sim", from: asAdmin ? ADMIN_SIM_ID : String(from || "") };
  if (buttonId) Object.assign(msg, { type: "button", buttonId, text: buttonTitle || "" });
  else if (image?.base64) Object.assign(msg, { type: "image", mediaId: sim.storeMedia(Buffer.from(image.base64, "base64"), image.mime || "image/jpeg"), text: text || "" });
  else Object.assign(msg, { type: "text", text: String(text || "") });
  handler.handle(msg).catch((e) => console.error("[lia] erro no simulador:", e));
  res.json({ ok: true });
});

app.get("/sim/outbox", guard, (req, res) => res.json(sim.all(Number(req.query.after || 0))));

app.get("/sim/clients", guard, (_req, res) => {
  res.json(store.listClients().map((c) => ({ phone: c.phone, business: c.business, plan: planOf(c.plan).name, credits: c.credits, onboarded: c.onboarded, brand: c.brand })));
});

app.get("/sim/queue", guard, (_req, res) => res.json(store.pending()));

app.listen(config.port, () => {
  console.log(`[lia] no ar na porta ${config.port}`);
  console.log(`[lia] WhatsApp: ${waEnabled() ? "conectado" : "não configurado (use o simulador em /sim)"}`);
  if (!process.env.ANTHROPIC_API_KEY) console.log("[lia] aviso: ANTHROPIC_API_KEY não definida");
});
