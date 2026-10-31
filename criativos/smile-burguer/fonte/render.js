// Renderiza cada artboard de reinauguracao.html em PNG (node render.js)
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 2000 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(__dirname, 'reinauguracao.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  const out = path.join(__dirname, '..');
  for (const id of ['a-feed', 'a-story', 'b-feed', 'b-story']) {
    await page.locator('#' + id).screenshot({ path: path.join(out, `smile-reinauguracao-${id}.png`) });
  }
  await browser.close();
})();
