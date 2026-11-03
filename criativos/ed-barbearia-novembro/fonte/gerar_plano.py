"""Gera plano.html (padrão House do Creator) para o plano de conteúdo de novembro/2026 da ED Barbearia."""
import html, pathlib

AQUI = pathlib.Path(__file__).parent
E = html.escape

# ---------------------------------------------------------------- conteúdo
VISITAS = [
    ("06/11", "sex", "Visita 1 · Diária de Reels", "Grava R1, R2 e R3 + stories da visita"),
    ("13/11", "sex", "Visita 2 · Diária de Reels", "Grava R4 e R5 + stories da visita"),
    ("19/11", "qui", "Visita 3 · Diária de fotos", "Ensaio: cortes, ambiente, equipe e o Ed (fotos de A3 e A4)"),
    ("25/11", "qua", "Visita 4 · Diária de Reels", "Grava R6 e R7 + stories da visita"),
]

# data, dia, código, tipo, título
FEED = [
    ("09/11", "seg", "A1", "Arte", "Campanha Seg a Qua: 50% no 1º corte", "fixar"),
    ("10/11", "ter", "R1", "Reels", "Do zero ao degradê", ""),
    ("12/11", "qui", "A2", "Carrossel", "Agendar na ED leva 3 toques + tabela", "fixar"),
    ("14/11", "sáb", "R2", "Reels", "Antes e depois: chegou pedindo socorro", ""),
    ("17/11", "ter", "R3", "Reels", "O Ed responde: qual corte pro seu rosto", ""),
    ("19/11", "qui", "R4", "Reels", "Movimentos da navalha, parte 2", ""),
    ("21/11", "sáb", "A3", "Carrossel", "Quem senta na cadeira da ED, volta (o Ed)", "fixar"),
    ("24/11", "ter", "R5", "Reels", "POV: agendou pelo app e não pegou fila", ""),
    ("26/11", "qui", "A4", "Carrossel", "Qual corte é o seu?", ""),
    ("28/11", "sáb", "R6", "Reels", "Barba completa: o ritual", ""),
    ("30/11", "seg", "R7", "Reels", "Pai e filho na mesma cadeira", ""),
]

CAMPANHA_DIAS = {"09", "10", "11", "16", "17", "18", "23", "24", "25", "30"}

