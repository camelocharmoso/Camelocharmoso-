// Modelos de arte inspirados no repertório de referência (hamburguerias e food service).
// Cada modelo recebe: marca, paleta, textos e a foto do produto (de preferência recortada, sem fundo).
//
//  eco     título gigante repetido 3x com o produto na frente (estilo "Exagero Exagero Exagero")
//  script  título em duas cores + palavra manuscrita por cima (estilo "Nostalgia pura")
//  oferta  manchete serifada, produto no centro e etiqueta "por apenas R$ 29,90"
//  cinema  foto ocupando tudo, escurecida, com título embaixo (estilo foto de estúdio)
//  fogo    fundo escuro com brilho, faíscas, título vazado gigante e reflexo do produto
import crypto from "node:crypto";
import QRCode from "qrcode";
import { clean, wrap, contrast } from "./art.js";

//  splash  título arredondado em 2 cores, produto na frente, selo de preço em explosão, xadrez de losangos
//  arco    título curvo por cima do produto e palavra de destaque embaixo (estilo "Seu novo vício")
//  enquete post de engajamento com pergunta e opções A, B, C, D
//  frase   frase de efeito numa caixa ondulada com palavra destacada (não precisa de foto)
//  combo   palavra gigante acima e abaixo do produto, fita ondulada e selo redondo (estilo "COMBO")
//  destaque título à esquerda, produto enorme saindo pela borda e etiqueta de preço vertical
//  versus   dois lanches lado a lado em cartões ("qual a sua escolha hoje?")
//  fichado  régua de altura de delegacia com carimbo "CULPADO" (humor)
//  epico    fundo escuro cinematográfico: brilho, fumaça, faíscas, luz de contorno, título metálico e escudo de preço
export const TEMPLATES = ["epico", "eco", "script", "oferta", "cinema", "fogo", "splash", "arco", "enquete", "frase", "combo", "destaque", "versus", "fichado"];

const F = {
  black: "Inter Display", // 800 e 900
  wide: "Archivo Black",
  slab: "Alfa Slab One",
  cond: "Anton",
  script: "Great Vibes",
  round: "Bagel Fat One",
  serif: "Instrument Serif",
  body: "Inter",
};
// largura média de um caractere, em "em", para estimar quanto o texto ocupa
const WIDTH = { round: 0.74, black: 0.62, blackUpper: 0.7, wide: 0.8, slab: 0.66, cond: 0.46, script: 0.4, body: 0.56 };

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const fit = (text, kind, maxW, maxSize, minSize = 40) => Math.max(minSize, Math.min(maxSize, Math.floor(maxW / (Math.max(1, text.length) * WIDTH[kind]))));

