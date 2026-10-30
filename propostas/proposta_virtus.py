OUT='Proposta-House-x-Virtus-Otica.pdf'; TITLE='House do Creator — Proposta Virtus Ótica'; FOOT='HOUSE DO CREATOR  ·  PROPOSTA VIRTUS ÓTICA'
exec(open('house_pdf.py').read())
DK=HexColor('#4A3D10'); DK2=HexColor('#6B5A1E'); VO=HexColor('#F0642D'); VN=HexColor('#16306E')

def phone(f,x,y,w,h,r=18):
    rect(x-6,y-6,w+12,h+12,HexColor('#262626'),r+6)
    c.saveState(); p=c.beginPath(); p.roundRect(x,y,w,h,r); c.clipPath(p,stroke=0,fill=0)
    im=Image.open(f); ih=w*im.height/im.width; c.drawImage(f,x,y+h-ih,w,ih); c.restoreState()
def xmark(x,y,col=RED,s=1):
    c.setStrokeColor(col); c.setLineWidth(1.8*s); c.setLineCap(1)
    c.line(x,y-3*s,x+7*s,y+4*s); c.line(x,y+4*s,x+7*s,y-3*s)

# 01 CAPA
N[0]+=1; rect(0,0,W,H,K)
for i in range(9): c.setStrokeColor(HexColor('#161616')); c.setLineWidth(1); c.line(W*.5+i*48,0,W*.5+i*48+260,H)
hclogo(True,M,H-78,170,'principal')
txt('PROPOSTA COMERCIAL  ·  VIRTUS ÓTICA  ·  RECIFE',M,H-120,8,Y,'PB',cs=2.4)
b=title([[('A Virtus já tem',WH)],[('cara de marca.',WH)],[('Agora é hora de',WH)],[('virar venda.',Y)]],M,H-190,46)
sparks(b[0][0]-8,H-168,'tl',1.1); sparks(b[3][1]+18,H-190-3*50.6+34,'br',1.1)
para('Diagnóstico do @oticavirtus, análise SWOT, estratégias de venda, marketing de guerrilha, captação de leads e os planos da House pra Boa Vista e Iputinga.',M,H-368,430,11.5,GR)
c.setStrokeColor(LN); c.setLineWidth(.6); c.line(M,98,M+380,98)
txt('Ryan Coimbra & Fontenele',M,70,11,WH,'PB'); txt('CEOs · House do Creator  ·  outubro de 2026',M,54,9,G2,'PR')
phone('virtus/perfil.jpg',W-M-200,70,186,376,20)
done()

# 02 PONTO DE PARTIDA
slide(True,'PONTO DE PARTIDA')
b=title([[('O feed tem cara de',WH)],[('marca grande. O alcance',WH)],[('ainda não acompanha.',Y)]],M,H-140,38)
sparks(b[0][0]-6,H-120,'tl',1)
cols=[('O que a Virtus já tem','Identidade forte, ensaios com padrão de campanha, perfil verificado, duas lojas e um diferencial raro: óculos em até 1h.'),
      ('O que ainda falta','Reels que prendem nos 3 primeiros segundos, oferta clara em todo post e um caminho curto até o WhatsApp.'),
      ('O que a House faz','Transforma a estética que vocês já construíram em conteúdo que vende óculos todo mês, nas duas unidades.')]
cw=(W-2*M-48)/3
for i,(h,t) in enumerate(cols):
    x=M+i*(cw+24); c.setStrokeColor(Y if i==2 else LN); c.setLineWidth(2); c.line(x,236,x+40,236)
    txt(h.upper(),x,214,8,Y if i==2 else WH,'PB',cs=1.6); para(t,x,204,cw,11.5,GR,lead=1.6)
done()

# 03 RAIO-X
slide(True,'RAIO-X DO PERFIL')
title([[('O @oticavirtus',WH)],[('em ',WH),('números.',Y)]],M,H-100,30)
para('Análise feita em 30/10/2026, só com os números que aparecem nos prints do perfil. Alcance, salvamentos e cliques a gente puxa no diagnóstico, com acesso aos Insights.',M,H-176,440,10.5,GR)
S_=[('8.263','seguidores','Base boa pra uma ótica de bairro e centro.'),('1.257','posts','Constância existe. O que falta é retorno por post.'),
    ('157','seguindo','Perfil focado, sem troca de seguidor.'),('390 a 620','views nos últimos 3 Reels','432, 620 e 390: entre 5% e 8% da base de seguidores.')]
