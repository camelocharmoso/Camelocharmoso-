const {chromium}=require('playwright');const path=require('path');
const V={
 feed:{m1:'14%',m2:'27%',h:1350,px:'-20px',py:'110px',pw:'1350px',s1:'16%',s2:'34%',s3:'50%',ht:'170px',k:'54px',b:'188px',sr:'40px',st:'470px'},
 story:{m1:'16%',m2:'28%',h:1920,px:'-75px',py:'330px',pw:'1500px',s1:'22%',s2:'38%',s3:'52%',ht:'300px',k:'64px',b:'230px',sr:'50px',st:'860px'}};
(async()=>{const b=await chromium.launch();
for(const [name,v] of Object.entries(V)){
 const p=await b.newPage({viewport:{width:1080,height:v.h}});
 await p.goto('file://'+path.resolve(__dirname,'arte.html'));
 await p.addStyleTag({content:':root{'+Object.entries(v).map(([k,x])=>`--${k}:${k=='h'?x+'px':x}`).join(';')+'}'});
 await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
 await p.screenshot({path:path.resolve(__dirname,'..',`moda-nostra-feriado-${name}.png`)});}
await b.close();})();
