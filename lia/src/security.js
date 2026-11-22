// Peças de segurança usadas pelo servidor e pelo atendimento.
import crypto from "node:crypto";
import { config, waEnabled } from "./config.js";

/** Comparação em tempo constante (evita descobrir a senha pelo tempo de resposta). */
export function safeEqual(a, b) {
  const x = crypto.createHash("sha256").update(String(a ?? "")).digest();
  const y = crypto.createHash("sha256").update(String(b ?? "")).digest();
  return crypto.timingSafeEqual(x, y) && String(a ?? "").length === String(b ?? "").length;
}

/** Contador por janela de tempo, em memória. hit() devolve quantas vezes a chave foi usada na janela. */
export class RateLimiter {
  constructor() { this.buckets = new Map(); }
  hit(key, windowMs, now = Date.now()) {
    let b = this.buckets.get(key);
    if (!b || now - b.start >= windowMs) { b = { start: now, count: 0 }; this.buckets.set(key, b); }
    b.count++;
    if (this.buckets.size > 50_000) this.sweep(now, windowMs);
    return b.count;
  }
  peek(key, windowMs, now = Date.now()) {
    const b = this.buckets.get(key);
    return b && now - b.start < windowMs ? b.count : 0;
  }
  sweep(now, windowMs) {
    for (const [k, b] of this.buckets) if (now - b.start >= windowMs) this.buckets.delete(k);
  }
}

/** Descobre o tipo real da imagem pelos primeiros bytes. Não confia no que o remetente diz. */
export function sniffImage(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.subarray(0, 4).toString("latin1") === "RIFF" && buf.subarray(8, 12).toString("latin1") === "WEBP") return "image/webp";
  return null;
}

/** Cabeçalhos HTTP de proteção (equivalente enxuto do helmet). */
export function securityHeaders(req, res, next) {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "Content-Security-Policy": "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' blob: data:; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
  });
  if (req.secure) res.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
}

/** Problemas de configuração que deixariam o sistema aberto em produção. */
export function configProblems() {
  const p = [];
  if (waEnabled()) {
    if (!config.wa.appSecret) p.push("WHATSAPP_APP_SECRET é obrigatório: sem ele qualquer pessoa pode mandar mensagens falsas para o webhook.");
    if (!config.wa.verifyToken || config.wa.verifyToken.length < 16) p.push("WHATSAPP_VERIFY_TOKEN precisa ter pelo menos 16 caracteres.");
    if (!config.adminPhone) p.push("ADMIN_PHONE é obrigatório para você receber os avisos e mandar comandos.");
  }
  if (config.adminToken && config.adminToken.length < 24) p.push("ADMIN_TOKEN precisa ter pelo menos 24 caracteres (gere com: openssl rand -hex 24).");
  return p;
}