let THEMED = null; // fonte temática ativa (só para títulos grandes)
function T(x, y, size, fill, txt, { anchor = "start", font = F.body, weight = 600, ls = 0, opacity, rotate, stroke, strokeW, italic } = {}) {
  // fonte temática (gótica, por exemplo) só fica legível em tamanho grande
  if (THEMED && font === THEMED && size < 56) font = "Archivo Black";
  const attrs = [
    italic ? `font-style="italic"` : "",
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

/** Logo do cliente (PNG com fundo transparente), centralizado em cx, com a altura pedida. */
function logoImg(ctx, cx, top, h) {
  const l = ctx.logo;
  const w = h * (l.w / l.h);
  return `<image href="${l.uri}" x="${cx - w / 2}" y="${top}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>`;
}

function brandTag(ctx, W, y, color) {
  if (ctx.logo) return logoImg(ctx, W / 2, Math.max(16, y - 110), 175);
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
  if (ctx.logo) s += logoImg(ctx, W / 2, oy + 30, 170);
  else s += `<rect x="${W / 2 - tw / 2}" y="${oy + 70}" width="${tw}" height="64" rx="32" fill="${p.bg}"/>` + T(W / 2, oy + 113, 28, pick(p.bg, p.light, p.ink), nm, { anchor: "middle", font: F.black, weight: 800, ls: 5 });
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
  s += qrTag(ctx, W - 470, end - 210, 5);
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
  s += ctx.logo ? logoImg(ctx, 160, 36, 230) : T(70, 110, 30, "#ffffff", ctx.name.toUpperCase().slice(0, 30), { font: F.black, weight: 800, ls: 8 });
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


// ---------- peças dos modelos novos ----------
/** Selo em explosão (splat) com "POR APENAS R$21". */
function starburst(cx, cy, r, fill, ink, badge, seed, label = "POR APENAS") {
  if (!badge) return "";
  const rnd = seeded(seed);
  const n = 14;
  let d = "";
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI * i) / n - Math.PI / 2;
    const rr = i % 2 ? r * (0.55 + rnd() * 0.12) : r * (0.85 + rnd() * 0.55);
    d += `${i ? "L" : "M"}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)} `;
  }
  const price = parsePrice(badge);
  let s = `<path d="${d}Z" fill="${fill}" stroke="${fill}" stroke-width="14" stroke-linejoin="round"/>`;
  if (price) {
    s += T(cx, cy - r * 0.2, Math.round(r * 0.13), ink, label, { anchor: "middle", font: F.body, weight: 600, ls: 1 });
    const big = Math.round(r * (price.int.length > 2 ? 0.42 : 0.52));
    s += T(cx - big * 0.55, cy + big * 0.55, Math.round(big * 0.34), ink, "R$", { anchor: "end", font: F.wide, weight: 400 });
    s += T(cx - big * 0.5, cy + big * 0.55, big, ink, price.int, { font: F.wide, weight: 400, ls: -3 });
  } else {
    const t = badge.toUpperCase();
    s += T(cx, cy + r * 0.12, fit(t, "wide", r * 1.3, r * 0.4, 24), ink, t, { anchor: "middle", font: F.wide, weight: 400 });
  }
  return s;
}

/** Faixa "//// PROMOÇÃO RELÂMPAGO DE HOJE". */
function kicker(W, y, color, text) {
  if (!text) return "";
  const t = clean(text).toUpperCase().slice(0, 40);
  const tw = t.length * 15;
  const x0 = W / 2 - (tw + 110) / 2;
  let s = "";
  for (let i = 0; i < 4; i++) s += `<path d="M${x0 + i * 22 + 10} ${y + 6} l14 -34 h12 l-14 34 Z" fill="${color}"/>`;
  return s + T(x0 + 110, y - 4, 24, color, t, { font: F.body, weight: 600, ls: 5 });
}

/** Bloco de descrição em caixa alta espaçada ("CARNE SUCULENTA, BACON CROCANTE..."). */
function details(x, y, maxChars, color, text, anchor = "start") {
  if (!text) return "";
  return wrap(clean(text).toUpperCase(), maxChars, 4).map((l, i) => T(x, y + i * 34, 25, color, l, { anchor, font: F.body, weight: 600, ls: 3 })).join("");
}

/** Rodapé de pedido: "PEÇA AGORA! 81 99999-9999 · também no iFood". Só texto, sem logos de terceiros. */
function orderBar(ctx, W, y, color) {
  const b = ctx.brand;
  const bits = [];
  if (b.whatsapp) bits.push(`PEÇA AGORA! ${clean(b.whatsapp)}`);
  if (b.delivery) bits.push(`TAMBÉM NO ${clean(b.delivery).toUpperCase()}`);
  if (!bits.length) return footer(ctx, W, y, color);
  return T(W / 2, y, 26, color, bits.join("   ·   ").slice(0, 80), { anchor: "middle", font: F.body, weight: 600, ls: 2 });
}

/** Fundo xadrez de losangos (harlequim) na parte de baixo. */
function harlequin(id, W, H, y0, a, b) {
  const s = 220;
  return `<defs><pattern id="${id}h" width="${s}" height="${s}" patternUnits="userSpaceOnUse" patternTransform="rotate(45 ${W / 2} ${y0})">
      <rect width="${s}" height="${s}" fill="${a}"/><rect width="${s / 2}" height="${s / 2}" fill="${b}"/><rect x="${s / 2}" y="${s / 2}" width="${s / 2}" height="${s / 2}" fill="${b}"/></pattern></defs>
    <rect x="0" y="${y0}" width="${W}" height="${H - y0}" fill="url(#${id}h)"/>`;
}

/** Caixa com bordas onduladas (posts de frase). */
function wavyBox(x, y, w, h, amp, seed) {
  const rnd = seeded(seed);
  const pts = [];
  const step = 46;
  const edge = (x1, y1, x2, y2, nx, ny) => {
    const len = Math.hypot(x2 - x1, y2 - y1), n = Math.max(2, Math.round(len / step));
    for (let i = 0; i < n; i++) {
      const t = i / n, k = (i % 2 ? 1 : -1) * amp * (0.6 + rnd() * 0.5);
      pts.push([x1 + (x2 - x1) * t + nx * k, y1 + (y2 - y1) * t + ny * k]);
    }
  };
  edge(x, y, x + w, y, 0, -1); edge(x + w, y, x + w, y + h, 1, 0); edge(x + w, y + h, x, y + h, 0, 1); edge(x, y + h, x, y, -1, 0);
  // curva suave passando pelos pontos (Catmull-Rom → Bézier)
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length; i++) {
    const p0 = pts[(i - 1 + pts.length) % pts.length], p1 = pts[i], p2 = pts[(i + 1) % pts.length], p3 = pts[(i + 2) % pts.length];
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d + " Z";
}

// ---------- modelos novos ----------
function splash(ctx, W, H) {
  const p = ctx.pal;
  const { oy, end, foot } = frame(H);
  const id = ctx.id();
  const bg = p.bg === PALETTES.noite.bg ? p.accent : p.bg;
  const dark = pick(bg, p.ink, "#0d0f14");
  const light = pick(bg, p.light, "#ffffff");
  let s = `<rect width="${W}" height="${H}" fill="${bg}"/>` + harlequin(id, W, H, oy + 780, bg, dark);
  s += kicker(W, oy + 120, dark, ctx.spec.kicker || "PROMOÇÃO RELÂMPAGO DE HOJE");
  const words = clean(ctx.spec.title).toUpperCase().split(" ");
  const half = Math.ceil(words.length / 2);
  const [l1, l2] = words.length > 1 ? [words.slice(0, half).join(" "), words.slice(half).join(" ")] : [words[0], ""];
  const sz1 = fit(l1, "round", 900, 190, 80), sz2 = l2 ? fit(l2, "round", 980, 210, 80) : 0;
  const y1 = oy + 210 + sz1 * 0.8;
  s += T(W / 2, y1, sz1, light, l1, { anchor: "middle", font: F.round, weight: 400 });
  const y2 = y1 + sz2 * 0.92;
  if (l2) s += T(W / 2, y2, sz2, dark, l2, { anchor: "middle", font: F.round, weight: 400 });
  const top = (l2 ? y2 : y1) - (l2 ? sz2 : sz1) * 0.32;
  const prod = product(ctx, 90, top, 900, end - 50 - top);
  s += prod.svg;
  s += starburst(Math.min(W - 230, prod.box.x + prod.box.w * 0.78), prod.box.y + prod.box.h * 0.62, 150, dark, light, ctx.spec.badge, ctx.spec.title + "s");
  const bandY = end - (ctx.spec.details ? 34 : -30);
  s += `<rect x="0" y="${bandY}" width="${W}" height="${(H > 1350 ? foot + 40 : H) - bandY}" fill="${dark}" opacity=".92"/>`;
  s += details(W / 2, end + 6, 46, light, ctx.spec.details, "middle");
  s += orderBar(ctx, W, foot + 10, light);
  if (H > 1350) s += storyCta(W, H, { ...p, accent: dark, accentInk: light });
  return s;
}

function arco(ctx, W, H) {
  const p = ctx.pal;
  const { oy, end, foot } = frame(H);
  const id = ctx.id();
  const bg = "#0d0f14";
  const hot = contrast(p.accent, bg) > 3 ? p.accent : contrast(p.bg, bg) > 3 ? p.bg : p.title;
  let s = `<rect width="${W}" height="${H}" fill="${bg}"/>`;
  s += kicker(W, oy + 110, "#ffffff", ctx.spec.kicker || "PROMOÇÃO RELÂMPAGO DE HOJE");
  // título em arco por cima do produto
  const words = clean(ctx.spec.title).toUpperCase().split(" ");
  const last = words.length > 1 ? words.pop() : "";
  const arcText = words.join(" ");
  const cx = W / 2, cy = oy + 700, r = 380;
  const arcSize = fit(arcText, "round", 1000, 104, 56);
  s += `<defs><path id="${id}a" d="M${cx - r} ${cy} A${r} ${r * 0.82} 0 0 1 ${cx + r} ${cy}"/></defs>`;
  s += `<text font-family="${F.round}" font-size="${arcSize}" fill="#ffffff" letter-spacing="2"><textPath href="#${id}a" startOffset="50%" text-anchor="middle">${esc(arcText)}</textPath></text>`;
  const prod = product(ctx, 230, oy + 470, 620, 460, { align: "center" });
  s += prod.svg;
  if (ctx.spec.badge) s += priceDrop(W - 200, oy + 640, { ...p, accent: hot, accentInk: pick(hot, "#ffffff", "#111111") }, ctx.spec.badge);
  if (last) {
    const lz = fit(last, "round", 900, 180, 90);
    s += T(W / 2, oy + 945 + lz * 0.72, lz, hot, last, { anchor: "middle", font: F.round, weight: 400 });
  }
  s += `<path d="M${W / 2} ${end - 100} l10 18 l18 10 l-18 10 l-10 18 l-10 -18 l-18 -10 l18 -10 Z" fill="none" stroke="${hot}" stroke-width="3"/>`;
  s += details(W / 2, end + 2, 52, "#ffffff", ctx.spec.details, "middle");
  s += orderBar(ctx, W, foot + 10, "#ffffff");
  if (H > 1350) s += storyCta(W, H, { ...p, accent: hot, accentInk: pick(hot, "#ffffff", "#111111") });
  return s;
}

function enquete(ctx, W, H) {
  const p = ctx.pal;
  const { oy, foot } = frame(H);
  const dark = "#0d0f14";
  const hot = contrast(p.accent, dark) > 3 ? p.accent : contrast(p.bg, dark) > 3 ? p.bg : "#ff4d1a";
  let s = `<rect width="${W}" height="${H}" fill="${dark}"/>`;
  // produto saindo pelas laterais
  if (ctx.cutout || ctx.photo) {
    const py = (oy + foot) / 2 - 260;
    s += product(ctx, -300, py, 560, 520, { align: "center", frameRotate: 6 }).svg;
    s += product(ctx, W - 260, py, 560, 520, { align: "center", frameRotate: -6 }).svg;
  }
  const words = clean(ctx.spec.title || "Hora da enquete!").toUpperCase().split(" ");
  const half = Math.ceil(words.length / 2);
  const [l1, l2] = words.length > 1 ? [words.slice(0, half).join(" "), words.slice(half).join(" ")] : [words[0], ""];
  const sz = Math.min(fit(l1, "round", 760, 170, 70), l2 ? fit(l2, "round", 760, 170, 70) : 999);
  const qLines = wrap(ctx.spec.subtitle || "O que você prefere?", 34, 2);
  const opts = (ctx.spec.options || []).filter(Boolean).slice(0, 4);
  // altura total do bloco, para centralizar entre o topo e o rodapé
  const blockH = 60 + sz * (l2 ? 1.75 : 0.8) + 90 + qLines.length * 50 + 30 + opts.length * 110 + 60;
  const top0 = Math.max(oy + 70, (oy + foot) / 2 - blockH / 2);
  for (let i = 0; i < 4; i++) s += `<path d="M${W / 2 - 50 + i * 24} ${top0 + 34} l14 -34 h12 l-14 34 Z" fill="${hot}"/>`;
  s += T(W / 2, top0 + 60 + sz * 0.8, sz, "#ffffff", l1, { anchor: "middle", font: F.round, weight: 400 });
  if (l2) s += T(W / 2, top0 + 60 + sz * 1.75, sz, hot, l2, { anchor: "middle", font: F.round, weight: 400 });
  let y = top0 + 60 + sz * (l2 ? 1.75 : 0.8) + 90;
  qLines.forEach((l) => { s += T(W / 2, y, 40, "#ffffff", l, { anchor: "middle", font: F.body, weight: 600 }); y += 50; });
  y += 30;
  opts.forEach((o, i) => {
    const x = W / 2 - 280, h = 88;
    const last = i === opts.length - 1 && opts.length > 2;
    s += `<rect x="${x}" y="${y}" width="560" height="${h}" rx="${h / 2}" fill="${last ? hot : "#ffffff"}"/>`;
    s += `<rect x="${x}" y="${y}" width="${h + 20}" height="${h}" rx="${h / 2}" fill="${last ? "#ffffff" : hot}"/>`;
    s += T(x + (h + 20) / 2, y + h * 0.66, 40, last ? hot : "#ffffff", String.fromCharCode(65 + i), { anchor: "middle", font: F.body, weight: 600 });
    s += T(x + h + 50, y + h * 0.66, fit(clean(o), "body", 400, 40, 26), last ? "#ffffff" : dark, clean(o).slice(0, 26), { font: F.body, weight: 600 });
    y += h + 22;
  });
  s += T(W / 2, Math.min(foot - 50, y + 60), 26, "#ffffff", "RESPONDE AQUI NOS COMENTÁRIOS 👇".replace(/👇/u, "").trim(), { anchor: "middle", font: F.body, weight: 600, ls: 3 });
  s += orderBar(ctx, W, foot + 10, "#ffffff");
  if (H > 1350) s += storyCta(W, H, { ...p, accent: hot, accentInk: "#ffffff" });
  return s;
}

function frase(ctx, W, H) {
  const p = ctx.pal;
  const id = ctx.id();
  const bg = p.soft;
  const box = contrast(p.ink, bg) > 6 ? p.ink : mix(p.bg, "#000000", 0.45);
  const hot = contrast(p.bg, bg) > 2 ? p.bg : p.accent;
  const cy = H / 2;
  let s = `<rect width="${W}" height="${H}" fill="${bg}"/>`;
  // manchas suaves no fundo
  s += `<path d="M-40 ${cy - 520} C200 ${cy - 600} 380 ${cy - 420} 260 ${cy - 300} C150 ${cy - 190} -40 ${cy - 260} -40 ${cy - 520} Z" fill="${hot}" opacity=".12"/>`;
  s += `<path d="M${W + 40} ${cy + 300} C${W - 260} ${cy + 260} ${W - 300} ${cy + 520} ${W - 120} ${cy + 620} C${W} ${cy + 680} ${W + 40} ${cy + 560} ${W + 40} ${cy + 300} Z" fill="${hot}" opacity=".12"/>`;
  const lines = wrap(clean(ctx.spec.title).toUpperCase(), 13, 6);
  const size = Math.min(...lines.map((l) => fit(l, "black", 560, 84, 48)));
  const bw = 700, bh = lines.length * size * 1.08 + 170;
  const bx = (W - bw) / 2, by = cy - bh / 2 - 40;
  s += `<path d="${wavyBox(bx - 26, by - 26, bw + 52, bh + 52, 9, ctx.spec.title + "o")}" fill="${box}" opacity=".45"/>`;
  s += `<path d="${wavyBox(bx, by, bw, bh, 8, ctx.spec.title)}" fill="${box}"/>`;
  lines.forEach((l, i) => { s += T(bx + 90, by + 110 + i * size * 1.08, size, pick(box, "#fbf3e8", "#ffffff"), l, { font: F.black, weight: 800, ls: -1 }); });
  const hl = clean(ctx.spec.subtitle).toUpperCase();
  if (hl) {
    const hs = fit(hl, "round", 520, 110, 60);
    const hw = hl.length * hs * 0.74 + 90, hh = hs * 1.35;
    const hx = bx + bw - hw + 70, hy = by + bh - hh / 2;
    s += `<path d="${wavyBox(hx, hy, hw, hh, 6, hl)}" fill="${hot}"/>`;
    s += T(hx + hw / 2, hy + hh * 0.72, hs, pick(hot, "#ffffff", "#111111"), hl, { anchor: "middle", font: F.round, weight: 400 });
  }
  // selo circular com o nome girando
  const r = 120, sx = 170, sy = by + bh + 210;
  s += `<defs><path id="${id}c" d="M${sx - r} ${sy} a${r} ${r} 0 1 1 ${2 * r} 0 a${r} ${r} 0 1 1 ${-2 * r} 0"/></defs>
    <circle cx="${sx}" cy="${sy}" r="${r + 34}" fill="none" stroke="${hot}" stroke-width="2" opacity=".6"/>
    <text font-family="${F.body}" font-size="26" font-weight="600" fill="${hot}" letter-spacing="3"><textPath href="#${id}c">${esc((ctx.name + " · " + ctx.name + " · ").toUpperCase().slice(0, 46))}</textPath></text>`;
  s += brandTag(ctx, W, H > 1350 ? 200 : 110, box);
  s += footer(ctx, W, H - (H > 1350 ? 120 : 60), box);
  return s;
}


// ---------- barra de contato e selos ----------
/** Pílula "Faça seu pedido 81 9999-9999 | Peça também no iFood" (só texto, sem logos de terceiros). */
function pillBar(ctx, W, y, bg, fg) {
  const b = ctx.brand;
  const left = b.whatsapp ? ["FAÇA SEU PEDIDO", clean(b.whatsapp)] : b.instagram ? ["SIGA A GENTE", "@" + clean(b.instagram).replace(/^@/, "")] : null;
  const right = b.delivery ? ["PEÇA TAMBÉM NO", clean(b.delivery).toUpperCase().slice(0, 22)] : b.location ? ["ONDE ESTAMOS", clean(b.location).slice(0, 22)] : null;
  if (!left && !right) return footer(ctx, W, y, fg);
  const w = left && right ? 760 : 420, x = (W - w) / 2, h = 96;
  let s = `<rect x="${x}" y="${y - h / 2 - 8}" width="${w}" height="${h}" rx="22" fill="${bg}"/>`;
  const col = (cx, [a, bb]) => T(cx, y - 14, 20, fg, a, { anchor: "middle", font: F.body, weight: 600, ls: 3, opacity: 0.8 }) + T(cx, y + 22, 32, fg, bb, { anchor: "middle", font: F.wide, weight: 400 });
  if (left && right) s += col(x + w * 0.27, left) + `<rect x="${W / 2 - 1}" y="${y - 38}" width="2" height="64" fill="${fg}" opacity=".35"/>` + col(x + w * 0.73, right);
  else s += col(W / 2, left || right);
  return s;
}

/** Selo redondo com texto girando (ex.: "MELHOR HAMBÚRGUER DA CIDADE"). */
function circleSeal(ctx, cx, cy, r, color, text) {
  const id = ctx.id();
  const t = (clean(text).toUpperCase() + " · ").repeat(3).slice(0, Math.floor((2 * Math.PI * r) / 17));
  return `<circle cx="${cx}" cy="${cy}" r="${r + 26}" fill="#ffffff" opacity=".92"/>
    <circle cx="${cx}" cy="${cy}" r="${r + 26}" fill="none" stroke="${color}" stroke-width="2" opacity=".5"/>
    <defs><path id="${id}" d="M${cx - r} ${cy} a${r} ${r} 0 1 1 ${2 * r} 0 a${r} ${r} 0 1 1 ${-2 * r} 0"/></defs>
    <text font-family="${F.body}" font-size="22" font-weight="600" fill="${color}" letter-spacing="2"><textPath href="#${id}">${esc(t)}</textPath></text>`;
}

function combo(ctx, W, H) {
  const p = ctx.pal;
  const { oy, end, foot } = frame(H);
  const id = ctx.id();
  const bg = p.soft;
  const hot = contrast(p.bg, bg) >= 2 ? p.bg : p.accent;
  let s = `<rect width="${W}" height="${H}" fill="${bg}"/>`;
  s += `<path d="M-60 ${oy + 160} C180 ${oy + 40} 260 ${oy + 260} 520 ${oy + 170} C700 ${oy + 110} 760 ${oy - 40} 1140 ${oy + 60} L1140 -10 L-60 -10 Z" fill="${hot}" opacity=".07"/>`;
  const word = clean(ctx.spec.title).split(" ")[0].toUpperCase().slice(0, 9);
  const size = fit(word, "cond", 1000, 470, 200);
  const capH = size * 0.74;
  const yTop = oy + 230 + capH;
  s += T(W / 2, yTop, size, hot, word, { anchor: "middle", font: F.cond, weight: 400, ls: 2 });
  s += T(W / 2, end - 10, size, hot, word, { anchor: "middle", font: F.cond, weight: 400, ls: 2 });
  const prod = product(ctx, 40, oy + 270, W - 80, end - 160 - (oy + 270), { align: "center" });
  s += prod.svg;
  const kick = clean(ctx.spec.kicker || ctx.spec.subtitle).toUpperCase();
  if (kick) {
    const ks = fit(kick, "wide", 720, 50, 30), kw = kick.length * ks * 0.8 + 90, kh = ks * 1.7;
    const tag = contrast("#f6b81c", hot) > 1.5 ? "#f6b81c" : p.accent;
    s += `<path d="${wavyBox((W - kw) / 2, oy + 110, kw, kh, 5, kick)}" fill="${tag}"/>` + T(W / 2, oy + 110 + kh * 0.68, ks, pick(tag, "#3a1606", "#ffffff"), kick, { anchor: "middle", font: F.wide, weight: 400 });
  }
  if (ctx.brand.tagline) s += circleSeal(ctx, Math.min(W - 150, prod.box.x + prod.box.w - 40), prod.box.y + prod.box.h - 70, 78, hot, ctx.brand.tagline);
  if (ctx.spec.badge) s += priceDrop(W - 200, prod.box.y + 50, { ...p, accent: hot, accentInk: pick(hot, "#ffffff", "#111111") }, ctx.spec.badge);
  s += pillBar(ctx, W, foot - 10, hot, pick(hot, "#ffffff", "#111111"));
  if (H > 1350) s += storyCta(W, H, { ...p, accent: hot, accentInk: pick(hot, "#ffffff", "#111111") });
  return s;
}

function destaque(ctx, W, H) {
  const p = ctx.pal;
  const { oy, foot } = frame(H);
  const bg = p.bg === PALETTES.noite.bg ? p.accent : p.bg;
  const ink = pick(bg, p.ink, "#3a1606", "#111111");
  const light = pick(bg, p.light, "#ffffff");
  let s = `<rect width="${W}" height="${H}" fill="${bg}"/>`;
  // manchas claras nas bordas
  s += `<path d="M-40 -20 L560 -20 C520 60 420 40 380 110 C330 190 200 120 120 200 C60 260 -10 220 -40 260 Z" fill="${p.soft}" opacity=".85"/>`;
  s += `<path d="M${W + 40} ${H * 0.62} C${W - 120} ${H * 0.66} ${W - 60} ${H * 0.78} ${W - 160} ${H * 0.84} C${W - 240} ${H * 0.9} ${W - 120} ${H} ${W + 40} ${H} Z" fill="${p.soft}" opacity=".6"/>`;
  const lines = wrap(clean(ctx.spec.title).toUpperCase(), 14, 3);
  const size = Math.min(...lines.map((l) => fit(l, "wide", 900, 112, 60)));
  let y = oy + 250;
  lines.forEach((l) => { s += T(76, y, size, ink, l, { font: F.wide, weight: 400, ls: -1 }); y += size * 1.02; });
  const sub = clean(ctx.spec.subtitle).toUpperCase();
  if (sub) { s += T(80, y + 10, fit(sub, "body", 880, 54, 30), light, sub, { font: F.body, weight: 600 }); y += 70; }
  // produto enorme, saindo pela borda de baixo
  const top = y + 40;
  s += product(ctx, -40, top, W + 80, (H - top) * 1.18, { align: "center", frameRotate: 0 }).svg;
  if (ctx.spec.badge) {
    const price = parsePrice(ctx.spec.badge);
    const tw = 300, th = 330, tx = W - tw - 50, ty = H * 0.55;
    const tag = contrast("#f6b81c", bg) > 1.4 ? "#f6b81c" : p.light;
    s += `<g transform="rotate(-4 ${tx + tw / 2} ${ty + th / 2})"><path d="${wavyBox(tx, ty, tw, th, 6, ctx.spec.badge)}" fill="${tag}"/>`;
    const label = clean(ctx.spec.details || ctx.spec.title).toUpperCase().slice(0, 14);
    s += T(tx + tw / 2, ty + 62, fit(label, "wide", tw - 50, 34, 20), "#3a1606", label, { anchor: "middle", font: F.wide, weight: 400 });
    if (price) {
      const isz = price.int.length > 2 ? 120 : 150;
      const iw = price.int.length * isz * 0.5;
      const x0 = tx + (tw - (iw + 60 + (price.cents ? 60 : 0))) / 2;
      s += T(x0, ty + 262, 38, "#3a1606", "R$", { font: F.wide, weight: 400 });
      s += T(x0 + 62, ty + 262, isz, "#ffffff", price.int, { font: F.cond, weight: 400 });
      if (price.cents) s += T(x0 + 66 + iw, ty + 262 - isz * 0.5, 50, "#ffffff", price.cents, { font: F.cond, weight: 400 });
    } else s += T(tx + tw / 2, ty + 220, fit(ctx.spec.badge, "wide", tw - 40, 70, 30), "#3a1606", ctx.spec.badge.toUpperCase(), { anchor: "middle", font: F.wide, weight: 400 });
    s += "</g>";
  }
  s += pillBar(ctx, W, foot - 10, mix(bg, "#000000", 0.45), "#ffffff");
  if (H > 1350) s += storyCta(W, H, { ...p, accent: ink, accentInk: light });
  return s;
}

// ---------- carrossel editorial ----------
/** Texto com *destaques*: as palavras entre asteriscos saem em serifada itálica colorida. */
function richLines(text, maxChars) {
  const tokens = [];
  String(text || "").split(/(\*[^*]+\*)/).forEach((part) => {
    const hl = /^\*[^*]+\*$/.test(part);
    clean(hl ? part.slice(1, -1) : part).split(" ").filter(Boolean).forEach((w) => {
      // pontuação logo depois de um destaque gruda na palavra anterior (sem espaço)
      if (/^[.,!?;:…)]+/.test(w) && tokens.length && !part.startsWith(" ")) { const m = w.match(/^[.,!?;:…)]+/)[0]; tokens[tokens.length - 1].tail = m; w = w.slice(m.length); if (!w) return; }
      tokens.push({ w, hl });
    });
  });
  const lines = [[]];
  let len = 0;
  for (const t of tokens) {
    if (len && len + 1 + t.w.length > maxChars) { lines.push([]); len = 0; }
    lines[lines.length - 1].push(t);
    len += (len ? 1 : 0) + t.w.length;
  }
  return lines.filter((l) => l.length);
}

