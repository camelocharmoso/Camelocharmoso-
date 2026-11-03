"""PDF de treinamento: como configurar e instruir o Claude para as fichas técnicas da Speciale."""
import sys, html
from ft_ref import FONTS, leaf_logo, wm
e = html.escape

CSS = FONTS + """
:root{--red:#DA161C;--dark:#241A17;--cream:#FDF5EC;--orange:#F07A1E;--line:#EADBC8;--muted:#5d524c}
@page{size:A4;margin:20mm 16mm 18mm}
@page :first{margin:0}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'InterF',Arial,sans-serif;color:var(--dark);font-size:9.4pt;line-height:1.55;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.cover{width:210mm;height:297mm;position:relative;overflow:hidden;background:radial-gradient(90% 70% at 70% 40%,#EB2229 0%,var(--red) 45%,#B30F14 100%);color:#fff;page-break-after:always}
.chk{position:absolute;left:0;right:0;height:5mm;background:repeating-conic-gradient(var(--red) 0 25%,#fff 0 50%) 0 0/5mm 5mm}
.cover .logo{position:absolute;left:18mm;top:24mm;display:flex;align-items:center;gap:3mm}
.wm b{display:block;font-family:'HerosCn';font-size:20pt;line-height:.9}.wm span{display:block;font-size:5.6pt;font-weight:700;letter-spacing:.42em;margin-top:.6mm}
.cover .tag{position:absolute;left:18mm;top:57mm;background:#fff;color:var(--red);font-family:'HerosCn';font-size:11pt;padding:2mm 4mm;transform:rotate(-2deg)}
.cover h1{position:absolute;left:18mm;right:18mm;top:72mm;font-family:'HerosCn';font-size:52pt;line-height:.93}
.cover h1 em{font-style:normal;color:var(--orange)}
.cover .desc{position:absolute;left:18mm;top:140mm;width:150mm;font-size:11.5pt;line-height:1.55}
.cover .stats{position:absolute;left:18mm;right:18mm;bottom:38mm;display:grid;grid-template-columns:repeat(3,1fr);gap:4.5mm}
.cover .stats div{border:.6pt solid rgba(255,255,255,.45);background:rgba(255,255,255,.08);border-radius:3mm;padding:4mm}
.cover .stats b{display:block;font-family:'HerosCn';font-size:20pt;line-height:1}.cover .stats span{display:block;font-size:7.6pt;margin-top:1.4mm;line-height:1.45}
.cover .ver{position:absolute;right:18mm;bottom:30mm;font-size:7.6pt}
h2{font-family:'HerosCn';font-size:18pt;text-transform:uppercase;display:flex;align-items:center;gap:3mm;margin:7mm 0 3mm;break-after:avoid}
h2 i{font-style:normal;background:var(--red);color:#fff;font-size:10pt;border-radius:1.6mm;padding:1mm 2.4mm}
h3{font-family:'HerosCn';font-size:11pt;color:var(--red);text-transform:uppercase;margin:4.5mm 0 1.6mm;break-after:avoid}
p{margin-bottom:2mm}
ul,ol{margin:0 0 2mm 5mm}li{margin-bottom:1.1mm}
table{width:100%;border-collapse:collapse;margin:1mm 0 3mm;break-inside:avoid}
th{background:var(--dark);color:#fff;font-family:'HerosCn';font-size:8pt;text-transform:uppercase;text-align:left;padding:2mm 2.4mm}
td{padding:1.8mm 2.4mm;border-bottom:.5pt solid var(--line);font-size:8.6pt;vertical-align:top}
tr:nth-child(odd) td{background:var(--cream)}
.box{background:var(--cream);border-left:3pt solid var(--red);border-radius:2mm;padding:3.5mm 4.5mm;margin:2mm 0 3.5mm;break-inside:avoid}
.box b.t{display:block;font-family:'HerosCn';color:var(--red);font-size:10pt;text-transform:uppercase;margin-bottom:1mm}
.prompt{background:#211816;color:#F7EDE2;border-radius:2.4mm;padding:4mm 4.5mm;margin:1.5mm 0 4mm;font-family:'DejaVu Sans Mono',monospace;font-size:7.6pt;line-height:1.55;white-space:pre-wrap;break-inside:avoid}
.prompt .h{display:block;font-family:'HerosCn';font-size:9pt;color:var(--orange);margin-bottom:1.5mm;letter-spacing:.03em}
.rule{display:grid;grid-template-columns:8mm 1fr;padding:1.8mm 0;border-bottom:.5pt dotted #d9c6b0;break-inside:avoid}
.rule i{font-style:normal;font-family:'HerosCn';color:var(--red);font-size:11pt}
.pb{page-break-before:always}
.prompt.big{break-inside:auto}
.small{font-size:7.8pt;color:var(--muted)}
"""

