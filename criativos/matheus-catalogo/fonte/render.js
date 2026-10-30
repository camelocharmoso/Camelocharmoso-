const {chromium}=require('playwright');const d=process.argv[2];
(async()=>{const b=await chromium.launch();
const p=await b.newPage({viewport:{width:794,height:1123}});
await p.goto('file://'+d+'/catalogo.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1500);
await p.pdf({path:d+'/../Matheus-Catalogo-Camisetas.pdf',width:'210mm',height:'297mm',printBackground:true,preferCSSPageSize:true});
await b.close();})();
