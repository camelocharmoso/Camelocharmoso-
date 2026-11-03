// node render.js in.html out.pdf [a4|long]  -> PDF (+ PNG previews)
const { chromium } = require('playwright');
(async () => {
  const [inp, out, mode = 'a4'] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: mode === 'long' ? { width: 430, height: 900 } : { width: 794, height: 1123 } });
  await p.goto('file://' + require('path').resolve(inp), { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(500);
  if (mode === 'long') {
    const h = await p.evaluate(() => document.documentElement.scrollHeight);
    await p.pdf({ path: out, width: '430px', height: (h + 2) + 'px', printBackground: true, pageRanges: '1' });
  } else {
    await p.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
  }
  await b.close();
})();
