"""Ficha técnica da Massa v1.1 e Receita da Produção v1.1 (corrigidas com as informações da produção).
uso: python3 massa_v2.py ficha|receita <saida.html>"""
import sys, html
from ft_ref import CSS, wm
from fichas_data import sec, table, steps, flow, pill, conf, SIGN, BL
from port_v2 import EXTRA, doc, cover, foto, img

e = html.escape
EST = '<span class="est">(est.)</span>'
FM = "fotos_massa"
P = pill
D = lambda t: f'<span class="pill d">{t}</span>'

ING = [("Farinha de trigo (1 tipo)", "15 kg", "15.000 g", "100%", "1 · secos", "Estrutura e corpo"),
       ("Fermento biológico", "150 g", "150 g", "1,0%", "1 · secos", "Crescimento e aroma"),
       ("Sal", "200 g", "200 g", "1,3%", "1 · secos", "Tempero e controle do fermento"),
       ("Açúcar", "400 g", "400 g", "2,7%", "1 · secos", "Dourar mais rápido no forno (*)"),
       ("Água em temperatura ambiente", "7 L", "7.000 g", "46,7%", "2 · 6,5 L + 500 ml", "Hidratação da massa"),
       ("Óleo de soja", "400 ml", "≈368 g " + EST, "2,5%", "3 · de uma vez", "Maciez e sabor")]