# data, dia, tag, tema, [o que gravar], adesivo/CTA
STORIES = [
    ("04/11", "qua", "", "Bom dia da ED", ["Abrindo a porta e a primeira cadeira do dia", "Primeiro cliente sentando (pedir autorização)", "Resultado do primeiro corte, de perfil"], "Enquete: degradê ou social? + link de agendar"),
    ("05/11", "qui", "PAUTA", "Bastidor técnico", ["Close de 10 s da máquina ou navalha trabalhando", "Mão do barbeiro fazendo o contorno", "Resultado final no espelho"], "Arte story-04 com caixinha: qual corte você quer?"),
    ("06/11", "sex", "VISITA 1", "Dia de gravação", ["Bastidor da House gravando (luz, celular, cadeira)", "Cliente do Reels antes de começar", "“Tem novidade chegando no perfil”"], "Arte story-03 (antes/depois) do cliente do dia"),
    ("07/11", "sáb", "", "Casa cheia", ["Timelapse de 15 s do movimento", "3 resultados do dia em sequência", "Barbeiro mostrando a agenda de segunda"], "Link de agendar: “segunda já tem horário”"),
    ("08/11", "dom", "FECHADO", "Repost de clientes", ["Repostar stories em que clientes marcaram a @edbarbearia", "Story de texto: “Amanhã começa a semana do 50%”"], "Lembrete de evento: 09/11"),
    ("09/11", "seg", "CAMPANHA", "Estreia da campanha e do perfil novo", ["Arte story-01 (Seg a Qua · 50%)", "Tela do perfil novo mostrando os destaques", "Arte story-02 com os horários livres de hoje"], "Link de agendar em todos"),
    ("10/11", "ter", "CAMPANHA", "Horários livres + R1", ["Arte story-02 com horários de hoje", "Compartilhar o Reels R1", "Cliente em 10 s: “como ficou?”"], "Link de agendar"),
    ("11/11", "qua", "CAMPANHA", "Último dia da semana do 50%", ["Story de texto: “só até hoje nesta semana”", "Resultado do dia", "Arte story-01"], "Contagem regressiva até 19h + link"),
    ("12/11", "qui", "", "Como agendar (A2)", ["Repostar o carrossel A2", "Gravar a tela do celular agendando de verdade no app (20 s)", "“Pronto, marcado”"], "Link de agendar"),
    ("13/11", "sex", "VISITA 2", "Dia de gravação", ["Bastidor da gravação", "Antes do cliente do Reels", "Depois, de perfil"], "Arte story-03 + link"),
    ("14/11", "sáb", "", "Casa cheia + R2", ["Compartilhar o Reels R2", "Timelapse do sábado", "Enquete: barba cheia ou só o contorno?"], "Link de agendar"),
    ("15/11", "dom", "FECHADO", "Pergunte ao Ed", ["Story de texto: “Manda tua dúvida pro Ed”"], "Caixinha de perguntas (respostas na segunda)"),
    ("16/11", "seg", "CAMPANHA", "O Ed responde", ["Ed respondendo 3 perguntas da caixinha em vídeo selfie (até 30 s cada)", "Arte story-01"], "Link de agendar"),
    ("17/11", "ter", "CAMPANHA", "Horários livres + R3", ["Arte story-02 com horários", "Compartilhar o Reels R3", "Resultado do dia"], "Link de agendar"),
    ("18/11", "qua", "CAMPANHA", "Espaço kids", ["Criança na cadeira (só com autorização dos pais)", "Resultado com o pai ou a mãe", "“Último dia do 50% nesta semana”"], "Contagem regressiva + link"),
    ("19/11", "qui", "VISITA 3", "Dia do ensaio", ["Bastidor das fotos", "Cada barbeiro se apresenta: nome e corte favorito (1 story cada)", "Compartilhar o Reels R4"], "Enquete: qual barbeiro você já conhece?"),
    ("20/11", "sex", "FERIADO", "Consciência Negra", ["Se abrir: “aberto no feriado” + horários livres", "Se fechar: aviso e link para agendar sábado"], "Confirmar com o Ed até 18/11"),
    ("21/11", "sáb", "", "Um dia com o Ed (A3)", ["Repostar o carrossel A3", "Ed chegando e preparando a bancada", "Ed revisando um acabamento"], "Link de agendar"),
    ("22/11", "dom", "FECHADO", "Repost + teaser", ["Repostar clientes que marcaram a ED", "“Amanhã volta o 50% no 1º corte”"], "Lembrete de evento: 23/11"),
    ("23/11", "seg", "CAMPANHA", "Abertura da semana", ["Arte story-01", "Arte story-02 com horários", "Bastidor da manhã"], "Link de agendar"),
    ("24/11", "ter", "CAMPANHA", "Prova real + R5", ["Compartilhar o Reels R5", "Depoimento de quem usou o 50% (10 a 15 s)", "Resultado do dia"], "Link de agendar"),
    ("25/11", "qua", "VISITA 4", "Última quarta do 50% no mês", ["Bastidor da gravação", "“Última quarta do mês com 50%”", "Antes e depois do dia"], "Contagem regressiva + link"),
    ("26/11", "qui", "", "Qual corte é o seu (A4)", ["Repostar o carrossel A4", "Enquete com os 3 cortes", "Caixinha: manda o print do corte que você quer"], "Arte story-04 + link"),
    ("27/11", "sex", "BLACK FRIDAY", "A nossa black é toda semana", ["Story de texto: “A Black da ED é de segunda a quarta: 50% no 1º corte”", "Horários livres de sábado", "Resultado do dia"], "Link de agendar"),
    ("28/11", "sáb", "", "Casa cheia + R6", ["Compartilhar o Reels R6", "Timelapse do sábado", "“Dezembro lota: já dá pra marcar”"], "Link de agendar"),
    ("29/11", "dom", "FECHADO", "Retrospectiva do mês", ["Os 3 melhores cortes de novembro", "Agradecimento aos clientes"], "Caixinha: o que você quer ver em dezembro?"),
    ("30/11", "seg", "CAMPANHA", "Agenda de dezembro aberta", ["Compartilhar o Reels R7", "Arte story-01", "“A agenda de dezembro já está aberta no app”"], "Link de agendar"),
]

