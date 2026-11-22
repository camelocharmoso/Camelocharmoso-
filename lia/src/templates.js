// Modelos de arte inspirados no repertório de referência (hamburguerias e food service).
// Cada modelo recebe: marca, paleta, textos e a foto do produto (de preferência recortada, sem fundo).
//
//  eco     título gigante repetido 3x com o produto na frente (estilo "Exagero Exagero Exagero")
//  script  título em duas cores + palavra manuscrita por cima (estilo "Nostalgia pura")
//  oferta  manchete serifada, produto no centro e etiqueta "por apenas R$ 29,90"
//  cinema  foto ocupando tudo, escurecida, com título embaixo (estilo foto de estúdio)
//  fogo    fundo escuro com brilho, faíscas, título vazado gigante e reflexo do produto
import crypto from "node:crypto";
import { clean, wrap, contrast } from "./art.js";

export const TEMPLATES = ["eco", "script", "oferta", "cinema", "fogo"];

const F = {
  black: "Inter Display", // 800 e 900
  wide: "Archivo Black",
  slab: "Alfa Slab One",
  cond: "Anton",
  script: "Great Vibes",
  body: "Inter",
};
// largura média de um caractere, em "em", para estimar quanto o texto ocupa
const WIDTH = { black: 0.62, blackUpper: 0.7, wide: 0.8, slab: 0.66, cond: 0.46, script: 0.4, body: 0.56 };

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const fit = (text, kind, maxW, maxSize, minSize = 40) => Math.max(minSize, Math.min(maxSize, Math.floor(maxW / (Math.max(1, text.length) * WIDTH[kind]))));

function T(x, y, size, fill, txt, { anchor = "start", font = F.body, weight = 600, ls = 0, opacity, rotate, stroke, strokeW } = {}) {
  const attrs = [
    `x="${x}"`, `y="${y}"`, `font-family="${font}"`, `font-size="${size}"`, `font-weight="${weight}"`,
    `text-anchor="${anchor}"`, `letter-spacing="${ls}"`,
    stroke ? `fill="none" stroke="${stroke}" stroke-width="${strokeW || 3}"` : `fill="${fill}"`,
    opacity != null ? `opacity="${opacity}"` : "",
    rotate ? `transform="rotate(${rotate} ${x} ${y})"` : "",
  ];
  return `<text ${attrs.join(" ")}>${esc(txt)}</text>`;
}

// ---------- paletas ----------
// Papéis: bg (fundo), title (cor do título), title2 (segunda cor do título), ink (escuro), light (claro),
// accent/accentInk (etiqueta de preço), soft (fundo claro do modelo oferta).
export const PALETTES = {
  brasa: { bg: "#a63f03", title: "#d9a384", title2: "#fbfcfd", ink: "#000000", light: "#fbfcfd", accent: "#000000", accentInk: "#fbfcfd", soft: "#f6e6d8", label: "Brasa (laranja queimado e preto)" },
  pop: { bg: "#f288c2", title: "#09a603", title2: "#fbfcfd", ink: "#14361a", light: "#fbfcfd", accent: "#f2c53d", accentInk: "#09a603", soft: "#ffe6f3", label: "Pop (rosa, verde e amarelo)" },
  fresh: { bg: "#f2eeb6", title: "#2a593b", title2: "#fdfcfc", ink: "#030303", light: "#fdfcfc", accent: "#030303", accentInk: "#fdfcfc", soft: "#f7f4d2", label: "Fresh (creme e verde)" },
  retro: { bg: "#f29f05", title: "#fefefc", title2: "#401202", ink: "#401202", light: "#fefefc", accent: "#a65132", accentInk: "#fefefc", soft: "#fdebc8", label: "Retrô (amarelo e marrom)" },
  street: { bg: "#0f4a22", title: "#ff6a00", title2: "#f8e6cf", ink: "#4a0d06", light: "#f8e6cf", accent: "#ff6a00", accentInk: "#4a0d06", soft: "#f8e6cf", label: "Street (verde e laranja)" },
  noite: { bg: "#140d0a", title: "#f4b41a", title2: "#fff4e0", ink: "#140d0a", light: "#fff4e0", accent: "#e2531c", accentInk: "#fff4e0", soft: "#f3e3cf", label: "Noite (preto, dourado e brasa)" },
};

