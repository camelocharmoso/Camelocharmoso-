// Gera os PNGs das artes: node render_artes.js (rodar dentro de propostas/virtus/artes)
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 2400, height: 2100 } });
  await p.goto('file://' + path.resolve(__dirname, 'express.html'), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  for (const id of ['feed', 'story']) await (await p.$('#' + id)).screenshot({ path: path.resolve(__dirname, `virtus-express-${id}.png`) });
  await b.close();
})();