REELS = [
    ("R1", "Do zero ao degradê", "06/11", "10/11", "Técnica (o que mais roda no perfil)",
     "Close na nuca com a máquina ligando. Texto: “Do zero ao degradê em 30 segundos.”",
     ["Cliente sentando, cabelo antes (2 s)", "Máquina abrindo o degradê, 4 cortes rápidos de 2 s", "Pente e tesoura no topo", "Contorno na navalha (close)", "Giro da cadeira mostrando o resultado"],
     "Degradê da ED do começo ao fim. Agende pelo link da bio. Segunda a quarta, 50% no primeiro corte."),
    ("R2", "Antes e depois: chegou pedindo socorro", "06/11", "14/11", "Antes e depois",
     "Cliente olhando o próprio cabelo no espelho com cara de dúvida. Texto: “Ele chegou assim…”",
     ["Antes em 3 ângulos (frente, perfil, nuca)", "Ed explicando o que vai fazer em 1 frase", "Corte acelerado", "Depois nos mesmos 3 ângulos", "Reação do cliente"],
     "Chegou pedindo socorro, saiu pronto pra foto. Marca aquele amigo que precisa. Agende pelo link da bio."),
    ("R3", "O Ed responde: qual corte pro seu rosto", "06/11", "17/11", "O Ed como rosto da marca",
     "Ed olhando pra câmera: “Rosto redondo? Não faz esse corte.”",
     ["Ed explica 3 formatos de rosto (redondo, quadrado, alongado)", "Para cada um, 1 corte indicado com foto ou cliente real", "Fecha: “Não sabe o seu? Senta aqui que eu te digo.”"],
     "Qual é o seu formato de rosto? Comenta aí que o Ed responde. Agende pelo link da bio."),
    ("R4", "Movimentos da navalha, parte 2", "13/11", "19/11", "Continuação do Reels de 16,6 mil views",
     "Close na navalha abrindo. Texto: “Parte 2, porque vocês pediram.”",
     ["Navalha sendo montada", "3 movimentos em close, com o Ed narrando o nome de cada um", "Resultado do contorno", "Ed: “Quer aprender? Destaque CURSO.”"],
     "Os movimentos da navalha, parte 2. Salva pra ver depois. Agende pelo link da bio."),
    ("R5", "POV: agendou pelo app e não pegou fila", "13/11", "24/11", "Conversão (app + campanha)",
     "Tela do celular agendando. Texto: “POV: você agendou e não pegou fila.”",
     ["Gravação da tela escolhendo serviço e hora", "Cliente chegando e já sentando na cadeira", "Corte rápido", "Resultado + texto: “segunda a quarta, 50% no 1º corte”"],
     "Sem fila, sem esperar. Agende pelo link da bio. Segunda a quarta, 50% no primeiro corte pelo app."),
    ("R6", "Barba completa: o ritual", "25/11", "28/11", "Técnica e experiência",
     "Toalha quente subindo do rosto do cliente (close).",
     ["Toalha quente", "Espuma ou óleo", "Navalha desenhando a linha", "Acabamento e finalização", "Cliente passando a mão na barba"],
     "Barba feita do jeito certo. Agende cabelo + barba por R$ 80 pelo link da bio."),
    ("R7", "Pai e filho na mesma cadeira", "25/11", "30/11", "Espaço kids e família (com autorização)",
     "Pai e filho sentados lado a lado. Texto: “Quem cortou melhor?”",
     ["Os dois chegando juntos", "Corte do filho no espaço kids", "Corte do pai", "Os dois no espelho no final", "Texto: “A agenda de dezembro já está aberta”"],
     "Programa de pai e filho na ED. Dezembro lota: já dá pra marcar pelo link da bio."),
]

LEGENDAS = {
    "A1": "Segunda a quarta a ED tem 50% no seu primeiro corte. É só agendar pelo app, escolher o horário e sentar na cadeira. Link na bio. 📍 Rua Paula Batista, 604, Casa Amarela.",
    "A2": "Agendar na ED leva 3 toques: link da bio, serviço e hora, confirmar. Arrasta pra ver a tabela. Cabelo R$ 50, barba R$ 40, cabelo + barba R$ 80.",
    "A3": "Quem senta na cadeira da ED, volta. O Ed está na casa de segunda a sábado e revisa cada acabamento antes de você levantar. Sua vez: link na bio.",
    "A4": "Qual corte é o seu? Textured crop, degradê com barba ou crop com fade. Comenta o número e manda o print do seu corte no direct. Agende pelo link da bio.",
}

BIO = ["ED BARBEARIA | Casa Amarela, Recife", "✂️ Degradê, barba, kids e salão", "🗓️ Seg a sáb, 9h às 19h", "🎟️ 50% no 1º corte: seg a qua, pelo app", "👇 Agende em 1 toque"]
DESTAQUES = [("agendar", "AGENDAR"), ("cortes", "CORTES"), ("precos", "PREÇOS"), ("kids", "KIDS"), ("salao", "SALÃO"), ("acao-social", "AÇÃO SOCIAL"), ("curso", "CURSO"), ("onde", "ONDE")]

