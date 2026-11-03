"""Conteúdo das fichas (massa + pizzas). Fonte: anotações à caneta da visita + cardápio oficial.
Preços em branco. 'a pesar' = dado que falta coletar."""
import html
from brand import photo
e = html.escape

TODO = '<span class="todo">a pesar</span>'
EST = ' <span class="est">(est.)</span>'
BL = '<span class="blank"></span>'

def sec(n, t):
    return f'<div class="sec"><i>{n:02d}</i><h2>{e(t)}</h2></div>'

def table(head, rows, nums=(), tot=None):
    h = "<table><tr>" + "".join(f'<th class="{"n" if i in nums else ""}">{c}</th>' for i, c in enumerate(head)) + "</tr>"
    for r in rows:
        h += "<tr>" + "".join(f'<td class="{"n" if i in nums else ""}">{c}</td>' for i, c in enumerate(r)) + "</tr>"
    if tot:
        h += '<tr class="tot">' + "".join(f'<td class="{"n" if i in nums else ""}">{c}</td>' for i, c in enumerate(tot)) + "</tr>"
    return h + "</table>"

def steps(lst):
    return '<div class="steps">' + "".join(f'<div class="st"><i>{i:02d}</i><div>{s}</div></div>' for i, s in enumerate(lst, 1)) + "</div>"

def flow(items):
    return '<div class="flow">' + "".join(f"<div><b>{e(a)}</b><span>{e(b)}</span></div>" for a, b in items) + "</div>"

def pill(t):
    return f'<span class="pill">{e(t)}</span>'

ALL_ALG = ["Glúten", "Leite", "Ovo", "Castanhas", "Soja"]
def alergs(on):
    return '<div class="alg">' + "".join(f'<span class="{"" if a in on else "off"}">{a}</span>' for a in ALL_ALG) + "</div>"

def conf(items):
    return '<div class="conf"><b>A confirmar com a equipe</b><ul>' + "".join(f"<li>{i}</li>" for i in items) + "</ul></div>"

SIGN = '<div class="sign"><div>Elaborado por</div><div>Responsável técnico</div><div>Aprovado por (Speciale)</div></div>'

def fmt(g):
    return f"{g:,.0f}".replace(",", ".") + " g"

# ---------------------------------------------------------------- MASSA
M_ING = [  # nome, bruto(g), liquido texto, fc, função
    ("Farinha de trigo", 15000, "15.000 g", "1,00", "Estrutura e glúten"),
    ("Água (temperatura ambiente)", 7000, "7.000 g (7 L)", "1,00", "Hidratação (6,5 L + 0,5 L até o ponto)"),
    ("Açúcar", 400, "400 g", "1,00", "Cor da borda (dourar mais rápido)"),
    ("Óleo de soja (400 ml)", 368, "368 g" + EST, "1,00", "Maciez e extensibilidade"),
    ("Sal", 200, "200 g", "1,00", "Sabor e controle da fermentação"),
    ("Fermento biológico", 150, "150 g", "1,00", "Crescimento"),
]
M_TOT = sum(x[1] for x in M_ING)

