// Gera as artes (feed 4:5, story 9:16 e carrossel) como SVG e converte para PNG.
// As cores vêm do Cérebro da Marca do cliente; a foto mais recente dele entra como imagem principal.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { config } from "./config.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const FONT_DIR = path.join(here, "..", "fonts");
const FONT_FILES = fs.readdirSync(FONT_DIR).filter((f) => /\.(ttf|otf)$/i.test(f)).map((f) => path.join(FONT_DIR, f));
const DISPLAY = "Inter Display";
const BODY = "Inter";

export const SIZES = { feed: [1080, 1350], story: [1080, 1920], carousel: [1080, 1350] };

// ---------- texto ----------
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
// A fonte das artes não tem emoji; tira para não aparecer quadradinho.
export const clean = (s) => String(s || "").replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}]/gu, "").replace(/\s+/g, " ").trim();

export function wrap(text, max, maxLines) {
  const words = clean(text).split(" ").filter(Boolean);
  const lines = [];
  let cur = "";
  for (const w of words) {
    if (!cur) cur = w;
    else if ((cur + " " + w).length <= max) cur += " " + w;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const keep = lines.slice(0, maxLines);
    keep[maxLines - 1] = keep[maxLines - 1].replace(/.{0,1}$/, "") + "…";
    return keep;
  }
  return lines;
}

const T = (x, y, size, fill, txt, { anchor = "start", font = DISPLAY, weight = 800, ls = 0 } = {}) =>
  `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${ls}">${esc(txt)}</text>`;

// ---------- cor ----------
const HEX = /^#?([0-9a-f]{6})$/i;
const norm = (c) => { const m = HEX.exec(String(c || "").trim()); return m ? "#" + m[1].toLowerCase() : null; };
function lum(hex) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
export const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const DARK = "#17120f";
const LIGHT = "#f7f1e6";
const readable = (fg, bg, min = 3) => (contrast(fg, bg) >= min ? fg : contrast(DARK, bg) > contrast(LIGHT, bg) ? DARK : LIGHT);

export function palettes(brand = {}) {
  const colors = (brand.colors || []).map(norm).filter(Boolean);
  const P = colors[0] || "#c2410c";
  const S = colors[1] || "#f4b41a";
  const mk = (bg, t, s, acc, bt, lay, deco) => ({ bg, t: readable(t, bg), s: readable(s, bg, 4.5), acc, bt: readable(bt, acc), lay, deco });
  return {
    A: mk(DARK, S, LIGHT, P, LIGHT, "left", "glow"),
    B: mk(S, DARK, DARK, P, LIGHT, "center", "stripes"),
    C: mk(LIGHT, P, DARK, DARK, S, "left", "circle"),
    D: mk(P, LIGHT, LIGHT, DARK, S, "center", "stripes"),
    P,
  };
}

// ---------- ilustração ----------
function burger(x, y, s) {
  let lettuce = "M10 168";
  for (let i = 0; i < 10; i++) lettuce += " q19 26 38 0";
  lettuce += " L390 150 L10 150 Z";
  const ses = [[120, 72, -20], [172, 50, 10], [232, 56, -8], [284, 82, 25], [150, 108, 5], [216, 96, -15], [306, 118, 12], [92, 124, 30]]
    .map(([a, b, r]) => `<ellipse cx="${a}" cy="${b}" rx="10" ry="5" transform="rotate(${r} ${a} ${b})" fill="#fff1d0"/>`).join("");
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="200" cy="320" rx="190" ry="14" fill="#000" opacity=".2"/>
    <rect x="22" y="240" width="356" height="72" rx="30" fill="#d4862a"/>
    <rect x="12" y="178" width="376" height="72" rx="36" fill="#4a2414"/>
    <path d="M8 172 L392 172 L370 214 L326 190 L282 228 L232 192 L178 224 L128 190 L84 220 L44 190 Z" fill="#f7c531"/>
    <path d="${lettuce}" fill="#5aa832"/>
    <path d="M14 158 C14 40 100 18 200 18 C300 18 386 40 386 158 Z" fill="#e9a03b"/>
    <path d="M62 112 C82 62 140 44 200 42" stroke="#fff" stroke-opacity=".3" stroke-width="14" fill="none" stroke-linecap="round"/>${ses}</g>`;
}

function monogram(cx, cy, r, p, name) {
  const initials = clean(name).split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "★";
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${p.acc}"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.82}" fill="none" stroke="${p.bt}" stroke-opacity=".4" stroke-width="6" stroke-dasharray="4 16"/>
    ${T(cx, cy + r * 0.24, r * 0.7, p.bt, initials, { anchor: "middle" })}`;
}