# ---------------------------------------------------------------- layout
CSS = """
@page{size:1333px 750px;margin:0}
*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
:root{--bg:#0b0b0b;--card:#161616;--y:#f5cf47;--w:#fff;--g:#9a9a9a;--l:#262626}
body{font-family:Poppins,sans-serif;background:var(--bg);color:var(--w)}
.s{position:relative;width:1333px;height:750px;overflow:hidden;background:var(--bg);page-break-after:always;padding:0 78px}
.s.am{background:var(--y);color:#0b0b0b}
.rot{position:absolute;left:78px;top:46px;font-size:11px;font-weight:700;letter-spacing:3px;color:var(--y);text-transform:uppercase}
.am .rot{color:#0b0b0b}
.hc{position:absolute;right:78px;top:38px;width:48px}
.rod{position:absolute;left:78px;right:78px;bottom:24px;border-top:1px solid var(--l);padding-top:12px;display:flex;justify-content:space-between;font-size:9px;font-weight:700;letter-spacing:2.5px;color:#6a6a6a}
.am .rod{border-color:rgba(11,11,11,.18);color:rgba(11,11,11,.6)}
h1{font-weight:700;font-size:46px;line-height:1.08;letter-spacing:-1.2px;padding-top:100px}
h1 em{font-style:normal;color:var(--y)}.am h1 em{color:#0b0b0b}
.sub{color:var(--g);font-size:15px;margin-top:14px;max-width:720px;line-height:1.55}
.am .sub{color:rgba(11,11,11,.7)}
.card{background:var(--card);border-radius:18px;padding:22px 24px}
.am .card{background:#0b0b0b;color:#fff}
.k{font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:var(--y)}
.chk{display:flex;gap:10px;font-size:13px;line-height:1.45;margin-top:8px}
.chk::before{content:"";flex:none;width:12px;height:7px;border-left:2.5px solid var(--y);border-bottom:2.5px solid var(--y);transform:rotate(-45deg);margin-top:5px}
.tag{display:inline-block;font-size:9px;font-weight:700;letter-spacing:1.8px;padding:3px 8px;border-radius:99px;background:var(--l);color:#ddd;text-transform:uppercase}
.tag.c{background:var(--y);color:#0b0b0b}.tag.v{background:#3a7bff;color:#fff}.tag.f{background:#333;color:#999}.tag.e{background:#e8604c;color:#fff}
table{border-collapse:collapse;width:100%}
"""

def slide(rot, n, corpo, amarelo=False, logo=True):
    hc = '<img class="hc" src="img/hc-escuro.png">' if amarelo else '<img class="hc" src="img/hc-claro.png">'
    return f'''<section class="s{' am' if amarelo else ''}"><div class="rot">{rot}</div>{hc if logo else ''}{corpo}
<div class="rod"><span>ED BARBEARIA × HOUSE DO CREATOR</span><span>{n:02d}</span></div></section>'''

S = []
n = 0
def add(rot, corpo, **kw):
    global n
    n += 1
    S.append(slide(rot, n, corpo, **kw))

# 1 capa
n += 1
S.append(f'''<section class="s" style="padding:0">
<div style="position:absolute;inset:0;left:640px;background:url(img/nuca.jpg) center 30%/cover;filter:grayscale(1) brightness(.75)"></div>
<div style="position:absolute;inset:0;left:640px;background:linear-gradient(90deg,#0b0b0b 0%,rgba(11,11,11,.2) 40%,rgba(11,11,11,0) 100%)"></div>
<img src="img/hc-claro.png" style="position:absolute;left:78px;top:60px;width:80px">
<div class="rot" style="top:160px">Plano de conteúdo · Novembro 2026</div>
<h1 style="position:absolute;left:78px;top:110px;font-size:64px;line-height:1.04;max-width:640px">Novembro é o mês de <em>encher a cadeira.</em></h1>
<p class="sub" style="position:absolute;left:78px;top:470px;max-width:520px">Calendário do mês, stories de todo dia pra equipe, roteiros dos 7 Reels, as 4 artes do feed, campanha Seg a Qua e perfil novo. Plano Essencial + campanha de bônus.</p>
<div style="position:absolute;left:78px;top:600px;border-top:1px solid #262626;padding-top:18px;width:520px"><b style="font-size:15px">Ryan Coimbra &amp; Fontenele</b><div style="color:#6a6a6a;font-size:12px">CEOs · House do Creator</div></div>
<img src="img/logo-ed.png" style="position:absolute;right:80px;bottom:60px;width:150px">
</section>''')

