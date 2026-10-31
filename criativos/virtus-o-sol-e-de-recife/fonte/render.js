// uso: node render.js  (gera o PNG na pasta acima)
const {chromium}=require('playwright');const d=__dirname, out=require('path').join(__dirname,'..');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1350}});
await p.goto('file://'+d+'/feed.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
await p.screenshot({path:out+'/virtus-o-sol-e-de-recife-feed.png'});await b.close();})();
