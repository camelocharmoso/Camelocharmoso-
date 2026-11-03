"""Ficha técnica Pizza Portuguesa (v1.1, corrigida) + material de padronização de tamanho e desperdício.
uso: python3 port_v2.py ficha|padrao <saida.html>"""
import sys, os, base64, html
from ft_ref import CSS, leaf_logo, wm
from fichas_data import sec, table, steps, flow, pill, conf, SIGN, BL

e = html.escape
HERE = os.path.dirname(os.path.abspath(__file__))

def img(k, folder="fotos_port"):
    d = base64.b64encode(open(os.path.join(HERE, folder, k + ".jpg"), "rb").read()).decode()
    return "data:image/jpeg;base64," + d

EXTRA = """
.photos{display:grid;grid-template-columns:1fr 1fr;gap:5mm 6mm}
.ph{position:relative}
.ph .im{height:56mm;border-radius:2.4mm;overflow:hidden}
.ph .im img{width:100%;height:100%;object-fit:cover}
.ph .lab{position:absolute;left:3mm;top:3mm;background:var(--red);color:#fff;font-family:'HerosCn';font-size:8pt;padding:.8mm 2.4mm;border-radius:1mm}
.ph h5{font-family:'HerosCn';font-size:10pt;text-transform:uppercase;margin-top:2mm}
.ph p{font-size:7.6pt;line-height:1.45;color:var(--muted);margin-top:.6mm}
.ph p b{color:var(--red)}
.pill.d{background:var(--dark)}
.pill.c{background:#fff;color:var(--orange);border:.8pt solid var(--orange)}
.big3{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm;margin:2mm 0 1mm}
.big3 div{background:var(--cream);border-radius:3mm;padding:4mm;text-align:center}
.big3 b{display:block;font-family:'HerosCn';font-size:20pt;color:var(--red);line-height:1}
.big3 span{font-size:7.6pt;color:var(--muted)}
.circ{display:flex;align-items:flex-end;justify-content:space-around;padding:3mm 0 1mm}
.circ div{text-align:center;font-size:7.6pt;color:var(--muted)}
.circ i{display:block;margin:0 auto 2mm;border-radius:50%;border:1.2pt solid var(--red);background:#FDEBE3}
.circ b{font-family:'HerosCn';font-size:11pt;color:var(--dark);display:block}
td{padding:1.85mm 2.6mm}
.gap{height:4.5mm}
.lead{font-size:9.2pt;line-height:1.6;margin-bottom:3mm}
"""

def doc(pages, title_bar, kind, N, start=2):
    out = []
    for i, (label, content) in enumerate(pages, start=start):
        out.append(f'''<section class="pg"><div class="bar">{wm()}<div class="r">{e(title_bar)}<br>{e(label)}</div></div>
<div class="body">{content}</div><div class="foot"><span>Speciale Pizzas Artesanais · {e(kind)}</span><span>{i} / {N}</span></div><div class="chk bot"></div></section>''')
    return "".join(out)

def cover(tag, title, desc, stats, ver="Versão 1.1 · Novembro/2026"):
    st = "".join(f"<div><b>{e(a)}</b><span>{e(b)}</span></div>" for a, b in stats)
    return f'''<section class="pg cover"><div class="chk top"></div><div class="logo">{leaf_logo()}{wm()}</div>
<div class="tag">{e(tag)}</div><h1>{title}</h1><div class="desc" style="top:128mm">{e(desc)}</div>
<div class="stats">{st}</div><div class="ver">{e(ver)}</div><div class="chk bot"></div></section>'''

def foto(k, n, t, cap, folder="fotos_port"):
    return f'<div class="ph"><div class="im"><img src="{img(k, folder)}" alt=""></div><span class="lab">FOTO {n}</span><h5>{e(t)}</h5><p>{cap}</p></div>'

EST = '<span class="est">(est.)</span>'

