// Gera os PNGs: node render.js (dentro de propostas/house/artes)
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 2400, height: 2100 } });
  await p.goto('file://' + path.resolve(__dirname, 'instagram-vende.html'), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  for (const id of ['feed', 'story']) await (await p.$('#' + id)).screenshot({ path: path.resolve(__dirname, `house-instagram-vende-${id}.png`) });
  await b.close();
})();