def massa_pages():
    rows = [[f"<b>{n}</b>" if i == 0 else n, fmt(b), l, fc, f"{b / 15000 * 100:.1f}%".replace(".", ","), fn]
            for i, (n, b, l, fc, fn) in enumerate(M_ING)]
    p2 = (sec(1, "Identificação geral") +
          table(["Campo", "Informação"], [
              ["Nome do produto", "Massa de pizza da casa (base para todas as pizzas)"],
              ["Código interno / SKU", BL],
              ["Categoria", "Preparação base · produção própria · uso interno da cozinha"],
              ["Tamanho do lote", "1 saco de farinha de trigo de 15 kg (1 tipo de trigo para todas as pizzas)"],
              ["Frequência", "Produção diária"],
              ["Porção de uso", "Bolinha de 320 g para a pizza grande · broto e média " + TODO],
              ["Responsável técnico", BL + BL + BL],
              ["Data de elaboração", "Outubro de 2026 · versão 1.0"]]) +
          '<div class="note">Descrição: massa de fermentação lenta no frio, sovada na masseira, boleada à mão e guardada no congelador até a hora de abrir. Aberta no balcão e assada no forno a lenha.</div>' +
          '<div class="gap"></div>' + sec(2, "Composição do lote") +
          table(["Ingrediente", "Peso bruto", "Peso líquido", "FC", "% farinha", "Função"], rows, nums=(1, 2, 3, 4),
                tot=["Total", fmt(M_TOT), fmt(M_TOT), "–", f"{M_TOT/150:.1f}%".replace(".", ","), f"Rendimento: ~{M_TOT/1000:.1f} kg".replace(".", ",") + EST]) +
          '<div class="note">% farinha (porcentagem do padeiro) = peso do ingrediente ÷ peso da farinha. Óleo convertido pela densidade do óleo de soja (≈0,92 g/ml). '
          '<span class="est">(est.)</span> = valor estimado a partir das medições; o rendimento real deve ser pesado depois da sova.</div>' +
          '<div class="two"><div class="card"><h4>Proporções da receita</h4><table>'
          '<tr><td>Hidratação</td><td class="n"><b>46,7%</b> (7 L ÷ 15 kg)</td></tr>'
          '<tr><td>Açúcar</td><td class="n"><b>2,7%</b> (o anotado como certo: 1,2%)</td></tr>'
          '<tr><td>Sal</td><td class="n"><b>1,3%</b></td></tr><tr><td>Fermento</td><td class="n"><b>1,0%</b></td></tr></table></div>'
          f'<div class="rcard"><h4>Rendimento do lote</h4>~{M_TOT/1000:.1f} kg de massa por batida ÷ 320 g = <b>~{int(M_TOT//320)} bolinhas grandes</b>, '
          f'ou cerca de <b>4 bandejas de 18</b>. Cada 20 g a mais por bolinha = 1 pizza perdida a cada 16.</div></div>').replace("~23.1", "~23,1")

    p3 = (sec(3, "Modo de preparo") +
          flow([("Pesar", "balança"), ("Secos", "na masseira"), ("Água", "6,5 L + 0,5 L"), ("Óleo", "de uma vez"), ("Bater", "10 min"), ("Bolear", "320 g")]) +
          steps([
              "<b>Pesar</b> todos os ingredientes na balança (nada de medida no olho).",
              "<b>Juntar os secos</b> na masseira: farinha, açúcar, sal e fermento.",
              "Com a masseira batendo, <b>jogar a água</b> em temperatura ambiente: primeiro <b>6,5 L</b>, depois mais <b>500 ml</b> até chegar ao ponto. " + pill("PCC 1"),
              "<b>Despejar o óleo</b> todo de uma vez.",
              "<b>Bater por 10 min</b>, até a massa ficar lisa e chegar ao ponto.",
              "Tirar e colocar na <b>mesa salpicada de trigo</b>.",
              "<b>Bolear</b>: bolinhas de <b>320 g</b> para a grande. " + pill("PCC 2"),
              "<b>Descanso de 20 a 30 min</b> já boleada, em bandeja (<b>18 bolinhas por bandeja</b>).",
              "<b>Tampar a bandeja</b> com saco de congelador e levar ao <b>congelador</b> para retardar o crescimento. " + pill("PCC 3"),
              "Tirar do congelador <b>só na hora de abrir</b> a pizza. Abrir no <b>balcão de baixo</b>. " + pill("PCC 4"),
          ]) +
          '<div class="sub">Pontos críticos de controle (PCC)</div>' +
          table(["PCC", "O que controlar", "Limite / referência"], [
              ["1 · Pesagem e água", "Receita pesada; água em temperatura ambiente", "Massa ao sair da masseira entre 22 e 26 °C (referência técnica)"],
              ["2 · Peso da bolinha", "Bolinha no peso da ficha", "320 g ± 5 g na grande · conferir 5 bolinhas por lote"],
              ["3 · Armazenamento", "Bandeja tampada, identificada, no congelador", "Usar até o dia seguinte à produção"],
              ["4 · Abertura", "Massa aberta na hora, no diâmetro do tamanho", "Broto 25 cm · grande 35 cm"]]))

    p4 = (sec(4, "Características do produto") +
          table(["Atributo", "Padrão esperado"], [
              ["Massa crua", "Lisa, macia, sem grudar nas mãos; estica fino sem rasgar (ponto de véu)"],
              ["Bolinha", "Redonda, firme e lisa por cima; mesmo tamanho em toda a bandeja"],
              ["Massa assada", "Borda leve e dourada, fundo crocante e sem partes cruas"],
              ["Sabor", "Neutro e levemente adocicado, sem gosto ácido de fermentação"]]) +
          '<div class="gap"></div>' + sec(5, "Rendimento e porcionamento") +
          table(["Tamanho", "Diâmetro", "Fatias", "Peso da bolinha", "Bolinhas por lote"], [
              ["Broto", "25 cm", "4", TODO, "–"],
              ["Média", "~30 cm (no olho)", "5", TODO, "–"],
              ["Grande", "35 cm", "8", "320 g", f"~{int(M_TOT//320)}" + EST]], nums=(2, 3, 4)) +
          '<div class="note">Hoje os tamanhos são abertos no olhômetro e a bolinha não é pesada. A anotação de controle de estoque registra o volume da batida; o rendimento real deve ser pesado e anotado nesta ficha.</div>' +
          '<div class="gap"></div>' + sec(6, "Controle de qualidade") +
          table(["Falha", "Causa provável", "Correção"], [
              ["Massa grudenta", "Água demais ou quente", "Seguir 6,5 L e só completar até o ponto"],
              ["Massa encolhe ao abrir", "Pouco descanso ou massa muito gelada", "Respeitar o descanso; abrir na temperatura certa"],
              ["Borda queima rápido", "Açúcar alto (400 g) no forno a lenha", "Testar a receita com 180 g de açúcar"],
              ["Massa ácida / com bolhas", "Fermentou demais ou passou da validade", "Descartar; usar até o dia seguinte"],
              ["Pizzas de tamanhos diferentes", "Bolinha sem pesar", "Pesar todas as bolinhas"]]))

    p5 = (sec(7, "Armazenamento e validade") +
          table(["Etapa", "Condição", "Prazo"], [
              ["Descanso", "Boleada, em bandeja, coberta", "20 a 30 min"],
              ["Congelador", "Bandeja de 18 tampada com saco de congelador", "Até o dia seguinte"],
              ["Abertura", "Tirar do congelador só na hora de abrir", "Na hora"],
              ["Etiqueta", "Produto · data · validade · responsável. Usar primeiro o que vence primeiro (PVPS)", "Obrigatória"]]) +
          '<div class="gap"></div>' + sec(8, "Custos do lote") +
          table(["Item", "Quantidade", "Preço unitário", "Custo no lote"], [
              ["Farinha de trigo", "15 kg", f"R$ {BL} /kg", f"R$ {BL}"],
              ["Açúcar", "400 g", f"R$ {BL} /kg", f"R$ {BL}"],
              ["Sal", "200 g", f"R$ {BL} /kg", f"R$ {BL}"],
              ["Fermento biológico", "150 g", f"R$ {BL} /kg", f"R$ {BL}"],
              ["Óleo de soja", "400 ml", f"R$ {BL} /L", f"R$ {BL}"],
              ["Gás/lenha, embalagens e mão de obra", "1 lote", "–", f"R$ {BL}"]], nums=(1,),
                tot=["Custo total do lote", "", "", f"R$ {BL}"]) +
          f'<div class="two"><div class="card"><b>Custo por kg</b> = custo do lote ÷ {M_TOT/1000:.1f}<br><b>Custo por bolinha grande</b> = custo por kg × 0,320</div>'.replace("23.1", "23,1") +
          '<div class="card">O que mais mexe no custo: <b>farinha</b> (65% do peso da receita) e <b>bolinhas acima do peso</b>.</div></div>' +
          '<div class="gap"></div>' + sec(9, "Melhorias recomendadas") +
          '<ul class="dots"><li><b>Pesar as bolinhas:</b> hoje não são pesadas; 320 g ± 5 g na grande, e definir o peso da broto e da média.</li>'
          '<li><b>Açúcar:</b> padronizar uma quantidade só (400 g ou 180 g). No forno a lenha o açúcar alto acelera a queima da borda.</li>'
          '<li><b>Termômetro no posto:</b> medir a temperatura da massa ao sair da masseira e a do congelador.</li>'
          '<li><b>Gabarito de tamanho:</b> disco de 25 cm e de 35 cm para abrir a massa sempre igual.</li></ul>' +
          conf(["Peso da bolinha da broto e da média.", "Rendimento real da batida (pesar a massa toda).",
                "Quanto tempo a bolinha fica no congelador antes de abrir.", "Se o fermento biológico é seco ou fresco."]) + SIGN)
    return [("Identificação e composição", p2), ("Modo de preparo", p3), ("Produto e qualidade", p4), ("Armazenamento, custos e melhorias", p5)]

