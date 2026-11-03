const {chromium}=require('playwright');const d=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:1200}});
await p.goto('file://'+d+'/fonte/artes.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
for(const id of await p.$$eval('.arte',e=>e.map(x=>x.id))){await p.locator('#'+id).screenshot({path:d+'/artes/'+id+'.png'});}
await b.close();})();