const HEX = /^#?([0-9a-f]{6})$/i;
const norm = (c) => { const m = HEX.exec(String(c || "").trim()); return m ? "#" + m[1].toLowerCase() : null; };
function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (s) => [(s >> 16) & 255, (s >> 8) & 255, s & 255];
  const [x, y] = [ch(pa), ch(pb)];
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
}
const pick = (bg, ...cands) => cands.reduce((best, c) => (contrast(c, bg) > contrast(best, bg) ? c : best));

/** Paleta do cliente: as cores da marca têm prioridade; depois o preset escolhido; depois o padrão do segmento. */
export function paletteFor(brand = {}) {
  const colors = (brand.colors || []).map(norm).filter(Boolean);
  if (colors.length) {
    const P = colors[0];
    const S = colors[1] || mix(P, "#ffffff", 0.7);
    const light = "#fbfaf7";
    const ink = contrast(P, "#000000") > 7 ? mix(P, "#000000", 0.75) : "#121212";
    return {
      bg: P,
      title: contrast(S, P) >= 2.2 ? S : pick(P, light, ink),
      title2: pick(P, light, ink),
      ink, light,
      accent: contrast(ink, P) >= 2 ? ink : S,
      accentInk: pick(contrast(ink, P) >= 2 ? ink : S, light, ink),
      soft: mix(P, "#ffffff", 0.88),
      label: "cores da marca",
    };
  }
  if (brand.palette && PALETTES[brand.palette]) return PALETTES[brand.palette];
  return /burg|hamb|lanch|smash|grill|churras/i.test(`${brand.segment || ""}`) ? PALETTES.brasa : PALETTES.retro;
}