def ficha():
    p2 = (sec(1, "Identificação geral") + table(["Campo", "Informação"], [
            ["Nome do produto", "Massa de Pizza Artesanal (base para todos os tamanhos)"],
            ["Código interno / SKU", BL],
            ["Categoria", "Preparação base · massa de pizza · produção própria · uso interno"],
            ["Tamanho do lote", "15 kg de farinha de trigo (1 tipo apenas), batidos na masseira"],
            ["Produção", "Diária, via de regra · cerca de 100 bolinhas por dia · horário a confirmar"],
            ["Porção de uso", "1 bolinha de 320 g por pizza (hoje todas as bolinhas têm 320 g)"],
            ["Conservação", "Direto na geladeira, em bandeja coberta · no máximo 2 dias"],
            ["Destino", "Pizzas assadas em forno a lenha · 3 a 4 min por pizza"],
            ["Alérgenos", "CONTÉM GLÚTEN (trigo)"],
            ["Responsável técnico", BL + BL + BL],
            ["Data de elaboração", "Novembro de 2026 · versão 1.1"]]) +
          '<div class="gap"></div>' + sec(2, "Ingredientes do lote") +
          table(["Ingrediente", "Quantidade", "Peso", "% farinha", "Ordem de adição", "Função"],
                [[f"<b>{a}</b>" if i == 0 else a, b, c, d, x, f] for i, (a, b, c, d, x, f) in enumerate(ING)], nums=(1, 2, 3),
                tot=["Total do lote", "", "≈23,1 kg " + EST, "154%", "", "≈72 bolinhas de 320 g"]) +
          '<div class="note">(*) A receita-padrão pede 180 g de açúcar; a casa usa 400 g para a massa dourar mais rápido. % farinha = peso do ingrediente ÷ peso da farinha. Óleo convertido pela densidade do óleo de soja (≈0,92 g/ml). O rendimento do lote é a soma dos ingredientes; pesar a massa após a batida para confirmar.</div>'
)
    p3 = (sec(3, "Equipamentos e utensílios") + table(["Item", "Uso"], [
            ["Masseira G. Paniz", "Mistura e batida da massa (10 min)"],
            ["Balança", "Pesagem dos insumos e das bolinhas (320 g)"],
            ["Mesa / bancada higienizada", "Dividir e bolear, com farinha de trigo"],
            ["Bandejas (18 bolinhas) e saco plástico alimentício", "Descanso, cobertura e guarda na geladeira"],
            ["Geladeira", "Guardar as bandejas por até 2 dias"],
            ["Jarra graduada · etiquetas · caneta", "Medir água e óleo · identificar o lote"]]) +
          '<div class="gap"></div>' + sec(4, "Modo de preparo") +
          flow([("Pesar", "insumos"), ("Bater", "10 min"), ("Bolear", "320 g"), ("Bandeja", "18 bolinhas"), ("Descansar", "20 a 30 min"), ("Geladeira", "até 2 dias")]) +
          steps([
            "<b>Preparar o posto:</b> separar balança, masseira, mesa e bandejas limpas; higienizar masseira, utensílios e mesa. " + P("PCC 1"),
            "<b>Pesar os insumos do lote:</b> farinha 15 kg, água 7 L (temperatura ambiente), fermento 150 g, sal 200 g, açúcar 400 g e óleo 400 ml. " + P("PCC 2"),
            "<b>Juntar os secos</b> na masseira. Com a masseira ligada, jogar <b>6,5 L de água</b> e depois mais <b>500 ml</b> para chegar ao ponto. " + D("FOTO 1"),
            "<b>Despejar todo o óleo</b> de uma vez e <b>bater por 10 min</b>: massa lisa e homogênea, sem farinha seca. " + P("PCC 3"),
            "Tirar a massa da masseira e levar para a <b>mesa salpicada de farinha</b>.",
            "<b>Dividir e bolear</b> em bolinhas de <b>320 g</b>, pesando na balança. " + D("FOTO 3") + P("PCC 4"),
            "Dispor <b>18 bolinhas por bandeja</b>, sobre farinha, em uma camada e sem encostar demais, e salpicar farinha por cima. " + D("FOTO 4") + D("FOTO 5"),
            "<b>Cobrir com saco plástico</b> e deixar <b>descansar 20 a 30 min</b> na bandeja. " + D("FOTO 6") + P("PCC 5"),
            "<b>Etiquetar</b> (data, validade e responsável) e levar <b>direto para a geladeira</b>. Validade: <b>no máximo 2 dias</b>. " + D("FOTO 2") + P("PCC 6"),
            "Na hora de usar: tirar a bandeja da geladeira e <b>abrir no balcão de baixo</b>, na mesa enfarinhada, aparando a borda com o cortador."]))

    p4 = ('<div class="sub" style="margin-top:0">Pontos críticos de controle (PCC)</div>' + table(["PCC", "O que controlar", "Limite / referência"], [
            ["1 · Higienização", "Masseira, utensílios, mesa e mãos limpos antes de iniciar", "Superfícies higienizadas conforme RDC 216/2004"],
            ["2 · Dosagem", "Peso dos insumos, em especial fermento, sal, açúcar e água", "Conforme seção 02 (150 g · 200 g · 400 g · 7 L)"],
            ["3 · Ponto da massa", "Tempo na masseira e aspecto da massa", "≈10 min; massa lisa e sem farinha seca"],
            ["4 · Peso da bolinha", "Cada bolinha pesada na balança", "320 g ± 5 g"],
            ["5 · Descanso", "Tempo na bandeja, coberta, antes da geladeira", "20 a 30 min"],
            ["6 · Refrigeração", "Temperatura da geladeira, etiqueta e validade", "Até 5 °C (referência) · no máximo 2 dias · usar primeiro o que vence primeiro"]]) +
          '<div class="gap"></div>' + sec(5, "Pontos de cada etapa") +
          '<div class="note" style="margin:-1mm 0 3mm">Registro fotográfico da produção acompanhada na visita.</div><div class="photos">' +
          foto("fm-004-000", 1, "Masseira G. Paniz", "<b>Etapa 3</b> · Masseira onde secos, água e óleo são batidos por 10 min. Conferir a limpeza antes de começar.", FM) +
          foto("fm-004-001", 2, "Massa de 2 dias na geladeira", "<b>Etapa 9</b> · Aspecto no limite da validade: aerada, com bolhas e crescida. Passou de 2 dias, descartar.", FM) +
          "</div>")

    p5 = ('<div class="photos">' +
          foto("fm-004-002", 3, "Bolinhas na mesa", "<b>Etapa 6</b> · Bolinhas de 320 g boleadas na mesa salpicada de farinha: superfície lisa e fechada, sem rasgos.", FM) +
          foto("fm-004-003", 4, "Enfarinhar na bandeja", "<b>Etapa 7</b> · Bolinhas sobre camada de farinha e leve cobertura por cima, para não grudarem.", FM) +
          foto("fm-004-004", 5, "Bandeja arrumada", "<b>Etapa 7</b> · 18 bolinhas lado a lado, uma camada, todas com farinha na superfície.", FM) +
          foto("fm-004-005", 6, "Coberta para o descanso", "<b>Etapa 8</b> · Bandeja coberta com saco plástico durante os 20 a 30 min de descanso. Depois, etiquetar e levar à geladeira.", FM) +
          "</div>" + '<div class="gap"></div>' + sec(6, "Características do produto") + table(["Atributo", "Padrão esperado"], [
            ["Cor", "Creme claro e uniforme, sem manchas de farinha seca"],
            ["Textura", "Massa lisa e homogênea, sem grumos de fermento, sal ou açúcar"],
            ["Consistência", "Macia e boleável: não gruda demais na mesa salpicada de farinha"],
            ["Aroma / sabor", "Aroma suave de fermento; sal equilibrado; assa dourada no forno a lenha"]]))

    p6 = (sec(7, "Tamanhos das pizzas e bolinhas") +
          '<div class="note" style="margin:-1mm 0 2.5mm">Hoje <b>todas as bolinhas têm 320 g</b> (peso da Grande) e o tamanho é definido no olho, aparando a borda com o cortador. Os pesos de Média e Broto abaixo são <b>sugestão</b>, proporcional à área da pizza, para testar.</div>' +
          table(["Tamanho", "Diâmetro", "Fatias", "Bolinha hoje", "Bolinha sugerida"], [
            ["Broto", "25 cm", "4", "320 g", "≈165 g " + EST], ["Média", "≈30 cm", "5", "320 g", "≈235 g " + EST], ["Grande", "35 cm", "8", "320 g", "320 g"]], nums=(2, 3, 4)) +
          '<div class="note">Ver o material “Padronização do tamanho e desperdício de massa” para o cálculo e o plano de teste.</div>'
          '<div class="gap"></div>' + sec(8, "Condições do forno") + table(["Item", "Resposta"], [
            ["Tipo de forno", "A lenha"], ["Temperatura", "340 a 380 °C é o ponto ideal (forno sem marcador de temperatura)"], ["Tempo médio de forno", "3 a 4 min"]]) +
          '<div class="gap"></div>' + sec(9, "Controle de qualidade") +
          '<ul class="chk2"><li>Cor, textura e consistência dentro do padrão da seção 06.</li><li>Massa batida por cerca de 10 min, lisa e sem farinha seca.</li>'
          '<li>Bolinhas pesadas (320 g), enfarinhadas, cobertas, etiquetadas e na geladeira no mesmo dia.</li><li>Sem corpos estranhos, cheiro azedo ou fermentação excessiva.</li></ul>' +
          table(["Falha", "Causa provável", "Correção"], [
            ["Massa dura ou seca", "Pouca água; ponto não atingido", "Completar com os 500 ml de água; bater até o ponto"],
            ["Massa mole / grudando", "Excesso de água ou pouca batida", "Conferir a medida da água; salpicar farinha na mesa"],
            ["Não cresce / sem aroma", "Fermento fraco ou fora do prazo", "Conferir validade do fermento e a dose (150 g)"],
            ["Queima ou escurece rápido", "Açúcar em excesso; forno muito quente", "Revisar o açúcar e a temperatura (340–380 °C)"],
            ["Massa encolhe ao abrir", "Massa muito gelada ou pouco descanso", "Respeitar os 20 a 30 min de descanso; avaliar tempo fora da geladeira antes de abrir"],
            ["Cheiro azedo / bolhas demais", "Validade vencida ou geladeira quente", "Descartar; respeitar os 2 dias (PCC 6)"]]))

    custo = [[n, q, f"R$ {BL} /{u}", f"R$ {BL}"] for n, q, u in [
        ("Farinha de trigo", "15 kg", "kg"), ("Fermento biológico", "150 g", "kg"), ("Sal", "200 g", "kg"), ("Açúcar", "400 g", "kg"),
        ("Óleo de soja", "400 ml", "L"), ("Gás, embalagens e mão de obra", "1 lote", "lote")]]
    p7 = (sec(10, "Armazenamento e validade") + table(["Etapa", "Condição", "Prazo"], [
            ["Produção", "Massa feita todos os dias, via de regra", "Diária"],
            ["Descanso", "18 bolinhas por bandeja, cobertas com saco plástico, em temperatura ambiente", "20 a 30 min"],
            ["Geladeira", "Direto na geladeira, bandeja coberta e etiquetada (até 5 °C, referência)", "No máximo 2 dias"],
            ["Uso", "Tirar a bandeja da geladeira e abrir no balcão de baixo", "Na hora"],
            ["Etiqueta", "Produto · data de preparo · validade · responsável · lote · usar primeiro o que vence primeiro (PVPS)", "Obrigatória"]]) +
          '<div class="gap"></div>' +
'<div class="two"><div class="card"><h4>Produção do dia</h4><table>'
          '<tr><td>Bolinhas por dia</td><td class="n"><b>≈100</b></td></tr>'
          '<tr><td>Massa por dia (100 × 320 g)</td><td class="n"><b>≈32 kg</b></td></tr>'
          '<tr><td>Bandejas (18 bolinhas cada)</td><td class="n"><b>≈6</b></td></tr>'
          '<tr><td>Lotes de 15 kg de farinha</td><td class="n"><b>≈1,4</b> ' + EST + '</td></tr></table></div>'
          '<div class="rcard"><h4>Rendimento do lote</h4>1 lote (15 kg de farinha) rende cerca de <b>23,1 kg de massa</b>, ou <b>≈72 bolinhas de 320 g</b>. Para as ≈100 bolinhas do dia são precisos cerca de 1,4 lote: confirmar quantas batidas são feitas por dia.</div></div>' +
          '<div class="gap"></div>' + sec(11, "Custos do lote") +
          table(["Item", "Quantidade", "Preço unitário", "Custo no lote"], custo, nums=(1,), tot=["Custo total do lote", "", "", f"R$ {BL}"]) +
          '<div class="two"><div class="card"><b>Custo por kg</b> = custo do lote ÷ 23,1<br><b>Custo por bolinha</b> = custo do lote ÷ 72</div>'
          '<div class="card">O que mais mexe no custo: <b>farinha</b> (65% do peso do lote) e <b>massa que vai fora</b> (bolinha de 320 g aparada para Broto e Média).</div></div>'
)

    p8 = (sec(12, "Registro de produção") +
          table(["Data", "Lote", "Responsável", "Temp. água", "Nº de bolinhas", "Validade", "Visto"], [["", "", "", "", "", "", ""] for _ in range(5)]) + '<div class="gap"></div>' +
          sec(13, "Melhorias recomendadas") + '<ul class="dots">'
          '<li><b>Bolinha por tamanho:</b> hoje todas têm 320 g. Fazer bolinhas de ≈165 g (Broto) e ≈235 g (Média) reduz a massa aparada e jogada fora (ver material de padronização).</li>'
          '<li><b>Pesar a água e registrar a temperatura:</b> a água entra em temperatura ambiente, que muda com a estação.</li>'
          '<li><b>Rever o açúcar:</b> a receita-padrão pede 180 g e a casa usa 400 g. Testar reduções e comparar cor, sabor e tempo de forno.</li>'
          '<li><b>Termômetro na geladeira:</b> manter até 5 °C e anotar; com massa guardada por até 2 dias, a temperatura faz diferença.</li>'
          '<li><b>Medir o forno:</b> termômetro infravermelho para manter 340 a 380 °C.</li></ul>' +
          conf(["Quantas batidas são feitas por dia para as ≈100 bolinhas.", "Horário da produção.",
                "Temperatura da geladeira.", "Tempo que a bandeja fica fora da geladeira antes de abrir.",
                "Marca e tipo do fermento (seco ou fresco).", "Diâmetro real da Média."]) + SIGN)

    pages = [("Identificação e ingredientes", p2), ("Equipamentos e modo de preparo", p3), ("PCC e guia visual", p4),
             ("Guia visual e produto", p5), ("Tamanhos, forno e qualidade", p6), ("Armazenamento, custos e registro", p7), ("Melhorias", p8)]
    return cover("FICHA TÉCNICA DE PREPARO", "MASSA DE<br>PIZZA<br><em>ARTESANAL</em>",
                 "Base de todas as pizzas da casa. Farinha, água, fermento e óleo batidos na masseira, divididos em bolinhas de 320 g e guardados direto na geladeira, para assar em forno a lenha.",
                 [("15 kg", "de farinha de trigo por lote (1 tipo apenas)"), ("≈100", "bolinhas de 320 g por dia"), ("2 dias", "no máximo, na geladeira")]) + \
        doc(pages, "FICHA TÉCNICA · MASSA DE PIZZA ARTESANAL", "Ficha técnica de preparo", len(pages) + 1)