# ---------------------------------------------------------------- PIZZAS
FORNO = "Forno a lenha · 340 a 380 °C · 3 a 4 min"

def pizza_pages(P):
    def g(x):
        return TODO if x is None else x
    comp = [[f"<b>{n}</b>" if i == 0 else n, g(bruto), g(liq), fc, etapa, fn] for i, (n, bruto, liq, fc, etapa, fn) in enumerate(P["ings"])]
    p2 = (sec(1, "Identificação geral") +
          table(["Campo", "Informação"], [
              ["Nome do produto", f"Pizza {e(P['nome'])}"],
              ["Código interno / SKU", BL],
              ["Categoria", P.get("cat", "Pizza salgada · cardápio fixo")],
              ["Descrição no cardápio", e(P["menu"])],
              ["Tamanhos", "Broto 25 cm (4 fatias) · Média (5 fatias) · Grande 35 cm (8 fatias)"],
              ["Forno", FORNO],
              ["Alergênicos", alergs(P["alerg"])],
              ["Responsável técnico", BL + BL + BL],
              ["Data de elaboração", "Outubro de 2026 · versão 1.0"]]) +
          '<div class="gap"></div>' + sec(2, "Composição · pizza grande") +
          table(["Ingrediente", "Peso bruto", "Peso líquido", "FC", "Etapa", "Função"], comp, nums=(1, 2, 3),
                tot=["Total montado", "", P.get("total", TODO), "–", "", "Grande · 35 cm · 8 fatias"]) +
          f'<div class="note">{P["comp_note"]} FC (fator de correção) = peso bruto ÷ peso líquido. Taras dos potes (13 g) já descontadas. <span class="est">(est.)</span> = estimado · <span class="todo">a pesar</span> = falta coletar.</div>' +
          (f'<div class="two"><div class="card"><h4>{P["box1"][0]}</h4>{P["box1"][1]}</div><div class="rcard"><h4>{P["box2"][0]}</h4>{P["box2"][1]}</div></div>' if P.get("box1") else ""))

    p3 = (sec(3, "Modo de montagem") + flow(P["flow"]) + steps(P["steps"]) +
          '<div class="sub">Pontos críticos de controle (PCC)</div>' +
          table(["PCC", "O que controlar", "Limite / referência"], [
              ["1 · Porcionamento", "Cada ingrediente pesado na balança", "Pesos desta ficha (± 5%)"],
              ["2 · Frios e recheios", "Temperatura dos insumos na bancada", "Até 5 °C; voltar à geladeira após o turno (RDC 216/2004)"],
              ["3 · Forno", "Cor da borda e cozimento do fundo", "340 a 380 °C · 3 a 4 min · borda dourada, fundo sem partes cruas"],
              ["4 · Finalização", P.get("pcc4", "Orégano polvilhado, corte e caixa"), P.get("pcc4l", "8 fatias iguais na grande · caixa fechada na hora")]]))

    sizes = table(["Ingrediente", "Broto (25 cm · 4 fatias)", "Média (5 fatias)", "Grande (35 cm · 8 fatias)"],
                  [[n, g(b), g(m), g(gr)] for n, b, m, gr in P["sizes"]], nums=(1, 2, 3))
    ph = (f'<div><img src="{photo(P["photo"])}" alt=""><div class="cap">Foto oficial do cardápio · referência visual</div></div>' if P.get("photo") else "<div></div>")
    p4 = (sec(4, "Características do produto") +
          (f'<div class="prod">' + table(["Atributo", "Padrão esperado"], P["chars"]) + ph + "</div>" if P.get("photo") else table(["Atributo", "Padrão esperado"], P["chars"])) +
          '<div class="gap"></div>' + sec(5, "Porcionamento por tamanho") + sizes +
          '<div class="note">Broto e média são abertas no olhômetro. Os valores em branco devem ser pesados (3 vezes, anotar a média).</div>' +
          '<div class="gap"></div>' + sec(6, "Controle de qualidade") +
          table(["Falha", "Causa provável", "Correção"], P["fails"]))

    custo_rows = [[n, q, f"R$ {BL} /{u}", f"R$ {BL}"] for n, q, u in P["cost"]]
    custo_rows.append(["Caixa (embalagem)", "1 un", f"R$ {BL} /un", f"R$ {BL}"])
    p5 = (sec(7, "Custos · pizza grande") +
          table(["Item", "Quantidade", "Preço unitário", "Custo na pizza"], custo_rows, nums=(1,), tot=["Custo total da pizza", "", "", f"R$ {BL}"]) +
          f'<div class="two"><div class="card"><b>Preço de venda:</b> R$ {BL}<br><b>CMV %</b> = custo ÷ preço de venda × 100 = {BL}</div>'
          f'<div class="card">{P.get("cost_note", "O que mais mexe no custo: os queijos e as proteínas. Pesar sempre.")}</div></div>' +
          '<div class="gap"></div>' + sec(8, "Melhorias recomendadas") +
          '<ul class="dots">' + "".join(f"<li>{x}</li>" for x in P["better"]) + "</ul>" + conf(P["confirm"]) + SIGN)
    return [("Identificação e composição", p2), ("Modo de montagem", p3), ("Produto e porcionamento", p4), ("Custos e melhorias", p5)]