def h2(n, t): return f'<h2><i>{n:02d}</i>{e(t)}</h2>'
def tbl(head, rows):
    return "<table><tr>" + "".join(f"<th>{h}</th>" for h in head) + "</tr>" + "".join("<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in rows) + "</table>"
def prompt(title, text): return f'<div class="prompt"><span class="h">{e(title)}</span>{e(text)}</div>'
def rules(lst): return "".join(f'<div class="rule"><i>{i:02d}</i><div>{r}</div></div>' for i, r in enumerate(lst, 1))

INSTR = """Você é a assistente técnica de uma nutricionista que está montando as fichas técnicas e materiais de padronização da pizzaria SPECIALE PIZZAS ARTESANAIS (Torre, Recife · forno a lenha). Responda sempre em português do Brasil, com linguagem simples, direta e sem jargão.

OBJETIVO
Transformar as anotações feitas na cozinha (muitas vezes à caneta, em fotos) em fichas técnicas em PDF, no padrão visual da "Ficha Técnica · Molho de Tomate Artesanal" (arquivo de referência deste projeto).

REGRAS QUE NUNCA PODEM SER QUEBRADAS
1. Preços: SEMPRE em branco ("R$ ______"). O dono não informa preços. Não invente valores de compra nem de venda.
2. Fotos: use SOMENTE fotos tiradas na pizzaria e enviadas por nós. Não use fotos da internet, de banco de imagens ou do site. Se não houver foto, a ficha fica sem foto.
3. Nunca invente dados. O que foi estimado leva "(est.)"; o que falta vai para "A confirmar com a equipe" e aparece como "a pesar".
4. Taras: desconte sempre o recipiente (pote = 13 g; balde = 0,30 kg; bacia = 1 kg; triturador = 1,35 kg). Ex.: muçarela 291 g − 13 g = 278 g.
5. Pizzas pesadas pela METADE (ex.: 4 Queijos) devem ser DOBRADAS para a pizza inteira.
6. Os pesos coletados são da pizza GRANDE (35 cm, 8 fatias, bolinha 320 g). Média e Broto são ESTIMATIVA proporcional à ÁREA, nunca ao número de fatias:
   - Broto 25 cm = (25÷35)² = 0,51 da Grande → bolinha ≈165 g
   - Média 30 cm = (30÷35)² = 0,735 da Grande → bolinha ≈235 g
   - Ovos arredondados (Grande 2 · Média 1½ · Broto 1).
7. Orégano: vai "a olho"; use ≈2 g na Grande como média de mercado (est.).
8. Catupiry: 4 listras em TODOS os tamanhos. Bisnaga 1,5 kg rende 1,330 kg (perda 11%, FC 1,13). Peso de 1 listra ainda a pesar.
9. Identidade visual: vermelho da Speciale (o rebranding verde foi adiado). Não mude cores nem fontes.
10. Alérgenos: liste glúten, leite, ovo, castanhas conforme os ingredientes. Óleo de soja refinado é dispensado de declarar "soja" (RDC 26/2015) — confirmar com a nutricionista.
11. Antes de entregar, confira cada número com as anotações originais e liste o que mudou.

PADRÃO DA FICHA (seções numeradas)
Capa vermelha (tag "Ficha técnica de preparo/montagem", título grande com destaque laranja, 3 quadros de números, versão e data) →
01 Identificação geral · 02 Ingredientes/composição (quantidade, forma de uso, função; peso bruto, líquido e FC quando houver perda) · 03 Equipamentos e utensílios · 04 Modo de preparo/montagem (faixa de etapas + passos numerados com etiquetas FOTO e PCC + tabela de PCC) · 05 Pontos de cada etapa (fotos da casa, se houver) · 06 Características do produto · 07 Padrão por tamanho · 08 Condições do forno · 09 Controle de qualidade (critérios + falhas mais comuns) · 10 Armazenamento e validade · 11 Custos (tudo em branco) · 12 Melhorias + "A confirmar com a equipe" + assinaturas (Elaborado por · Responsável técnico · Aprovado por).
Visual: A4; vermelho #DA161C; laranja #F07A1E; texto #241A17; fundo creme #FDF5EC; títulos em TeX Gyre Heros Condensed Bold (ou Arial Narrow Bold); texto em Inter; faixa quadriculada vermelha e branca no topo da capa e no rodapé; referência à RDC ANVISA 216/2004.

COMO TRABALHAR
- Ao receber fotos de anotações, primeiro transcreva tudo em uma tabela (o que foi lido / dúvida) e me peça confirmação do que estiver ilegível.
- Depois gere o PDF da ficha. Se não conseguir gerar o PDF, entregue o conteúdo completo organizado nas seções acima.
- Ao final, sempre liste: o que foi medido, o que foi estimado e o que falta."""

def body():
    S = []
    S.append(f'''<section class="cover"><div class="chk" style="top:0"></div><div class="logo">{leaf_logo()}{wm()}</div>
<div class="tag">MATERIAL DE TREINAMENTO</div><h1>TREINANDO<br>O CLAUDE<br><em>SPECIALE</em></h1>
<div class="desc">Tudo o que aprendemos fazendo as fichas técnicas da Speciale: as regras, os dados coletados, o padrão visual, os prompts prontos e como configurar o Claude para continuar o trabalho.</div>
<div class="stats"><div><b>11</b><span>regras de ouro aprendidas com as correções</span></div><div><b>6</b><span>prompts prontos para copiar e colar</span></div><div><b>1</b><span>projeto no Claude com as instruções e arquivos de referência</span></div></div>
<div class="ver">Versão 1.0 · Novembro/2026</div><div class="chk" style="bottom:0"></div></section>''')

    S.append(h2(1, "Como usar este material") +
      "<p>O Claude não lembra das conversas de outra pessoa. Para ele trabalhar do mesmo jeito, você precisa entregar o contexto: as <b>instruções</b> (seção 06), os <b>arquivos de referência</b> e os <b>dados coletados</b>. O jeito mais fácil é criar um <b>Projeto</b> no Claude.</p>" +
      "<h3>Passo a passo</h3><ol>"
      "<li>Entre em <b>claude.ai</b> (ou no app) com a sua conta.</li>"
      "<li>Em <b>Configurações → Recursos (Capabilities)</b>, ative a <b>criação e edição de arquivos / execução de código</b>. É isso que permite ao Claude gerar PDFs. (Disponível conforme o plano.)</li>"
      "<li>Crie um <b>Projeto</b> chamado “Speciale · Fichas técnicas”.</li>"
      "<li>Em <b>Instruções do projeto</b>, cole o texto inteiro do prompt da seção 06.</li>"
      "<li>Em <b>Conhecimento do projeto</b>, envie os arquivos de referência (lista abaixo).</li>"
      "<li>Abra uma conversa dentro do projeto e use os prompts da seção 07.</li></ol>" +
      "<h3>Arquivos para colocar no projeto</h3>" +
      tbl(["Arquivo", "Para que serve"], [
        ["Ficha_Tecnica_Molho_Speciale.pdf", "<b>Referência principal de visual e estrutura</b>"],
        ["Ficha_Tecnica_Massa_Speciale.pdf · Receita_Producao_Massa_Speciale.pdf", "Massa da casa (com as correções da seção 04)"],
        ["Ficha_Tecnica_Portuguesa.pdf (v1.1)", "Modelo de ficha de pizza já corrigida"],
        ["Padronizacao_Tamanho_e_Desperdicio_Massa.pdf", "Pesos estimados por tamanho e desperdício"],
        ["Materiais_e_Compras_Pizzaria_Speciale.pdf", "Lista de materiais (gabarito, balança, caixas, termômetro)"],
        ["Fotos das folhas anotadas à caneta", "Fonte original dos dados"],
        ["Fotos da cozinha (montagem, massa, pizzas prontas)", "Únicas fotos permitidas nas fichas"]]) +
      '<div class="box"><b class="t">Conexões e ferramentas</b>'
      "<b>Obrigatório:</b> Projeto + criação de arquivos ativada.<br>"
      "<b>Opcional:</b> conector do <b>Google Drive</b> (para o Claude ler os arquivos direto da pasta) e do <b>Canva</b> (para ajustes visuais). Ative em Configurações → Conectores, se aparecerem no seu plano.<br>"
      "<b>Para quem usa o Claude Code</b> (versão para programação): o trabalho também está salvo no GitHub, na pasta <b>speciale/</b> do repositório, com os PDFs prontos.</div>")

    S.append('<div class="pb"></div>' + h2(2, "O cliente: Speciale") + tbl(["Item", "Informação"], [
        ["Empresa", "Speciale Pizzas Artesanais · Rua José Bonifácio, 601 · Torre · Recife"],
        ["Forno", "A lenha, sem marcador · ponto ideal 340 a 380 °C · 3 a 4 min por pizza"],
        ["Tamanhos", "Broto 25 cm (4 fatias) · Média ~30 cm (5 fatias) · Grande 35 cm (8 fatias)"],
        ["Caixas", "Existe caixa de 25 cm (broto) e de 35 cm (grande). Não existe caixa média."],
        ["Massa", "Bolinha única de 320 g para todos os tamanhos · ≈100 bolinhas por dia · tamanho no olho, borda aparada com cortador (carretilha)"],
        ["Fichas pedidas", "Massa · Molho · Portuguesa · 4 Queijos · Lombinho com Bacon · Frango com Catupiry · Chocolate com Avelã · Parma Speciale"],
        ["Identidade", "Vermelho da marca. O rebranding (verde) ficou para depois."]]) +
      h2(3, "Regras de ouro") + "<p>Cada regra veio de uma correção feita durante o trabalho. Elas já estão dentro do prompt da seção 06.</p>" +
      rules([
        "<b>Preços sempre em branco</b> (R$ ______). O dono não passa preços.",
        "<b>Fotos só da casa.</b> Nada de internet, nem do site. Sem foto, a ficha fica sem foto.",
        "<b>Leia a caneta.</b> As anotações à caneta são informação da produção e valem mais que qualquer suposição.",
        "<b>Desconte a tara</b> de todos os pesos: pote 13 g · balde 0,30 kg · bacia 1 kg · triturador 1,35 kg.",
        "<b>Pizza pesada pela metade = dobrar</b> para a pizza inteira (caso da 4 Queijos).",
        "<b>Dados são da pizza Grande.</b> Média e Broto são estimativa proporcional à <b>área</b> (0,735 e 0,51), nunca ao número de fatias.",
        "<b>Nunca inventar.</b> Estimado leva “(est.)”; o que falta vai para “A confirmar com a equipe”.",
        "<b>Seguir o padrão da ficha do Molho</b>: mesmas seções, cores, fontes e quadriculado.",
        "<b>Orégano</b> a olho, com ≈2 g na Grande como média de mercado.",
        "<b>Catupiry: 4 listras em todos os tamanhos</b>; bisnaga 1,5 kg rende 1,330 kg.",
        "<b>Conferir antes de entregar</b>: comparar cada número com as anotações e listar o que mudou."]))

    S.append('<div class="pb"></div>' + h2(4, "Dados coletados na cozinha") +
      "<h3>Massa (lote de 1 saco de 15 kg)</h3>" + tbl(["Item", "Valor"], [
        ["Ingredientes", "Farinha de trigo 15 kg (1 tipo só) · fermento biológico 150 g · sal 200 g · açúcar 400 g (a receita-padrão pediria 180 g; usam 400 g para dourar mais rápido) · água em temperatura ambiente 7 L (6,5 L + 500 ml até o ponto) · óleo de soja 400 ml"],
        ["Preparo", "Secos na masseira → água com a masseira ligada → óleo de uma vez → bater 10 min → mesa salpicada de trigo → bolear (Grande 320 g)"],
        ["Bandeja e descanso", "<b>18 bolinhas por bandeja</b> · descansam <b>20 a 30 min</b> na bandeja, tampadas com saco, antes de congelar"],
        ["Produção e validade", "<b>Produção diária</b>, via de regra · ficam <b>no máximo 2 dias na geladeira</b>"],
        ["Guarda e uso", "<b>Direto na geladeira</b> (não congela) · abrir no balcão de baixo · <b>todas as bolinhas são de 320 g</b> · <b>≈100 bolinhas por dia</b>"]]) +
      "<h3>Molho de tomate (lote)</h3>" + tbl(["Item", "Valor"], [
        ["Ingredientes", "Tomate 30 kg · manjericão 102 g · alho 3 cabeças · orégano desidratado 50 g · óleo 158 g (≈172 ml) · sal 160 g · açúcar 210 g"],
        ["Produção", "2 vezes por semana, início 18h30 · porção de 150 ml (≈150 g) por pizza Grande · rendimento ≈17,7 kg"]]) +
      "<h3>Pizzas (pesos da Grande, já sem tara)</h3>" + tbl(["Pizza", "Pesos anotados"], [
        ["Portuguesa", "Molho 150 ml · muçarela 278 g · presunto 82 g · 2 ovos cozidos · cebola crua partida 97 g · azeitona preta 9 g · orégano. Ordem: molho, muçarela, presunto, ovo, azeitona (cebola: etapa a confirmar)"],
        ["4 Queijos", "Pesada pela metade e dobrada: muçarela 126 g · provolone 126 g · gorgonzola 24 g · catupiry 4 listras"],
        ["Lombinho com Bacon", "Muçarela 278 g · lombo 105 g · bacon, cream cheese e azeitona preta a pesar"],
        ["Frango com Catupiry", "Frango: Broto 70 g · Média 70 g · Grande 140 g (porção de 75 a 80 g) · catupiry 4 listras · muçarela a pesar"],
        ["Chocolate com Avelã · Parma Speciale", "Sem pesos anotados (composição pelo cardápio)"],
        ["Muçarela (bloco)", "3,850 kg comprado → 3,850 kg porcionado: sem perda"]]) +
      '<div class="box"><b class="t">Estimativa para Média e Broto</b>Fórmula: (diâmetro ÷ 35)² × peso da Grande. Bolinha: Grande 320 g · Média ≈235 g · Broto ≈165 g. O mesmo fator vale para todas as coberturas.</div>')

    S.append(h2(5, "Correções que já foram feitas") +
      "<p>Erros encontrados nas revisões. Servem para o Claude não repetir.</p>" + tbl(["Onde", "Estava", "Correto"], [
        ["Portuguesa · presunto", "70 g", "82 g"],
        ["Portuguesa · cebola", "fora da receita / 100 g", "Está na receita: crua, partida, 97 g (110 − 13)"],
        ["Média e Broto", "proporção ao nº de fatias (5/8 e 4/8)", "proporção à área (0,735 e 0,51)"],
        ["Massa · descanso", "30 a 40 min", "20 a 30 min na bandeja antes de congelar"],
        ["Massa · validade", "2 dias congelada", "direto na geladeira, no máximo 2 dias"],
        ["Massa · bolinha", "pesos diferentes por tamanho", "hoje todas são de 320 g (Broto e Média: sugestão ≈165 g e ≈235 g)"],
        ["Ovo cozido · validade", "a confirmar", "até 3 dias refrigerado; fatiado, usar no turno"],
        ["Massa · bandeja", "caixa sem quantidade", "18 bolinhas por bandeja"],
        ["Massa · abertura", "abrir até o gabarito", "abrir e aparar com cortador (ainda não há gabarito)"],
        ["Alérgenos", "contém soja (óleo)", "glúten, leite, ovo (soja refinada dispensada; confirmar)"],
        ["Fotos", "fotos do site", "só fotos tiradas na cozinha"]]) +
      h2(6, "Instruções do projeto (copiar e colar)") +
      "<p>Cole este texto inteiro em <b>Projeto → Instruções do projeto</b>.</p>" + prompt("INSTRUÇÕES DO PROJETO · SPECIALE", INSTR).replace('class="prompt"','class="prompt big"'))

    S.append(h2(7, "Prompts prontos") +
      prompt("1 · TRANSCREVER ANOTAÇÕES À CANETA",
        "Vou enviar fotos das folhas anotadas na cozinha da Speciale. Transcreva tudo o que estiver escrito à caneta em uma tabela com: produto, ingrediente, valor anotado, tara a descontar, valor líquido e dúvidas. Não interprete nem complete: marque como ilegível o que não der para ler e me pergunte antes de seguir.") +
      prompt("2 · CRIAR FICHA TÉCNICA DE UMA PIZZA",
        "Crie a ficha técnica da pizza [NOME] no padrão da ficha do Molho (arquivo de referência), em PDF A4, identidade vermelha da Speciale. Use os pesos da pizza Grande que estão nos dados do projeto, descontando as taras. Faça Média e Broto por estimativa proporcional à área e marque (est.). Preços em branco. Use só as fotos que eu enviar desta pizza; se não houver, não coloque foto. No fim, liste o que foi medido, o que foi estimado e o que falta confirmar.") +
      prompt("3 · REVISAR UMA FICHA",
        "Revise o PDF anexo comparando com as anotações da cozinha e com as regras do projeto. Aponte em uma tabela: o que está certo, o que está errado (onde está, o que diz e o valor correto) e o que falta. Confira taras, pesos da Grande, estimativa por área de Média e Broto, alérgenos, preços em branco e fotos só da casa. Não altere nada até eu aprovar.") +
      prompt("4 · CORRIGIR E REGERAR",
        "Aplique as correções aprovadas na ficha [NOME] e gere o PDF de novo, mantendo o mesmo visual e as mesmas fotos. Suba a versão (ex.: 1.1) e, ao final, liste exatamente o que mudou.") +
      prompt("5 · MATERIAL DE PADRONIZAÇÃO",
        "Crie um material curto em PDF, no visual da Speciale, explicando como padronizar o peso da bolinha e o diâmetro das pizzas (Broto 25 cm ≈165 g, Média 30 cm ≈235 g, Grande 35 cm 320 g), onde está o desperdício (apara da borda, bolinha acima do peso, pizza maior que o padrão) e um plano de teste de 4 semanas com tabelas de registro. Números de desperdício só como exemplo de cálculo, sem inventar medições.") +
      prompt("6 · CONFERÊNCIA FINAL ANTES DE IMPRIMIR",
        "Faça uma checagem final do PDF anexo: textos cortados ou sobrepostos, páginas em branco, numeração das seções e das páginas, legendas das fotos batendo com as etapas, PCC citados corretamente, preços em branco e versão/data na capa. Responda só com a lista do que precisa ajustar."))

    S.append(h2(8, "Pendências atuais") + "<p>O que ainda falta coletar na cozinha para fechar as fichas:</p><ul>"
      "<li><b>Massa:</b> quantas batidas por dia; temperatura da geladeira; tempo fora da geladeira antes de abrir.</li>"
      "<li><b>Portuguesa:</b> em que etapa entra a cebola; validade da cebola cortada.</li>"
      "<li><b>Lombinho com Bacon:</b> bacon (peso; cru ou pré-frito), cream cheese e azeitona preta.</li>"
      "<li><b>Frango com Catupiry:</b> receita do frango, peso da muçarela, frango na Média.</li>"
      "<li><b>Chocolate com Avelã e Parma Speciale:</b> todos os pesos e a ordem de montagem.</li>"
      "<li><b>Catupiry:</b> peso de 1 listra (fazer 5 listras, pesar e dividir por 5).</li>"
      "<li><b>Desperdício:</b> peso da apara de 10 pizzas; quantas pizzas por dia são Broto, Média e Grande.</li></ul>" +
      '<div class="box"><b class="t">Dica final</b>Sempre que corrigir algo com o Claude, acrescente a correção nas Instruções do projeto. Assim ele não repete o erro nas próximas conversas.</div>')
    return "".join(S)

if __name__ == "__main__":
    OUT = sys.argv[1]
    open(OUT, "w", encoding="utf-8").write(f'<!doctype html><html lang="pt-br"><head><meta charset="utf-8"><title>Treinamento Claude Speciale</title><style>{CSS}</style></head><body>{body()}</body></html>')
    print("ok")
