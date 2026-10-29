"""Publica a pasta web/ na Vercel (projeto prato-planejado).

Uso: VERCEL_TOKEN=... python3 scripts/deploy-vercel.py
O token vem só da variável de ambiente; nunca o escreva neste arquivo.
"""
import base64, json, os, time, urllib.request

token = os.environ["VERCEL_TOKEN"]
web = os.path.join(os.path.dirname(__file__), "..", "web")
files = [{"file": f, "data": base64.b64encode(open(os.path.join(web, f), "rb").read()).decode(), "encoding": "base64"}
         for f in sorted(os.listdir(web)) if f != ".nojekyll"]
headers = {"Authorization": "Bearer " + token, "Content-Type": "application/json"}
body = {"name": "prato-planejado", "files": files, "target": "production",
        "projectSettings": {"framework": None, "buildCommand": None, "outputDirectory": None, "installCommand": None}}
req = urllib.request.Request("https://api.vercel.com/v13/deployments?skipAutoDetectionConfirmation=1",
                             data=json.dumps(body).encode(), headers=headers, method="POST")
dep = json.load(urllib.request.urlopen(req, timeout=120))
for _ in range(60):
    dep = json.load(urllib.request.urlopen(urllib.request.Request(
        "https://api.vercel.com/v13/deployments/" + dep["id"], headers=headers), timeout=30))
    if dep.get("readyState") in ("READY", "ERROR", "CANCELED"):
        break
    time.sleep(3)
print(dep.get("readyState"), "https://prato-planejado.vercel.app")