# 2 o que está no plano
itens = [
    ("4 visitas no mês (1 por semana)", "06/11, 13/11, 19/11 e 25/11"),
    ("3 diárias de Reels: 7 Reels", "Visitas 1, 2 e 4 · R1 a R7 publicados de 10 a 30/11"),
    ("1 diária de fotos pro feed", "Visita 3, 19/11 · fotos de A3, A4 e dos meses seguintes"),
    ("4 artes ou carrosséis", "A1 a A4, prontas neste material"),
    ("Legendas, calendário e Stories", "Calendário de 11 posts, legendas e pauta de stories de 04 a 30/11"),
    ("Bio e capas de destaques novas", "No ar em 09/11, com 8 capas no padrão novo"),
    ("Relatório mensal", "Entregue em 30/11, com o que vira pauta de dezembro"),
    ("Bônus: 1 campanha de vendas", "Seg a Qua Cheia · 50% no 1º corte, de 09 a 30/11"),
]
cards = "".join(f'<div class="card" style="padding:16px 20px"><div style="font-weight:700;font-size:14px">{E(a)}</div><div style="color:var(--g);font-size:12px;margin-top:4px">{E(b)}</div></div>' for a, b in itens)
add("Escopo · Plano Essencial", f'''<h1>Tudo que foi contratado, <em>com data marcada.</em></h1>
<p class="sub">Plano Essencial (R$ 1.000/mês) + uma campanha de vendas de bônus. Cada item do contrato tem dia e responsável neste material.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:30px">{cards}</div>''')

# 3 campanha
add("Campanha do mês · Bônus", f'''<h1>Seg a Qua Cheia: <em>50% no 1º corte.</em></h1>
<p class="sub">Segunda a quarta são os dias mais vazios. A promoção que a ED já tem vira campanha do mês, com peça no feed, stories em todo dia de campanha e Reels apontando pro app.</p>
<div style="display:grid;grid-template-columns:1.1fr 1fr 1fr;gap:14px;margin-top:30px">
<div class="card"><div class="k">Mecânica</div><div class="chk">50% no primeiro corte, agendando pelo app</div><div class="chk">Vale de segunda a quarta</div><div class="chk">Período: 09 a 30/11 (10 dias de campanha)</div><div class="chk">Pedir ao cliente: “como conheceu a ED?”</div></div>
<div class="card"><div class="k">Peças</div><div class="chk">A1 no feed, fixada em 09/11</div><div class="chk">Story-01 e story-02 em todo dia de campanha</div><div class="chk">R5 (POV do app) e R1 com a oferta na legenda</div><div class="chk">Bio e destaque AGENDAR com a oferta</div></div>
<div class="card"><div class="k">O que medir</div><div class="chk">Agendamentos de seg a qua no app, antes x depois</div><div class="chk">Quantos usaram o 50%</div><div class="chk">Cliques no link da bio</div><div class="chk">Quanto desses clientes voltou em 20 dias</div></div>
</div>
<div style="display:flex;gap:14px;margin-top:18px">
<img src="../artes/feed-01-campanha.png" style="height:150px;border-radius:10px"><img src="../artes/story-01-campanha.png" style="height:150px;border-radius:10px"><img src="../artes/story-02-horarios-hoje.png" style="height:150px;border-radius:10px">
<p style="color:var(--g);font-size:12px;align-self:end;max-width:420px">Em 27/11 (Black Friday) a gente não cria desconto novo: a mensagem é “a black da ED é toda semana, de segunda a quarta”. Em 30/11 a campanha passa o bastão pra agenda de dezembro.</p></div>''')

# 4 cronograma de produção
etapas = [("05/11", "qui", "Reunião de pauta", "Pauta aprovada com o Ed")] + VISITAS[:1] + [("09/11", "seg", "Perfil novo no ar", "Bio, 8 destaques e A1 fixada")] + VISITAS[1:] + [("30/11", "seg", "Relatório", "Alcance, seguidores, agendamentos e pauta de dezembro")]
linha = "".join(f'''<div style="position:relative;padding-top:30px"><div style="position:absolute;top:0;left:0;width:16px;height:16px;border-radius:50%;border:4px solid var(--y);background:var(--bg)"></div>
<div class="k">{d} · {w}</div><div style="font-weight:700;font-size:15px;margin-top:6px;line-height:1.25">{E(t)}</div><div style="color:var(--g);font-size:12px;margin-top:6px;line-height:1.45">{E(x)}</div></div>''' for d, w, t, x in etapas)
add("Cronograma de produção", f'''<h1>Quando a House <em>vai na ED.</em></h1>
<p class="sub">Uma visita por semana. Em toda visita a gente grava stories de bastidor, além do que está na pauta.</p>
<div style="position:relative;margin-top:50px"><div style="position:absolute;left:8px;right:0;top:7px;height:2px;background:#262626"></div>
<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:16px">{linha}</div></div>
<div class="card" style="margin-top:44px;display:flex;gap:30px;align-items:center"><div class="k" style="flex:none">Antes de cada visita</div><div style="font-size:13px;color:#ccc">Agendar no app 2 clientes para o horário da gravação (um para corte, um para barba) e avisar que vão aparecer no Instagram. Pedir autorização de imagem, principalmente de crianças.</div></div>''')