// ---------- peças ----------
function seeded(seed) {
  let h = crypto.createHash("sha256").update(String(seed)).digest().readUInt32LE(0) || 1;
  return () => ((h = (h * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/** Palavras gigantes e apagadas no fundo (as "UH YEAH / YUMMY" das referências, em português). */
function texture(W, H, color, words, opacity = 0.08) {
  const rows = Math.ceil(H / 150);
  let s = `<g opacity="${opacity}">`;
  for (let r = 0; r < rows; r++) {
    const line = Array(6).fill(words[r % words.length]).join("  ");
    s += T(r % 2 ? -220 : -40, 140 + r * 150, 150, color, line, { font: F.cond, weight: 400, ls: 4 });
  }
  return s + "</g>";
}

/** Produto: recorte (melhor), foto emoldurada ou ilustração. Devolve o SVG e a caixa ocupada. */
function product(ctx, x, y, w, h, { align = "bottom", frameRotate = -3 } = {}) {
  const id = ctx.id();
  if (ctx.cutout) {
    const r = ctx.cutout.w / ctx.cutout.h;
    let pw = w, ph = w / r;
    if (ph > h) { ph = h; pw = h * r; }
    const px = x + (w - pw) / 2;
    const py = align === "bottom" ? y + h - ph : y + (h - ph) / 2;
    const shadow = `<ellipse cx="${px + pw / 2}" cy="${py + ph - 6}" rx="${pw * 0.46}" ry="${Math.max(14, ph * 0.045)}" fill="#000" opacity=".28"/>`;
    return { svg: shadow + `<image href="${ctx.cutout.uri}" x="${px}" y="${py}" width="${pw}" height="${ph}" preserveAspectRatio="xMidYMid meet"/>`, box: { x: px, y: py, w: pw, h: ph } };
  }
  if (ctx.photo) {
    const pad = 16;
    const cx = x + w / 2, cy = y + h / 2;
    const svg = `<g transform="rotate(${frameRotate} ${cx} ${cy})">
      <rect x="${x + 6}" y="${y + 14}" width="${w}" height="${h}" rx="34" fill="#000" opacity=".25"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="34" fill="#fbfaf7"/>
      <defs><clipPath id="${id}"><rect x="${x + pad}" y="${y + pad}" width="${w - 2 * pad}" height="${h - 2 * pad}" rx="22"/></clipPath></defs>
      <image href="${ctx.photo.uri}" x="${x + pad}" y="${y + pad}" width="${w - 2 * pad}" height="${h - 2 * pad}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/></g>`;
    return { svg, box: { x, y, w, h } };
  }
  // sem foto: ilustração simples (só para não sair vazio; a Lia pede fotos ao cliente)
  const s = Math.min(w / 400, h / 335);
  return { svg: burgerIllustration(x + (w - 400 * s) / 2, y + h - 335 * s, s), box: { x, y: y + h - 335 * s, w, h: 335 * s } };
}

function burgerIllustration(x, y, s) {
  let lettuce = "M10 168";
  for (let i = 0; i < 10; i++) lettuce += " q19 26 38 0";
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="200" cy="320" rx="190" ry="14" fill="#000" opacity=".22"/>
    <rect x="22" y="240" width="356" height="72" rx="30" fill="#d4862a"/>
    <rect x="12" y="178" width="376" height="72" rx="36" fill="#4a2414"/>
    <path d="M8 172 L392 172 L370 214 L326 190 L282 228 L232 192 L178 224 L128 190 L84 220 L44 190 Z" fill="#f7c531"/>
    <path d="${lettuce} L390 150 L10 150 Z" fill="#5aa832"/>
    <path d="M14 158 C14 40 100 18 200 18 C300 18 386 40 386 158 Z" fill="#e9a03b"/></g>`;
}

/** "R$ 29,90" → { cur: "R$", int: "29", cents: "90" }; outros textos (ex.: "20% OFF") → null. */
export function parsePrice(badge) {
  const m = /R\$\s?(\d{1,4})(?:[,.](\d{2}))?/i.exec(badge || "");
  return m ? { cur: "R$", int: m[1], cents: m[2] || "" } : null;
}

/** Etiqueta em gota (canto inferior esquerdo reto), como "R$29" das referências. */
function priceDrop(cx, cy, p, badge) {
  if (!badge) return "";
  const price = parsePrice(badge);
  const txt = price ? `R$${price.int}${price.cents ? "," + price.cents : ""}` : badge.toUpperCase();
  const size = fit(txt, "wide", 230, 64, 34);
  const w = Math.max(190, txt.length * size * 0.78 + 70), h = size * 2.1;
  const x = cx - w / 2, y = cy - h / 2, r = h / 2;
  return `<g transform="rotate(-6 ${cx} ${cy})">
    <path d="M${x} ${y + r} A${r} ${r} 0 0 1 ${x + r} ${y} H${x + w - r} A${r} ${r} 0 0 1 ${x + w} ${y + r} A${r} ${r} 0 0 1 ${x + w - r} ${y + h} H${x} Z" fill="${p.accent}"/>
    ${T(cx, cy + size * 0.36, size, p.accentInk, txt, { anchor: "middle", font: F.wide, weight: 400, ls: -1 })}</g>`;
}

/** Placa "por apenas R$ 20,90 unid" com seta, do modelo oferta. */
function pricePlaque(x, y, p, badge) {
  if (!badge) return "";
  const price = parsePrice(badge);
  const w = 360, h = 170;
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="36" fill="${p.ink}"/>
    <path d="M${x + w - 6} ${y + h / 2 - 40} L${x + w + 52} ${y + h / 2} L${x + w - 6} ${y + h / 2 + 40} Z" fill="${p.accent === p.ink ? p.bg : p.accent}"/>`;
  const hi = contrast(p.accent, p.ink) > 2.5 ? p.accent : pick(p.ink, p.light, p.bg);
  if (price) {
    s += T(x + w / 2 + 10, y + 46, 34, hi, "por apenas", { anchor: "middle", font: F.slab, weight: 400 });
    s += `<circle cx="${x + 44}" cy="${y + 108}" r="26" fill="${hi}"/>` + T(x + 44, y + 117, 24, p.ink, "R$", { anchor: "middle", font: F.wide, weight: 400 });
    const intSize = price.int.length > 2 ? 92 : 112;
    s += T(x + 84, y + 146, intSize, p.light, price.int, { font: F.wide, weight: 400, ls: -4 });
    const cx = x + 84 + price.int.length * intSize * 0.74;
    if (price.cents) s += T(cx, y + 100, 50, p.light, "," + price.cents, { font: F.wide, weight: 400 });
    s += T(cx + 6, y + 144, 22, hi, "unid", { font: F.body, weight: 600 });
  } else {
    const size = fit(badge, "wide", w - 50, 70, 34);
    s += T(x + w / 2, y + h / 2 + size * 0.36, size, p.light, badge.toUpperCase(), { anchor: "middle", font: F.wide, weight: 400 });
  }
  return s;
}

function footer(ctx, W, y, color) {
  const b = ctx.brand;
  const bits = [b.instagram && (b.instagram.startsWith("@") ? b.instagram : "@" + b.instagram), b.location, b.hours].filter(Boolean).map(clean);
  if (!bits.length) return "";
  const txt = bits.join("  ·  ").slice(0, 70);
  return T(W / 2, y, 28, color, txt, { anchor: "middle", font: F.body, weight: 600, opacity: 0.85 });
}

function brandTag(ctx, W, y, color) {
  return T(W / 2, y, 30, color, ctx.name.toUpperCase().slice(0, 30), { anchor: "middle", font: F.black, weight: 800, ls: 7 });
}

function storyCta(W, H, p) {
  return `<rect x="${W / 2 - 300}" y="${H - 190}" width="600" height="110" rx="55" fill="${p.accent}"/>` +
    T(W / 2, H - 120, 44, p.accentInk, "CHAMA NO DIRECT", { anchor: "middle", font: F.wide, weight: 400, ls: 2 });
}

// ---------- modelos ----------
/** Medidas verticais: no story o conteúdo começa mais perto do topo e o produto cresce. */
const frame = (H) => (H > 1350 ? { oy: 150, end: H - 330, foot: H - 250 } : { oy: 0, end: 1220, foot: 1300 });
function eco(ctx, W, H) {
  const p = ctx.pal;
  const { oy, end, foot } = frame(H);
  const word = clean(ctx.spec.title).split(" ").length <= 2 ? clean(ctx.spec.title) : wrap(ctx.spec.title, 12, 1)[0];
  const size = fit(word, "black", 950, 240, 110);
  const step = Math.round(size * 0.84);
  const y0 = oy + 220 + size * 0.72;
  let s = `<rect width="${W}" height="${H}" fill="${p.bg}"/>` + texture(W, H, p.title, ctx.words, 0.07);
  s += brandTag(ctx, W, oy + 120, p.title);
  // com recorte o produto fica na frente da 3ª linha; com foto emoldurada, só 2 linhas
  const colors = ctx.cutout ? [p.title, p.title2, p.title] : [p.title, p.title2];
  colors.forEach((c, i) => { s += T(W / 2, y0 + i * step, size, c, word, { anchor: "middle", font: F.black, weight: 900, ls: -size * 0.04 }); });
  const top = ctx.cutout ? y0 + step * 1.35 : y0 + step * 1.0 + 40;
  const prod = product(ctx, 110, top, 860, end - top);
  s += prod.svg;
  s += priceDrop(Math.min(W - 190, prod.box.x + prod.box.w * 0.62), prod.box.y + 10, p, ctx.spec.badge);
  s += footer(ctx, W, foot, p.title);
  if (H > 1350) s += storyCta(W, H, p);
  return s;
}

function script(ctx, W, H) {
  const p = ctx.pal;
  const { oy, end, foot } = frame(H);
  const word = wrap(ctx.spec.title, 11, 1)[0];
  const size = fit(word, "black", 940, 210, 100);
  const y1 = oy + 200 + size * 0.75;
  const y2 = y1 + size * 0.86;
  let s = `<rect width="${W}" height="${H}" fill="${p.bg}"/>` + texture(W, H, p.ink, ctx.words, 0.06);
  s += brandTag(ctx, W, oy + 120, p.title2);
  s += T(W / 2, y1, size, p.title2, word, { anchor: "middle", font: F.black, weight: 900, ls: -size * 0.04 });
  s += T(W / 2, y2, size, p.title, word, { anchor: "middle", font: F.black, weight: 900, ls: -size * 0.04 });
  const top = y2 + size * 0.05;
  const prod = product(ctx, 120, top, 840, end + 10 - top);
  s += prod.svg;
  // palavra manuscrita por cima de tudo, com sombra leve para ler sobre o título e o produto
  const sub = clean(ctx.spec.subtitle).toLowerCase();
  if (sub) {
    const ss = fit(sub, "script", 760, 200, 100);
    const sy = y2 + ss * 0.12;
    s += T(W / 2 + 34, sy + 5, ss, "#000000", sub, { anchor: "middle", font: F.script, weight: 400, rotate: -7, opacity: 0.3 });
    s += T(W / 2 + 30, sy, ss, p.light, sub, { anchor: "middle", font: F.script, weight: 400, rotate: -7 });
  }
  if (ctx.spec.badge) {
    const cx = Math.min(W - 160, prod.box.x + prod.box.w * 0.86), cy = prod.box.y + 40;
    const txt = (parsePrice(ctx.spec.badge) ? "R$" + parsePrice(ctx.spec.badge).int : ctx.spec.badge.toUpperCase()).slice(0, 9);
    s += `<path d="M${cx - 95} ${cy} a95 95 0 1 1 95 95 H${cx - 95} Z" fill="${p.accent}" transform="rotate(8 ${cx} ${cy})"/>`;
    s += T(cx, cy + 20, fit(txt, "wide", 160, 56, 30), p.accentInk, txt, { anchor: "middle", font: F.wide, weight: 400 });
  }
  s += footer(ctx, W, foot, p.title2);
  if (H > 1350) s += storyCta(W, H, p);
  return s;
}

function oferta(ctx, W, H) {
  const p = ctx.pal;
  const { oy, end, foot } = frame(H);
  const bg = p.soft;
  const titleColor = pick(bg, p.ink, p.bg);
  const subColor = contrast(p.bg, bg) >= 2.5 ? p.bg : p.accent;
  let s = `<rect width="${W}" height="${H}" fill="${bg}"/>`;
  // formas orgânicas nos cantos (as "manchas" das referências)
  s += `<path d="M0 ${oy + 380} C120 ${oy + 300} 60 ${oy + 120} 0 ${oy + 60} Z M0 ${H} L0 ${H - 420} C140 ${H - 360} 220 ${H - 200} 180 ${H} Z" fill="${p.bg}"/>`;
  s += `<path d="M${W} ${oy + 900} C${W - 160} ${oy + 980} ${W - 120} ${oy + 1180} ${W} ${oy + 1250} Z" fill="${p.bg}" opacity=".9"/>`;
  // selo do nome no topo
  const nm = ctx.name.toUpperCase().slice(0, 26);
  const tw = Math.max(240, nm.length * 19 + 70);
  s += `<rect x="${W / 2 - tw / 2}" y="${oy + 70}" width="${tw}" height="64" rx="32" fill="${p.bg}"/>` + T(W / 2, oy + 113, 28, pick(p.bg, p.light, p.ink), nm, { anchor: "middle", font: F.black, weight: 800, ls: 5 });
  const lines = wrap(ctx.spec.title, 13, 2);
  const size = Math.min(...lines.map((l) => fit(l, "slab", 900, 128, 70)));
  lines.forEach((l, i) => { s += T(W / 2, oy + 250 + size * 0.78 + i * size * 0.98, size, titleColor, l, { anchor: "middle", font: F.slab, weight: 400, ls: -1 }); });
  let yNext = oy + 250 + size * 0.78 + (lines.length - 1) * size * 0.98;
  const sub = clean(ctx.spec.subtitle);
  if (sub) { yNext += 78; s += T(W / 2, yNext, fit(sub, "slab", 820, 54, 30), subColor, sub, { anchor: "middle", font: F.slab, weight: 400 }); }
  const top = yNext + 40;
  const prod = product(ctx, 150, top, 780, end - 10 - top);
  s += prod.svg;
  s += pricePlaque(130, Math.min(end - 180, prod.box.y + prod.box.h - 150), p, ctx.spec.badge);
  s += footer(ctx, W, foot, titleColor);
  if (H > 1350) s += storyCta(W, H, p);
  return s;
}

function cinema(ctx, W, H) {
  const p = ctx.pal;
  const id = ctx.id();
  let s = `<rect width="${W}" height="${H}" fill="#0d0a08"/>`;
  const src = ctx.photo || null;
  if (src) s += `<image href="${src.uri}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>`;
  else s += product(ctx, 120, H * 0.18, W - 240, H * 0.5, { align: "center" }).svg;
  s += `<defs>
    <linearGradient id="${id}t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".65"/><stop offset=".3" stop-color="#000" stop-opacity="0"/></linearGradient>
    <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".9"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#${id}t)"/><rect width="${W}" height="${H}" fill="url(#${id}b)"/>`;
  s += T(70, 110, 30, "#ffffff", ctx.name.toUpperCase().slice(0, 30), { font: F.black, weight: 800, ls: 8 });
  const lines = wrap(clean(ctx.spec.title).toUpperCase(), 13, 3);
  const size = Math.min(...lines.map((l) => fit(l, "wide", 900, 124, 60)));
  const sub = clean(ctx.spec.subtitle);
  const bottom = H - (H > 1350 ? 300 : 120) - (sub ? 70 : 0);
  lines.forEach((l, i) => { s += T(66, bottom - (lines.length - 1 - i) * size * 1.02, size, "#ffffff", l, { font: F.wide, weight: 400, ls: -1 }); });
  if (sub) s += T(70, bottom + 72, 40, p.title === p.bg ? "#ffffff" : pick("#000000", p.title, p.accent, "#ffffff"), sub.toUpperCase(), { font: F.body, weight: 600, ls: 3 });
  if (ctx.spec.badge) {
    const txt = ctx.spec.badge.toUpperCase();
    const bs = fit(txt, "wide", 300, 52, 30);
    const bw = txt.length * bs * 0.8 + 70;
    const by = bottom - (lines.length - 1) * size * 1.02 - size - 70;
    s += `<rect x="66" y="${by - bs - 22}" width="${bw}" height="${bs * 1.9}" rx="${bs * 0.95}" fill="${p.accent === p.ink ? p.bg : p.accent}"/>`;
    s += T(66 + bw / 2, by + bs * 0.1, bs, pick(p.accent === p.ink ? p.bg : p.accent, "#ffffff", "#111111"), txt, { anchor: "middle", font: F.wide, weight: 400 });
  }
  if (H > 1350) s += storyCta(W, H, p);
  return s;
}

function fogo(ctx, W, H) {
  const p = ctx.pal;
  const id = ctx.id();
  const glow = p.bg === PALETTES.noite.bg ? p.accent : p.bg;
  const rnd = seeded(ctx.spec.title + W + H);
  let s = `<rect width="${W}" height="${H}" fill="#0b0807"/>
    <defs><radialGradient id="${id}g" cx="50%" cy="55%" r="55%"><stop offset="0" stop-color="${glow}" stop-opacity=".85"/><stop offset=".55" stop-color="${glow}" stop-opacity=".25"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#${id}g)"/>`;
  for (let i = 0; i < 70; i++) {
    const r = 1.5 + rnd() * 4.5;
    s += `<circle cx="${(rnd() * W).toFixed(0)}" cy="${(rnd() * H).toFixed(0)}" r="${r.toFixed(1)}" fill="${rnd() > 0.5 ? "#ffb347" : "#ff6a2b"}" opacity="${(0.25 + rnd() * 0.6).toFixed(2)}"/>`;
  }
  const word = wrap(clean(ctx.spec.title).toUpperCase(), 9, 1)[0];
  const big = fit(word, "wide", 1000, 260, 120);
  s += T(W / 2, H * 0.3 + big * 0.35, big, "none", word, { anchor: "middle", font: F.wide, weight: 400, stroke: "#ffffff", strokeW: 4, opacity: 0.55 });
  s += brandTag(ctx, W, 110, "#ffffff");
  const top = H * 0.27, bottom = H * (H > 1350 ? 0.74 : 0.78);
  const prod = product(ctx, 130, top, W - 260, bottom - top);
  if (ctx.cutout) {
    const b = prod.box;
    s += `<defs><linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <mask id="${id}m"><rect x="0" y="${b.y + b.h}" width="${W}" height="${b.h}" fill="url(#${id}f)"/></mask></defs>
      <g mask="url(#${id}m)"><image href="${ctx.cutout.uri}" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" transform="translate(0 ${2 * (b.y + b.h)}) scale(1 -1)"/></g>`;
  }
  s += prod.svg;
  const lines = wrap(clean(ctx.spec.title).toUpperCase(), 14, 2);
  const size = Math.min(...lines.map((l) => fit(l, "wide", 940, 96, 54)));
  const ty = bottom + size + 40;
  lines.forEach((l, i) => { s += T(W / 2, ty + i * size * 1.02, size, "#ffffff", l, { anchor: "middle", font: F.wide, weight: 400 }); });
  if (ctx.spec.badge) s += priceDrop(W - 210, top + 60, { ...p, accent: glow, accentInk: pick(glow, "#ffffff", "#111111") }, ctx.spec.badge);
  if (H > 1350) s += storyCta(W, H, { ...p, accent: glow, accentInk: pick(glow, "#ffffff", "#111111") });
  return s;
}

const BUILDERS = { eco, script, oferta, cinema, fogo };

/**
 * Monta a arte.
 * input: { client, spec: {title, badge, subtitle}, template, format: "feed"|"story", photo: {uri,w,h}|null, cutout: {uri,w,h}|null }
 */
export function renderTemplate({ client, spec, template, format = "feed", photo = null, cutout = null }) {
  const W = 1080, H = format === "story" ? 1920 : 1350;
  const brand = client.brand || {};
  let n = 0;
  const salt = crypto.randomBytes(3).toString("hex");
  const ctx = {
    brand,
    name: clean(brand.business_name || client.business || ""),
    pal: paletteFor(brand),
    spec: { title: clean(spec.title) || clean(client.business), badge: clean(spec.badge), subtitle: clean(spec.subtitle) },
    photo, cutout,
    words: /burg|hamb|lanch|smash/i.test(`${brand.segment || ""}`) ? ["SUCULENTO", "NA BRASA", "PEÇA JÁ", "SABOR"] : ["NOVIDADE", "PEÇA JÁ", "QUALIDADE", "SABOR"],
    id: () => `t${salt}${++n}`,
  };
  const build = BUILDERS[template] || eco;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${build(ctx, W, H)}</svg>`;
}

/** Quais modelos combinam com o pedido e com o material que o cliente mandou. */
export function templatesFor(style, { hasCutout, hasPhoto }) {
  const byStyle = {
    promo: ["oferta", "eco", "script", "fogo", "cinema"],
    premium: ["cinema", "fogo", "eco", "script", "oferta"],
    divertido: ["script", "eco", "oferta", "fogo", "cinema"],
    auto: ["eco", "oferta", "script", "fogo", "cinema"],
  };
  let list = byStyle[style] || byStyle.auto;
  if (!hasCutout && hasPhoto) list = ["cinema", ...list.filter((t) => t !== "cinema" && t !== "fogo")];
  if (!hasCutout && !hasPhoto) list = list.filter((t) => t !== "cinema");
  return list;
}