RC_CSS = """
.rc .stat4{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm;margin-bottom:5mm}
.rc .stat4 div{background:var(--cream);border-radius:2.4mm;padding:3.5mm;text-align:center}
.rc .stat4 b{display:block;font-family:'HerosCn';font-size:20pt;color:var(--red);line-height:1}
.rc .stat4 span{font-size:7.6pt;color:var(--muted)}
.rc .ing{display:flex;justify-content:space-between;padding:2.6mm 1mm;border-bottom:.5pt solid var(--line);font-size:10.5pt}
.rc .ing b{font-family:'HerosCn';font-size:13pt;color:var(--red)}
.rc .ing span small{display:block;font-size:7.6pt;color:var(--muted)}
.rc .blk{display:grid;grid-template-columns:1fr 52mm;gap:5mm;align-items:start;margin-bottom:3mm}
.rc .blk img{width:52mm;height:36mm;object-fit:cover;border-radius:2mm}
.rc .blk .cap{font-size:6.8pt;color:var(--muted);margin-top:.8mm}
.rc .st{display:grid;grid-template-columns:8mm 1fr;font-size:10pt;line-height:1.5;padding:1.4mm 0}
.rc .st i{font-style:normal;font-family:'HerosCn';color:var(--red);font-size:12pt}
.rc .ponto{background:var(--cream);border-left:3pt solid var(--red);padding:2.4mm 3.5mm;font-size:8.6pt;margin:1.5mm 0 1mm}
.rc .letra{display:flex;align-items:center;gap:2.5mm;font-family:'HerosCn';font-size:13pt;text-transform:uppercase;margin:3mm 0 1mm}
.rc .letra i{font-style:normal;background:var(--red);color:#fff;border-radius:1.4mm;padding:.6mm 2.4mm;font-size:11pt}
.rc .dark{background:var(--dark);color:#fff;border-radius:3mm;padding:4mm 5mm;margin-top:4mm;display:grid;grid-template-columns:1fr 1fr;gap:1.5mm 6mm;font-size:8.8pt}
.rc .dark h4{grid-column:1/-1;font-family:'HerosCn';color:var(--orange);font-size:10pt}
.rc .two2{display:grid;grid-template-columns:1fr 1fr;gap:5mm;margin-top:4mm}
.rc .two2 ul{margin:1mm 0 0 4mm;font-size:8.8pt}
.rc .etq{border:1pt dashed var(--muted);border-radius:2.4mm;padding:4mm 5mm;margin-top:5mm;display:grid;grid-template-columns:30mm 1fr 1fr;gap:3mm 6mm;font-size:8.4pt}
.rc .etq b.t{font-family:'HerosCn';color:var(--red);grid-row:1/4;font-size:11pt}
"""