BASE_FAILS = [
    ["Pizza encharcada", "Excesso de queijo ou molho", "Pesar queijo e molho (150 g)"],
    ["Recheio só no centro", "Distribuição apressada", "Espalhar até 1,5 cm da borda"],
    ["Borda queimada", "Forno acima de 380 °C ou açúcar da massa", "Girar a pizza; conferir o fogo"],
    ["Fundo cru", "Forno frio ou massa grossa", "Esperar o forno; abrir no diâmetro certo"]]

MASSA_L = ("Massa (bolinha)", "320 g", "320 g", "1,00", "base", "Base e borda")
MOLHO_L = ("Molho de tomate", "150 g", "150 g" + EST.replace("(est.)", "≈145 ml"), "1,00", "antes", "Base de sabor e umidade")
OREG_L = ("Orégano", "2 g" + EST, "2 g" + EST, "1,00", "antes", "Aroma (média de mercado)")

PIZZAS = {
"portuguesa": dict(nome="Portuguesa", photo=None,
    menu="Mussarela, presunto, ovo cozido, cebola, azeitona e orégano.", alerg={"Glúten", "Leite", "Ovo"},
    ings=[MASSA_L, MOLHO_L,
          ("Muçarela", "278 g", "278 g", "1,00", "antes", "Cobertura (291 g − 13 g do pote)"),
          ("Presunto fatiado", "82 g", "82 g", "1,00", "antes", "Proteína"),
          ("Ovo cozido", "2 un", "2 un", "–", "antes", "Proteína"),
          ("Cebola", "97 g", "97 g", "1,00", "antes", "Sabor (110 g − 13 g do pote)"),
          ("Azeitona", "9 g", "9 g", "1,00", "antes", "Sabor (22 g − 13 g do pote)"),
          OREG_L],
    total="~1.040 g" + EST,
    comp_note="Pesagem anotada como P/M/G (pizza grande).",
    box1=("Pesos medidos", "<table><tr><td>Muçarela</td><td class='n'><b>278 g</b></td></tr><tr><td>Presunto</td><td class='n'><b>82 g</b></td></tr><tr><td>Cebola</td><td class='n'><b>97 g</b></td></tr><tr><td>Azeitona</td><td class='n'><b>9 g</b></td></tr></table>"),
    box2=("A mais completa", "Leva os dois ovos cozidos e quatro coberturas além da muçarela. Com tanto ingrediente, a pesagem é o que garante que a pizza saia igual todo dia."),
    flow=[("Abrir", "balcão de baixo"), ("Molho", "150 g"), ("Muçarela", "278 g"), ("Presunto", "82 g"), ("Ovo", "2 un"), ("Azeitona", "+ orégano")],
    steps=["<b>Abrir</b> a bolinha de 320 g no balcão de baixo, no diâmetro do tamanho.",
           "Espalhar o <b>molho</b> (150 g) até 1,5 cm da borda.",
           "Cobrir com a <b>muçarela</b> (278 g). " + pill("PCC 1"),
           "Distribuir o <b>presunto</b> (82 g).",
           "Distribuir o <b>ovo cozido</b> (2 unidades).",
           "Distribuir a <b>cebola</b> (97 g) " + '<span class="todo">· confirmar em que momento entra</span>',
           "Finalizar com a <b>azeitona</b> (9 g) e <b>polvilhar orégano</b>.",
           "<b>Forno a lenha</b> por 3 a 4 min. " + pill("PCC 3"),
           "Cortar em <b>8 fatias</b> e fechar a caixa. " + pill("PCC 4")],
    chars=[["Aparência", "Cobertura bem distribuída, ovo e presunto visíveis em todas as fatias"],
           ["Queijo", "Derretido e levemente dourado, sem soltar gordura"],
           ["Borda", "Dourada, leve, sem pontos pretos"],
           ["Sabor", "Equilíbrio entre presunto, ovo e cebola; azeitona sem sobrar"]],
    sizes=[("Massa (bolinha)", None, None, "320 g"), ("Molho", None, None, "150 g"), ("Muçarela", None, None, "278 g"),
           ("Presunto", None, None, "82 g"), ("Ovo cozido", None, None, "2 un"), ("Cebola", None, None, "97 g"), ("Azeitona", None, None, "9 g")],
    fails=BASE_FAILS + [["Ovo ressecado", "Ovo cozido há muito tempo", "Cozinhar no dia; validade até 3 dias"]],
    cost=[("Massa (bolinha)", "320 g", "kg"), ("Molho de tomate", "150 g", "kg"), ("Muçarela", "278 g", "kg"), ("Presunto", "82 g", "kg"),
          ("Ovo", "2 un", "un"), ("Cebola", "97 g", "kg"), ("Azeitona", "9 g", "kg"), ("Orégano", "2 g", "kg")],
    better=["<b>Cebola na ordem de montagem:</b> ela foi pesada, mas não aparece na ordem anotada.",
            "<b>Azeitona:</b> 13 g do pote para 9 g de azeitona; porcionar direto na mão evita erro de tara.",
            "<b>Broto e média:</b> pesar e completar a tabela da seção 05."],
    confirm=["Em que momento a cebola entra na montagem.", "Pesos da broto e da média.", "Peso de um punhado de orégano (hoje: média de mercado, 2 g)."]),

"quatro_queijos": dict(nome="4 Queijos", photo=None,
    menu="Mussarela, gorgonzola, provolone, catupiry e orégano.", alerg={"Glúten", "Leite"},
    ings=[MASSA_L, MOLHO_L,
          ("Muçarela", "126 g", "126 g", "1,00", "antes", "Base de queijo (2 × 63 g)"),
          ("Provolone", "126 g", "126 g", "1,00", "antes", "Sabor defumado (2 × 63 g)"),
          ("Gorgonzola", "24 g", "24 g", "1,00", "antes", "Sabor marcante (2 × 12 g)"),
          ("Catupiry", "4 listras", "4 listras", "1,13", "antes", "Cremosidade · g/listra a pesar"),
          OREG_L],
    comp_note="Pesagem feita em <b>meia pizza</b> e dobrada: muçarela 76 g − 13 g do pote, provolone 76 g − 13 g do pote, gorgonzola 12 g, catupiry 4 listras.",
    box1=("Catupiry", "<table><tr><td>Bisnaga</td><td class='n'><b>1,500 kg</b></td></tr><tr><td>Aproveitado</td><td class='n'><b>1,330 kg</b></td></tr><tr><td>Perda</td><td class='n'><b>11% (FC 1,13)</b></td></tr><tr><td>Por pizza</td><td class='n'><b>4 listras</b></td></tr></table>"),
    box2=("Regra da casa", "São <b>4 listras de catupiry em qualquer tamanho</b> (broto, média ou grande). Por isso a broto é proporcionalmente a pizza mais cara de fazer."),
    flow=[("Abrir", "balcão de baixo"), ("Molho", "150 g"), ("Muçarela", "126 g"), ("Provolone", "126 g"), ("Gorgonzola", "24 g"), ("Catupiry", "4 listras")],
    steps=["<b>Abrir</b> a bolinha de 320 g no balcão de baixo.",
           "Espalhar o <b>molho</b> (150 g).",
           "Cobrir com a <b>muçarela</b> (126 g). " + pill("PCC 1"),
           "Distribuir o <b>provolone</b> (126 g).",
           "Distribuir o <b>gorgonzola</b> (24 g) em pedaços pequenos, bem espalhados.",
           "Fazer <b>4 listras de catupiry</b>.",
           "<b>Polvilhar orégano</b> e levar ao <b>forno a lenha</b> por 3 a 4 min. " + pill("PCC 3"),
           "Cortar em <b>8 fatias</b> e fechar a caixa. " + pill("PCC 4")],
    chars=[["Aparência", "Quatro queijos visíveis; gorgonzola em pontos espalhados, 4 listras de catupiry"],
           ["Queijo", "Derretido e cremoso, sem poças de gordura"],
           ["Borda", "Dourada e leve"],
           ["Sabor", "Gorgonzola presente sem dominar; provolone e catupiry equilibrados"]],
    sizes=[("Massa (bolinha)", None, None, "320 g"), ("Molho", None, None, "150 g"), ("Muçarela", None, None, "126 g"),
           ("Provolone", None, None, "126 g"), ("Gorgonzola", None, None, "24 g"), ("Catupiry", "4 listras", "4 listras", "4 listras")],
    fails=BASE_FAILS[1:] + [["Gordura acumulada", "Queijo demais ou forno frio", "Pesar os queijos; forno no ponto"],
                            ["Gorgonzola domina", "Pedaços grandes ou concentrados", "Pedaços pequenos e espalhados"]],
    cost=[("Massa (bolinha)", "320 g", "kg"), ("Molho de tomate", "150 g", "kg"), ("Muçarela", "126 g", "kg"), ("Provolone", "126 g", "kg"),
          ("Gorgonzola", "24 g", "kg"), ("Catupiry", "4 listras", "kg"), ("Orégano", "2 g", "kg")],
    cost_note="O que mais mexe no custo: os <b>queijos</b>. Na broto, as 4 listras de catupiry pesam mais no custo do que na grande.",
    better=["<b>Peso da listra:</b> fazer 5 listras numa vasilha, pesar e dividir por 5.",
            "<b>Catupiry na broto:</b> avaliar 2 listras na broto para equilibrar o custo.",
            "<b>Raspar a bisnaga:</b> 170 g ficam em cada bisnaga (11%)."],
    confirm=["Peso de 1 listra de catupiry.", "Pesos da broto e da média."]),

"lombinho_bacon": dict(nome="Lombinho com Bacon", photo=None,
    menu="Mussarela, lombo canadense, cream cheese, bacon, azeitona preta e orégano.", alerg={"Glúten", "Leite"},
    ings=[MASSA_L, MOLHO_L,
          ("Muçarela", "278 g", "278 g", "1,00", "antes", "Cobertura (291 g − 13 g do pote)"),
          ("Lombo canadense fatiado", "105 g", "105 g", "1,00", "antes", "Proteína"),
          ("Bacon", None, None, "–", "antes", "Sabor defumado · cru ou pré-frito?"),
          ("Cream cheese", None, None, "–", "antes", "Cremosidade"),
          ("Azeitona preta", None, None, "1,00", "antes", "Sabor"),
          OREG_L],
    comp_note="Pesagem anotada como P/M/G (pizza grande). Composição pelo cardápio oficial.",
    box1=("Pesos medidos", "<table><tr><td>Muçarela</td><td class='n'><b>278 g</b></td></tr><tr><td>Lombo</td><td class='n'><b>105 g</b></td></tr><tr><td>Bacon</td><td class='n todo'>a pesar</td></tr><tr><td>Cream cheese</td><td class='n todo'>a pesar</td></tr></table>"),
    box2=("Bacon", "Se o bacon é frito antes, ele perde boa parte do peso. Pesar cru e depois de frito para saber o rendimento e o custo real."),
    flow=[("Abrir", "balcão de baixo"), ("Molho", "150 g"), ("Muçarela", "278 g"), ("Lombo", "105 g"), ("Bacon", "a pesar"), ("Finalizar", "cream cheese")],
    steps=["<b>Abrir</b> a bolinha de 320 g no balcão de baixo.",
           "Espalhar o <b>molho</b> (150 g).",
           "Cobrir com a <b>muçarela</b> (278 g). " + pill("PCC 1"),
           "Distribuir as fatias de <b>lombo</b> (105 g).",
           "Distribuir o <b>bacon</b> " + '<span class="todo">(a pesar)</span>.',
           "<b>Cream cheese</b> " + '<span class="todo">(quantidade a confirmar)</span>.',
           "<b>Azeitona preta</b> e <b>orégano</b> polvilhado.",
           "<b>Forno a lenha</b> por 3 a 4 min e cortar em <b>8 fatias</b>. " + pill("PCC 3")],
    chars=[["Aparência", "Lombo e bacon em todas as fatias; cream cheese em pontos"],
           ["Bacon", "Dourado e crocante, sem partes cruas nem queimadas"],
           ["Borda", "Dourada e leve"],
           ["Sabor", "Defumado do bacon equilibrado com o lombo; sem excesso de sal"]],
    sizes=[("Massa (bolinha)", None, None, "320 g"), ("Molho", None, None, "150 g"), ("Muçarela", None, None, "278 g"),
           ("Lombo", None, None, "105 g"), ("Bacon", None, None, None), ("Cream cheese", None, None, None)],
    fails=BASE_FAILS[1:] + [["Salgada demais", "Bacon + lombo + azeitona", "Pesar o bacon; não salgar o molho a mais"],
                            ["Bacon cru", "Bacon cru em pedaço grosso", "Pré-fritar ou cortar mais fino"]],
    cost=[("Massa (bolinha)", "320 g", "kg"), ("Molho de tomate", "150 g", "kg"), ("Muçarela", "278 g", "kg"), ("Lombo canadense", "105 g", "kg"),
          ("Bacon", "a pesar", "kg"), ("Cream cheese", "a pesar", "kg"), ("Azeitona preta", "a pesar", "kg"), ("Orégano", "2 g", "kg")],
    better=["<b>Bacon:</b> definir se vai cru ou pré-frito e pesar.", "<b>Cream cheese:</b> padronizar como o catupiry (número de listras e peso).",
            "<b>Lombo:</b> contar as fatias (ex.: 8 fatias = 105 g) para facilitar a montagem."],
    confirm=["Peso do bacon e se vai cru ou pré-frito.", "Quantidade de cream cheese.", "Peso da azeitona preta.", "Pesos da broto e da média."]),

"frango_catupiry": dict(nome="Frango com Catupiry", photo=None,
    menu="Mussarela, frango desfiado, catupiry e orégano.", alerg={"Glúten", "Leite"},
    ings=[MASSA_L, MOLHO_L,
          ("Muçarela", None, None, "1,00", "antes", "Cobertura"),
          ("Frango desfiado temperado", "140 g", "140 g", "–", "antes", "Proteína (porção de 75 a 80 g)"),
          ("Catupiry", "4 listras", "4 listras", "1,13", "antes", "Cremosidade · g/listra a pesar"),
          OREG_L],
    comp_note="Frango anotado por tamanho: broto 70 g, média 70 g, grande 140 g.",
    box1=("Frango por tamanho", "<table><tr><td>Broto</td><td class='n'><b>70 g</b></td></tr><tr><td>Média</td><td class='n'><b>70 g</b> <span class='todo'>confirmar</span></td></tr><tr><td>Grande</td><td class='n'><b>140 g</b></td></tr><tr><td>Porção</td><td class='n'><b>75 a 80 g</b></td></tr></table>"),
    box2=("Sub-receita", "O frango desfiado precisa de ficha própria: peso cru, temperos, peso depois de cozido e validade (normalmente até 3 dias na geladeira)."),
    flow=[("Abrir", "balcão de baixo"), ("Molho", "150 g"), ("Muçarela", "a pesar"), ("Frango", "140 g"), ("Catupiry", "4 listras"), ("Forno", "3 a 4 min")],
    steps=["<b>Abrir</b> a bolinha de 320 g no balcão de baixo.",
           "Espalhar o <b>molho</b> (150 g).",
           "Cobrir com a <b>muçarela</b> " + '<span class="todo">(a pesar)</span>. ' + pill("PCC 1"),
           "Distribuir o <b>frango desfiado</b> (140 g na grande).",
           "Fazer <b>4 listras de catupiry</b>.",
           "<b>Polvilhar orégano</b> e levar ao <b>forno a lenha</b> por 3 a 4 min. " + pill("PCC 3"),
           "Cortar em <b>8 fatias</b> e fechar a caixa. " + pill("PCC 4")],
    chars=[["Aparência", "Frango em todas as fatias, 4 listras de catupiry visíveis"],
           ["Frango", "Úmido e temperado, sem ressecar no forno"],
           ["Borda", "Dourada e leve"],
           ["Sabor", "Tempero do frango presente; catupiry cremoso"]],
    sizes=[("Massa (bolinha)", None, None, "320 g"), ("Molho", None, None, "150 g"), ("Muçarela", None, None, None),
           ("Frango desfiado", "70 g", "70 g", "140 g"), ("Catupiry", "4 listras", "4 listras", "4 listras")],
    fails=BASE_FAILS[1:] + [["Frango seco", "Frango cozido demais ou velho", "Validade de 3 dias; não recozer"],
                            ["Pouco frango na fatia", "Frango só no centro", "Espalhar até a borda"]],
    cost=[("Massa (bolinha)", "320 g", "kg"), ("Molho de tomate", "150 g", "kg"), ("Muçarela", "a pesar", "kg"),
          ("Frango desfiado (pronto)", "140 g", "kg"), ("Catupiry", "4 listras", "kg"), ("Orégano", "2 g", "kg")],
    better=["<b>Ficha do frango:</b> registrar peso cru e cozido (fator de cocção) para ter o custo por kg pronto.",
            "<b>Frango na média:</b> 70 g é o mesmo da broto; conferir se não deveria ser ~105 g.",
            "<b>Peso da listra de catupiry.</b>"],
    confirm=["Preparo do frango (receita, peso cru e cozido, validade).", "Peso da muçarela.", "Frango na média (anotado 70 g).", "Peso de 1 listra de catupiry."]),

"chocolate_avela": dict(nome="Chocolate com Avelã", photo=None, cat="Pizza doce · cardápio fixo",
    menu="Barra de chocolate derretido sobre massa de pizza fina e crocante, coberta com avelã.", alerg={"Glúten", "Leite", "Castanhas", "Soja"},
    ings=[("Massa (bolinha)", "320 g", "320 g", "1,00", "base", "Base fina e crocante"),
          ("Chocolate em barra", None, None, "1,00", "a confirmar", "Cobertura"),
          ("Avelã", None, None, "1,00", "a confirmar", "Crocância e sabor")],
    comp_note="Só o cabeçalho P/M/G foi anotado. Composição pelo cardápio oficial. Doce não leva orégano.",
    flow=[("Abrir", "bem fina"), ("Chocolate", "a pesar"), ("Forno", "até derreter"), ("Avelã", "a pesar"), ("Cortar", "8 fatias"), ("Caixa", "na hora")],
    steps=["<b>Abrir</b> a bolinha bem fina no balcão de baixo.",
           "Distribuir o <b>chocolate em barra</b> " + '<span class="todo">(a pesar · confirmar se vai antes ou depois do forno)</span>.',
           "<b>Forno a lenha</b> até a massa ficar crocante e o chocolate derreter. " + pill("PCC 3"),
           "Cobrir com a <b>avelã</b> " + '<span class="todo">(a pesar)</span>.',
           "Cortar em <b>8 fatias</b> e fechar a caixa. " + pill("PCC 4")],
    pcc4="Chocolate derretido sem queimar", pcc4l="Brilhante, sem partes secas ou amargas",
    chars=[["Aparência", "Chocolate cobrindo a massa até perto da borda; avelã por cima"],
           ["Massa", "Fina e crocante"],
           ["Chocolate", "Derretido e brilhante, sem queimar"],
           ["Sabor", "Chocolate com avelã, sem amargor"]],
    sizes=[("Massa (bolinha)", None, None, "320 g"), ("Chocolate em barra", None, None, None), ("Avelã", None, None, None)],
    fails=[["Chocolate queimado / amargo", "Tempo demais no forno", "Tirar assim que derreter"],
           ["Massa mole", "Massa grossa", "Abrir bem fina"],
           ["Chocolate demais", "Porção sem pesar", "Pesar o chocolate"]],
    cost=[("Massa (bolinha)", "320 g", "kg"), ("Chocolate em barra", "a pesar", "kg"), ("Avelã", "a pesar", "kg")],
    cost_note="O que mais mexe no custo: <b>chocolate e avelã</b>. Pesar os dois.",
    better=["<b>Pesar o chocolate e a avelã</b> e registrar a marca.", "<b>Definir a ordem:</b> chocolate antes ou depois do forno."],
    confirm=["Peso e marca do chocolate.", "Peso da avelã.", "Ordem de montagem (antes/depois do forno).", "Se a massa é a mesma das salgadas."]),

"parma_speciale": dict(nome="Parma Speciale", photo=None,
    menu="Muçarela, tomate seco, presunto parma e rúcula (pela foto oficial do site).", alerg={"Glúten", "Leite"},
    ings=[MASSA_L, MOLHO_L,
          ("Muçarela", None, None, "1,00", "antes", "Cobertura"),
          ("Tomate seco", None, None, "1,00", "antes", "Sabor adocicado"),
          ("Presunto parma", None, None, "1,00", "depois", "Proteína (depois do forno)"),
          ("Rúcula", None, None, None, "depois", "Frescor (depois do forno)"),
          OREG_L],
    comp_note="Não há anotações desta pizza. Ingredientes pela foto oficial do site; a pizza não aparece no cardápio de delivery.",
    flow=[("Abrir", "balcão de baixo"), ("Molho", "150 g"), ("Muçarela", "a pesar"), ("Forno", "3 a 4 min"), ("Parma", "depois"), ("Rúcula", "depois")],
    steps=["<b>Abrir</b> a bolinha de 320 g no balcão de baixo.",
           "Espalhar o <b>molho</b> (150 g).",
           "<b>Muçarela</b> e <b>tomate seco</b> " + '<span class="todo">(a pesar)</span>. ' + pill("PCC 1"),
           "<b>Polvilhar orégano</b> e levar ao <b>forno a lenha</b> por 3 a 4 min. " + pill("PCC 3"),
           "Ao sair do forno: <b>rúcula</b> e fatias de <b>parma</b> " + '<span class="todo">(a pesar)</span>.',
           "Cortar em <b>8 fatias</b> e fechar a caixa. " + pill("PCC 4")],
    pcc4="Parma e rúcula só depois do forno", pcc4l="Rúcula verde e firme; parma macio, sem assar",
    chars=[["Aparência", "Parma em todas as fatias, rúcula verde por cima"],
           ["Parma", "Macio, sem ir ao forno"],
           ["Rúcula", "Lavada, bem seca, colocada na hora de fechar a caixa"],
           ["Sabor", "Salgado do parma equilibrado com o tomate seco"]],
    sizes=[("Massa (bolinha)", None, None, "320 g"), ("Molho", None, None, "150 g"), ("Muçarela", None, None, None),
           ("Tomate seco", None, None, None), ("Presunto parma", None, None, None), ("Rúcula", None, None, None)],
    fails=BASE_FAILS[1:] + [["Parma duro e salgado", "Parma foi ao forno", "Parma só depois do forno"],
                            ["Rúcula murcha", "Colocada cedo ou molhada", "Secar bem; colocar na hora"]],
    cost=[("Massa (bolinha)", "320 g", "kg"), ("Molho de tomate", "150 g", "kg"), ("Muçarela", "a pesar", "kg"), ("Tomate seco", "a pesar", "kg"),
          ("Presunto parma", "a pesar", "kg"), ("Rúcula (limpa)", "a pesar", "kg"), ("Orégano", "2 g", "kg")],
    cost_note="O que mais mexe no custo: o <b>presunto parma</b>, o item mais caro do cardápio. Pesar com precisão.",
    better=["<b>Pesar todos os ingredientes</b> (3 vezes, anotar a média).", "<b>Rúcula:</b> pesar já limpa e seca."],
    confirm=["Todos os pesos (não há anotações).", "Ordem de montagem.", "Se a pizza ainda é vendida e o preço."]),
}