cw=(500-12)/2; top=H-250; ch=(top-52-12)/2
for i,(n,l,d) in enumerate(S_):
    x=M+(i%2)*(cw+12); y=top-(i//2)*(ch+12); hl=i==3
    rect(x,y-ch,cw,ch,Y if hl else C1,14)
    txt(n,x+18,y-38,24,K if hl else Y,'PB'); txt(l.upper(),x+18,y-56,7.5,K if hl else WH,'PB',cs=1.4)
    para(d,x+18,y-64,cw-36,9,DK if hl else GR,lead=1.45)
phone('virtus/perfil.jpg',600,58,165,334,18)
rx=790; rw=W-M-rx; rh_=rw*774/1125
c.saveState(); p=c.beginPath(); p.roundRect(rx,250,rw,rh_,10); c.clipPath(p,stroke=0,fill=0); c.drawImage('virtus/reels.jpg',rx,250,rw,rh_); c.restoreState()
para('<b>Aba Reels:</b> os três vídeos mais recentes.',rx,240,rw,8,GR,lead=1.4)
para('Leitura: quem já segue não está vendo os vídeos. O problema é <b>gancho e retenção</b>, não falta de post.',rx,190,rw,8.5,WH,lead=1.45)
done()

# 04 FUNCIONA x TRAVA
slide(True,'DIAGNÓSTICO')
title([[('O que ',WH),('funciona',Y),(' e o que',WH)],[('trava a venda.',WH)]],M,H-100,30)
F=['<b>Identidade visual forte:</b> laranja, azul e o "olho" da marca em tudo.',
   '<b>Ensaios editoriais</b> com modelos diversos, em padrão de campanha.',
   '<b>Destaques organizados</b> com capas próprias: lojas, de sol, de grau.',
   '<b>Virtus Express:</b> óculos em até 1h. Diferencial de verdade.',
   '<b>Calendário ativo:</b> Pais, Crianças, São João, Copa, Dia do Cliente.',
   '<b>Equipe nos Reels:</b> rosto humano e atendimento perto.']
T=['<b>Reels com 390 a 620 views</b> pra 8.263 seguidores: gancho fraco.',
   '<b>Muito ensaio, pouca conversa:</b> post sem preço, pergunta ou chamada.',
   '<b>Avisos no feed</b> ("Aviso importante") ocupando espaço de venda.',
   '<b>Link da bio via beacons:</b> um clique a mais até o WhatsApp.',
   '<b>O Express quase não vira prova:</b> cronômetro, bastidor, cliente saindo.',
   '<b>Prova social fraca:</b> o "Você de Virtus" tem repost de março de 2025.']
cw=(W-2*M-16)/2; top=H-170
for j,(lab,its,col) in enumerate([('O QUE FUNCIONA',F,GRN),('O QUE TRAVA',T,RED)]):
    x=M+j*(cw+16); rect(x,48,cw,top-48,C1,16)
    txt(lab,x+22,top-30,8.5,col,'PB',cs=1.8); c.setStrokeColor(LN); c.setLineWidth(.6); c.line(x+22,top-42,x+cw-22,top-42)
    y=top-62
    for it in its:
        (check if j==0 else xmark)(x+22,y+3,col,.9); h=para(it,x+42,y+9,cw-64,10.4,GR,lead=1.45); y-=max(h,15)+22
done()

# 05 O QUE O PERFIL ENTREGA
slide(True,'CONTEÚDO HOJE')
title([[('O que o teu perfil',WH)],[('entrega ',WH),('hoje.',Y)]],M,H-100,30)
R=[('Ensaios editoriais com modelos','Bonito e dá cara de marca grande. Sozinho, não puxa conversa.','AJUSTAR',HexColor('#E8B04A')),
   ('Reels com a equipe na loja','O formato mais humano do perfil. A atendente já virou rosto da Virtus.','ESCALAR',GRN),
   ('Campanhas de data','Pais, Crianças, São João, Copa: calendário criativo e constante.','MANTER',Y),
   ('Ofertas ("a partir de R$ 69,90", sol de brinde)','O que mais move venda no nicho. Aparece pouco e some no feed.','ESCALAR',GRN),
   ('Avisos e informes da loja','Ocupam o feed com conteúdo que só serve por um dia.','PRO STORIES',RED)]
y=H-176; tw=560
for i,(a,b_,tag,col) in enumerate(R):
    c.setStrokeColor(LN); c.setLineWidth(.6); c.line(M,y+16,M+tw,y+16)
    txt(a,M,y,11,WH,'PB'); para(b_,M,y-6,440,9.3,GR,lead=1.4)
    tw_=pdfmetrics.stringWidth(tag,'PB',7)+tag.__len__()*1.1+18
    rect(M+tw-tw_,y-8,tw_,18,col,9); txt(tag,M+tw-tw_/2,y-2,7,K,'PB','c',cs=1.1)
    y-=60
para('Leitura feita pelos prints do feed. A ideia não é jogar fora o que é bonito: é fazer cada post bonito também vender.',M,60,520,8.8,G2,lead=1.45)
phone('virtus/grid1.jpg',W-M-170,58,164,290,16)
done()

# 06 SWOT
slide(False,'ANÁLISE SWOT')
title([[('Forças, fraquezas,',K)],[('oportunidades e ameaças.',K)]],M,H-100,30)
Q=[('FORÇAS','S',['Virtus Express: óculos em até 1h','2 lojas: Boa Vista (centro) e Iputinga','Identidade profissional e perfil verificado','7 anos de história no Recife','Equipe que topa aparecer em vídeo']),
   ('FRAQUEZAS','W',['Reels com alcance baixo pra base','Post bonito com pouca chamada pra ação','Prova social fraca e desatualizada','Caminho longo até o WhatsApp','Sem lista de clientes pra recompra']),
   ('OPORTUNIDADES','O',['Black Friday, Natal, verão e Carnaval','Óculos de sol no verão do Recife','Clínicas, empresas e faculdades do centro','Google com avaliações nas 2 lojas','Fontenele: alcance de ~1,2 mi']),
   ('AMEAÇAS','T',['Redes grandes e e-commerce com preço baixo','Óticas do centro brigando por preço','Cliente troca de óculos a cada 1 ou 2 anos','Algoritmo esconde vídeo sem retenção','Concorrente copiar o "óculos rápido"'])]
cw=(W-2*M-12)/2; top=H-172; ch=(top-46-12)/2
for i,(t,l,its) in enumerate(Q):
    x=M+(i%2)*(cw+12); y=top-(i//2)*(ch+12)
    rect(x,y-ch,cw,ch,K,14)
    txt(l,x+cw-24,y-40,30,HexColor('#2A2A2A'),'PB','r')
    txt(t,x+20,y-26,8.5,Y,'PB',cs=1.8)
    yy=y-46
    for it in its:
        c.setFillColor(Y if i<3 else RED); c.circle(x+23,yy+3,2,stroke=0,fill=1); txt(it,x+33,yy,9.2,WH,'PR'); yy-=15.5
done()

# 07 ESTRATEGIA 3 FRENTES
slide(True,'ESTRATÉGIA')
b=title([[('Três frentes pra',WH)],[('vender ',WH),('todo mês.',Y)]],M,H-100,30)
P3=[('01','ATRAIR','Gente nova chegando no perfil e na loja',['Reels com gancho: provador, teste de lente, cronômetro do Express','Fontenele e creators locais na loja','Ações de guerrilha na rua, gravadas']),
    ('02','CONVERTER','Seguidor virando cliente',['Bio e fixados com oferta clara','WhatsApp direto, com mensagem pronta','Google das 2 lojas com avaliações','Uma campanha de venda por mês']),
    ('03','FAZER VOLTAR','Cliente comprando de novo',['Lista de clientes no WhatsApp','Lembrete: "teu óculos fez 1 ano"','Indicação premiada','Pós-venda com vídeo de cuidado'])]
cw=(W-2*M-32)/3; top=H-180
for i,(n,t,s_,its) in enumerate(P3):
    x=M+i*(cw+16); hl=i==1; rect(x,48,cw,top-48,Y if hl else C1,16)
    fg=K if hl else WH; sc=DK if hl else G2
    txt(n,x+22,top-44,26,K if hl else Y,'PB'); txt(t,x+22,top-70,13,fg,'PB',cs=1); txt(s_,x+22,top-86,8.6,sc,'PR')
    c.setStrokeColor(HexColor('#C9A52E') if hl else LN); c.setLineWidth(.6); c.line(x+22,top-100,x+cw-22,top-100)
    y=top-120
    for it in its: check(x+22,y+3,K if hl else Y); h=para(it,x+40,y+9,cw-62,10.4,fg,lead=1.45); y-=h+14
done()

# 08 CONTEUDOS VALIDADOS
slide(True,'CONTEÚDOS VALIDADOS NO NICHO')
title([[('8 formatos que já',WH)],[('vendem ',WH),('óculos.',Y)]],M,H-100,30)
E=[('Provador','"Testei 5 armações": a pessoa se imagina no óculos e comenta qual ficou melhor.'),
   ('O óculos do teu rosto','Redondo, quadrado, oval. Salvamento e comentário garantidos.'),
   ('Teste de lente na câmera','Antirreflexo x comum, lente que escurece no sol, polarizado na tela.'),
   ('Cronômetro Express','Grava o relógio real, da receita ao óculos pronto. Prova, não promessa.'),
   ('Sinais pra trocar','Dor de cabeça, apertar o olho, lente riscada. Vocês já fizeram: vira série.'),
   ('Primeira vez nítido','Criança ou cliente colocando o óculos novo. Emoção real (com autorização).'),
   ('O óculos da tendência','"O óculos do clipe, da série, do jogo": carona no assunto da semana.'),
   ('Bastidor do laboratório','Corte e montagem da lente. Satisfatório e mostra que o Express é real.')]
cw=(W-2*M-36)/4; top=H-180; ch=(top-62-12)/2
for i,(t,s_) in enumerate(E):
    x=M+(i%4)*(cw+12); y=top-(i//4)*(ch+12)
    rect(x,y-ch,cw,ch,C1,14); txt(f'{i+1:02d}',x+18,y-32,18,Y,'PB'); txt(t,x+18,y-58,11.5,WH,'PB')
    para(s_,x+18,y-68,cw-36,9.2,GR,lead=1.5)
para('Formatos recorrentes nas óticas que crescem no Instagram. A House adapta roteiro, gancho e estética pra cara da Virtus.',M,52,700,8.8,G2)
done()

# 09 ACOES DE VENDA
slide(False,'ESTRATÉGIAS DE VENDA')
title([[('8 ações pra transformar',K)],[('seguidor em cliente.',K)]],M,H-100,30)
E=[('Oferta fixada','"Óculos completo a partir de R$ X" no 1º fixado e na bio, sempre.'),
   ('Receita na gaveta','Campanha pra quem tem receita parada: traz que a gente monta em até 1h.'),
   ('Convênio com empresas','Condição pra quem trabalha nas lojas e escritórios da Boa Vista.'),
   ('Parceria com clínicas','Indicação cruzada com oftalmologistas perto das 2 lojas.'),
   ('Sol de brinde no verão','O combo que vocês já usam, virando campanha fixa da estação.'),
   ('Indique e ganhe','Quem indica ganha ajuste e limpeza premium ou desconto no próximo.'),
   ('Lembrete de 12 meses','"Teu óculos fez 1 ano, bora revisar?" no WhatsApp de quem comprou.'),
   ('Google + avaliações','Aparecer em "ótica perto de mim" nas 2 unidades, com notas reais.')]
cw=(W-2*M-36)/4; top=H-172; ch=(top-48-12)/2
for i,(t,s_) in enumerate(E):
    x=M+(i%4)*(cw+12); y=top-(i//4)*(ch+12)
    rect(x,y-ch,cw,ch,K,14); txt(f'{i+1:02d}',x+18,y-32,18,Y,'PB'); txt(t,x+18,y-58,11.5,WH,'PB')
    para(s_,x+18,y-68,cw-36,9.2,GR,lead=1.5)
done()

# 10 GUERRILHA
slide(True,'MARKETING DE GUERRILHA')
b=title([[('Muito resultado,',WH)],[('pouco ',WH),('dinheiro.',Y)]],M,H-100,30)
sparks(b[1][1]+14,H-100-33+22,'br',.8)
para('Ações de rua com custo baixo, que geram conversa na calçada, conteúdo pro Instagram e contato no WhatsApp ao mesmo tempo.',M,H-180,440,10.5,GR)
G_=[('Tabela de letras na vitrine','Uma tabela gigante na fachada: "Leu a última linha? Entra que a gente te mostra os modelos."'),
    ('Estação de limpeza grátis','Mesa na porta limpando e ajustando o óculos de quem passa. Em troca, o WhatsApp entra na lista.'),
    ('Flanela com QR Code','Toda flanela entregue leva o QR pro WhatsApp. Cada óculos vira um anúncio que dura anos.'),
    ('Moldura instagramável','Um óculos gigante com a marca na loja: tira foto, marca @oticavirtus e ganha um mimo.'),
    ('Cupom cruzado com vizinhos','Lojas da Rua da Conceição e da Av. Maurício de Nassau trocando cupons. Custo zero.'),
    ('Óculos de sol no Carnaval','Ação perto dos blocos (com autorização) e cupom pra voltar na loja depois da folia.')]
cw=(W-2*M-24)/3; top=H-232; ch=(top-48-12)/2
for i,(t,s_) in enumerate(G_):
    x=M+(i%3)*(cw+12); y=top-(i//3)*(ch+12); hl=i==1
    rect(x,y-ch,cw,ch,Y if hl else C1,14)
    txt(f'{i+1:02d}',x+18,y-28,14,K if hl else Y,'PB'); txt(t,x+50,y-28,11,K if hl else WH,'PB')
    para(s_,x+18,y-40,cw-36,9.2,DK if hl else GR,lead=1.5)
done()

# 11 CAPTACAO DE LEADS
slide(True,'CAPTAÇÃO DE LEADS')
title([[('Cliente que compra',WH)],[('e some ',WH),('volta pra lista.',Y)]],M,H-100,30)
para('Óculos se troca de tempos em tempos. Sem uma lista, a Virtus depende de o cliente lembrar dela. Com a lista, cada venda de hoje já é a venda do ano que vem.',M,H-180,520,10.5,GR)
L=[('ISCA','Quiz "qual óculos combina com teu rosto?", estação de limpeza e QR da flanela.'),
   ('CONTATO','WhatsApp com mensagem pronta e etiqueta de origem: Instagram, rua ou Google.'),
   ('LISTA','Listas por interesse: grau, sol, infantil. Cada uma recebe o que importa.'),
   ('OFERTA','A campanha do mês chega primeiro pra lista. Black Friday com acesso antecipado.'),
   ('RECOMPRA','Lembrete de 12 meses, aniversário do cliente e indicação premiada.')]
cw=(W-2*M-4*14)/5; ly=H-262
c.setStrokeColor(LN); c.setLineWidth(1.5); c.line(M+8,ly,W-M-8,ly)
for i,(t,s_) in enumerate(L):
    x=M+i*(cw+14); hl=i==4
    c.setFillColor(Y); c.circle(x+8,ly,6,stroke=0,fill=1); c.setFillColor(K); c.circle(x+8,ly,2.5,stroke=0,fill=1)
    rect(x,120,cw,ly-142,Y if hl else C1,14)
    txt(f'PASSO {i+1}',x+16,ly-46,7,K if hl else G2,'PB',cs=1.4); txt(t,x+16,ly-66,13,K if hl else Y,'PB',cs=.8)
    para(s_,x+16,ly-78,cw-32,9.2,DK if hl else GR,lead=1.5)
done()

# 12 CALENDARIO
slide(True,'CALENDÁRIO DE OPORTUNIDADES')
title([[('Os próximos 4 meses',WH)],[('são os que ',WH),('mais vendem.',Y)]],M,H-100,30)
para('Fechando agora, a House entra a tempo da Black Friday. Cada mês tem uma campanha pronta, com Reels, artes e disparo pra lista.',M,H-180,520,10.5,GR)
C_=[('NOVEMBRO','Black Virtus','Lista VIP com acesso antecipado à Black Friday (27/11) e oferta de óculos completo.'),
    ('DEZEMBRO','Óculos de presente','Óculos de sol e vale-presente pro Natal. Embalagem que vira conteúdo de unboxing.'),
    ('JANEIRO','Verão e volta às aulas','Sol polarizado pro verão do Recife e o primeiro óculos da criança antes das aulas.'),
    ('FEVEREIRO','Carnaval Virtus','Óculos de folia e Virtus Express pra quem perdeu ou quebrou o óculos no bloco.')]
cw=(W-2*M-36)/4; top=H-232
for i,(m,t,s_) in enumerate(C_):
    x=M+i*(cw+12); hl=i==0; rect(x,120,cw,top-120,Y if hl else C1,16)
    txt(m,x+20,top-30,8,K if hl else Y,'PB',cs=1.8); h=para(t,x+20,top-42,cw-40,15,K if hl else WH,'PB',1.2)
    para(s_,x+20,top-54-h,cw-40,9.4,DK if hl else GR,lead=1.5)
done()

# 13 UM MES
slide(True,'COMO FUNCIONA')
title([[('Um mês de trabalho',WH)],[('nas duas ',WH),('lojas.',Y)]],M,H-100,30)
para('A House alterna as visitas entre Boa Vista e Iputinga. Vocês cuidam dos clientes, a gente cuida da imagem e da venda no digital.',M,H-180,560,10.5,GR)
S=[('SEMANA 1','Perfil + Reels',['Diagnóstico com os Insights','Bio, fixados e destaques novos','1ª diária de Reels na Boa Vista']),
   ('SEMANA 2','Reels + rua',['2ª diária de Reels em Iputinga','Ação de guerrilha gravada','Artes da campanha do mês']),
   ('SEMANA 3','Fotos + campanha',['Sessão de fotos de produto e equipe','Campanha do mês no ar','Disparo pra lista do WhatsApp']),
   ('SEMANA 4','Reels + resultado',['3ª diária de Reels','Relatório: alcance, contatos, vendas','O que funcionou vira pauta'])]
cw=(W-2*M-36)/4; ly=H-262
c.setStrokeColor(LN); c.setLineWidth(1.5); c.line(M+8,ly,W-M-8,ly)
for i,(s1,s2,its) in enumerate(S):
    x=M+i*(cw+12); c.setFillColor(Y); c.circle(x+8,ly,6,stroke=0,fill=1); c.setFillColor(K); c.circle(x+8,ly,2.5,stroke=0,fill=1)
    txt(s1,x,ly-32,8,Y,'PB',cs=1.8); txt(s2,x,ly-56,16,WH,'PB')
    y=ly-86
    for it in its: check(x,y+3,Y,.9); h=para(it,x+18,y+9,cw-24,10,GR); y-=h+10
done()

# 14 FONTENELE
slide(False,'EXCLUSIVO DA HOUSE')
b=title([[('A Fontenele',K)],[('dentro da Virtus.',K)]],M,H-110,40)
sparks(b[1][1]+16,H-110-44+28,'br',1,K)
para('A House do Creator é sócia da <b>Priscilla Fontenele</b>, influenciadora com cerca de <b>1,2 milhão de seguidores</b>. Nos planos Nitidez e Visão 360 ela vai até a loja, escolhe o óculos dela com a equipe e marca o @oticavirtus pra essa audiência.',M,H-226,450,11,DK,lead=1.6)
FN=[('Visita na loja','Gravação com a equipe que vira Reels e Stories da Virtus.'),
    ('O @ da Fontenele','Marcação pro público dela, com caminho direto pro perfil.'),
    ('Conteúdo que fica','O que for gravado vira anúncio e prova social depois.')]
y=150
for i,(a,b_) in enumerate(FN):
    x=M+i*152; rect(x,52,142,y-52+28,K,14)
    txt(f'{i+1:02d}',x+16,y,12,Y,'PB'); txt(a,x+16,y-20,10.5,WH,'PB'); para(b_,x+16,y-28,110,8.4,GR,lead=1.45)
bx=W/2+80; bw=W-M-bx
rect(bx,52,bw,H-120-52,K,18)
txt('ALCANCE APROXIMADO',bx+24,H-150,7.5,Y,'PB',cs=1.6)
txt('1,2 mi',bx+24,H-212,52,WH,'PB'); txt('de seguidores da Fontenele',bx+24,H-234,9.5,GR,'PR')
c.setStrokeColor(LN); c.setLineWidth(.6); c.line(bx+24,H-256,bx+bw-24,H-256)
for k,(pl,v) in enumerate([('NITIDEZ','1 @ da Fontenele + visita na loja'),('VISÃO 360','2 @ da Fontenele + visita na loja')]):
    yy=H-290-k*58; txt(pl,bx+24,yy,8,Y,'PB',cs=1.6); txt(v,bx+24,yy-18,11,WH,'PB')
para('Dentro do período do contrato. Data da visita combinada com a agenda dela e da loja.',bx+24,110,bw-48,8.4,G2,lead=1.45)
done()

# 15 PLANOS
slide(False,'INVESTIMENTO MENSAL')
title([[('Escolhe o foco',K)],[('da Virtus.',K)]],M,H-100,30)
P=[('FOCO','2.000','Pra estruturar o perfil',
    ['4 visitas no mês (2 por loja)','8 Reels com roteiro e gancho','1 sessão de fotos de produto','6 artes ou carrosséis','Legendas, calendário e Stories','Bio, fixados e destaques novos','Diagnóstico completo do perfil','Relatório mensal'],False),
   ('NITIDEZ','2.600','Pra vender todo mês',
    ['5 visitas no mês','12 Reels com roteiro e gancho','1 sessão de fotos de produto','8 artes ou carrosséis','Tudo do Foco, mais:','Perfil reformulado completo','Google das 2 lojas + avaliações','1 campanha de vendas por mês','1 ação de guerrilha por mês','Funil de leads no WhatsApp','!1 @ da Fontenele + visita','*Landing page com quiz'],True),
   ('VISÃO 360','3.000','Pra dominar a região',
    ['6 visitas no mês','15 Reels com roteiro e gancho','1 sessão de fotos de produto','10 artes ou carrosséis','Tudo do Nitidez, mais:','Gestão de tráfego pago','2 ações de guerrilha por mês','Treino da equipe pra gravar','Reunião quinzenal + suporte','!2 @ da Fontenele + visita','*Landing page com quiz','*Ensaio de campanha'],False)]
x0=M+262; cw=(W-M-x0-24)/3; top=H-66; bot=52
para('Captação, roteiro, edição, legendas e postagem inclusos em todos os planos.',M,H-190,190,10.5,DK)
para('Valores mensais, contrato mínimo de 3 meses. Verba de anúncio paga à parte. Arrobas e visita da Fontenele dentro do período do contrato.',M,H-258,190,8.6,DK2,lead=1.5)
rect(M,bot,190,104,K,14); txt('NO NITIDEZ',M+16,bot+80,7.5,Y,'PB',cs=1.6)
para('A Fontenele na loja, a landing page com quiz e o funil de leads. <b>+R$ 600 = R$ 20 por dia.</b>',M+16,bot+72,158,9,WH,'PM',1.45)
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
        if it[0] in '*!':
            lab='INCLUSO' if it[0]=='*' else 'EXCLUSIVO'; t=it[1:]
            lw_=pdfmetrics.stringWidth(lab,'PB',5.8)+len(lab)*1
            rect(x+14,y-5,cw-28,16,Y if it[0]=='*' else WH,8); txt(lab,x+21,y-0.5,5.8,K,'PB',cs=1); txt(t,x+21+lw_+6,y-0.5,7.4,K,'PB'); y-=19
        elif it.endswith(':'):
            txt(it,x+18,y,7.6,Y,'PB'); y-=15
        else:
            check(x+18,y+3,Y if hl else GR,.8); txt(it,x+33,y,8.1,WH if hl else GR,'PR'); y-=15.6
done()

# 16 COMPARATIVO
slide(True,'COMPARATIVO')
b=title([[('Por que o ',WH),('Nitidez',Y)],[('compensa mais.',WH)]],M,H-96,28)
sparks(b[0][1]+12,H-80,'br',.75)
rows=[('Visitas nas lojas por mês','4','5','6'),('Reels editados','8','12','15'),('Sessão de fotos de produto','1','1','1'),('Artes ou carrosséis','6','8','10'),
      ('Legendas, calendário e Stories','✓','✓','✓'),('Bio, fixados e destaques novos','✓','✓','✓'),('Relatório mensal','✓','✓','✓'),
      ('Perfil reformulado completo','—','✓','✓'),('Google das 2 lojas + avaliações','—','✓','✓'),('Campanha de vendas mensal','—','✓','✓'),
      ('Ações de guerrilha por mês','—','1','2'),('Funil de leads no WhatsApp','—','✓','✓'),('Landing page com quiz','—','✓','✓'),
      ('@ da Fontenele + visita na loja','—','1','2'),('Gestão de tráfego pago','—','—','✓'),('Treino da equipe pra gravar','—','—','✓'),
      ('Reunião quinzenal + suporte','—','—','✓'),('Ensaio de campanha sazonal','—','—','✓')]
tx=M; tw=560; c1=tx+250; cwd=(tw-250)/3; top=H-150; rh=16.4
rect(c1+cwd,40,cwd,top-40+24,HexColor('#17150B'),10)
for j,h in enumerate(['FOCO','NITIDEZ','VISÃO 360']): txt(h,c1+j*cwd+cwd/2,top+6,7.5,Y if j==1 else G2,'PB','c',cs=1.4)
y=top-4
for k,r in enumerate(rows):
    c.setStrokeColor(LN); c.setLineWidth(.5); c.line(tx,y-rh+5,tx+tw,y-rh+5)
    txt(r[0],tx,y-8,8.4,WH,'PR')
    for j in (1,2,3):
        v=r[j]; cx=c1+(j-1)*cwd+cwd/2; col=Y if j==2 else (WH if v!='—' else G2)
        if v=='✓': check(cx-5,y-5,col,.8)
        else: txt(v,cx,y-8,9,col,'PB' if j==2 else 'PR','c')
    y-=rh
y-=2; txt('Valor por mês',tx,y-8,9.5,WH,'PB')
for j,v in enumerate(['R$ 2.000','R$ 2.600','R$ 3.000']): txt(v,c1+j*cwd+cwd/2,y-8,10.5,Y if j==1 else WH,'PB','c')
bx=tx+tw+36; bw=W-M-bx
rect(bx,40,bw,top-40+24,Y,16)
txt('A CONTA',bx+22,top-6,8,K,'PB',cs=1.8)
txt('+R$ 600',bx+22,top-52,32,K,'PB')
para('separam o Foco do Nitidez. Dá <b>R$ 20 por dia</b>.',bx+22,top-64,bw-44,10.5,K,'PM',1.45)
c.setStrokeColor(HexColor('#C9A52E')); c.setLineWidth(.6); c.line(bx+22,top-108,bx+bw-22,top-108)
para('Na tabela avulsa da House, cada Reels sai <b>R$ 250</b> e a landing page <b>R$ 390</b>. Só os 4 Reels a mais do Nitidez já passam dos R$ 600. E ainda vem o Google, a campanha do mês, o funil de leads e a Fontenele na loja.',bx+22,top-120,bw-44,9.2,HexColor('#3A300B'),'PR',1.55)
para('<b>O Visão 360 é pra quem quer tráfego pago e o dobro de Fontenele.</b>',bx+22,82,bw-44,9.2,K,'PB',1.4)
done()

# 17 LANDING PAGE
slide(True,'INCLUSO NO NITIDEZ E NO VISÃO 360')
title([[('Um quiz que vira',WH)],[('contato no ',WH),('WhatsApp.',Y)]],M,H-100,30)
para('Uma landing page da Virtus pra bio, pro Google e pros anúncios. O cliente responde 4 perguntas, descobre os modelos que combinam com ele e já chama no WhatsApp com a resposta pronta.',M,H-180,430,11,GR,lead=1.6)
F=[('Quiz do óculos ideal','Rosto, estilo, uso e grau ou sol'),('Botão de WhatsApp','Mensagem pronta com o resultado'),('As 2 lojas','Endereço, mapa e horário de cada uma'),('Virtus Express','O diferencial em destaque na página'),('Avaliações reais','Puxadas do Google das unidades'),('Lista automática','Cada resposta vira um lead')]
y=H-268
for i,(a,b_) in enumerate(F):
    x=M+(i%2)*222; yy=y-(i//2)*58
    check(x,yy+3,Y); txt(a,x+18,yy,10.5,WH,'PB'); txt(b_,x+18,yy-15,8.8,G2,'PR')
pw=176; ph=356; px=W-M-pw-70; py=60
rect(px-8,py-8,pw+16,ph+16,HexColor('#262626'),28); rect(px,py,pw,ph,HexColor('#F4F1EC'),21)
c.saveState(); p=c.beginPath(); p.roundRect(px,py,pw,ph,21); c.clipPath(p,stroke=0)
rect(px,py+ph-120,pw,120,VN)
for i in range(5): c.setStrokeColor(VO); c.setLineWidth(10); c.line(px-60+i*50,py+ph-120,px+i*50+20,py+ph)
c.restoreState()
c.setFillColor(VN); c.roundRect(px+pw/2-46,py+ph-86,92,26,13,stroke=0,fill=1); txt('VIRTUS',px+pw/2,py+ph-77,10,WH,'PB','c',cs=2.5)
txt('Qual óculos combina',px+pw/2,py+ph-146,11,VN,'PB','c'); txt('com o teu rosto?',px+pw/2,py+ph-160,11,VN,'PB','c')
txt('Responde 4 perguntas e descobre.',px+pw/2,py+ph-174,7,HexColor('#555555'),'PR','c')
for k,o in enumerate(['Redondo','Quadrado','Oval','Coração']):
    xx=px+18+(k%2)*((pw-44)/2+8); yy=py+ph-210-(k//2)*32
    c.setStrokeColor(VN); c.setLineWidth(1); c.setFillColor(white); c.roundRect(xx,yy,(pw-44)/2,24,8,stroke=1,fill=1); txt(o,xx+(pw-44)/4,yy+8.5,7.8,VN,'PM','c')
rect(px+18,py+ph-290,pw-36,24,VO,12); txt('VER MEUS MODELOS',px+pw/2,py+ph-281,7.5,WH,'PB','c',cs=.8)
txt('Virtus Express: óculos em até 1h',px+pw/2,py+ph-312,7,VN,'PB','c')
txt('Boa Vista  ·  Iputinga',px+pw/2,py+ph-326,6.8,HexColor('#555555'),'PR','c')
txt('Imagem ilustrativa',px+pw/2,py-20,7,G2,'PR','c')
done()

# 18 POR QUE A HOUSE
slide(True,'POR QUE A HOUSE')
b=title([[('Padrão de estúdio',WH)],[('com alcance de',WH)],[('influência.',Y)]],M,H-120,40)
sparks(b[0][0]-6,H-98,'tl',1)
para('A House do Creator é estúdio de foto e vídeo em Recife. Quem vai nas lojas da Virtus é a mesma equipe que faz direção, captação, edição, design e estratégia. E a sócia da House é uma das influenciadoras com mais alcance da cidade.',M,H-300,400,11,GR,lead=1.65)
x=W/2+40; w=W-M-x
items=[('Equipe completa','Foto, vídeo, design e estratégia no mesmo contrato'),('Influência de verdade','A Fontenele na loja e no @ da Virtus, sem intermediário'),('Portfólio na mesa','A gente mostra nossos trabalhos antes de vocês decidirem')]
y=H-70
for i,(a,b_) in enumerate(items):
    hl=i==1; bh=118; rect(x,y-bh,w,bh,Y if hl else C1,14)
    txt(f'{i+1:02d}',x+20,y-28,10,K if hl else Y,'PB')
    h=para(a,x+20,y-38,w-40,13,K if hl else WH,'PB',1.3); para(b_,x+20,y-46-h,w-40,9.8,HexColor('#3A300B') if hl else GR,'PR',1.45)
    y-=bh+12
done()

# 19 PROXIMOS PASSOS
slide(False,'PRÓXIMOS PASSOS')
title([[('Do sim ao primeiro',K)],[('post em 10 dias.',K)]],M,H-100,32)
St=[('01','Conversa de 15 min','A gente apresenta a proposta e tira as dúvidas.'),
    ('02','Escolhe o plano','Foco, Nitidez ou Visão 360, no ritmo da Virtus.'),
    ('03','Diagnóstico','Acesso aos Insights, pauta do mês e campanha da Black Friday.'),
    ('04','Primeira visita','Gravação na loja e o perfil novo no ar.')]
cw=(W-2*M-36)/4; top=H-210
for i,(n,t,s_) in enumerate(St):
    x=M+i*(cw+12); rect(x,150,cw,top-150,K,16)
    txt(n,x+20,top-44,26,Y,'PB'); txt(t,x+20,top-74,12,WH,'PB'); para(s_,x+20,top-86,cw-40,9.5,GR)
txt('CONDIÇÕES',M,118,8,K,'PB',cs=1.8)
cond=['Pagamento mensal via Pix','Contrato mínimo de 3 meses','Tráfego com verba à parte','Conteúdo aprovado antes de ir ao ar','Proposta válida por 15 dias']
x=M
for t in cond:
    w_=pdfmetrics.stringWidth(t,'PM',7.6)+20; rect(x,72,w_,24,K,12); txt(t,x+10,81,7.6,WH,'PM'); x+=w_+6
done()

# 20 FECHAMENTO
N[0]+=1; rect(0,0,W,H,K)
hclogo(True,W/2-110,H-116,220,'principal')
b=title([[('A Virtus enxerga o Recife.',WH)],[('Agora o Recife',WH)],[('vai enxergar a Virtus.',Y)]],W/2,H-200,40,'c')
sparks(b[0][0]-14,H-180,'tl',1.1); sparks(b[2][1]+14,H-200-2*44+26,'br',1.1)
pw=300; rect(W/2-pw/2,140,pw,44,Y,22); txt('WhatsApp  (81) 98355-4583',W/2,157,13,K,'PB','c')
txt('@housedocreator',W/2,116,10,GR,'PM','c')
txt('Ryan Coimbra & Fontenele  ·  CEOs',W/2,64,10,WH,'PB','c'); txt('House do Creator  ·  Recife/PE',W/2,48,8.5,G2,'PR','c')
done()
c.save()
