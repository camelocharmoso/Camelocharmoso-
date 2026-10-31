const {chromium}=require('playwright');// uso: node render.js  (gera os PNGs na pasta acima)
const d=__dirname, out=require('path').join(__dirname,'..');
(async()=>{const b=await chromium.launch();
for(const [f,w,h] of [['feed',1080,1350],['story',1080,1920]]){
const p=await b.newPage({viewport:{width:w,height:h}});
await p.goto('file://'+d+'/'+f+'.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
await p.screenshot({path:out+'/virtus-os-animais-'+f+'.png'});}
await b.close();})();