function hero(ctx, id, x, y, w, h) {
  if (h < 120) return "";
  if (ctx.photo) {
    return `<defs><clipPath id="${id}c"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="44"/></clipPath></defs>
      <image href="${ctx.photo}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id}c)"/>`;
  }
  if (ctx.isBurger) {
    const s = Math.min(w / 400, h / 335);
    return burger(x + (w - 400 * s) / 2, y + (h - 335 * s) / 2, s);
  }
  const r = Math.min(w, h) / 2.4;
  return monogram(x + w / 2, y + h / 2, r, ctx.p, ctx.name);
}

function badgeCircle(cx, cy, r, p, text) {
  const lines = wrap(text, 8, 2);
  if (!lines.length) return "";
  const longest = Math.max(...lines.map((l) => l.length));
  // ~0.66em por caractere na fonte display; o texto ocupa até 72% do diâmetro
  const size = Math.min(lines.length > 1 ? 54 : 70, Math.floor((2 * r * 0.72) / (longest * 0.66)));
  const y0 = cy - ((lines.length - 1) * size) / 2 + size * 0.35;
  return `<g transform="rotate(-10 ${cx} ${cy})"><circle cx="${cx}" cy="${cy}" r="${r}" fill="${p.acc}"/>
    <circle cx="${cx}" cy="${cy}" r="${r - 16}" fill="none" stroke="${p.bt}" stroke-opacity=".4" stroke-width="3" stroke-dasharray="6 8"/>
    ${lines.map((l, i) => T(cx, y0 + i * size, size, p.bt, l, { anchor: "middle" })).join("")}</g>`;
}

function background(id, p, W, H) {
  let s = `<rect width="${W}" height="${H}" fill="${p.bg}"/>`;
  if (p.deco === "glow") s += `<defs><radialGradient id="${id}g"><stop offset="0" stop-color="${p.acc}" stop-opacity=".5"/><stop offset="1" stop-color="${p.acc}" stop-opacity="0"/></radialGradient></defs><circle cx="${W * 0.72}" cy="${H * 0.72}" r="${W * 0.55}" fill="url(#${id}g)"/>`;
  if (p.deco === "stripes") s += `<defs><pattern id="${id}p" width="70" height="70" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="35" height="70" fill="#000" opacity=".07"/></pattern></defs><rect width="${W}" height="${H}" fill="url(#${id}p)"/>`;
  if (p.deco === "circle") s += `<circle cx="${W * 0.8}" cy="${H * 0.7}" r="${W * 0.38}" fill="${p.t}" opacity=".1"/>`;
  return s;
}

const open = (W, H) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;

function context(client, photo) {
  const brand = client.brand || {};
  const name = clean(brand.business_name || client.business || "");
  const isBurger = /burg|hamb|lanch|smash/i.test(`${brand.segment || ""} ${name}`);
  return { brand, name, isBurger, photo };
}

/**
 * spec: { title, badge, subtitle }
 * format: "feed" | "story"
 * variant: "A" | "B" | "C" | "D"
 */