function richText(x, y, size, color, hlColor, lines, { anchor = "start", lh = 1.18 } = {}) {
  return lines.map((line, i) => {
    const spans = line.map((t, k) => {
      const sp = k < line.length - 1 ? " " : "";
      const tail = t.tail ? `<tspan>${esc(t.tail)}</tspan>` : "";
      return t.hl
        ? `<tspan font-family="${F.serif}" font-style="italic" font-weight="400" font-size="${Math.round(size * 1.18)}" fill="${hlColor}">${esc(t.w)}</tspan>${tail}<tspan>${sp}</tspan>`
        : `<tspan>${esc(t.w)}</tspan>${tail}<tspan>${sp}</tspan>`;
    }).join("");
    return `<text x="${x}" y="${y + i * size * lh}" font-family="${F.body}" font-weight="600" font-size="${size}" fill="${color}" text-anchor="${anchor}" xml:space="preserve">${spans}</text>`;
  }).join("");
}

function header(ctx, W, color) {
  const insta = ctx.brand.instagram ? "@" + clean(ctx.brand.instagram).replace(/^@/, "") : "";
  const parts = [insta, ctx.name].filter(Boolean);
  return `<text x="${W / 2}" y="78" font-family="${F.body}" font-size="28" fill="${color}" text-anchor="middle" xml:space="preserve">` +
    parts.map((p, i) => `<tspan font-weight="600" opacity="${i === 0 && parts.length > 1 ? 0.75 : 1}">${esc(p)}</tspan>`).join(`<tspan opacity=".6">  |  </tspan>`) + "</text>" +
    `<rect x="60" y="62" width="34" height="4" rx="2" fill="${color}" opacity=".7"/>`;
}

