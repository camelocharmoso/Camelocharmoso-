OUT='Apresentacao-Barbearias-Premium.pdf'; TITLE='House do Creator — Barbearias premium'; FOOT='HOUSE DO CREATOR  ·  BARBEARIAS PREMIUM'
exec(open('house_pdf.py').read())
# 01 CAPA
N[0]+=1; rect(0,0,W,H,K)
for i in range(9): c.setStrokeColor(HexColor('#161616')); c.setLineWidth(1); c.line(W*.55+i*48,0,W*.55+i*48+260,H)
hclogo(True,M,H-70,58)
txt('PROPOSTA COMERCIAL  ·  BARBEARIAS PREMIUM  ·  RECIFE',M,H-120,8,Y,'PB',cs=2.4)
b=title([[('Tua barbearia',WH)],[('já é premium.',WH)],[('O Instagram',WH)],[('precisa parecer.',Y)]],M,H-190,46)
sparks(b[0][0]-8,H-168,'tl',1.1); sparks(b[3][1]+18,H-190-3*50.6+34,'br',1.1)
para('Gestão de imagem, conteúdo e vendas no Instagram para barbearias que cobram pelo padrão que entregam.',M,H-400,420,12,GR)
c.setStrokeColor(LN); c.setLineWidth(.6); c.line(M,98,M+380,98)
txt('Ryan Coimbra & Fontenele',M,70,11,WH,'PB'); txt('CEOs · House do Creator',M,54,9,G2,'PR')
lw=230; img('marca/compacta-negativa.png',W-M-lw-20,H/2-60,lw)
done()

# 02 STATEMENT
slide(True,'PONTO DE PARTIDA')
b=title([[('Quem paga caro num corte',WH)],[('escolhe pela imagem',WH)],[('antes de sentar ',Y),('na cadeira.',Y)]],M,H-140,38)
sparks(b[0][0]-6,H-120,'tl',1)
cols=[('O cliente premium','Pesquisa no Instagram, compara o feed e decide em segundos se o lugar é pra ele.'),
      ('O risco','Um perfil com cara de celular faz uma barbearia de alto padrão parecer comum.'),
      ('O que a gente faz','Damos ao teu perfil o mesmo nível da tua cadeira, do teu ambiente e do teu preço.')]
cw=(W-2*M-48)/3
for i,(h,t) in enumerate(cols):
    x=M+i*(cw+24); c.setStrokeColor(Y if i==2 else LN); c.setLineWidth(2); c.line(x,170,x+40,170)
    txt(h.upper(),x,148,8,Y if i==2 else WH,'PB',cs=1.6); para(t,x,138,cw,10.5,GR)
done()

# 03 O QUE SEPARA
slide(False,'O QUE FAZ UMA MARCA')
title([[('Barbearia premium',K)],[('não vende corte.',K)]],M,H-100,32)
para('Vende <b>estética, experiência e autoridade</b>. É isso que o conteúdo precisa mostrar.',M,H-176,520,11,HexColor('#4A3D10'))
P=[('01','ESTÉTICA','Um feed com direção de arte',['Fotos editoriais, não fotos de celular','Paleta, luz e enquadramento padronizados','Cada post parecendo campanha']),
   ('02','EXPERIÊNCIA','O que acontece além do corte',['O ambiente, o atendimento, os detalhes','A bebida, a toalha quente, o acabamento','O cliente se vendo naquele lugar']),
   ('03','AUTORIDADE','Quem está por trás da tesoura',['O dono como referência na área','Técnica mostrada com cuidado','Prova social de clientes reais'])]
cw=(W-2*M-32)/3; top=H-212
for i,(n,t,s_,its) in enumerate(P):
    x=M+i*(cw+16); rect(x,52,cw,top-52,K,16)
    txt(n,x+22,top-44,26,Y,'PB'); txt(t,x+22,top-70,13,WH,'PB',cs=1); txt(s_,x+22,top-88,9,G2,'PR')
    c.setStrokeColor(LN); c.setLineWidth(.6); c.line(x+22,top-104,x+cw-22,top-104)
    y=top-124
    for it in its: check(x+22,y+3); h=para(it,x+40,y+9,cw-62,9.8,WH); y-=h+12
done()