# 5 calendário (grade)
feed_d = {d[:2]: (c, t) for d, w, c, ty, t, fx in FEED}
vis_d = {d[:2]: t for d, w, t, x in VISITAS}
cel = ""
for _ in range(6):  # 01/11 é domingo: seg-sáb vazios antes
    cel += '<div></div>'
for dia in range(1, 31):
    dd = f"{dia:02d}"
    conteudo = ""
    if dd in feed_d:
        c, t = feed_d[dd]
        cor = "#f5cf47" if c.startswith("A") else "#fff"
        conteudo += f'<div style="margin-top:4px;font-size:10px;line-height:1.25"><b style="color:{cor}">{c}</b> {E(t)}</div>'
    if dd in vis_d:
        conteudo += f'<div style="margin-top:4px"><span class="tag v">{E(vis_d[dd].split(" · ")[0])}</span></div>'
    if dd in CAMPANHA_DIAS:
        conteudo += '<div style="margin-top:4px"><span class="tag c">Seg a Qua 50%</span></div>'
    if dd == "05": conteudo += '<div style="margin-top:4px"><span class="tag">Pauta</span></div>'
    if dd == "20": conteudo += '<div style="margin-top:4px"><span class="tag e">Feriado</span></div>'
    if dd == "27": conteudo += '<div style="margin-top:4px"><span class="tag e">Black Friday</span></div>'
    passado = dia < 4
    cel += f'<div style="background:{"#111" if passado else "var(--card)"};border-radius:10px;padding:7px 9px;min-height:78px;{"opacity:.35;" if passado else ""}"><div style="font-weight:700;font-size:12px">{dia}</div>{conteudo}</div>'