function ruler(W, H, color) {
  let s = `<g opacity=".25" stroke="${color}" stroke-width="2">`;
  for (let y = 170; y < H - 90; y += 22) {
    const big = (y - 170) % 110 === 0;
    s += `<line x1="38" y1="${y}" x2="${big ? 62 : 50}" y2="${y}"/><line x1="${W - 38}" y1="${y}" x2="${W - (big ? 62 : 50)}" y2="${y}"/>`;
  }
  return s + "</g>";
}

/**
 * Carrossel editorial (estilo das agências): capa com gancho, slides de frase com destaque e CTA final.
 * spec: { cover_title, cover_script, slides: [{heading, body}], cta }
 */
export function renderCarousel({ client, spec, photo = null, cutout = null, alt = false }) {
  const W = 1080, H = 1350;
  const brand = client.brand || {};
  let n = 0;
  const salt = crypto.randomBytes(3).toString("hex");
  const pal = paletteFor(brand);
  const ctx = { brand, name: clean(brand.business_name || client.business || ""), pal, spec: {}, photo, cutout, id: () => `k${salt}${++n}` };
  const svg = (body, bg) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${bg}"/>${body}</svg>`;
  const total = (spec.slides || []).length + 1 + (spec.cta ? 1 : 0);
  const out = [];
  const coverBg = alt ? pal.soft : pal.bg;
  const dark = pick(coverBg, pal.ink, "#1d1206", "#111111");
  const light = pick(coverBg, "#ffffff", pal.light);
  // cor do destaque: a mais próxima da marca que ainda tenha contraste com o fundo do slide
  const hlOn = (bg) => [pal.bg, mix(pal.bg, "#000000", 0.3), mix(pal.bg, "#000000", 0.5), pal.title, "#ffffff", "#111111"].find((c) => contrast(c, bg) >= 3) || pick(bg, "#ffffff", "#111111");
  const hot = hlOn("#f7f5f0");

  // capa
  {
    const words = clean(spec.cover_title).toUpperCase().split(" ");
    const half = Math.ceil(words.length / 2);
    const [l1, l2] = words.length > 1 ? [words.slice(0, half).join(" "), words.slice(half).join(" ")] : [words[0], ""];
    const s1 = fit(l1, "cond", 900, 300, 120), s2 = l2 ? fit(l2, "cond", 900, 300, 120) : 0;
    let b = ruler(W, H, dark) + header(ctx, W, dark);
    const y1 = 190 + s1 * 0.78;
    b += T(W / 2, y1, s1, light, l1, { anchor: "middle", font: F.cond, weight: 400 });
    const y2 = y1 + s2 * 0.96;
    if (l2) b += T(W / 2, y2, s2, dark, l2, { anchor: "middle", font: F.cond, weight: 400 });
    const yEnd = l2 ? y2 : y1;
    if (photo || cutout) b += product(ctx, 140, yEnd + 30, W - 280, H - yEnd - 60, { align: "bottom", frameRotate: -2 }).svg;
    const sc = clean(spec.cover_script).toLowerCase();
    if (sc) b += T(W / 2 - 80, yEnd + 70, fit(sc, "script", 700, 130, 70), light, sc, { anchor: "middle", font: F.script, weight: 400, rotate: -5 });
    b += `<rect x="${W - 330}" y="${H - 96}" width="270" height="52" rx="26" fill="${dark}"/>` + T(W - 195, H - 61, 22, light, "ARRASTA PRO LADO →", { anchor: "middle", font: F.body, weight: 600, ls: 2 });
    out.push(svg(b, coverBg));
  }
  // slides de conteúdo
  (spec.slides || []).forEach((sl, i) => {
    const bg = i % 2 ? pal.soft : "#f7f5f0";
    const ink = "#1c1712";
    const lines = richLines(sl.body, 20);
    const size = lines.length > 6 ? 56 : 68;
    const blockH = lines.length * size * 1.18 + (sl.heading ? 90 : 0);
    let y = H / 2 - blockH / 2 + size;
    let b = ruler(W, H, ink) + header(ctx, W, ink);
    if (sl.heading) { b += T(110, y - size - 30, 26, hlOn(bg), clean(sl.heading).toUpperCase(), { font: F.body, weight: 600, ls: 5 }); }
    b += richText(110, y, size, ink, hlOn(bg), lines);
    b += T(110, H - 70, 30, ink, `${String(i + 2).padStart(2, "0")}/${String(total).padStart(2, "0")}`, { font: F.wide, weight: 400, opacity: 0.6 });
    out.push(svg(b, bg));
  });
  // chamada final
  if (spec.cta) {
    const bg = "#14110e";
    const lines = richLines(spec.cta, 18);
    const size = 76;
    let b = ruler(W, H, "#ffffff") + header(ctx, W, "#ffffff");
    const hotDark = hlOn(bg);
    b += richText(W / 2, H / 2 - (lines.length * size * 1.18) / 2 + size, size, "#ffffff", hotDark, lines, { anchor: "middle" });
    b += `<path d="M${W / 2 - 30} ${H - 260} h60 m-22 -22 l22 22 l-22 22" stroke="${hotDark}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    b += T(W / 2, H - 70, 30, "#ffffff", `${total}/${total}`, { anchor: "middle", font: F.wide, weight: 400, opacity: 0.6 });
    out.push(svg(b, bg));
  }
  return out;
}


// ---------- QR code e chamas desenhadas ----------
/** Só aceita link https curto (o QR leva o cliente final para lá). */
export function safeMenuUrl(u) {
  try {
    const url = new URL(String(u || "").trim());
    return url.protocol === "https:" && url.href.length <= 300 ? url.href : null;
  } catch { return null; }
}

/** Etiqueta "Aponte a câmera e acesse nosso cardápio" com QR de verdade. */
function qrTag(ctx, x, y, rotate = -6) {
  const url = safeMenuUrl(ctx.brand.menu_url);
  if (!url) return "";
  const q = QRCode.create(url, { errorCorrectionLevel: "M" });
  const n = q.modules.size, cell = 132 / n;
  let mods = "";
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.modules.get(r, c)) mods += `M${(c * cell).toFixed(2)} ${(r * cell).toFixed(2)}h${cell.toFixed(2)}v${cell.toFixed(2)}h-${cell.toFixed(2)}Z`;
  return `<g transform="rotate(${rotate} ${x + 210} ${y + 90})">
    <rect x="${x + 6}" y="${y + 10}" width="420" height="172" rx="20" fill="#000" opacity=".25"/>
    <rect x="${x}" y="${y}" width="420" height="172" rx="20" fill="#fbf1d6"/>
    <rect x="${x + 16}" y="${y + 16}" width="140" height="140" rx="8" fill="#ffffff"/>
    <path transform="translate(${x + 20} ${y + 20})" d="${mods}" fill="#111111"/>
    ${T(x + 172, y + 62, 26, "#3a1606", "Aponte a câmera", { font: F.body, weight: 600 })}
    ${T(x + 172, y + 96, 26, "#3a1606", "e acesse agora", { font: F.body, weight: 600 })}
    ${T(x + 172, y + 134, 26, "#3a1606", "nosso cardápio", { font: F.wide, weight: 400 })}</g>`;
}

/** Chama desenhada (contorno escuro, miolo laranja e amarelo), como nas artes ilustradas. */
function flame(x, y, s, rot = 0) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <path d="M0 0 C-40 -40 -30 -90 0 -150 C10 -110 40 -100 45 -60 C50 -30 30 0 0 0 Z" fill="#ff6a1a" stroke="#4a1406" stroke-width="7" stroke-linejoin="round"/>
    <path d="M2 -12 C-18 -34 -12 -66 4 -96 C10 -70 26 -60 26 -40 C26 -22 16 -12 2 -12 Z" fill="#ffc531"/></g>`;
}

/** Placa "APENAS: 40,99" do estilo ilustrado. */
function pricePlate(cx, cy, p, badge, label = "APENAS:") {
  const price = parsePrice(badge);
  if (!badge) return "";
  const main = price ? price.int : clean(badge).toUpperCase();
  const msz = price ? 120 : fit(main, "wide", 300, 80, 36);
  const mw = main.length * msz * (price ? 0.72 : 0.8);
  const w = 200 + mw + (price?.cents ? 70 : 20), h = 130, x = cx - w / 2, y = cy - h / 2;
  let s = `<g transform="rotate(-4 ${cx} ${cy})"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#5a1708"/>`;
  s += `<rect x="${x + 18}" y="${y + 34}" width="160" height="62" rx="16" fill="#ffffff"/>` + T(x + 98, y + 76, 26, "#5a1708", label, { anchor: "middle", font: F.wide, weight: 400 });
  s += T(x + 200, y + h / 2 + msz * 0.36, msz, p.accent === "#000000" ? "#ff5a1f" : "#ff5a1f", main, { font: F.wide, weight: 400, ls: -4 });
  if (price?.cents) s += T(x + 204 + mw, y + 54, 40, "#ffffff", "," + price.cents, { font: F.wide, weight: 400 });
  return s + "</g>";
}

function versus(ctx, W, H) {
  const p = ctx.pal;
  const { oy, foot } = frame(H);
  const bg = "#4a1208";
  let s = `<rect width="${W}" height="${H}" fill="${bg}"/>`;
  s += flame(70, oy + 420, 1.6, -15) + flame(1010, oy + 380, 1.7, 18) + flame(60, H - 230, 1.3, -25) + flame(1030, H - 260, 1.4, 20);
  const words = clean(ctx.spec.title || "Qual a sua escolha hoje?").toUpperCase();
  const tl = wrap(words, 18, 2);
  const tsz = Math.min(...tl.map((l) => fit(l, "wide", 860, 86, 50)));
  tl.forEach((l, i) => { s += T(W / 2, oy + 150 + i * tsz * 1.02, tsz, "#f6dca6", l, { anchor: "middle", font: F.wide, weight: 400, ls: -2 }); });
  const sub = clean(ctx.spec.subtitle || "entre esses 2?").toUpperCase();
  s += T(W / 2, oy + 150 + tl.length * tsz * 1.02 + 6, 44, "#ff5a1f", sub, { anchor: "middle", font: F.wide, weight: 400 });
  const items = (ctx.spec.items || []).slice(0, 2);
  while (items.length < 2) items.push({ name: `Burguer 0${items.length + 1}`, details: "", price: "" });
  const top = oy + 330, cw = 420, ch = Math.min((H > 1350 ? foot - 140 : 1180) - top, 760);
  items.forEach((it, i) => {
    const x = i ? W / 2 + 25 : W / 2 - 25 - cw;
    s += `<rect x="${x}" y="${top}" width="${cw}" height="${ch}" rx="40" fill="#fbf7f2"/>`;
    s += `<rect x="${x + 24}" y="${top + 24}" width="${cw - 48}" height="${cw - 80}" rx="28" fill="#ff5a1f"/>`;
    const asset = (ctx.extra || [])[i] || ctx.cutout || ctx.photo;
    const sub = { ...ctx, cutout: asset && asset.cut ? asset : ctx.cutout, photo: asset && !asset.cut ? asset : ctx.photo };
    if ((ctx.extra || [])[i]) { sub.cutout = ctx.extra[i].cut ? ctx.extra[i] : null; sub.photo = ctx.extra[i].cut ? null : ctx.extra[i]; }
    s += product(sub, x + 10, top + 10, cw - 20, cw - 40, { align: "center", frameRotate: 0 }).svg;
    let y = top + cw - 10;
    const nm = clean(it.name).slice(0, 18);
    s += T(x + cw / 2, y + 40, fit(nm, "wide", cw - 50, 50, 28), "#5a1708", nm, { anchor: "middle", font: F.wide, weight: 400, ls: -1 });
    y += 90;
    String(it.details || "").split(/[;\n]|,\s*(?=[A-ZÀ-Ú])/).map(clean).filter(Boolean).slice(0, 5).forEach((item) => {
      wrap(item, 24, 2).forEach((l, k) => {
        if (!k) s += `<rect x="${x + 36}" y="${y - 16}" width="10" height="10" fill="#ffb300"/>`;
        s += T(x + 56, y - 6, 26, "#3a1606", l, { font: F.body, weight: 600 }); y += 36;
      });
      y += 8;
    });
    if (it.price) s += T(x + cw / 2, y + 10, 28, "#3a1606", `Custa apenas ${clean(it.price)}`, { anchor: "middle", font: F.body, weight: 600 });
    const by = top + ch - 90;
    s += `<rect x="${x + 70}" y="${by}" width="${cw - 140}" height="62" rx="31" fill="#d8261a"/>` + T(x + cw / 2, by + 42, 28, "#ffffff", "Quero esse!", { anchor: "middle", font: F.wide, weight: 400 });
  });
  s += `<circle cx="${W / 2}" cy="${top + cw / 2 - 20}" r="54" fill="${bg}"/>` + T(W / 2, top + cw / 2 + 4, 70, "#f6dca6", "X", { anchor: "middle", font: F.wide, weight: 400 });
  s += pillBar(ctx, W, foot + 6, "#2a0904", "#ffffff");
  if (H > 1350) s += storyCta(W, H, { ...p, accent: "#d8261a", accentInk: "#ffffff" });
  return s;
}

function fichado(ctx, W, H) {
  const p = ctx.pal;
  const { oy, end, foot } = frame(H);
  const bg = "#f3e2a6", ink = "#5a1708", hot = "#e8401c";
  let s = `<rect width="${W}" height="${H}" fill="${bg}"/>`;
  s += `<path d="M-60 ${oy + 250} C200 ${oy + 120} 380 ${oy + 380} 640 ${oy + 240} S1000 ${oy + 120} 1140 ${oy + 220}" stroke="#e9cf86" stroke-width="80" fill="none" opacity=".6"/>`;
  const head = clean(ctx.spec.kicker || "Se ser").toUpperCase();
  const mid = wrap(clean(ctx.spec.title || "Gostoso demais").toUpperCase(), 14, 2);
  const tail = clean(ctx.spec.subtitle || "fosse crime:").toUpperCase();
  let y = oy + 150;
  s += T(W / 2, y, 82, ink, head, { anchor: "middle", font: F.wide, weight: 400, ls: -3 }); y += 4;
  const msz = Math.min(...mid.map((l) => fit(l, "wide", 820, 120, 60)));
  mid.forEach((l) => { y += msz * 0.98; s += T(W / 2, y, msz, hot, l, { anchor: "middle", font: F.wide, weight: 400, ls: -4 }); });
  y += 70; s += T(W / 2, y, 56, ink, tail, { anchor: "middle", font: F.wide, weight: 400, ls: -2 });
  // régua de altura
  const top = y + 50, bottom = end - 10, rows = 7;
  for (let i = 0; i < rows; i++) {
    const ly = top + 20 + i * ((bottom - top - 40) / (rows - 1));
    const lbl = (1.9 - i * 0.1).toFixed(2).replace(".", ",") + "m";
    s += `<line x1="170" y1="${ly}" x2="${W - 170}" y2="${ly}" stroke="${ink}" stroke-width="${i === 0 ? 5 : 3}"/>`;
    s += T(150, ly + 12, 34, ink, lbl, { anchor: "end", font: F.cond, weight: 400 }) + T(W - 150, ly + 12, 34, ink, lbl, { font: F.cond, weight: 400 });
  }
  s += flame(210, bottom - 60, 1.2, -10) + flame(870, top + 300, 1.3, 15) + flame(840, bottom - 40, 1.0, 10);
  const prod = product(ctx, 220, top + 40, W - 440, bottom - top - 30, { align: "bottom", frameRotate: 0 });
  s += prod.svg;
  const stamp = clean(ctx.spec.badge && !parsePrice(ctx.spec.badge) ? ctx.spec.badge : "CULPADO").toUpperCase().slice(0, 12);
  const ssz = fit(stamp, "wide", 360, 64, 34), sw = stamp.length * ssz * 0.8 + 60;
  const sx = W / 2 - sw / 2 - 40, sy = prod.box.y + 40;
  s += `<g transform="rotate(-12 ${sx + sw / 2} ${sy + 50})"><rect x="${sx}" y="${sy}" width="${sw}" height="${ssz * 1.6}" rx="10" fill="#fbf1d6" fill-opacity=".9" stroke="#c1121f" stroke-width="8"/>` +
    T(sx + sw / 2, sy + ssz * 1.15, ssz, "#c1121f", stamp, { anchor: "middle", font: F.wide, weight: 400 }) + "</g>";
  if (parsePrice(ctx.spec.badge)) s += pricePlate(W - 260, prod.box.y + prod.box.h - 80, p, ctx.spec.badge);
  s += qrTag(ctx, 60, bottom - 150, -6);
  s += pillBar(ctx, W, foot + 6, ink, "#ffffff");
  if (H > 1350) s += storyCta(W, H, { ...p, accent: hot, accentInk: "#ffffff" });
  return s;
}


// ---------- modelo épico (cinematográfico) ----------
function shield(cx, cy, r, glow, badge, seed) {
  if (!badge) return "";
  const price = parsePrice(badge);
  const rnd = seeded(seed);
  let rivets = "";
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; rivets += `<circle cx="${(cx + Math.cos(a) * r * 0.88).toFixed(1)}" cy="${(cy + Math.sin(a) * r * 0.88).toFixed(1)}" r="${r * 0.035}" fill="#e9d2a6"/>`; }
  let planks = "";
  for (let i = -2; i <= 2; i++) planks += `<line x1="${cx + i * r * 0.32}" y1="${cy - r}" x2="${cx + i * r * 0.32}" y2="${cy + r}" stroke="#000" stroke-opacity=".25" stroke-width="4"/>`;
  const id = "sh" + Math.floor(rnd() * 1e9);
  let s = `<defs><radialGradient id="${id}" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="${mix(glow, "#ffffff", 0.15)}"/><stop offset="1" stop-color="${mix(glow, "#000000", 0.45)}"/></radialGradient>
    <clipPath id="${id}c"><circle cx="${cx}" cy="${cy}" r="${r * 0.8}"/></clipPath></defs>
    <circle cx="${cx + 8}" cy="${cy + 14}" r="${r}" fill="#000" opacity=".45" filter="url(#blur8)"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#gold)"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.8}" fill="url(#${id})"/>
    <g clip-path="url(#${id}c)">${planks}</g>${rivets}
    <circle cx="${cx}" cy="${cy}" r="${r * 0.8}" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="3"/>`;
  if (price) {
    s += T(cx, cy - r * 0.42, r * 0.14, "#f6e7c8", "SÓ", { anchor: "middle", font: "Archivo Black", weight: 400, ls: 3 });
    const big = r * (price.int.length > 2 ? 0.5 : 0.62);
    s += T(cx - big * 0.62, cy + big * 0.38, big * 0.3, "#f6e7c8", "R$", { anchor: "end", font: "Archivo Black", weight: 400 });
    s += `<text x="${cx - big * 0.58}" y="${cy + big * 0.38}" font-family="Anton" font-size="${big}" fill="#fff6e2" filter="url(#txtShadow)">${esc(price.int)}</text>`;
    if (price.cents) s += T(cx + big * 0.62, cy - big * 0.05, big * 0.32, "#f6e7c8", "," + price.cents, { font: "Anton", weight: 400 });
  } else {
    const t = clean(badge).toUpperCase();
    s += T(cx, cy + r * 0.12, fit(t, "wide", r * 1.3, r * 0.36, 24), "#fff6e2", t, { anchor: "middle", font: "Archivo Black", weight: 400 });
  }
  return s;
}

