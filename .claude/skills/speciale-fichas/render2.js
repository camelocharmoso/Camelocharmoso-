const { chromium } = require('playwright');
(async () => { const [i,o]=process.argv.slice(2); const b=await chromium.launch(); const p=await b.newPage();
await p.goto('file://'+require('path').resolve(i),{waitUntil:'load'}); await p.evaluate(()=>document.fonts.ready);
await p.pdf({path:o,format:'A4',printBackground:true,preferCSSPageSize:true,displayHeaderFooter:true,headerTemplate:'<span></span>',
footerTemplate:'<div style="width:100%;font-size:7px;color:#5d524c;padding:0 16mm;display:flex;justify-content:space-between;font-family:Arial"><span>Speciale Pizzas Artesanais · Treinamento do Claude</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>'});
await b.close(); })();