# ===================================================== FICHA PORTUGUESA
def ficha():
    p2 = (sec(1, "Identificação geral") + table(["Campo", "Informação"], [
            ["Nome do produto", "Pizza Portuguesa"],
            ["Código interno / SKU", BL],
            ["Categoria", "Pizza salgada · montagem sobre a massa artesanal da casa"],
            ["Tamanho de referência", "Grande · 35 cm (caixa) · bolinha de 320 g · 8 fatias (Média e Broto estimados na seção 07)"],
            ["Base", "Massa de pizza artesanal (ficha própria) + molho de tomate artesanal (150 ml)"],
            ["Forno", "A lenha · 340 a 380 °C (ponto ideal) · 3 a 4 min"],
            ["Alérgenos", "CONTÉM GLÚTEN (trigo), LEITE (muçarela) e OVO"],
            ["Responsável técnico", BL + BL + BL],
            ["Data de elaboração", "Novembro de 2026 · versão 1.2"]]) +
          '<div class="note">Descrição: pizza tradicional montada em camadas sobre a massa aberta na hora: molho de tomate, muçarela, presunto fatiado, ovo cozido, cebola crua e azeitona, finalizada com orégano.</div>'
          '<div class="gap"></div>' + sec(2, "Ingredientes por pizza") +
          table(["Ingrediente", "Quantidade", "Forma de uso", "Função"], [
            ["<b>Massa de pizza (bolinha)</b>", "1 un · 320 g", "Aberta na hora e aparada com cortador", "Base"],
            ["Molho de tomate artesanal", "150 ml", "Aplicado com colher funda", "Sabor e umidade"],
            ["Muçarela", "278 g", "Ralada, jogada sobre o molho", "Recheio principal"],
            ["Presunto", "82 g", "Fatiado, em tiras a partir do centro", "Sabor e sal"],
            ["Ovo cozido", "2 un", "Em rodelas, entre as tiras", "Complemento clássico"],
            ["Cebola", "97 g", "Crua, partida", "Doçura e aroma"],
            ["Azeitona", "9 g", "Preta, em pedaços, espalhada", "Finalização"],
            ["Orégano", "≈2 g " + EST, "Salpicado a olho pelo pizzaiolo", "Aroma de pizza"]], nums=(1,)) +
          '<div class="note">Quantidades por pizza Grande, pesadas na visita e já sem a tara dos potes (13 g): muçarela 291 g − 13 g, cebola 110 g − 13 g, azeitona 22 g − 13 g. Orégano vai a olho; ≈2 g é a média de mercado usada como referência.</div>'
          '<div class="gap"></div>' + sec(3, "Equipamentos e utensílios") +
          table(["Item", "Uso"], [
            ["Mesa / bancada higienizada", "Abrir a massa e montar a pizza"],
            ["Cortador de massa (carretilha)", "Aparar a borda da massa aberta"],
            ["Colher funda", "Aplicar e espalhar o molho (150 ml)"],
            ["Balança", "Conferir muçarela, presunto, cebola e azeitona"],
            ["Pá de pizza e forno a lenha", "Levar a pizza ao forno e assar"]]))

    P = lambda t: pill(t)
    D = lambda t: f'<span class="pill d">{t}</span>'
    p3 = (sec(4, "Modo de montagem") +
          flow([("Abrir", "e aparar"), ("Molho", "150 ml"), ("Muçarela", "278 g"), ("Presunto", "82 g"), ("Ovo · cebola", "azeitona"), ("Orégano", "e forno")]) +
          steps([
            "<b>Preparar o posto:</b> mesa higienizada, ingredientes porcionados e refrigerados até o uso, colher funda e balança à mão. " + P("PCC 1"),
            "<b>Abrir a bolinha</b> de massa na mesa enfarinhada e <b>aparar a borda com o cortador</b> até o tamanho da pizza. " + D("FOTO 1") + D("FOTO 2"),
            "Aplicar <b>150 ml de molho</b> com a colher funda e espalhar por toda a massa, deixando uma borda livre. " + D("FOTO 3") + P("PCC 2"),
            "Jogar toda a <b>muçarela ralada (278 g)</b> sobre o molho, distribuindo por igual. " + D("FOTO 3") + P("PCC 2"),
            "Dispor o <b>presunto (82 g)</b> fatiado em tiras, partindo do centro, sobre a muçarela. " + D("FOTO 4") + P("PCC 2"),
            "Incluir o <b>ovo cozido</b> em rodelas (2 ovos) entre as tiras de presunto. " + D("FOTO 4"),
            "Distribuir a <b>cebola crua, partida (97 g)</b>. " + '<span class="pill c">ORDEM A CONFIRMAR</span>',
            "Espalhar a <b>azeitona preta</b> em pedaços (9 g) e finalizar com <b>orégano</b> salpicado por cima de tudo. " + D("FOTO 4"),
            "Assar no <b>forno a lenha</b> a 340 a 380 °C, por 3 a 4 min, até a muçarela derreter e a borda dourar. " + D("FOTO 5") + D("FOTO 6") + P("PCC 3"),
            "Retirar, <b>cortar em 8 fatias</b> e servir ou embalar na hora."]) +
          '<div class="sub">Pontos críticos de controle (PCC)</div>' +
          table(["PCC", "O que controlar", "Limite / referência"], [
            ["1 · Higienização", "Mesa, utensílios, mãos e ingredientes (ovo cozido, presunto, muçarela, cebola cortada) limpos e refrigerados até o uso", "Conforme RDC 216/2004 e rótulo dos fabricantes"],
            ["2 · Porções", "Peso e medida de cada ingrediente por pizza", "Grande: molho 150 ml · muçarela 278 g · presunto 82 g · cebola 97 g · azeitona 9 g · ovo 2 un"],
            ["3 · Forno", "Temperatura e tempo de forno", "340 a 380 °C · 3 a 4 min · muçarela derretida, borda dourada"]]))

    p4 = (sec(5, "Pontos de cada etapa") +
          '<div class="note" style="margin:-1mm 0 3mm">Registro fotográfico da montagem acompanhada na visita. Use como referência para conferir o ponto antes de seguir para a próxima etapa.</div>'
          '<div class="photos">' +
          foto("f1", 1, "Massa aberta e aparada", "<b>Etapa 2</b> · Massa aberta na mesa enfarinhada e aparada com o cortador. A tira que sobra da borda é massa perdida (ver material de padronização).") +
          foto("f2", 2, "Massas abertas na bancada", "<b>Etapa 2</b> · Massas abertas e aparadas, redondas e de espessura uniforme, prontas para receber o molho.") +
          foto("f3", 3, "Molho e muçarela ralada", "<b>Etapas 3–4</b> · Molho espalhado por toda a massa, com borda livre, e muçarela ralada distribuída por igual.") +
          foto("f4", 4, "Montada, pronta para o forno", "<b>Etapas 5–8</b> · Presunto em tiras a partir do centro, rodelas de ovo, azeitona em pedaços e orégano por cima.") +
          foto("f5", 5, "Pizza pronta", "<b>Etapa 9</b> · Muçarela derretida, borda dourada e ingredientes visíveis e bem distribuídos.") +
          foto("f6", 6, "Detalhe da pizza pronta", "<b>Etapa 9</b> · Muçarela dourada, ovo e presunto no ponto e orégano visível.") + "</div>")

    def row(n, g, unit, dec=0, ovo=None):
        if ovo:
            return [n, ovo[0], ovo[1], ovo[2]]
        f = lambda x: (f"≈{x:.0f}" if dec == 0 else f"≈{x:.1f}".replace(".", ",")) + f" {unit}"
        return [n, f"{g} {unit}", f(g * 0.735), f(g * 0.51)]
    p5 = (sec(6, "Características do produto") + table(["Atributo", "Padrão esperado"], [
            ["Aparência", "Muçarela derretida e uniforme; tiras de presunto a partir do centro, rodelas de ovo, cebola e azeitona bem distribuídas; borda livre dourada"],
            ["Massa", "Borda dourada e levantada, sem partes cruas no centro"],
            ["Molho", "Cobrindo toda a massa, sem encharcar nem deixar áreas secas"],
            ["Aroma / sabor", "Tomate, queijo e presunto equilibrados; cebola crua macia e sem amargor; orégano presente"]]) +
          '<div class="gap"></div>' + sec(7, "Padrão por tamanho") +
          '<div class="note" style="margin:-1mm 0 2.5mm">Grande: quantidades pesadas na visita. Média e Broto <span class="est">(est.)</span>: hoje todas as bolinhas são de 320 g e o tamanho é definido no olho. Valores sugeridos <b>proporcionais à área</b> da pizza (Broto 25 cm = 51% da Grande · Média 30 cm = 73,5%). Validar na prática e ajustar.</div>' +
          table(["Ingrediente", "Grande · 35 cm · 8 fatias", "Média · 30 cm · 5 fatias (est.)", "Broto · 25 cm · 4 fatias (est.)"], [
            ["Massa (bolinha)", "320 g", "≈235 g (hoje 320 g)", "≈165 g (hoje 320 g)"],
            row("Molho de tomate", 150, "ml"), row("Muçarela", 278, "g"), row("Presunto", 82, "g"),
            row("Cebola", 97, "g"), row("Azeitona", 9, "g"),
            row("Ovo cozido", 0, "", ovo=("2 un", "1½ un", "1 un")),
            row("Orégano", 2, "g", 1)], nums=(1, 2, 3)) +
          '<div class="note">Os diâmetros de Média (30 cm) e Broto (25 cm) são os de referência: Broto pela caixa de 25 cm; a Média não tem caixa própria. Como padronizar e reduzir o desperdício: ver o material “Padronização do tamanho e desperdício de massa”.</div>'
          '<div class="gap"></div>' + sec(8, "Condições do forno") + table(["Item", "Resposta"], [
            ["Tipo de forno", "A lenha"], ["Temperatura", "340 a 380 °C é o ponto ideal (forno sem marcador de temperatura)"], ["Tempo médio de forno", "3 a 4 min"]]))

    p6 = (sec(9, "Controle de qualidade") + '<div class="sub" style="margin-top:0">Critérios de aprovação da pizza</div>'
          '<ul class="chk2"><li>Todas as porções conforme a seção 07 (molho, muçarela, presunto, cebola, ovo e azeitona).</li>'
          '<li>Molho espalhado por toda a massa e ingredientes distribuídos por igual.</li>'
          '<li>Muçarela derretida, borda dourada e massa assada por inteiro.</li><li>Orégano presente e sem queimar; sem corpos estranhos.</li></ul>'
          '<div class="sub">Falhas mais comuns</div>' + table(["Falha", "Causa provável", "Correção"], [
            ["Centro cru ou mole", "Excesso de molho ou de ingredientes; forno frio", "Respeitar 150 ml e as porções; manter o forno em 340–380 °C"],
            ["Pizza encharcada", "Molho demais ou cebola/ovo úmidos", "Medir o molho com a colher funda; escorrer a cebola cortada"],
            ["Borda queimada ou pálida", "Forno quente ou frio demais; tempo errado", "Conferir a temperatura e o tempo de 3 a 4 min"],
            ["Muçarela sem derreter", "Pouco tempo de forno ou camada irregular", "Distribuir os 278 g por igual e manter o tempo"],
            ["Sabor salgado demais", "Presunto ou azeitona acima da porção", "Pesar presunto (82 g) e azeitona (9 g)"],
            ["Pizza maior ou menor que o padrão", "Bolinha sem peso e abertura no olho", "Pesar a bolinha e usar gabarito (ver material de padronização)"]]) +
          '<div class="gap"></div>' + sec(10, "Armazenamento dos ingredientes") + table(["Ingrediente", "Condição", "Prazo"], [
            ["Muçarela e presunto", "Refrigerados, na embalagem ou em recipiente tampado", "Conforme rótulo"],
            ["Ovo cozido", "Cozido por completo, resfriado e refrigerado (até 5 °C) em recipiente tampado e etiquetado; depois de fatiado, usar no mesmo turno", "Até 3 dias"],
            ["Cebola crua partida", "Já cortada: refrigerada, em recipiente tampado e identificado", "A confirmar"],
            ["Azeitona e orégano", "Azeitona em recipiente tampado; orégano em pote fechado, em local seco", "Conforme rótulo"],
            ["Etiqueta", "Produto · data de preparo · validade · responsável · usar primeiro o que vence primeiro (PVPS)", "Obrigatória"]]))

    custo = [[n, q, f"R$ {BL} /{u}", f"R$ {BL}"] for n, q, u in [
        ("Massa (bolinha)", "320 g", "kg"), ("Molho de tomate", "150 ml", "kg"), ("Muçarela", "278 g", "kg"), ("Presunto", "82 g", "kg"),
        ("Ovo", "2 un", "un"), ("Cebola", "97 g", "kg"), ("Azeitona", "9 g", "kg"), ("Orégano", "≈2 g", "kg"), ("Caixa (embalagem)", "1 un", "un")]]
    p7 = (sec(11, "Custos · pizza grande") + table(["Item", "Quantidade", "Preço unitário", "Custo na pizza"], custo, nums=(1,),
                                                   tot=["Custo total da pizza", "", "", f"R$ {BL}"]) +
          f'<div class="two"><div class="card"><b>Preço de venda:</b> R$ {BL}<br><b>CMV %</b> = custo ÷ preço de venda × 100 = {BL}</div>'
          '<div class="card">O que mais mexe no custo: <b>muçarela</b> (278 g) e <b>presunto</b>. Pesar sempre.</div></div>'
          '<div class="gap"></div>' + sec(12, "Registro de montagem") +
          table(["Data", "Responsável", "Tamanho", "Temp. forno", "Tempo forno", "Visto"], [["", "", "", "", "", ""] for _ in range(4)]) +
          '<div class="note">Registro opcional para conferir a padronização: tamanho, temperatura e tempo de forno de algumas pizzas por turno.</div>')

    p8 = (sec(13, "Melhorias recomendadas") + '<ul class="dots">'
          '<li><b>Pré-porcionar os ingredientes:</b> deixar muçarela (278 g), presunto (82 g), cebola (97 g) e azeitona (9 g) já pesados em porções, para a montagem sair sempre igual.</li>'
          '<li><b>Padronizar a colher funda:</b> conferir uma vez que a colher entrega os 150 ml de molho e marcar essa colher para a Grande.</li>'
          '<li><b>Peso da bolinha e gabarito:</b> hoje o tamanho é definido no olho e a borda é aparada com cortador. Pesar a bolinha e abrir até o gabarito reduz a apara e o desperdício.</li>'
          '<li><b>Validar Média e Broto:</b> testar as porções estimadas na seção 07, pesar e ajustar com o pizzaiolo.</li>'
          '<li><b>Dar um peso de referência ao orégano:</b> mesmo que seja “1 pitada” padronizada (≈2 g na Grande).</li></ul>' +
          conf(["Em que etapa a cebola entra (está na receita, mas não aparece nas fotos de referência).",
                "Validade da cebola cortada.", "Marca do presunto e da muçarela.",
                "Teste das porções estimadas de Média e Broto."]) + SIGN)

    pages = [("Identificação e ingredientes", p2), ("Modo de montagem", p3), ("Guia visual dos pontos", p4),
             ("Produto e padrão", p5), ("Qualidade e armazenamento", p6), ("Custos e registro", p7), ("Melhorias", p8)]
    N = len(pages) + 1
    return cover("FICHA TÉCNICA DE MONTAGEM", "PIZZA<br><em>PORTUGUESA</em>",
                 "Muçarela, presunto, ovo cozido, cebola crua e azeitona sobre molho de tomate artesanal, finalizada com orégano e assada em forno a lenha.",
                 [("278 g", "de muçarela por pizza Grande"), ("150 ml", "de molho de tomate artesanal, espalhado por toda a massa"), ("3 a 4 min", "no forno a lenha, a 340 a 380 °C")]) + \
        doc(pages, "FICHA TÉCNICA · PIZZA PORTUGUESA", "Ficha técnica de montagem", N)

