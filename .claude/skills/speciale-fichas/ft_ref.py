"""Fichas técnicas Speciale no padrão da ficha do Molho (vermelho, Heros Condensed + Inter).
uso: python3 ft_ref.py <slug> <saida.html>"""
import sys, html, base64, os
from fichas_data import FICHAS
from brand import photo

HERE = os.path.dirname(os.path.abspath(__file__))
e = html.escape

def ff(fam, path, w, st="normal"):
    d = base64.b64encode(open(path, "rb").read()).decode()
    return f"@font-face{{font-family:'{fam}';src:url(data:font/otf;base64,{d});font-weight:{w};font-style:{st}}}"

FONTS = "\n".join([
    ff("HerosCn", os.path.join(HERE, "fonts/texgyreheroscn-bold.otf"), 700),
    ff("InterF", os.path.join(HERE, "fonts/Inter-Regular.otf"), 400),
    ff("InterF", os.path.join(HERE, "fonts/Inter-SemiBold.otf"), 600),
    ff("InterF", os.path.join(HERE, "fonts/Inter-Bold.otf"), 700),
])

CSS = FONTS + """
:root{--red:#DA161C;--red2:#B80F14;--dark:#241A17;--cream:#FDF5EC;--cream2:#FBEFE2;--orange:#F07A1E;--line:#EADBC8;--muted:#5d524c}
@page{size:A4;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'InterF',Arial,sans-serif;color:var(--dark);font-size:9.2pt;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:210mm;height:297mm;position:relative;overflow:hidden;page-break-after:always;background:#fff}
.pg:last-child{page-break-after:auto}
.chk{position:absolute;left:0;right:0;height:5mm;background:repeating-conic-gradient(var(--red) 0 25%,#fff 0 50%) 0 0/5mm 5mm}
.chk.top{top:0}.chk.bot{bottom:0}
.hc{font-family:'HerosCn',Arial Narrow,sans-serif;font-weight:700}
/* capa */
.cover{background:radial-gradient(90% 70% at 70% 40%,#EB2229 0%,var(--red) 45%,#B30F14 100%);color:#fff}
.cover .logo{position:absolute;left:18mm;top:24mm;display:flex;align-items:center;gap:3mm}
.wm{line-height:.9}
.wm b{display:block;font-family:'HerosCn';font-size:20pt;letter-spacing:.01em}
.wm span{display:block;font-size:5.6pt;font-weight:700;letter-spacing:.42em;margin-top:.6mm}
.cover .tag{position:absolute;left:18mm;top:57mm;background:#fff;color:var(--red);font-family:'HerosCn';font-size:11pt;padding:2mm 4mm;transform:rotate(-2deg)}
.cover h1{position:absolute;left:18mm;right:18mm;top:72mm;font-family:'HerosCn';font-size:56pt;line-height:.93;text-transform:uppercase;letter-spacing:-.005em}
.cover h1 em{font-style:normal;color:var(--orange)}
.cover .desc{position:absolute;left:18mm;width:140mm;font-size:11.5pt;line-height:1.55}
.cover .stats{position:absolute;left:18mm;right:18mm;bottom:38mm;display:grid;grid-template-columns:repeat(3,1fr);gap:4.5mm}
.cover .stats div{border:.6pt solid rgba(255,255,255,.45);background:rgba(255,255,255,.08);border-radius:3mm;padding:4mm 4mm 4.5mm;min-height:26mm}
.cover .stats b{display:block;font-family:'HerosCn';font-size:22pt;line-height:1}
.cover .stats span{display:block;font-size:7.6pt;line-height:1.5;margin-top:1.4mm}
.cover .ver{position:absolute;right:18mm;bottom:30mm;font-size:7.6pt}
.cover .ph{position:absolute;right:18mm;width:62mm;height:62mm;border-radius:50%;overflow:hidden;border:2.5mm solid #fff}
.cover .ph img{width:100%;height:100%;object-fit:cover}
/* internas */
.bar{position:absolute;left:0;right:0;top:0;height:16mm;background:var(--red);color:#fff;display:flex;justify-content:space-between;align-items:center;padding:0 16mm}
.bar .wm b{font-size:14pt}.bar .wm span{font-size:4.6pt}
.bar .r{text-align:right;font-size:7.6pt;line-height:1.55}
.body{position:absolute;left:16mm;right:16mm;top:24mm;bottom:16mm}
.foot{position:absolute;left:16mm;right:16mm;bottom:9mm;display:flex;justify-content:space-between;font-size:7pt;color:var(--muted)}
.sec{display:flex;align-items:center;gap:3mm;margin:0 0 3.2mm}
.sec i{font-style:normal;background:var(--red);color:#fff;font-family:'HerosCn';font-size:10pt;border-radius:1.6mm;padding:1mm 2.4mm}
.sec h2{font-family:'HerosCn';font-size:17pt;text-transform:uppercase;letter-spacing:.005em}
.gap{height:6mm}
table{width:100%;border-collapse:collapse}
th{background:var(--dark);color:#fff;font-family:'HerosCn';font-weight:700;font-size:8pt;text-transform:uppercase;letter-spacing:.03em;text-align:left;padding:2.2mm 2.6mm}
th.n,td.n{text-align:right}
td{padding:2.25mm 2.6mm;border-bottom:.5pt solid var(--line);font-size:8.6pt;vertical-align:top}
tr:nth-child(odd) td{background:var(--cream)}
tr.tot td{font-weight:700;background:var(--cream2)!important;border-top:1.2pt solid var(--red)}
.est{color:var(--orange);font-weight:700;font-size:7.4pt}
.todo{color:var(--orange);font-weight:700}
.blank{display:inline-block;min-width:26mm;border-bottom:.6pt solid var(--dark);height:3.6mm;vertical-align:bottom}
.note{font-size:7.6pt;color:var(--muted);line-height:1.55;margin-top:2mm}
.two{display:grid;grid-template-columns:1fr 1fr;gap:5mm;margin-top:5mm}
.card{background:var(--cream);border-radius:3mm;padding:4.5mm 5mm}
.card h4,.rcard h4{font-family:'HerosCn';font-size:10.5pt;text-transform:uppercase;color:var(--red);margin-bottom:2mm}
.card table td{background:transparent!important;font-size:8.4pt;padding:1.8mm 2.4mm}
.rcard{background:var(--red);color:#fff;border-radius:3mm;padding:4.5mm 5mm;font-size:9pt;line-height:1.55}
.rcard h4{color:#fff}
.flow{display:grid;grid-template-columns:repeat(6,1fr);border-top:1.4pt solid var(--red);margin-bottom:3mm}
.flow div{background:var(--cream);text-align:center;padding:2mm 1mm 1.8mm;border-right:1pt solid #fff}
.flow b{display:block;font-family:'HerosCn';color:var(--red);font-size:8.4pt}
.flow span{font-size:6.4pt;color:var(--muted)}
.steps .st{display:grid;grid-template-columns:9mm 1fr;padding:2.1mm 0;border-bottom:.5pt dotted #d9c6b0;font-size:8.7pt;line-height:1.5}
.steps .st i{font-style:normal;font-family:'HerosCn';color:var(--red);font-size:11pt}
.pill{display:inline-block;font-size:6pt;font-weight:700;padding:.6mm 1.6mm;border-radius:.8mm;margin-left:1.4mm;vertical-align:1pt;background:var(--orange);color:#fff}
.sub{font-family:'HerosCn';font-size:10.5pt;color:var(--red);text-transform:uppercase;margin:4.5mm 0 2.2mm}
ul.chk2{list-style:none}
ul.chk2 li{position:relative;padding:1.3mm 0 1.3mm 6mm;font-size:8.7pt;line-height:1.5}
ul.chk2 li:before{content:"";position:absolute;left:0;top:2.4mm;width:2.8mm;height:2.8mm;border:1pt solid var(--red);border-radius:.6mm}
ul.dots li{margin:0 0 1.6mm 4mm;font-size:8.7pt;line-height:1.55}
.conf{border:1.2pt solid var(--red);border-radius:2.4mm;padding:3.5mm 4.5mm;margin-top:4mm;font-size:8.5pt;line-height:1.6}
.conf b{color:var(--red);font-family:'HerosCn';font-size:9pt;text-transform:uppercase;margin-right:1.5mm}
.conf ul{margin:1mm 0 0 4mm}
.sign{display:grid;grid-template-columns:repeat(3,1fr);gap:8mm;margin-top:10mm;text-align:center;font-size:7pt;color:var(--muted)}
.sign div{border-top:.6pt solid var(--dark);padding-top:1.6mm}
.prod{display:grid;grid-template-columns:1fr 56mm;gap:5mm;align-items:start}
.prod img{width:56mm;height:44mm;object-fit:cover;border-radius:2.4mm}
.prod .cap{font-size:6.6pt;color:var(--muted);margin-top:1mm}
.alg{display:flex;gap:2mm;flex-wrap:wrap}
.alg span{border:1pt solid var(--red);color:var(--red);font-weight:700;font-size:7.4pt;border-radius:5mm;padding:.8mm 2.6mm}
.alg span.off{border-color:#d5c6b6;color:#b6a898;font-weight:600}
"""