function epico(ctx, W, H) {
  const p = ctx.pal;
  const { oy, end, foot } = frame(H);
  const glow = contrast(p.bg, "#0b0706") > 1.6 ? p.bg : p.accent;
  const rnd = seeded(ctx.spec.title + "e" + W + H);
  const goldA = "#fff1cf", goldB = "#e3b15c", goldC = "#9a5b1c";
  let s = `<defs>
    <radialGradient id="glow" cx="50%" cy="62%" r="62%"><stop offset="0" stop-color="${mix(glow, "#ff7a2a", 0.3)}" stop-opacity="1"/><stop offset=".4" stop-color="${glow}" stop-opacity=".75"/><stop offset=".75" stop-color="${mix(glow, "#000000", 0.6)}" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    <radialGradient id="vig" cx="50%" cy="50%" r="75%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></radialGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${goldA}"/><stop offset=".55" stop-color="${goldB}"/><stop offset="1" stop-color="${goldC}"/></linearGradient>
    <filter id="blur8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="blur30" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter>
    <filter id="blur70" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="70"/></filter>
    <filter id="txtShadow" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000" flood-opacity=".75"/></filter>
    <filter id="smoke" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.0035 0.009" numOctaves="4" seed="${Math.floor(rnd() * 99)}"/><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.92  0 0 0 0 0.85  0 0 0 -1.4 0.95"/><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7"/><feColorMatrix type="saturate" values="0"/></filter>
    <filter id="grade" x="-5%" y="-5%" width="110%" height="110%"><feComponentTransfer><feFuncR type="linear" slope="1.12" intercept="-0.03"/><feFuncG type="linear" slope="1.08" intercept="-0.03"/><feFuncB type="linear" slope="1.0" intercept="-0.04"/></feComponentTransfer><feColorMatrix type="saturate" values="1.18"/></filter>
    <filter id="rim" x="-20%" y="-20%" width="140%" height="140%"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.38  0 0 0 0 0.1  0 0 0 1 0"/><feGaussianBlur stdDeviation="10"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="#0b0706"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect x="0" y="${H * 0.25}" width="${W}" height="${H * 0.75}" filter="url(#smoke)" opacity=".18"/>`;
  // título gigante metálico atrás do produto
  const word = wrap(clean(ctx.spec.title).toUpperCase(), 10, 1)[0];
  const tsz = fit(word, "wide", 1000, 300, 130);
  const ty = oy + 260 + tsz * 0.75;
  s += `<text x="${W / 2}" y="${ty}" font-family="${F.wide}" font-size="${tsz}" fill="url(#gold)" text-anchor="middle" stroke="#2a0d05" stroke-width="3" filter="url(#txtShadow)">${esc(word)}</text>`;
  // produto com luz de contorno, sombra de contato e tratamento de cor
  const asset = ctx.cutout;
  const story = H > 1350;
  const pTop = ty + (clean(ctx.spec.subtitle) ? 95 : 40), pBottom = story ? end - 110 : end - (ctx.spec.details ? 70 : 30);
  // núcleo de luz quente atrás do produto
  s += `<ellipse cx="${W / 2}" cy="${(pTop + pBottom) / 2 + 40}" rx="${W * 0.34}" ry="${(pBottom - pTop) * 0.36}" fill="${mix(glow, "#ff8a3a", 0.45)}" opacity=".85" filter="url(#blur70)"/>`;
  let box;
  if (asset) {
    const r = asset.w / asset.h;
    let pw = W * (story ? 0.9 : 0.8), ph = pw / r;
    if (ph > pBottom - pTop) { ph = pBottom - pTop; pw = ph * r; }
    const px = (W - pw) / 2, py = pBottom - ph;
    box = { x: px, y: py, w: pw, h: ph };
    s += `<ellipse cx="${W / 2}" cy="${pBottom - 6}" rx="${pw * 0.5}" ry="${ph * 0.07}" fill="#000" opacity=".8" filter="url(#blur30)"/>`;
    s += `<ellipse cx="${W / 2}" cy="${pBottom - 4}" rx="${pw * 0.4}" ry="${ph * 0.025}" fill="#000" opacity=".9" filter="url(#blur8)"/>`;
    s += `<image href="${asset.uri}" x="${px - 6}" y="${py - 12}" width="${pw + 12}" height="${ph + 12}" filter="url(#rim)" opacity=".55"/>`;
    s += `<image href="${asset.uri}" x="${px}" y="${py}" width="${pw}" height="${ph}" filter="url(#grade)"/>`;
  } else {
    const pr = product(ctx, 120, pTop, W - 240, pBottom - pTop, { align: "bottom", frameRotate: 0 });
    s += pr.svg; box = pr.box;
  }
  // faíscas
  let em = "";
  for (let i = 0; i < 90; i++) {
    const x = rnd() * W, y = H * (0.25 + rnd() * 0.75), r = 0.8 + rnd() * rnd() * 4.5;
    const c = rnd() > 0.4 ? "#ffb347" : "#ff6a1f", o = 0.35 + rnd() * 0.65;
    em += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(r * 3.2).toFixed(1)}" fill="${c}" opacity="${(o * 0.18).toFixed(2)}"/><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="#ffe2a8" opacity="${o.toFixed(2)}"/>`;
  }
  s += em;
  s += `<rect width="${W}" height="${H}" fill="url(#vig)"/>`;
  // logo e linha de apoio
  if (ctx.logo) s += logoImg(ctx, W / 2, oy + 36, 200);
  else s += T(W / 2, oy + 120, 34, goldA, ctx.name.toUpperCase(), { anchor: "middle", font: "Archivo Black", weight: 400, ls: 8 });
  const sub = clean(ctx.spec.subtitle).toUpperCase();
  if (sub) {
    const sy = ty + 70;
    const sw = sub.length * 17 + 40;
    s += `<line x1="${W / 2 - sw / 2 - 80}" y1="${sy - 12}" x2="${W / 2 - sw / 2 - 16}" y2="${sy - 12}" stroke="${goldB}" stroke-width="2"/><line x1="${W / 2 + sw / 2 + 16}" y1="${sy - 12}" x2="${W / 2 + sw / 2 + 80}" y2="${sy - 12}" stroke="${goldB}" stroke-width="2"/>`;
    s += T(W / 2, sy, 30, goldA, sub, { anchor: "middle", font: "Inter", weight: 600, ls: 6 });
  }
  s += shield(Math.min(W - 170, box.x + box.w * 0.9), box.y + box.h * 0.3, 135, glow, ctx.spec.badge, ctx.spec.title);
  // detalhes e rodapé
  if (ctx.spec.details) s += details(W / 2, pBottom + (story ? 70 : 40), 58, "#f3e6cc", ctx.spec.details, "middle");
  const b = ctx.brand;
  const bits = [b.whatsapp && `PEÇA: ${clean(b.whatsapp)}`, b.delivery && `TAMBÉM NO ${clean(b.delivery).toUpperCase()}`, b.instagram && "@" + clean(b.instagram).replace(/^@/, "")].filter(Boolean);
  if (bits.length) {
    const fy = story ? H - 250 : foot + 8;
    s += `<line x1="140" y1="${fy - 40}" x2="${W - 140}" y2="${fy - 40}" stroke="${goldB}" stroke-opacity=".5" stroke-width="1.5"/>`;
    s += T(W / 2, fy, 24, "#f3e6cc", bits.join("    ·    "), { anchor: "middle", font: "Inter", weight: 600, ls: 3 });
  }
  if (H > 1350) s += storyCta(W, H, { ...p, accent: glow, accentInk: "#ffffff" });
  s += `<rect width="${W}" height="${H}" filter="url(#grain)" opacity=".07"/>`;
  return s;
}

