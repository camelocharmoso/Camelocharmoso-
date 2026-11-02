const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();
for(const [name,h,h1,pz,gap] of [['feed',1350,'130px','230px','26px'],['story',1920,'190px','420px','56px']]){
 const p=await b.newPage({viewport:{width:1080,height:h}});
 await p.goto('file://'+path.resolve(__dirname,'arte.html'));
 await p.addStyleTag({content:`:root{--h:${h}px;--h1:${h1};--pz:${pz};--gap:${gap}}`});
 await p.waitForTimeout(1500);
 await p.screenshot({path:path.resolve(__dirname,'..',`moda-nostra-feriado-${name}.png`)});}
await b.close();})();
