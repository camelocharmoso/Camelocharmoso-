const {chromium}=require('playwright');const path=require('path');
const dir=__dirname, out=path.join(dir,'..');
(async()=>{const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:1});
await p.goto('file://'+dir+'/post.html#00-capa');await p.evaluate(()=>document.fonts.ready);
const ids=await p.evaluate(()=>window.IDS);const only=process.argv[2];
for(const id of ids){ if(only&&!id.startsWith(only))continue;
  await p.goto('file://'+dir+'/post.html#'+id);await p.reload();
  await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(500);
  await p.screenshot({path:path.join(out,id+'.png')});console.log(id);}
await b.close();})();
