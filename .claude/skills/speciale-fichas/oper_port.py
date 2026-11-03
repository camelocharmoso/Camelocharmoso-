"""Ficha operacional simplificada da Portuguesa (1 página, para a cozinha)."""
import sys
from ft_ref import CSS, wm
from port_v2 import EXTRA, img

OCSS = """
.op{position:absolute;left:14mm;right:14mm;top:21mm;bottom:14mm}
.op h1{font-family:'HerosCn';font-size:30pt;line-height:1;text-transform:uppercase}
.op h1 em{font-style:normal;color:var(--red)}
.op .ld{font-size:8.6pt;color:var(--muted);margin:1mm 0 3mm}
.op .st4{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm;margin-bottom:3mm}
.op .st4 div{background:var(--red);color:#fff;border-radius:2.4mm;padding:2.2mm;text-align:center}
.op .st4 b{display:block;font-family:'HerosCn';font-size:22pt;line-height:1}
.op .st4 span{font-size:7.6pt}
.op table td{font-size:10pt;padding:1.2mm 3mm;vertical-align:middle}
.op table th{font-size:8.6pt;padding:1.8mm 3mm}
.op table td.n{font-family:'HerosCn';font-size:12pt}
.op table td.g{font-family:'HerosCn';font-size:13.5pt;color:var(--red)}
.op .grid{display:grid;grid-template-columns:1fr 60mm;gap:5mm;margin-top:3mm}
.op .s{display:grid;grid-template-columns:9mm 1fr;align-items:center;padding:1mm 0;border-bottom:.6pt dotted #d9c6b0;font-size:10pt;line-height:1.3}
.op .s i{font-style:normal;font-family:'HerosCn';font-size:15pt;color:#fff;background:var(--red);border-radius:50%;width:7mm;height:7mm;display:flex;align-items:center;justify-content:center}
.op .s small{color:var(--muted);font-size:8pt}
.op .fotos{display:grid;grid-template-rows:repeat(3,1fr);gap:2.5mm}
.op .fotos div{position:relative;height:31mm;border-radius:2mm;overflow:hidden}
.op .fotos img{width:100%;height:100%;object-fit:cover}
.op .fotos span{position:absolute;left:0;bottom:0;right:0;background:rgba(36,26,23,.85);color:#fff;font-size:7.4pt;font-weight:700;padding:1.2mm 2mm}
.op .alert{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm;margin-top:3mm}
.op .alert div{border:1.2pt solid var(--red);border-radius:2.4mm;padding:2mm 3mm;font-size:8pt;line-height:1.35}
.op .alert b{display:block;font-family:'HerosCn';color:var(--red);font-size:10pt;text-transform:uppercase}
.op .lab{font-family:'HerosCn';font-size:12pt;text-transform:uppercase;margin:1mm 0 1.5mm}
"""

def html():
    rows = [("Massa (bolinha)", "320 g", "≈235 g", "≈165 g"), ("Molho de tomate", "150 ml", "≈110 ml", "≈75 ml"),
            ("Muçarela ralada", "278 g", "≈205 g", "≈140 g"), ("Presunto fatiado", "82 g", "≈60 g", "≈40 g"),
            ("Ovo cozido (rodelas)", "2 un", "1½ un", "1 un"), ("Cebola crua, partida", "97 g", "≈70 g", "≈50 g"),
            ("Azeitona preta", "9 g", "≈7 g", "≈5 g"), ("Orégano", "≈2 g", "≈1,5 g", "≈1 g")]
    t = ('<table><tr><th>Ingrediente</th><th class="n">Grande · 35 cm</th><th class="n">Média · 30 cm</th><th class="n">Broto · 25 cm</th></tr>' +
         "".join(f'<tr><td>{a}</td><td class="n g">{b}</td><td class="n">{c}</td><td class="n">{d}</td></tr>' for a, b, c, d in rows) + "</table>")
    steps = [("Abrir a massa", "mesa enfarinhada, balcão de baixo · aparar a borda com o cortador"),
             ("Molho", "espalhar com a colher funda, deixando a borda livre"),
             ("Muçarela", "jogar por igual sobre todo o molho"),
             ("Presunto", "em tiras, partindo do centro"),
             ("Ovo cozido", "rodelas entre as tiras de presunto"),
             ("Cebola", "crua, partida, espalhada"),
             ("Azeitona + orégano", "azeitona em pedaços e orégano por cima de tudo"),
             ("Forno a lenha", "340 a 380 °C · 3 a 4 min · borda dourada · cortar em 8")]
    s = "".join(f'<div class="s"><i>{i}</i><div><b>{a}</b><br><small>{b}</small></div></div>' for i, (a, b) in enumerate(steps, 1))
    fotos = "".join(f'<div><img src="{img(k)}" alt=""><span>{c}</span></div>' for k, c in [
        ("f3", "2–3 · Molho e muçarela"), ("f4", "4–7 · Montada, pronta para o forno"), ("f5", "8 · Pronta")])
    return f'''<section class="pg"><div class="bar">{wm()}<div class="r">FICHA OPERACIONAL · COZINHA<br>Montagem</div></div>
<div class="op"><h1>Pizza <em>Portuguesa</em></h1><div class="ld">Pesar sempre na balança. Grande = pesado na cozinha · Média e Broto = estimativa (est.), em teste.</div>
<div class="st4"><div><b>320 g</b><span>massa (Grande)</span></div><div><b>150 ml</b><span>molho</span></div><div><b>278 g</b><span>muçarela</span></div><div><b>3–4 min</b><span>forno a lenha</span></div></div>
<div class="lab">Quanto vai em cada tamanho</div>{t}
<div class="grid"><div><div class="lab">Ordem de montagem</div>{s}</div><div class="fotos">{fotos}</div></div>
<div class="alert"><div><b>Pese tudo</b>Muçarela, presunto, cebola e azeitona na balança. Sem “no olho”.</div>
<div><b>Ovo cozido</b>Até 3 dias na geladeira. Fatiado, usar no mesmo turno.</div>
<div><b>Massa</b>Bolinha da geladeira, no máximo 2 dias. Conferir a etiqueta.</div></div></div>
<div class="foot"><span>Speciale Pizzas Artesanais · Ficha operacional · Versão 1.0 · Novembro/2026</span><span>Ficha completa: Ficha Técnica · Pizza Portuguesa</span></div><div class="chk bot"></div></section>'''

if __name__ == "__main__":
    open(sys.argv[1], "w", encoding="utf-8").write(f'<!doctype html><html lang="pt-br"><head><meta charset="utf-8"><title>Operacional Portuguesa</title><style>{CSS}{EXTRA}{OCSS}</style></head><body>{html()}</body></html>')
    print("ok")