cab = "".join(f'<div class="k" style="color:var(--g)">{x}</div>' for x in ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"])
add("Calendário · Novembro 2026", f'''<h1 style="padding-top:84px;font-size:36px">Feed do mês: <em>11 posts.</em></h1>
<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-top:16px">{cab}{cel}</div>
<div style="position:absolute;right:78px;top:96px;font-size:11px;color:var(--g);text-align:right">Branco: Reels · Amarelo: arte/carrossel · Postar às 18h30<br>Stories todos os dias (próximas páginas)</div>''')

# 6 feed: tabela de posts
linhas = "".join(f'<tr style="border-bottom:1px solid #262626"><td style="padding:9px 0;font-weight:700;width:80px">{d}</td><td style="color:var(--g);width:50px">{w}</td><td style="width:60px"><span class="tag {"c" if c.startswith("A") else ""}">{c}</span></td><td style="width:100px;color:var(--g)">{ty}</td><td style="font-weight:600">{E(t)}</td><td style="text-align:right;color:var(--y);font-size:11px;font-weight:700">{"FIXAR" if fx else ""}</td></tr>' for d, w, c, ty, t, fx in FEED)
add("Feed · Ordem de postagem", f'''<h1>7 Reels e 4 artes, <em>três por semana.</em></h1>
<p class="sub">Terça, quinta e sábado às 18h30, com segunda nos dias de estreia. Os 3 fixados ficam: campanha, como agendar e o Ed.</p>
<table style="margin-top:24px;font-size:13px">{linhas}</table>''')

# 7 kit da equipe
regras = ["Sempre vertical e na luz da janela ou do espelho", "Nada de marca d’água de app de edição", "Todo story de oferta com o adesivo de link do agendamento", "Marcar @edbarbearia e o barbeiro do corte", "Pedir autorização antes de filmar o cliente (e dos pais, no kids)", "3 a 5 stories por dia: melhor pouco e todo dia do que muito num dia só", "Usar as artes story-01 a story-04 que estão na pasta de artes", "Repostar todo cliente que marcar a ED"]
add("Stories · Regras da equipe", f'''<h1>Stories todo dia, <em>feitos pela equipe da ED.</em></h1>
<p class="sub">As próximas páginas têm o que postar em cada dia. Leva 5 minutos e quem estiver livre entre um cliente e outro pode fazer.</p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 40px;margin-top:30px">{"".join(f'<div class="chk" style="font-size:14px">{E(r)}</div>' for r in regras)}</div>
<div style="display:flex;gap:14px;margin-top:30px">{"".join(f'<img src="../artes/{a}.png" style="height:170px;border-radius:10px">' for a in ["story-01-campanha","story-02-horarios-hoje","story-03-antes-depois","story-04-caixinha"])}
<p style="color:var(--g);font-size:12px;align-self:end;max-width:330px">Os modelos de story já têm o espaço marcado para o adesivo de link, a caixinha ou as fotos. É só abrir no Instagram e completar.</p></div>''')

# 8-10 stories dia a dia
def tagcls(t):
    return {"CAMPANHA": "c", "FECHADO": "f", "FERIADO": "e", "BLACK FRIDAY": "e"}.get(t, "v" if t.startswith("VISITA") else "")
for i in range(0, len(STORIES), 7):
    bloco = STORIES[i:i + 7]
    rows = "".join(f'''<tr style="border-bottom:1px solid #262626;vertical-align:top"><td style="padding:8px 0;width:74px"><b style="font-size:14px">{d}</b><div style="color:var(--g);font-size:11px">{w}</div></td>
<td style="width:210px;padding:8px 10px 8px 0"><div style="font-weight:700;font-size:13px">{E(t)}</div>{f'<span class="tag {tagcls(tg)}" style="margin-top:4px">{tg}</span>' if tg else ''}</td>
<td style="padding:8px 14px 8px 0;font-size:11.5px;color:#ccc;line-height:1.45">{" · ".join(f"{k+1}. {E(x)}" for k, x in enumerate(fr))}</td>
<td style="width:230px;padding:8px 0;font-size:11.5px;color:var(--y);line-height:1.4">{E(st)}</td></tr>''' for d, w, tg, t, fr, st in bloco)
    add(f"Stories · {bloco[0][0]} a {bloco[-1][0]}", f'''<h1 style="padding-top:84px;font-size:32px">Stories do dia <em>{bloco[0][0]} a {bloco[-1][0]}</em></h1>
<table style="margin-top:14px"><tr><td class="k" style="color:var(--g);padding-bottom:6px">Dia</td><td class="k" style="color:var(--g)">Tema</td><td class="k" style="color:var(--g)">O que gravar</td><td class="k" style="color:var(--g)">Adesivo / chamada</td></tr>{rows}</table>''')

# 11-14 roteiros
for i in range(0, len(REELS), 2):
    par = REELS[i:i + 2]
    cols = ""
    for c, t, grav, post, pilar, gancho, cenas, leg in par:
        cols += f'''<div class="card" style="padding:22px 24px"><div style="display:flex;justify-content:space-between;align-items:baseline"><span style="font-weight:700;font-size:28px;color:var(--y)">{c}</span><span style="font-size:11px;color:var(--g)">grava {grav} · posta {post}</span></div>
<div style="font-weight:700;font-size:19px;margin-top:4px">{E(t)}</div><div style="font-size:11px;color:var(--g);margin-top:2px">{E(pilar)} · 20 a 35 s · áudio em alta da semana</div>
<div class="k" style="margin-top:14px">Gancho (0 a 3 s)</div><div style="font-size:13px;margin-top:4px;line-height:1.45">{E(gancho)}</div>
<div class="k" style="margin-top:12px">Cenas</div>{"".join(f'<div class="chk" style="font-size:12.5px;margin-top:5px">{E(x)}</div>' for x in cenas)}
<div class="k" style="margin-top:12px">Legenda</div><div style="font-size:12px;color:#ccc;margin-top:4px;line-height:1.45">{E(leg)}</div></div>'''
    rot = f"Roteiros de Reels · {par[0][0]}" + (f" e {par[1][0]}" if len(par) > 1 else "")
    add(rot, f'''<h1 style="padding-top:84px;font-size:32px">Roteiros: <em>gancho nos 3 primeiros segundos.</em></h1>
<div style="display:grid;grid-template-columns:{"1fr 1fr" if len(par) > 1 else "1fr 1fr"};gap:16px;margin-top:20px">{cols}{'<div class="card" style="display:grid;place-items:center;color:var(--g);font-size:13px;text-align:center;padding:40px">Regra dos Reels da ED:<br><b style="color:#fff">mostrar a técnica, terminar no resultado<br>e chamar pro app na legenda.</b></div>' if len(par) == 1 else ''}</div>''')

# artes + legendas
for codigo, arquivos, titulo in [
    ("A1", ["feed-01-campanha"], "Campanha Seg a Qua"),
    ("A2", ["feed-02a-agendar-capa", "feed-02b-agendar-passos", "feed-02c-agendar-precos"], "Agendar em 3 toques"),
    ("A3", ["feed-03a-ed-capa", "feed-03b-ed-frase", "feed-03c-ed-agendar"], "Quem é o Ed"),
    ("A4", ["feed-04a-cortes-capa", "feed-04b-corte-textured", "feed-04c-corte-barba", "feed-04d-corte-crop"], "Qual corte é o seu"),
]:
    dt = next(d for d, w, c, *_ in FEED if c == codigo)
    imgs = "".join(f'<img src="../artes/{a}.png" style="height:330px;border-radius:12px">' for a in arquivos)
    aviso = ' <b style="color:var(--y)">As fotos dos cortes são provisórias: trocar pelas do ensaio de 19/11.</b>' if codigo in ("A1", "A4") else ""
    add(f"Feed · {codigo} · {dt}", f'''<h1 style="padding-top:84px;font-size:32px">{codigo} · <em>{E(titulo)}</em></h1>
<div style="display:flex;gap:12px;margin-top:20px">{imgs}</div>
<div class="card" style="margin-top:18px;padding:16px 20px"><div class="k">Legenda</div><div style="font-size:13px;margin-top:6px;line-height:1.5">{E(LEGENDAS[codigo])}</div><div style="font-size:11px;color:var(--g);margin-top:6px">1080 × 1350 px · arquivos na pasta artes.{aviso}</div></div>''')

# perfil
caps = "".join(f'<div style="text-align:center"><div style="width:78px;height:78px;border-radius:50%;overflow:hidden;border:2px solid #333;margin:0 auto"><img src="../artes/destaque-{a}.png" style="width:100%;height:100%;object-fit:cover"></div><div style="font-size:10px;margin-top:6px;color:#ccc">{t}</div></div>' for a, t in DESTAQUES)
add("Perfil · Bio e destaques", f'''<h1>Perfil novo <em>no ar em 09/11.</em></h1>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:30px">
<div class="card"><div class="k">Bio nova (até 150 caracteres)</div><div style="font-size:16px;margin-top:12px;line-height:1.7">{"<br>".join(E(b) for b in BIO)}</div>
<div style="font-size:12px;color:var(--g);margin-top:12px">Link da bio: landing page da ED (agendar, WhatsApp e mapa num lugar só).</div></div>
<div class="card"><div class="k">8 destaques, sem repetir</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:16px">{caps}</div>
<div style="font-size:12px;color:var(--g);margin-top:14px">Sai o destaque duplicado “Curso / CURSO”. O conteúdo de aluno vai só pro destaque CURSO, e o feed fala com o cliente.</div></div></div>
<div class="card" style="margin-top:16px;padding:14px 20px;font-size:13px"><span class="k">Fixados</span>&nbsp;&nbsp; A1 (campanha), A2 (como agendar) e A3 (o Ed). O post “Estamos contratando” sai dos fixados e vai pro destaque.</div>''')

# relatório
met = [("Alcance do mês", "Contas alcançadas e de onde vieram"), ("Seguidores", "Ganhos no mês, partindo de 3.199"), ("Reels", "Views de R1 a R7, comparando com a média de 600 a 2,6 mil"), ("Link da bio", "Cliques no link e no WhatsApp"), ("Agendamentos", "Total do mês no app e só de seg a qua (pedir o número ao Ed)"), ("Campanha", "Quantos clientes usaram os 50% no 1º corte")]
add("Relatório · 30/11", f'''<h1>O que a gente <em>vai medir.</em></h1>
<p class="sub">No dia 30 sai o relatório. O que funcionou vira pauta de dezembro, o mês mais cheio do ano.</p>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:30px">{"".join(f'<div class="card"><div class="k">{E(a)}</div><div style="font-size:14px;margin-top:8px;line-height:1.45">{E(b)}</div></div>' for a, b in met)}</div>''')

# aprovação
add("Próximos passos", f'''<h1 style="color:#0b0b0b">Aprovou, <em>a gente grava.</em></h1>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:40px">
{"".join(f'<div class="card" style="padding:24px"><div style="font-weight:700;font-size:34px;color:var(--y)">{i:02d}</div><div style="font-weight:700;font-size:16px;margin-top:8px">{E(a)}</div><div style="font-size:12px;color:#aaa;margin-top:6px;line-height:1.5">{E(b)}</div></div>' for i, (a, b) in enumerate([("Aprovar a pauta", "Ed aprova este plano na reunião de 05/11."), ("Confirmar feriado", "Se a ED abre em 20/11 (Consciência Negra)."), ("Clientes da gravação", "2 clientes agendados para cada visita."), ("Equipe nos stories", "Definir quem posta os stories de cada dia.")], 1))}</div>
<p style="margin-top:30px;font-size:13px;max-width:760px">Todo conteúdo é aprovado antes de ir ao ar. Dúvidas e ajustes: WhatsApp (81) 98355-4583 · @housedocreator</p>''', amarelo=True)

doc = f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>{"".join(S)}</body></html>'''
(AQUI / "plano.html").write_text(doc, encoding="utf-8")
print(len(S), "páginas")