export function postSVG(client, spec, format, variant, photo = null) {
  const ctx = context(client, photo);
  const p = palettes(ctx.brand)[variant];
  ctx.p = p;
  const [W, H] = SIZES[format];
  const id = "x" + crypto.randomBytes(3).toString("hex");
  const title = clean(spec.title).toUpperCase();
  const sub = clean(spec.subtitle).toUpperCase();
  const badge = clean(spec.badge).toUpperCase();
  const brandName = ctx.name.toUpperCase().slice(0, 28);
  let s = open(W, H) + background(id, p, W, H);

  if (format === "story") {
    s += T(540, 170, 40, p.t, brandName, { anchor: "middle", ls: 8 });
    const L = wrap(title, 10, 3);
    L.forEach((l, i) => { s += T(540, 400 + i * 150, 146, p.t, l, { anchor: "middle" }); });
    const yS = 400 + (L.length - 1) * 150 + 92;
    if (sub) s += T(540, yS, 46, p.s, sub, { anchor: "middle", font: BODY, weight: 600, ls: 3 });
    s += hero(ctx, id, 130, yS + 80, 820, 1560 - (yS + 80));
    if (badge) s += badgeCircle(870, yS + 150, 150, p, badge);
    s += `<rect x="230" y="1650" width="620" height="124" rx="62" fill="${p.acc}"/>` + T(540, 1729, 50, p.bt, "CHAMA NO DIRECT", { anchor: "middle", ls: 2 });
  } else if (p.lay === "left") {
    s += T(80, 130, 36, p.t, brandName, { ls: 8 });
    const L = wrap(title, 11, 3);
    L.forEach((l, i) => { s += T(74, 300 + i * 120, 116, p.t, l); });
    const yS = 300 + (L.length - 1) * 120 + 78;
    if (sub) s += T(80, yS, 40, p.s, sub, { font: BODY, weight: 600, ls: 3 });
    const hy = Math.max(yS + 60, 680);
    s += hero(ctx, id, 470, hy, 560, 1290 - hy);
    if (badge) s += badgeCircle(260, 1110, 140, p, badge);
  } else {
    s += T(540, 125, 36, p.t, brandName, { anchor: "middle", ls: 8 });
    const L = wrap(title, 14, 2);
    L.forEach((l, i) => { s += T(540, 262 + i * 108, 104, p.t, l, { anchor: "middle" }); });
    const yS = 262 + (L.length - 1) * 108 + 66;
    if (sub) s += T(540, yS, 38, p.s, sub, { anchor: "middle", font: BODY, weight: 600, ls: 3 });
    s += hero(ctx, id, 170, yS + 50, 740, 1140 - (yS + 50));
    if (badge) s += `<rect x="250" y="1180" width="580" height="112" rx="56" fill="${p.acc}"/>` + T(540, 1256, 56, p.bt, badge.slice(0, 16), { anchor: "middle", ls: 2 });
  }
  return s + "</svg>";
}