def leaf_logo(size=13):
    return (f'<svg width="{size}mm" height="{size*0.62}mm" viewBox="0 0 100 62"><ellipse cx="18" cy="22" rx="16" ry="12" fill="#fff"/>'
            f'<ellipse cx="34" cy="47" rx="13" ry="11" fill="#fff"/><path d="M40 28 C42 12 60 4 92 4 C88 20 72 30 40 28Z" fill="#3BA935"/></svg>')

def wm():
    return '<div class="wm"><b>SPECIALE</b><span>PIZZAS ARTESANAIS</span></div>'

def sec(n, t):
    return f'<div class="sec"><i>{n:02d}</i><h2>{e(t)}</h2></div>'

def table(head, rows, nums=(), tot=None):
    h = "<table><tr>" + "".join(f'<th class="{"n" if i in nums else ""}">{c}</th>' for i, c in enumerate(head)) + "</tr>"
    for r in rows:
        h += "<tr>" + "".join(f'<td class="{"n" if i in nums else ""}">{c}</td>' for i, c in enumerate(r)) + "</tr>"
    if tot:
        h += '<tr class="tot">' + "".join(f'<td class="{"n" if i in nums else ""}">{c}</td>' for i, c in enumerate(tot)) + "</tr>"
    return h + "</table>"

