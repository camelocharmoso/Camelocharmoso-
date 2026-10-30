import sys, numpy as np
from PIL import Image
src,out=sys.argv[1],sys.argv[2]
a=np.asarray(Image.open(src).convert('RGB')).astype(float)
R,G,B=a[...,0],a[...,1],a[...,2]
yel=(R-B)>60
lum=.299*R+.587*G+.114*B
ay=np.clip((240-B)/235,0,1)*yel
ak=np.clip((245-lum)/231,0,1)*(~yel)
boxes={'principal':(218,147,2330,717),'compacta':(333,883,1101,1312),'icone':(1574,896,2176,1300)}
INK=(14,14,14); YEL=(254,207,5); WHT=(255,255,255)
for name,(x0,y0,x1,y1) in boxes.items():
    k=ak[y0:y1,x0:x1]; y=ay[y0:y1,x0:x1]
    alpha=np.clip(k+y,0,1)
    m=alpha>0.05; ys,xs=np.where(m); pad=6
    sl=(slice(max(ys.min()-pad,0),ys.max()+pad),slice(max(xs.min()-pad,0),xs.max()+pad))
    k,y,alpha=k[sl],y[sl],alpha[sl]
    frac=np.where(alpha>0,y/np.maximum(alpha,1e-6),0)[...,None]
    for var,(ci,cy) in {'positiva':(INK,YEL),'negativa':(WHT,WHT),'mono':(INK,INK)}.items():
        if name=='icone' and var=='positiva': continue
        rgb=np.array(ci)*(1-frac)+np.array(cy)*frac
        img=np.dstack([rgb,alpha*255]).astype(np.uint8)
        im=Image.fromarray(img,'RGBA'); f=f'{out}/{name}-{var}.png'; im.save(f); print(f,im.size, round(im.width/im.height,2))