# 04 DIAGNOSTICO
slide(True,'DIAGNÓSTICO GRATUITO')
title([[('O que a gente analisa',WH)],[('no teu ',WH),('perfil.',Y)]],M,H-100,30)
para('Antes de começar, a House faz um raio-x do teu Instagram e te mostra, com números do próprio perfil, onde está o potencial e o que está travando os agendamentos.',M,H-178,520,11,GR)
D=[('Primeira impressão','Bio, foto, destaques e fixados: o perfil diz em 3 segundos que é premium?'),
   ('Estética do feed','Existe padrão visual ou cada post tem uma cara diferente?'),
   ('Reels','Quais vídeos rodam, quais morrem e por quê. Gancho, ritmo e chamada.'),
   ('Prova social','Avaliações no Google, depoimentos e clientes aparecendo no conteúdo.'),
   ('Caminho até a cadeira','Quantos toques o cliente precisa pra conseguir agendar.')]
cw=(W-2*M-48)/5; top=H-250
for i,(t,s_) in enumerate(D):
    x=M+i*(cw+12); rect(x,60,cw,top-60,C1,14); rect(x,top-6,cw,6,Y if i==0 else LN,3)
    txt(f'{i+1:02d}',x+16,top-40,20,Y,'PB'); h=para(t,x+16,top-54,cw-32,11,WH,'PB',1.3)
    para(s_,x+16,top-62-h,cw-32,9,GR,lead=1.5)
done()

# 05 ESTRATEGIAS
slide(True,'ESTRATÉGIAS DE VENDA')
title([[('8 ações pra atrair',WH)],[('o cliente ',WH),('certo.',Y)]],M,H-100,30)
E=[('Clube Black','Assinatura mensal com horário garantido. Receita fixa e cliente fiel.'),
   ('Agenda VIP','Horários exclusivos pra assinantes e clientes antigos.'),
   ('Parcerias de marca','Relógios, moda masculina e bebidas premium da cidade.'),
   ('Eventos fechados','Noites pra clientes com convidados, que viram conteúdo.'),
   ('Google e avaliações','Aparecer bem em "barbearia" nos bairros nobres.'),
   ('Indicação premiada','Cliente que traz cliente ganha um serviço extra.'),
   ('Lembrete de retorno','Mensagem no tempo certo pra marcar o próximo corte.'),
   ('O dono como marca','Conteúdo de bastidor e técnica com quem dá nome à casa.')]
