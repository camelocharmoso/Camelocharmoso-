// Traduz os nomes da USDA para o português no estilo da TACO ("Frango, peito, sem pele, grelhado").
// Uso: GEMINI_API_KEY=... node scripts/traduzir-usda.mjs   (retoma de onde parou; grava scripts/dados/usda-pt.json)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const RAIZ = new URL('../web/data/', import.meta.url);
const usda = JSON.parse(readFileSync(new URL('usda.json', RAIZ))).alimentos;
const destino = new URL('dados/usda-pt.json', import.meta.url);
const pt = existsSync(destino) ? JSON.parse(readFileSync(destino)) : {};
const falta = usda.filter((u) => !pt[u.id.slice(1)]);
const LOTE = 250, MODELO = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
console.log(`faltam ${falta.length} de ${usda.length}`);
const instrucao = `Traduza nomes de alimentos da tabela USDA para o português do Brasil, no estilo da Tabela TACO: termo principal primeiro, depois detalhes separados por vírgula, em minúsculas exceto a primeira letra (ex.: "Chicken, broilers or fryers, breast, meat only, cooked, roasted" -> "Frango, peito, sem pele, assado"; "Milk, whole, 3.25% milkfat" -> "Leite, de vaca, integral, 3,25% de gordura").
Use os nomes usados no Brasil (raw = cru/crua, cooked = cozido, boiled = cozido, roasted = assado, broiled/grilled = grelhado, fried = frito, canned = enlatado, frozen = congelado, dry = seco, enriched = enriquecido, unenriched = não enriquecido, without salt = sem sal, ground beef = carne moída, bell pepper = pimentão, squash = abóbora, sweet potato = batata-doce, cassava = mandioca, whey protein = whey protein). Mantenha marcas e siglas. Use vírgula decimal. Responda só com o JSON: um array com as traduções na mesma ordem e na mesma quantidade.`;
for (let i = 0; i < falta.length; i += LOTE) {
  const lote = falta.slice(i, i + LOTE);
  for (let tentativa = 1; tentativa <= 4; tentativa++) {
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent`, { method: 'POST', headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY, 'content-type': 'application/json' },
        body: JSON.stringify({ systemInstruction: { parts: [{ text: instrucao }] }, contents: [{ parts: [{ text: JSON.stringify(lote.map((u) => u.en)) }] }],
          generationConfig: { responseMimeType: 'application/json', responseJsonSchema: { type: 'array', items: { type: 'string' } }, temperature: 0.1 } }) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const lista = JSON.parse((await r.json()).candidates[0].content.parts.filter((p) => !p.thought).map((p) => p.text).join(''));
      if (lista.length !== lote.length) throw new Error(`veio ${lista.length} de ${lote.length}`);
      lote.forEach((u, j) => (pt[u.id.slice(1)] = String(lista[j]).trim()));
      writeFileSync(destino, JSON.stringify(pt));
      console.log(`${Math.min(i + LOTE, falta.length)}/${falta.length}  ex.: ${lote[0].en} -> ${lista[0]}`);
      break;
    } catch (e) {
      console.warn(`lote ${i}: tentativa ${tentativa} falhou (${e.message})`);
      await new Promise((ok) => setTimeout(ok, 4000 * tentativa));
    }
  }
}
console.log('traduzidos:', Object.keys(pt).length);
