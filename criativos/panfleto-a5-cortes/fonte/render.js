const {chromium}=require('playwright');const d=process.argv[2];
(async()=>{const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1124,height:1576},deviceScaleFactor:1819/1124});
await p.goto('file://'+d+'/flyer.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1200);
await p.screenshot({path:d+'/panfleto.png'});
await p.pdf({path:d+'/panfleto.pdf',width:'154mm',height:'216mm',printBackground:true,preferCSSPageSize:true});
await b.close();})();