def receita():
    from ft_ref import leaf_logo
    rc = lambda n, t, s: f'<div class="st"><i>{n}</i><div>{s}</div></div>'
    p1 = ('<div class="rc"><div class="stat4"><div><b>15 kg</b><span>de farinha de trigo</span></div><div><b>7 L</b><span>de água</span></div>'
          '<div><b>10 min</b><span>de batida na masseira</span></div><div><b>2 dias</b><span>no máximo, na geladeira</span></div></div>' +
          sec(1, "Separe os ingredientes") +
          "".join(f'<div class="ing"><span>{a}{"<small>" + s + "</small>" if s else ""}</span><b>{q}</b></div>' for a, s, q in [
              ("Farinha de trigo", "1 tipo apenas", "15 kg"), ("Fermento biológico", "", "150 g"), ("Sal", "", "200 g"),
              ("Açúcar", "", "400 g"), ("Água", "temperatura ambiente", "7 L"), ("Óleo de soja", "", "400 ml")]) +
          '<div class="gap"></div>' + sec(2, "Tamanho e peso da bolinha") +
          '<p style="font-size:9pt;margin-bottom:2mm">Cada pizza leva 1 bolinha. <b>Hoje todas as bolinhas são de 320 g.</b> Pese cada uma na balança.</p>' +
          table(["Tamanho", "Fatias", "Peso da bolinha hoje", "Sugestão em teste"], [
              ["Broto", "4", "320 g", "≈165 g"], ["Média", "5", "320 g", "≈235 g"], ["Grande", "8", "320 g", "320 g"]], nums=(1, 2, 3)) +
          '<div class="dark"><h4>ANTES DE COMEÇAR</h4><span>☐ Mãos lavadas, touca e avental</span><span>☐ Bandejas limpas</span>'
          '<span>☐ Masseira limpa e seca</span><span>☐ Saco plástico para cobrir</span><span>☐ Mesa limpa e salpicada de farinha</span>'
          '<span>☐ Etiquetas e caneta</span><span>☐ Balança conferida</span><span>☐ Jarra graduada (água e óleo)</span></div></div>')

    def blk(letter, title, inner, im, cap):
        return (f'<div class="letra"><i>{letter}</i>{e(title)}</div><div class="blk"><div>{inner}</div>'
                f'<div><img src="{img(im, FM)}" alt=""><div class="cap">{e(cap)}</div></div></div>')
    p2 = ('<div class="rc">' +
          blk("A", "Misturar na masseira", rc(1, "", "Junte na masseira a <b>farinha, o fermento, o sal e o açúcar</b>.") +
              rc(2, "", "Com a masseira ligada, jogue <b>6,5 L de água</b>. Depois, mais <b>500 ml</b> para chegar ao ponto.") +
              rc(3, "", "Despeje <b>todo o óleo de uma vez</b>.") +
              '<div class="ponto"><b>Água sempre em temperatura ambiente.</b> Não use água quente nem gelada.</div>', "rc-002-000", "Masseira limpa, antes de começar") +
          blk("B", "Bater até o ponto", rc(4, "", "Deixe bater por <b>10 minutos</b> até chegar ao ponto.") +
              '<div class="ponto"><b>PONTO:</b> massa lisa, macia e homogênea, sem farinha seca no fundo. Dura: complete com água aos poucos. Mole: salpique farinha.</div>', "fm-004-001", "Massa pronta na bandeja") +
          blk("C", "Dividir e bolear", rc(5, "", "Tire a massa e coloque na <b>mesa salpicada de farinha</b>.") +
              rc(6, "", "Faça as bolinhas de <b>320 g</b>. <b>Pese cada uma</b> na balança.") +
              '<div class="ponto"><b>PONTO:</b> bolinha lisa e fechada, sem rasgos nem farinha em excesso por dentro.</div>', "rc-002-001", "Bolinhas na mesa com farinha") +
          blk("D", "Bandeja, descanso e geladeira", rc(7, "", "Coloque <b>18 bolinhas por bandeja</b>, sobre farinha, em uma camada, e salpique farinha por cima.") +
              rc(8, "", "Cubra com saco plástico e deixe <b>descansar 20 a 30 minutos</b> na bandeja.") +
              rc(9, "", "Cole a etiqueta (data, validade e responsável) e leve <b>direto para a geladeira</b>.") +
              '<div class="ponto"><b>Validade: no máximo 2 dias na geladeira.</b> Use primeiro a massa que vence primeiro.</div>', "fm-004-005", "Bandeja coberta com saco plástico") + "</div>")

    p3 = ('<div class="rc">' + sec(3, "Como usar") +
          rc(10, "", "Na hora de abrir, tire a bandeja da geladeira, ainda coberta.") +
          rc(11, "", "Abra a pizza no <b>balcão de baixo</b>, na mesa enfarinhada, e apare a borda com o cortador.") +
          '<div class="stat4" style="grid-template-columns:1fr 1fr;margin-top:4mm"><div><b>2 dias</b><span>no máximo na geladeira, bandeja coberta e etiquetada</span></div>'
          '<div><b>20–30 min</b><span>de descanso na bandeja antes de ir para a geladeira</span></div></div>'
          '<div class="two2"><div class="card"><h4>Faça sempre</h4><ul><li>Use primeiro a massa que vence primeiro.</li><li>Pese cada bolinha: 320 g.</li>'
          '<li>Mantenha a bandeja coberta o tempo todo.</li><li>Etiquete toda bandeja.</li></ul></div>'
          '<div class="card"><h4>Jogue fora se</h4><ul><li>Passou de 2 dias (veja a etiqueta).</li><li>Cheiro azedo, bolhas demais ou mofo.</li>'
          '<li>Ficou fora da geladeira por muito tempo.</li></ul></div></div>'
          '<div class="etq"><b class="t">MODELO DE<br>ETIQUETA</b><span>Produto: <b>Massa de pizza</b></span><span>Lote: ' + BL + '</span>'
          '<span>Preparo: ' + BL + '</span><span>Validade: ' + BL + '</span><span>Responsável: ' + BL + '</span><span>☐ Geladeira · até 2 dias</span></div>'
          '<div class="note" style="margin-top:5mm">Boas Práticas · RDC ANVISA 216/2004.</div></div>')

    pages = [("Ingredientes e bolinhas", p1), ("Modo de preparo", p2), ("Como usar", p3)]
    return doc(pages, "MASSA DE PIZZA · RECEITA DA PRODUÇÃO", "Ficha de produção", len(pages), start=1)

if __name__ == "__main__":
    mode, out = sys.argv[1], sys.argv[2]
    body = ficha() if mode == "ficha" else receita()
    open(out, "w", encoding="utf-8").write(f'<!doctype html><html lang="pt-br"><head><meta charset="utf-8"><title>Speciale</title><style>{CSS}{EXTRA}{RC_CSS}</style></head><body>{body}</body></html>')
    print("ok", mode)