def build(F):
    pages = []
    N = F["pages_total"]
    def page(content, label, i):
        pages.append(f'''<section class="pg"><div class="bar">{wm()}<div class="r">FICHA TÉCNICA · {e(F["title_bar"])}<br>{e(label)}</div></div>
<div class="body">{content}</div><div class="foot"><span>Speciale Pizzas Artesanais · Ficha técnica de {e(F["kind"])}</span><span>{i} / {N}</span></div><div class="chk bot"></div></section>''')

    # capa
    ph = f'<div class="ph" style="top:{F.get("ph_top", 150)}mm"><img src="{photo(F["photo"])}" alt=""></div>' if F.get("photo") else ""
    stats = "".join(f"<div><b>{e(a)}</b><span>{e(b)}</span></div>" for a, b in F["stats"])
    pages.append(f'''<section class="pg cover"><div class="chk top"></div>
<div class="logo">{leaf_logo()}{wm()}</div>
<div class="tag">{e(F["tag"])}</div>
<h1>{F["cover_title"]}</h1>
<div class="desc" style="top:{F.get("desc_top", 128)}mm">{e(F["desc"])}</div>{ph}
<div class="stats">{stats}</div><div class="ver">Versão 1.0 · Outubro/2026</div><div class="chk bot"></div></section>''')

    for i, (label, content) in enumerate(F["pages"](), start=2):
        page(content, label, i)
    return "".join(pages)

if __name__ == "__main__":
    slug, out = sys.argv[1], sys.argv[2]
    F = FICHAS[slug]
    body = build(F)
    open(out, "w", encoding="utf-8").write(f'<!doctype html><html lang="pt-br"><head><meta charset="utf-8"><title>Ficha técnica {e(F["title_bar"])}</title><style>{CSS}</style></head><body>{body}</body></html>')
    print("ok", slug)
