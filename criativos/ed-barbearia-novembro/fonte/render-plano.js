const {chromium}=require('playwright');const d=process.argv[2];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1333,height:750}});
await p.goto('file://'+d+'/fonte/plano.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1200);
await p.pdf({path:d+'/ED-Barbearia-Plano-de-Conteudo-Novembro-2026.pdf',width:'1333px',height:'750px',printBackground:true,preferCSSPageSize:true});
await b.close();})();