# ===================================================== PADRONIZAÇÃO / DESPERDÍCIO
def padrao():
    circ = ('<div class="circ">'
            '<div><i style="width:25mm;height:25mm"></i><b>BROTO</b>25 cm · ≈165 g</div>'
            '<div><i style="width:30mm;height:30mm"></i><b>MÉDIA</b>30 cm · ≈235 g</div>'
            '<div><i style="width:35mm;height:35mm"></i><b>GRANDE</b>35 cm · 320 g</div></div>')
    p2 = (sec(1, "Como é feito hoje") +
          '<p class="lead">Hoje <b>todas as bolinhas são de 320 g</b> (o peso da Grande), cerca de <b>100 bolinhas por dia</b> (≈32 kg de massa). Broto e Média não têm peso nem medida próprios: saem da mesma bolinha de 320 g e o tamanho é definido no olho. Na abertura, o pizzaiolo abre a massa e <b>apara a borda com o cortador</b> para deixar a pizza redonda. A tira que sobra não vira pizza.</p>' +
          table(["Ponto", "Situação hoje", "Efeito"], [
            ["Peso da bolinha", "Bolinha única de 320 g para todos os tamanhos", "Broto e Média recebem massa de Grande"],
            ["Tamanho da pizza", "Definido no olho; não há gabarito", "Pizzas maiores ou menores conforme quem abre"],
            ["Abertura", "Massa aberta e aparada com cortador", "Sobra de massa (apara) a cada pizza"],
            ["Broto e Média", "Abertas da bolinha de 320 g e aparadas", "Sobra de massa muito maior que na Grande"]]) +
          '<div class="gap"></div>' + sec(2, "Pesos sugeridos por tamanho") +
          '<p class="lead">Como a casa ainda não tem esses pesos, a sugestão é partir da Grande e reduzir <b>proporcionalmente à área</b> da pizza, para manter a mesma espessura de massa nos três tamanhos.</p>' + circ +
          table(["Tamanho", "Diâmetro", "Área em relação à Grande", "Peso da bolinha sugerido", "Fatias"], [
            ["Broto", "25 cm", "51%", "≈165 g", "4"], ["Média", "30 cm", "73,5%", "≈235 g", "5"], ["Grande", "35 cm", "100%", "320 g", "8"]], nums=(2, 3, 4)) +
          '<div class="note">Conta: (diâmetro ÷ 35)² × 320 g. Broto: (25 ÷ 35)² = 0,51 → 163 g, arredondado para 165 g. Média: (30 ÷ 35)² = 0,735 → 235 g. Por que não usar o número de fatias: fatia não é tamanho; a Média tem 5 fatias, mas 73,5% da área da Grande (e não 5 ÷ 8 = 62,5%). Os mesmos fatores valem para as coberturas na ficha de cada pizza.</div>')

    p3 = (sec(3, "Onde está o desperdício") +
          '<p class="lead">Quatro pontos fazem a casa gastar mais massa do que precisa. Nenhum deles foi medido ainda; os números abaixo são <b>exemplos de cálculo</b>, para mostrar o tamanho do efeito. A casa deve pesar e trocar pelos valores reais.</p>' +
          table(["Ponto", "O que acontece", "Exemplo de cálculo"], [
            ["1 · Apara da borda", "A sobra cortada com o cortador vai fora", "Se a apara pesar 20 g por pizza, nas ≈100 pizzas do dia são 2 kg de massa: ≈6 bolinhas por dia, ≈60 kg por mês"],
            ["2 · Broto e Média da bolinha de 320 g", "A bolinha é maior do que o tamanho precisa", "Broto precisa de ≈165 g: sobram ≈155 g. Média precisa de ≈235 g: sobram ≈85 g (se aparados e descartados)"],
            ["3 · Bolinha acima do peso", "Sem balança, a bolinha sai maior que 320 g", "20 g a mais por bolinha = 1 pizza Grande perdida a cada 16"],
            ["4 · Pizza maior que o padrão", "Abrir maior pede mais cobertura", "Uma Grande de 37 cm tem 12% mais área que a de 35 cm, e leva mais queijo"]]) +
          '<div class="two"><div class="rcard"><h4>Como medir a apara</h4>Junte a apara de 10 pizzas seguidas, pese na balança e divida por 10. Esse é o desperdício por pizza. Multiplique pelo número de pizzas do dia.</div>'
          '<div class="card"><h4>Massa perdida por mês</h4><table><tr><td>Apara por pizza</td><td class="n">' + BL + ' g</td></tr>'
          '<tr><td>× pizzas por dia</td><td class="n">≈100</td></tr><tr><td>× dias no mês</td><td class="n">' + BL + '</td></tr>'
          '<tr><td><b>= massa perdida</b></td><td class="n"><b>' + BL + ' kg</b></td></tr></table></div></div>' +
          '<div class="gap"></div>' + sec(4, "Como otimizar") +
          table(["Ação", "Como fazer", "Ganho"], [
            ["Bolinha por tamanho", "Fazer bolinhas de ≈165 g (Broto) e ≈235 g (Média), além das de 320 g (Grande), com etiqueta de cor por tamanho", "Fim da sobra grande no Broto e na Média"],
            ["Pesar toda bolinha", "Balança na bancada; tolerância ± 5 g", "Mesma massa em toda pizza; custo previsível"],
            ["Gabarito de diâmetro", "Aro ou disco de 25, 30 e 35 cm; abrir a massa até o gabarito", "Mesmo tamanho e espessura, com menos apara"],
            ["Abrir no tamanho certo", "Com peso + gabarito, a massa já sai no diâmetro, e o cortador vira só acabamento", "Apara mínima"],
            ["Marcação na bancada e cor por tamanho", "Círculos marcados na mesa; etiqueta de cor diferente para cada tamanho", "Ninguém troca as bolinhas"],
            ["Reaproveitar a apara (avaliar)", "Só aparas limpas, sem molho, do mesmo turno e cobertas: testar no crostini da casa", "Apara vira produto vendido"]]) +
          '<div class="note">Reaproveitamento: avaliar com a nutricionista. A apara pega farinha da mesa e fica exposta; usar só no mesmo turno, mantida coberta, e nunca recongelar.</div>')

    p4 = (sec(5, "Plano de teste") + table(["Quando", "O que fazer"], [
            ["Semana 1", "Pesar a apara de 10 pizzas e 5 bolinhas Grandes; anotar na tabela abaixo"],
            ["Semana 2", "Testar bolinhas de ≈165 g (Broto) e ≈235 g (Média); abrir até o gabarito provisório e anotar ajustes"],
            ["Semana 3", "Fixar os pesos de cada tamanho, marcar a bancada e treinar a equipe"],
            ["Semana 4", "Pesar a apara de novo e comparar com a semana 1; atualizar as fichas técnicas"]]) +
          '<div class="gap"></div>' + sec(6, "Registro de pesagem") +
          table(["Data", "Tamanho", "Bolinha 1", "Bolinha 2", "Bolinha 3", "Bolinha 4", "Bolinha 5", "Média"], [["", "", "", "", "", "", "", ""] for _ in range(6)]) +
          '<div class="gap"></div>' +
          table(["Data", "Nº de pizzas", "Peso total da apara", "Apara por pizza", "Responsável"], [["", "", "", "", ""] for _ in range(5)]) +
          '<div class="note">Tolerância da bolinha: ± 5 g. Se a média passar do peso, ajustar a divisão da massa no boleamento.</div>' +
          conf(["Quantas pizzas por dia são Broto, Média e Grande.", "Se a sobra do Broto e da Média é descartada ou reaproveitada.", "Peso real da apara por pizza.",
                "Diâmetro da Média (30 cm é sugestão; não há caixa média).", "Se o crostini pode usar as aparas."]) + SIGN)

    pages = [("Situação atual e pesos", p2), ("Desperdício e otimização", p3), ("Plano e registro", p4)]
    N = len(pages) + 1
    return cover("PADRONIZAÇÃO DA MASSA", "TAMANHO<br>E <em>DESPERDÍCIO</em>",
                 "Como definir o peso da bolinha de cada tamanho, padronizar o diâmetro das pizzas e reduzir a massa que vai fora na abertura.",
                 [("320 g", "bolinha única de hoje · ≈100 por dia"), ("165 · 235 g", "sugestão para Broto e Média, proporcional à área"), ("± 5 g", "tolerância na pesagem de cada bolinha")],
                 "Versão 1.0 · Novembro/2026") + doc(pages, "PADRONIZAÇÃO · TAMANHO E DESPERDÍCIO", "Padronização da massa", N)

if __name__ == "__main__":
    MODE, OUT = sys.argv[1], sys.argv[2]
    body = ficha() if MODE == "ficha" else padrao()
    open(OUT, "w", encoding="utf-8").write(f'<!doctype html><html lang="pt-br"><head><meta charset="utf-8"><title>Speciale</title><style>{CSS}{EXTRA}</style></head><body>{body}</body></html>')
    print("ok", MODE)