const BUILDERS = { epico, eco, script, oferta, cinema, fogo, splash, arco, enquete, frase, combo, destaque, versus, fichado };

/**
 * Monta a arte.
 * input: { client, spec: {title, badge, subtitle}, template, format: "feed"|"story", photo: {uri,w,h}|null, cutout: {uri,w,h}|null }
 */
export const TITLE_FONTS = { gotica: "Pirata One" };

export function renderTemplate({ client, spec, template, format = "feed", photo = null, cutout = null, extra = [], logo = null }) {
  const W = 1080, H = format === "story" ? 1920 : 1350;
  const brand = client.brand || {};
  let n = 0;
  const salt = crypto.randomBytes(3).toString("hex");
  const ctx = {
    brand,
    name: clean(brand.business_name || client.business || ""),
    pal: paletteFor(brand),
    spec: {
      title: clean(spec.title) || clean(client.business), badge: clean(spec.badge), subtitle: clean(spec.subtitle),
      details: clean(spec.details), kicker: clean(spec.kicker), options: (spec.options || []).map(clean).filter(Boolean),
      items: (spec.items || []).slice(0, 2).map((i) => ({ name: clean(i.name), details: clean(i.details), price: clean(i.price) })),
    },
    photo, cutout, extra, logo,
    words: /burg|hamb|lanch|smash/i.test(`${brand.segment || ""}`) ? ["SUCULENTO", "NA BRASA", "PEÇA JÁ", "SABOR"] : ["NOVIDADE", "PEÇA JÁ", "QUALIDADE", "SABOR"],
    id: () => `t${salt}${++n}`,
  };
  const build = BUILDERS[template] || eco;
  // Fonte de título temática da marca (ex.: gótica para uma hamburgueria viking).
  const themed = TITLE_FONTS[brand.title_font];
  const saved = { black: F.black, wide: F.wide, cond: F.cond, slab: F.slab, round: F.round };
  if (themed) { Object.assign(F, { black: themed, wide: themed, cond: themed, slab: themed, round: themed }); THEMED = themed; }
  let body;
  try { body = build(ctx, W, H); } finally { Object.assign(F, saved); THEMED = null; }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`;
}

/** Quais modelos combinam com o pedido e com o material que o cliente mandou. */
export function templatesFor(style, { hasCutout, hasPhoto, postType = "produto" }) {
  if (postType === "enquete") return ["enquete"];
  if (postType === "frase") return ["frase"];
  if (postType === "versus") return ["versus"];
  const byStyle = {
    promo: ["epico", "splash", "combo", "destaque", "oferta", "eco", "arco", "script", "fogo", "cinema"],
    premium: ["epico", "cinema", "fogo", "arco", "destaque", "eco", "script", "combo", "oferta", "splash"],
    divertido: ["fichado", "script", "splash", "combo", "eco", "arco", "destaque", "oferta", "fogo", "cinema"],
    auto: ["epico", "eco", "splash", "destaque", "combo", "oferta", "arco", "script", "fogo", "cinema"],
  };
  let list = byStyle[style] || byStyle.auto;
  // sem recorte, só a foto inteira fica boa; os modelos de produto "solto" ficam por último
  if (!hasCutout && hasPhoto) list = ["cinema", "oferta", "eco", ...list.filter((t) => !["cinema", "oferta", "eco", "fogo", "arco", "combo", "destaque", "fichado", "epico"].includes(t))];
  if (!hasCutout && !hasPhoto) list = list.filter((t) => t !== "cinema");
  return list;
}
