# house_pdf.py — helpers de slides 16:9 (960x540 pt) no padrão House do Creator
# Uso: OUT='arquivo.pdf'; TITLE='Título'; FOOT='HOUSE DO CREATOR  ·  CLIENTE'; exec(open('house_pdf.py').read())
# Precisa de lw.png (logo branca) e lb.png (logo preta) na mesma pasta e da fonte Poppins instalada.
# Funções: rect, txt (com letter-spacing cs), heavy/title (Poppins Bold com contorno), para (texto com quebra),
# spark/sparks (faíscas amarelas), img, hclogo, check, slide(dark, eyebrow), done(). Termine com c.save().
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, white, Color
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from PIL import Image
import math
import os
G='fonts/' if os.path.isdir('fonts') else '/usr/share/fonts/truetype/google-fonts/'
for n,f in [('PB','Poppins-Bold'),('PR','Poppins-Regular'),('PM','Poppins-Medium'),('PL','Poppins-Light'),('PSB','Poppins-SemiBold')]:
    try: pdfmetrics.registerFont(TTFont(n,G+f+'.ttf'))
    except: pdfmetrics.registerFont(TTFont(n,G+'Poppins-Medium.ttf'))
W,H=960,540; M=56
Y=HexColor('#F5CF47'); K=HexColor('#0B0B0B'); WH=white; GR=HexColor('#A9A9A9'); G2=HexColor('#6E6E6E')
C1=HexColor('#141414'); C2=HexColor('#1C1C1C'); LN=HexColor('#2A2A2A'); RED=HexColor('#E8705F'); GRN=HexColor('#7BD394')
import sys
OUT=globals().get('OUT','saida.pdf'); FOOT=globals().get('FOOT','HOUSE DO CREATOR')
c=canvas.Canvas(OUT,pagesize=(W,H)); c.setTitle(globals().get('TITLE','House do Creator')); c.setAuthor('House do Creator')
N=[0]
def rect(x,y,w,h,col,r=0):
    c.setFillColor(col)
    if r: c.roundRect(x,y,w,h,r,stroke=0,fill=1)
    else: c.rect(x,y,w,h,stroke=0,fill=1)
def txt(t,x,y,s,col=WH,font='PR',align='l',cs=0):
    c.setFillColor(col); c.setFont(font,s)
    tw=pdfmetrics.stringWidth(t,font,s)+cs*(len(t)-1)
    sx={'l':x,'c':x-tw/2,'r':x-tw}[align]
    to=c.beginText(sx,y); to.setFont(font,s); to.setCharSpace(cs); to.textOut(t); to.setCharSpace(0); c.drawText(to); return tw
def heavy(segs,x,y,s,align='l'):
    tw=sum(pdfmetrics.stringWidth(t,'PB',s) for t,_ in segs); sx={'l':x,'c':x-tw/2,'r':x-tw}[align]; x0=sx
    for t,col in segs:
        c.saveState(); to=c.beginText(); to.setTextRenderMode(2); to.setFont('PB',s); c.setLineWidth(s*.03)
        c.setFillColor(col); c.setStrokeColor(col); to.setTextOrigin(sx,y); to.textOut(t); c.drawText(to); c.restoreState()
        sx+=pdfmetrics.stringWidth(t,'PB',s)
    return x0,x0+tw
def title(lines,x,y,s,align='l',lead=1.1):
    return [heavy(l,x,y-i*s*lead,s,align) for i,l in enumerate(lines)]
def para(t,x,y,w,s=11,col=GR,font='PR',lead=1.55,align=0):
    p=Paragraph(t,ParagraphStyle('p',fontName=font,fontSize=s,leading=s*lead,textColor=col,alignment=align)); _,h=p.wrap(w,2000); p.drawOn(c,x,y-h); return h
def spark(x,y,ang,ln,w,col=Y):
    c.setStrokeColor(col); c.setLineWidth(w); c.setLineCap(1); c.line(x,y,x+ln*math.cos(math.radians(ang)),y+ln*math.sin(math.radians(ang)))
def sparks(x,y,side,s=1,col=Y):
    if side=='tl': spark(x,y,125,18*s,5.5*s,col); spark(x-8*s,y-10*s,160,16*s,5.5*s,col)
    else: spark(x,y,-55,18*s,5.5*s,col); spark(x+8*s,y+10*s,-20,16*s,5.5*s,col)
def img(f,x,y,w=None,h=None):
    im=Image.open(f); r=im.height/im.width
    if w and not h: h=w*r
    if h and not w: w=h/r
    c.drawImage(f,x,y,w,h,mask='auto'); return w,h
def hclogo(dark=True,x=None,y=None,w=34):
    f='lw.png' if dark else 'lb.png'; im=Image.open(f); h=w*im.height/im.width
    x=W-M-w if x is None else x; y=H-38-h/2 if y is None else y; c.drawImage(f,x,y,w,h,mask='auto')
def check(x,y,col=Y,s=1):
    c.setStrokeColor(col); c.setLineWidth(1.8*s); c.setLineCap(1); c.setLineJoin(1); p=c.beginPath(); p.moveTo(x,y); p.lineTo(x+3.5*s,y-3.5*s); p.lineTo(x+10*s,y+4*s); c.drawPath(p,stroke=1,fill=0)
def slide(dark=True,eyebrow=None,section=None):
    N[0]+=1; rect(0,0,W,H,K if dark else Y)
    fg=WH if dark else K; sub=G2 if dark else HexColor('#6B5A1E')
    hclogo(dark)
    if eyebrow: txt(eyebrow,M,H-42,8,Y if dark else K,'PB',cs=2.2)
    c.setStrokeColor(LN if dark else HexColor('#DDB53A')); c.setLineWidth(.6); c.line(M,34,W-M,34)
    txt(FOOT,M,20,6.5,sub,'PB',cs=1.6)
    txt(f'{N[0]:02d}',W-M,20,6.5,sub,'PB','r',cs=1.6)
def done(): c.showPage()

