"""Identidade visual Speciale: fontes embutidas, cores, logo e elementos gráficos."""
import base64, os

HERE = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = os.path.join(HERE, "fonts")

def _ff(family, file, weight, style="normal"):
    data = base64.b64encode(open(os.path.join(FONT_DIR, file), "rb").read()).decode()
    return (f"@font-face{{font-family:'{family}';src:url(data:font/ttf;base64,{data}) format('truetype');"
            f"font-weight:{weight};font-style:{style};font-display:swap}}")

FONTS_CSS = "\n".join([
    _ff("Anton", "Anton-400.ttf", 400),
    _ff("Montserrat", "Montserrat-400.ttf", 400),
    _ff("Montserrat", "Montserrat-600.ttf", 600),
    _ff("Montserrat", "Montserrat-800.ttf", 800),
    _ff("Playfair Display", "PlayfairDisplay-800i.ttf", 800, "italic"),
])

TOKENS = """
:root{
  --red:#BE030C; --wine:#9B0000; --deep:#5E0000; --yellow:#FFB000; --orange:#F7941D;
  --green:#1F8F3E; --leaf:#34A853; --cream:#FFF4E2; --paper:#FFFBF4; --ink:#1B1210; --muted:#6E5E57;
  --line:#EAD9C4; --est:#FFE7B3;
  --head:'Anton',Impact,sans-serif; --body:'Montserrat',Arial,sans-serif; --script:'Playfair Display',Georgia,serif;
}
"""

def checker(c1="var(--red)", c2="#fff", size=14):
    return (f"background:repeating-conic-gradient({c1} 0 25%,{c2} 0 50%) 0 0/{size*2}px {size*2}px;")

def mark(size=64, bg="#D3121A", circles="#fff", leaf="#34A853", radius=10, square=True):
    """Símbolo: dois círculos brancos + folha verde, sobre quadrado vermelho."""
    rect = f'<rect width="100" height="100" rx="{radius}" fill="{bg}"/>' if square else ""
    return (f'<svg class="mark" width="{size}" height="{size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="Speciale">'
            f'{rect}<ellipse cx="33" cy="47" rx="17" ry="15.5" fill="{circles}"/>'
            f'<ellipse cx="53" cy="72" rx="14" ry="13" fill="{circles}"/>'
            f'<path d="M50 53 C47 33 61 17 84 13 C88 35 74 52 50 53 Z" fill="{leaf}"/></svg>')

def wordmark(color="#fff", size=1.0):
    return (f'<div class="wordmark" style="color:{color};font-size:{size}em">'
            f'<span class="wm-main">SPECIALE</span><span class="wm-sub">PIZZAS ARTESANAIS</span></div>')

WORDMARK_CSS = """
.wordmark{display:inline-flex;flex-direction:column;align-items:center;line-height:1;font-family:var(--body)}
.wm-main{font-weight:800;font-size:2.2em;letter-spacing:.04em}
.wm-sub{font-weight:800;font-size:.5em;letter-spacing:.32em;margin-top:.35em}
"""

def pizza_svg(size=300, seed=1):
    """Ilustração de pizza vista de cima (calabresa/pepperoni + azeitona + manjericão)."""
    import math, random
    r = random.Random(seed)
    parts = [f'<svg class="pizza" width="{size}" height="{size}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">',
             '<defs><radialGradient id="cr" cx="50%" cy="45%" r="55%"><stop offset="80%" stop-color="#F3B562"/><stop offset="100%" stop-color="#C9792E"/></radialGradient>'
             '<radialGradient id="ch" cx="45%" cy="40%" r="60%"><stop offset="0%" stop-color="#FFE7A3"/><stop offset="100%" stop-color="#F6C25B"/></radialGradient></defs>',
             '<circle cx="100" cy="100" r="98" fill="url(#cr)"/>',
             '<circle cx="100" cy="100" r="84" fill="#D8441F"/>',
             '<circle cx="100" cy="100" r="80" fill="url(#ch)"/>']
    for _ in range(9):
        a, d = r.uniform(0, 6.28), r.uniform(10, 62)
        x, y = 100 + d * math.cos(a), 100 + d * math.sin(a)
        parts.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="11" fill="#B3261E"/><circle cx="{x-3:.1f}" cy="{y-3:.1f}" r="3" fill="#CF4A3A" opacity=".7"/>')
    for _ in range(8):
        a, d = r.uniform(0, 6.28), r.uniform(8, 68)
        x, y = 100 + d * math.cos(a), 100 + d * math.sin(a)
        parts.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="4.2" fill="#2A1A14"/><circle cx="{x:.1f}" cy="{y:.1f}" r="1.6" fill="#F6C25B"/>')
    for _ in range(5):
        a, d = r.uniform(0, 6.28), r.uniform(15, 60)
        x, y, rot = 100 + d * math.cos(a), 100 + d * math.sin(a), r.uniform(0, 360)
        parts.append(f'<path transform="translate({x:.1f} {y:.1f}) rotate({rot:.0f})" d="M0 0 C4 -7 12 -7 16 0 C12 7 4 7 0 0Z" fill="#2E8B3E"/>')
    parts.append('</svg>')
    return "".join(parts)

def brl(v, cents=True):
    s = f"{v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return s if cents else s.split(",")[0]

def photo(name):
    data = base64.b64encode(open(os.path.join(HERE, "assets", name + ".jpg"), "rb").read()).decode()
    return "data:image/jpeg;base64," + data

PHOTOS = {"Portuguesa": "portuguesa", "Marguerita": "marguerita", "Quatro Queijos": "queijos",
          "Charque Speciale": "charque", "Frango com Catupiry": "frango"}
