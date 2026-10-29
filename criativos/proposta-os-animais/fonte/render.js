// Gera o PDF da proposta e uma prévia PNG de cada slide.
// Uso: node render.js <pasta_saida>
const {chromium}=require('playwright');const path=require('path');
const dir=__dirname, out=process.argv[2]||dir;
(async()=>{const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.goto('file://'+path.join(dir,'proposta.html'));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1000);
const n=await p.$$eval('section.s',s=>s.length);
for(let i=0;i<n;i++){const el=(await p.$$('section.s'))[i];await el.screenshot({path:path.join(out,`slide-${String(i+1).padStart(2,'0')}.png`)});}
await p.pdf({path:path.join(dir,'..','Proposta-Os-Animais-x-Mylena-Almeida.pdf'),width:'1920px',height:'1080px',printBackground:true,preferCSSPageSize:true});
await b.close();console.log(n,'slides');})();