cw=(W-2*M-36)/4; top=H-190; ch=(top-60-12)/2
for i,(t,s_) in enumerate(E):
    x=M+(i%4)*(cw+12); y=top-(i//4)*(ch+12)
    rect(x,y-ch,cw,ch,C1,14); txt(f'{i+1:02d}',x+18,y-34,18,Y,'PB'); txt(t,x+18,y-62,12.5,WH,'PB')
    para(s_,x+18,y-74,cw-36,9.8,GR,lead=1.5)
done()

# 06 MES
slide(True,'COMO FUNCIONA')
title([[('Um mês de trabalho',WH)],[('no teu ',WH),('Instagram.',Y)]],M,H-100,30)
para('A House vai na tua barbearia uma vez por semana. Tu cuida dos clientes, a gente cuida da imagem.',M,H-180,560,11,GR)
S=[('SEMANA 1','Reels',['Pauta do mês aprovada','1ª diária de Reels','Stories gravados em toda visita']),
   ('SEMANA 2','Reels',['2ª diária de Reels','Artes com direção de arte','Legendas e calendário rodando']),
   ('SEMANA 3','Fotos editoriais',['Sessão de fotos com luz de estúdio','Ambiente, detalhes, equipe e o dono','Material pro feed do mês']),
   ('SEMANA 4','Reels + resultado',['3ª diária de Reels','Relatório de alcance e agendamentos','O que funcionou vira pauta do próximo mês'])]
cw=(W-2*M-36)/4; ly=H-262
c.setStrokeColor(LN); c.setLineWidth(1.5); c.line(M+8,ly,W-M-8,ly)
for i,(s1,s2,its) in enumerate(S):
    x=M+i*(cw+12); c.setFillColor(Y); c.circle(x+8,ly,6,stroke=0,fill=1); c.setFillColor(K); c.circle(x+8,ly,2.5,stroke=0,fill=1)
    txt(s1,x,ly-32,8,Y,'PB',cs=1.8); txt(s2,x,ly-56,17,WH,'PB')
    y=ly-86
    for it in its: check(x,y+3,Y,.9); h=para(it,x+18,y+9,cw-24,10.5,GR); y-=h+11
done()

# 07 PLANOS
slide(False,'INVESTIMENTO MENSAL')
title([[('Escolhe o nível',K)],[('da tua marca.',K)]],M,H-100,30)
P=[('SIGNATURE','1.500','Pra ter imagem de marca',
    ['4 visitas no mês (1 por semana)','3 diárias de Reels: 8 Reels','1 sessão de fotos editoriais','6 artes ou carrosséis','Direção de arte do feed','Legendas, calendário e Stories','Bio e capas de destaques novas','Relatório mensal'],False),
   ('BLACK','2.300','Pra crescer com consistência',
    ['4 visitas no mês (1 por semana)','3 diárias de Reels: 10 Reels','1 sessão de fotos editoriais','8 artes ou carrosséis','Direção de arte do feed','Legendas, calendário e Stories','Perfil reformulado completo','Google + avaliações','1 campanha de vendas por mês','Relatório mensal'],False),
   ('PRESTIGE','2.800','Pra ser referência na cidade',
    ['5 visitas no mês','3 diárias de Reels: 12 Reels','1 sessão de fotos editoriais','1 diária extra de Stories','10 artes ou carrosséis','Direção de arte do feed','Perfil reformulado completo','Google + avaliações','1 campanha de vendas por mês','Gestão de tráfego pago','Reunião + suporte prioritário','*Ensaio editorial do dono','*Landing page premium'],True)]
x0=M+262; cw=(W-M-x0-24)/3; top=H-66; bot=52
para('Captação, edição, direção de arte, legendas e postagem inclusos em todos os níveis.',M,H-190,190,10.5,HexColor('#4A3D10'))
para('Valores mensais, contrato mínimo de 3 meses. Verba de anúncio paga à parte.',M,H-262,190,9,HexColor('#6B5A1E'))
rect(M,bot,190,92,K,14); txt('NO PRESTIGE',M+16,bot+68,7.5,Y,'PB',cs=1.6)
para('Ensaio editorial do dono e landing page premium, entregues no 1º mês.',M+16,bot+60,158,9,WH,'PM',1.45)
for i,(n,p,s_,its,hl) in enumerate(P):
    x=x0+i*(cw+12); t2=top+(8 if hl else 0)
    rect(x,bot,cw,t2-bot,K,16)
    if hl: rect(x+14,t2-26,cw-28,18,Y,9); txt('A ESCOLHA DA HOUSE',x+cw/2,t2-20.5,6.4,K,'PB','c',cs=1.2)
    yy=t2-(50 if hl else 34)
    txt(n,x+18,yy,8.5,Y,'PB',cs=1.8); txt(s_,x+18,yy-14,7.6,G2,'PR')
    txt('R$',x+18,yy-44,10,WH,'PM'); txt(p,x+36,yy-48,26,WH,'PB'); txt('/mês',x+36+pdfmetrics.stringWidth(p,'PB',26)+4,yy-48,8,G2,'PR')
    c.setStrokeColor(LN); c.setLineWidth(.6); c.line(x+18,yy-62,x+cw-18,yy-62)
    y=yy-78
    for it in its:
        if it.startswith('*'):
            t=it[1:]; rect(x+14,y-5,cw-28,16,Y,8); txt('INCLUSO',x+21,y-0.5,5.8,K,'PB',cs=1); txt(t,x+56,y-0.5,7.6,K,'PB'); y-=19
        else:
            check(x+18,y+3,Y if hl else GR,.8); txt(it,x+33,y,8.1,WH if hl else GR,'PR'); y-=16.8
done()

# 08 COMPARATIVO
slide(True,'COMPARATIVO')
b=title([[('Por que o ',WH),('Prestige',Y)],[('compensa mais.',WH)]],M,H-100,30)
sparks(b[0][1]+12,H-82,'br',.8)
rows=[('Visitas na barbearia por mês','4','4','5'),('Reels editados','8','10','12'),('Sessão de fotos editoriais','1','1','1'),('Diária extra de Stories','—','—','✓'),('Artes ou carrosséis','6','8','10'),('Direção de arte do feed','✓','✓','✓'),('Legendas, calendário e Stories','✓','✓','✓'),('Relatório mensal','✓','✓','✓'),
      ('Perfil reformulado completo','—','✓','✓'),('Google + avaliações','—','✓','✓'),('Campanha de vendas mensal','—','✓','✓'),('Gestão de tráfego pago','—','—','✓'),('Ensaio editorial do dono','—','—','✓'),('Landing page premium','—','—','✓'),('Reunião + suporte prioritário','—','—','✓')]
tx=M; tw=560; c1=tx+250; cwd=(tw-250)/3; top=H-166; rh=19
rect(c1+2*cwd,40,cwd,top-40+28,HexColor('#17150B'),10)
for j,h in enumerate(['SIGNATURE','BLACK','PRESTIGE']): txt(h,c1+j*cwd+cwd/2,top+8,7.5,Y if j==2 else G2,'PB','c',cs=1.4)
y=top-6
for k,r in enumerate(rows):
    c.setStrokeColor(LN); c.setLineWidth(.5); c.line(tx,y-rh+6,tx+tw,y-rh+6)
    txt(r[0],tx,y-8,8.8,WH,'PR')
    for j in (1,2,3):
        v=r[j]; cx=c1+(j-1)*cwd+cwd/2; col=Y if j==3 else (WH if v!='—' else G2)
        if v=='✓': check(cx-5,y-4,col,.85)
        else: txt(v,cx,y-8,9.3,col,'PB' if j==3 else 'PR','c')
    y-=rh
y-=2; txt('Valor por mês',tx,y-8,10,WH,'PB')
for j,v in enumerate(['R$ 1.500','R$ 2.300','R$ 2.800']): txt(v,c1+j*cwd+cwd/2,y-8,11,Y if j==2 else WH,'PB','c')
bx=tx+tw+36; bw=W-M-bx
rect(bx,40,bw,top-40+28,Y,16)
txt('A CONTA',bx+22,top-6,8,K,'PB',cs=1.8)
txt('+R$ 500',bx+22,top-54,34,K,'PB')
para('separam o Black do Prestige.',bx+22,top-68,bw-44,11,K,'PM',1.45)
c.setStrokeColor(HexColor('#C9A52E')); c.setLineWidth(.6); c.line(bx+22,top-110,bx+bw-22,top-110)
para('Só a landing page, contratada avulsa na House, sai <b>R$ 390</b>. No Prestige ela já vem junto com o ensaio editorial do dono, a gestão de tráfego, a visita extra, mais 2 Reels e 2 artes por mês.',bx+22,top-124,bw-44,9.5,HexColor('#3A300B'),'PR',1.55)
para('<b>Quem quer ser referência não economiza na vitrine.</b>',bx+22,72,bw-44,9.5,K,'PB',1.4)
done()

# 09 LANDING PAGE
slide(True,'INCLUSO NO PRESTIGE')
title([[('Uma vitrine à altura',WH)],[('do teu ',WH),('preço.',Y)]],M,H-100,30)
para('Uma landing page premium da tua barbearia pra usar na bio, no Google e nos anúncios. O cliente vê o ambiente, os serviços e a equipe, e em um toque marca o horário.',M,H-180,430,11,GR,lead=1.6)
F=[('Fotos do ensaio editorial','O ambiente e o dono em padrão de campanha'),('Serviços e experiência','Tudo o que está incluso em cada atendimento'),('Botão de agendar','Direto pro app ou WhatsApp que vocês já usam'),('Clube e assinatura','Página pra vender os planos mensais'),('Avaliações reais','Puxadas do perfil no Google')]
y=H-268
for i,(a,b_) in enumerate(F):
    x=M+(i%2)*222; yy=y-(i//2)*58
    check(x,yy+3,Y); txt(a,x+18,yy,10.5,WH,'PB'); txt(b_,x+18,yy-15,8.8,G2,'PR')
pw=176; ph=356; px=W-M-pw-70; py=60
rect(px-8,py-8,pw+16,ph+16,HexColor('#262626'),28); rect(px,py,pw,ph,HexColor('#111111'),21)
c.saveState(); p=c.beginPath(); p.roundRect(px,py,pw,ph,21); c.clipPath(p,stroke=0)
rect(px,py+ph-150,pw,150,HexColor('#1E1E1E'))
for i in range(7): c.setStrokeColor(HexColor('#262626')); c.setLineWidth(8); c.line(px-40+i*36,py+ph-150,px+i*36+40,py+ph)
c.restoreState()
c.setFillColor(K); c.circle(px+pw/2,py+ph-112,30,stroke=0,fill=1); c.setStrokeColor(Y); c.setLineWidth(1.2); c.circle(px+pw/2,py+ph-112,30,stroke=1,fill=0)
txt('TUA',px+pw/2,py+ph-110,8,Y,'PB','c',cs=1.5); txt('MARCA',px+pw/2,py+ph-120,8,Y,'PB','c',cs=1.5)
txt('BARBEARIA',px+pw/2,py+ph-164,12,WH,'PB','c',cs=2); txt('Corte, barba e experiência.',px+pw/2,py+ph-178,7.5,GR,'PR','c')
rect(px+18,py+ph-212,pw-36,24,Y,12); txt('AGENDAR MEU HORÁRIO',px+pw/2,py+ph-203,7.5,K,'PB','c',cs=.8)
rect(px+18,py+ph-242,pw-36,22,HexColor('#222222'),11); txt('Conhecer o Clube',px+pw/2,py+ph-234,7.5,WH,'PM','c')
for k,(s1,s2) in enumerate([('Corte','Tesoura, máquina e acabamento'),('Barba','Navalha e toalha quente'),('Clube','Horário garantido todo mês')]):
    yy=py+ph-272-k*30; rect(px+18,yy-20,pw-36,26,HexColor('#1B1B1B'),8); txt(s1,px+28,yy-3,8,WH,'PB'); txt(s2,px+28,yy-14,6.5,G2,'PR')
txt('Imagem ilustrativa',px+pw/2,py-18,7,G2,'PR','c')
done()

# 10 POR QUE A HOUSE
slide(True,'POR QUE A HOUSE')
b=title([[('Padrão de estúdio,',WH)],[('não de ',WH),('celular.',Y)]],M,H-120,40)
sparks(b[0][0]-6,H-98,'tl',1)
para('A House do Creator é estúdio de foto e vídeo em Recife. Quem vai na tua barbearia é a mesma equipe que faz direção, captação, edição e design. Um time só, um padrão só.',M,H-250,400,11.5,GR,lead=1.65)
x=W/2+40; w=W-M-x
items=[('Equipe completa','Foto, vídeo, design e estratégia no mesmo contrato'),('Direção de arte','Teu feed com identidade, não post solto'),('Portfólio na mesa','A gente mostra nossos trabalhos antes de tu decidir')]
y=H-70
for i,(a,b_) in enumerate(items):
    hl=i==2; bh=96; rect(x,y-bh,w,bh,Y if hl else C1,14)
    txt(f'{i+1:02d}',x+20,y-26,10,K if hl else Y,'PB')
    h=para(a,x+20,y-34,w-40,12,K if hl else WH,'PB',1.3); para(b_,x+20,y-40-h,w-40,9.5,HexColor('#3A300B') if hl else GR,'PR',1.4)
    y-=bh+12
done()

# 11 PROXIMOS PASSOS
slide(False,'PRÓXIMOS PASSOS')
title([[('Do sim ao primeiro',K)],[('post em 10 dias.',K)]],M,H-100,32)
St=[('01','Diagnóstico','A gente analisa teu perfil e te mostra os números.'),
    ('02','Escolhe o nível','Signature, Black ou Prestige, no ritmo da tua marca.'),
    ('03','Reunião de pauta','Alinhamos estética, serviços e calendário do mês.'),
    ('04','Primeira visita','Gravação na barbearia e o perfil novo no ar.')]
cw=(W-2*M-36)/4; top=H-210
for i,(n,t,s_) in enumerate(St):
    x=M+i*(cw+12); rect(x,150,cw,top-150,K,16)
    txt(n,x+20,top-44,26,Y,'PB'); txt(t,x+20,top-74,12.5,WH,'PB'); para(s_,x+20,top-86,cw-40,9.5,GR)
txt('CONDIÇÕES',M,118,8,K,'PB',cs=1.8)
cond=['Pagamento mensal via Pix','Contrato mínimo de 3 meses','Tráfego com verba à parte','Conteúdo aprovado antes de ir ao ar','Proposta válida por 15 dias']
x=M
for t in cond:
    w_=pdfmetrics.stringWidth(t,'PM',7.6)+20; rect(x,72,w_,24,K,12); txt(t,x+10,81,7.6,WH,'PM'); x+=w_+6
done()

# 12 FECHAMENTO
N[0]+=1; rect(0,0,W,H,K)
hclogo(True,W/2-40,H-130,80)
b=title([[('Bora fazer tua marca',WH)],[('ser a referência',WH)],[('de Recife?',Y)]],W/2,H-200,44,'c')
sparks(b[0][0]-14,H-178,'tl',1.2); sparks(b[2][1]+14,H-200-2*48.4+28,'br',1.2)
pw=300; rect(W/2-pw/2,140,pw,44,Y,22); txt('WhatsApp  (81) 98355-4583',W/2,157,13,K,'PB','c')
txt('@housedocreator',W/2,116,10,GR,'PM','c')
txt('Ryan Coimbra & Fontenele  ·  CEOs',W/2,64,10,WH,'PB','c'); txt('House do Creator  ·  Recife/PE',W/2,48,8.5,G2,'PR','c')
done()
c.save()