/** slides: [{heading, body}], o primeiro é a capa (usa cover_title). */
export function carouselSVGs(client, coverTitle, slides, photo = null, alt = false) {
  const ctx = context(client, photo);
  const pals = palettes(ctx.brand);
  const [W, H] = SIZES.carousel;
  const total = slides.length + 1;
  const out = [];
  const brandName = ctx.name.toUpperCase().slice(0, 28);

  // capa
  {
    const p = alt ? pals.D : pals.A;
    ctx.p = p;
    const id = "c" + crypto.randomBytes(3).toString("hex");
    let s = open(W, H) + background(id, p, W, H) + T(80, 130, 36, p.t, brandName, { ls: 8 });
    const L = wrap(clean(coverTitle).toUpperCase(), 11, 4);
    L.forEach((l, i) => { s += T(74, 320 + i * 120, 116, p.t, l); });
    const hy = 320 + (L.length - 1) * 120 + 90;
    s += hero(ctx, id, 300, hy, 700, 1180 - hy);
    s += T(1000, 1270, 34, p.s, "ARRASTA PRO LADO →", { anchor: "end", font: BODY, weight: 600, ls: 3 });
    out.push(s + "</svg>");
  }
  slides.forEach((sl, i) => {
    const p = i % 2 ? (alt ? pals.D : pals.A) : pals.C;
    const id = "c" + crypto.randomBytes(3).toString("hex");
    let s = open(W, H) + background(id, p, W, H);
    const head = wrap(clean(sl.heading).toUpperCase(), 13, 3);
    head.forEach((l, k) => { s += T(80, 300 + k * 112, 104, p.t, l); });
    const yb = 300 + (head.length - 1) * 112 + 130;
    wrap(sl.body, 28, 8).forEach((l, k) => { s += T(84, yb + k * 74, 54, p.s, l, { font: BODY, weight: 600 }); });
    s += T(80, 1270, 32, p.t, `${i + 2}/${total}`, { ls: 3 });
    s += T(1000, 1270, 30, p.t, brandName, { anchor: "end", ls: 6 });
    out.push(s + "</svg>");
  });
  return out;
}

// ---------- PNG ----------
export function renderPng(svg) {
  const r = new Resvg(svg, {
    font: { fontFiles: FONT_FILES, loadSystemFonts: false, defaultFontFamily: BODY },
    fitTo: { mode: "original" },
  });
  return r.render().asPng();
}

export const mediaDir = () => path.join(config.dataDir, "media");

export const MEDIA_NAME = /^[a-f0-9]{24}\.(png|jpg|webp)$/;
const PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function saveMedia(buffer, ext = "png") {
  if (!["png", "jpg", "webp"].includes(ext)) throw new Error("extensão não permitida");
  fs.mkdirSync(mediaDir(), { recursive: true });
  const name = `${crypto.randomBytes(12).toString("hex")}.${ext}`;
  fs.writeFileSync(path.join(mediaDir(), name), buffer);
  return name;
}

export const mediaPath = (name) => path.join(mediaDir(), path.basename(String(name)));

/** Largura e altura de PNG, JPEG ou WEBP lendo só o cabeçalho. */
export function imageSize(buf) {
  try {
    if (buf[0] === 0x89 && buf[1] === 0x50) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2;
      while (i < buf.length - 9) {
        if (buf[i] !== 0xff) { i++; continue; }
        const m = buf[i + 1];
        if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5) };
        i += 2 + buf.readUInt16BE(i + 2);
      }
    }
    if (buf.subarray(8, 12).toString("latin1") === "WEBP") {
      const kind = buf.subarray(12, 16).toString("latin1");
      if (kind === "VP8X") return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
      if (kind === "VP8 ") return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
      if (kind === "VP8L") { const b = buf.readUInt32LE(21); return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 }; }
    }
  } catch { /* cabeçalho estranho */ }
  return { w: 1000, h: 1000 };
}

/** Foto e recorte (se houver) prontos para entrar na arte. */
export function loadPhotoAssets(row) {
  const load = (file, mime) => {
    if (!file || !PHOTO_TYPES.has(mime) || !MEDIA_NAME.test(file)) return null;
    try {
      const buf = fs.readFileSync(mediaPath(file));
      return { uri: `data:${mime};base64,${buf.toString("base64")}`, ...imageSize(buf) };
    } catch { return null; }
  };
  if (!row) return { photo: null, cutout: null };
  return { photo: load(row.file, row.mime), cutout: load(row.cutout, "image/png") };
}

/** Lê uma foto salva como data URI para entrar na arte. */
export function photoDataUri(photo) {
  if (!photo || !PHOTO_TYPES.has(photo.mime) || !MEDIA_NAME.test(photo.file)) return null;
  try {
    const buf = fs.readFileSync(mediaPath(photo.file));
    return `data:${photo.mime};base64,${buf.toString("base64")}`;
  } catch { return null; }
}
