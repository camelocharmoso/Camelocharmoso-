// Modelos de arte: todos renderizam em feed e story, com e sem foto, e o recorte de fundo funciona.
import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "lia-tpl-"));
const { renderTemplate, templatesFor, parsePrice, paletteFor, TEMPLATES, PALETTES } = await import("../src/templates.js");
const { renderPng, imageSize, contrast } = await import("../src/art.js");
const { config } = await import("../src/config.js");
const { removeBackground } = await import("../src/cutout.js");

// PNG 4x2 com transparência, gerado pelo próprio renderizador
const tinyPng = renderPng('<svg xmlns="http://www.w3.org/2000/svg" width="4" height="2"><rect width="4" height="2" fill="#c00"/></svg>');
const asset = { uri: `data:image/png;base64,${tinyPng.toString("base64")}`, w: 4, h: 2 };
const client = { business: "Brasa Burger", brand: { segment: "hamburgueria", palette: "brasa", instagram: "brasa", location: "Centro" } };
const spec = { title: "Exagero <script>", badge: "R$ 29,90", subtitle: "pura" };

test("todos os modelos geram PNG em feed e story, com recorte, com foto e sem nada", () => {
  for (const template of TEMPLATES) {
    for (const format of ["feed", "story"]) {
      for (const [photo, cutout] of [[null, asset], [asset, null], [null, null]]) {
        const svg = renderTemplate({ client, spec, template, format, photo, cutout });
        assert.ok(!svg.includes("<script>"), "texto do cliente é escapado");
        const png = renderPng(svg);
        const size = imageSize(png);
        assert.deepEqual(size, { w: 1080, h: format === "story" ? 1920 : 1350 }, `${template}/${format}`);
      }
    }
  }
});

test("preço vira etiqueta; outros textos não", () => {
  assert.deepEqual(parsePrice("R$ 20,90"), { cur: "R$", int: "20", cents: "90" });
  assert.deepEqual(parsePrice("por R$37"), { cur: "R$", int: "37", cents: "" });
  assert.equal(parsePrice("20% OFF"), null);
});

test("paleta: cores da marca têm prioridade e o título fica legível", () => {
  const p = paletteFor({ colors: ["#7a3e65", "#7b3f66"] });
  assert.equal(p.bg, "#7a3e65");
  assert.ok(contrast(p.title, p.bg) >= 2.2);
  assert.equal(paletteFor({ palette: "pop" }), PALETTES.pop);
  assert.equal(paletteFor({ segment: "hamburgueria" }), PALETTES.brasa);
});

test("modelos escolhidos combinam com o material disponível", () => {
  assert.equal(templatesFor("premium", { hasCutout: true, hasPhoto: true })[0], "cinema");
  assert.equal(templatesFor("promo", { hasCutout: false, hasPhoto: true })[0], "cinema", "sem recorte, a foto inteira rende mais");
  assert.ok(!templatesFor("auto", { hasCutout: false, hasPhoto: false }).includes("cinema"));
});

test("recorte de fundo: envia a foto e aceita só PNG de volta", async () => {
  let got = null;
  const srv = http.createServer((req, res) => {
    got = req.headers["x-api-key"];
    req.resume();
    req.on("end", () => {
      if (req.url === "/ruim") { res.setHeader("content-type", "text/html"); return res.end("<html>"); }
      res.setHeader("content-type", "image/png"); res.end(tinyPng);
    });
  });
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  Object.assign(config.cutout, { url: base + "/ok", key: "chave", header: "X-Api-Key" });
  try {
    const out = await removeBackground(tinyPng, "image/png");
    assert.equal(got, "chave");
    assert.deepEqual(imageSize(out), { w: 4, h: 2 });
    config.cutout.url = base + "/ruim";
    await assert.rejects(removeBackground(tinyPng, "image/png"), /inesperado/);
  } finally {
    srv.close();
  }
});