def _cover_title(n):
    words = n.upper().split(" ")
    return "PIZZA<br>" + " ".join(words[:-1]) + (" " if len(words) > 1 else "") + f"<em>{words[-1]}</em>"

FICHAS = {
    "massa": dict(title_bar="MASSA DE PIZZA", kind="preparo", tag="FICHA TÉCNICA DE PREPARO",
                  cover_title="MASSA DE<br>PIZZA<br><em>DA CASA</em>", desc_top=150,
                  desc="Base de todas as pizzas da Speciale. Sovada na masseira, boleada à mão e guardada no congelador até a hora de abrir no forno a lenha.",
                  stats=[(f"~{M_TOT/1000:.1f} kg".replace(".", ","), "de massa por batida (15 kg de trigo)"),
                         (f"~{int(M_TOT//320)}", "bolinhas grandes de 320 g por batida"),
                         ("Diária", "produção · usar até o dia seguinte")],
                  pages=massa_pages, pages_total=5),
}
for slug, P in PIZZAS.items():
    sizes_line = "35 cm"
    FICHAS[slug] = dict(title_bar=P["nome"].upper(), kind="montagem", tag="FICHA TÉCNICA DE MONTAGEM",
                        cover_title=_cover_title(P["nome"]), desc=P["menu"], desc_top=128,
                        photo=P.get("photo"), ph_top=150,
                        stats=[("35 cm", "pizza grande · 8 fatias (broto 25 cm · 4 fatias)"),
                               ("320 g", "de massa na grande · molho 150 g" if slug != "chocolate_avela" else "de massa na grande · aberta bem fina"),
                               ("3 a 4 min", "forno a lenha · 340 a 380 °C")],
                        pages=(lambda P=P: pizza_pages(P)), pages_total=5)
