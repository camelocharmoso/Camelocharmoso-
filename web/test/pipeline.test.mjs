// Teste do caminho do servidor com uma resposta de IA simulada (não chama a Anthropic).
import assert from 'node:assert/strict';
process.env.ANTHROPIC_API_KEY = 'teste';
const mock = {
  refeicoes: [
    { nome: 'Café da manhã', horario: '07:00', substituicoes: 'Cuscuz por tapioca.', itens: [
      { taco_id: 533, gramas: 120, unidade_nome: 'colher de sopa', gramas_por_unidade: 30 },
      { taco_id: 488, gramas: 50, unidade_nome: 'unidade', gramas_por_unidade: 50 },
      { taco_id: 448, gramas: 170, unidade_nome: 'pote', gramas_por_unidade: 170 }, // iogurte: proibido para APLV
      { taco_id: 226, gramas: 150, unidade_nome: 'fatia', gramas_por_unidade: 100 },
      { taco_id: 471, gramas: 100, unidade_nome: 'xícara', gramas_por_unidade: 100 } ] },
    { nome: 'Lanche da manhã', horario: '10:00', substituicoes: 'Banana por maçã.', itens: [
      { taco_id: 182, gramas: 70, unidade_nome: 'unidade', gramas_por_unidade: 70 } ] },
    { nome: 'Almoço', horario: '12:30', substituicoes: 'Frango por patinho.', itens: [
      { taco_id: 1, gramas: 100, unidade_nome: 'colher de sopa', gramas_por_unidade: 25 },
      { taco_id: 561, gramas: 86, unidade_nome: 'concha', gramas_por_unidade: 86 },
      { taco_id: 410, gramas: 100, unidade_nome: 'filé', gramas_por_unidade: 100 },
      { taco_id: 161, gramas: 80, unidade_nome: 'prato de sobremesa', gramas_por_unidade: 80 },
      { taco_id: 260, gramas: 5, unidade_nome: 'colher de chá', gramas_por_unidade: 5 } ] },
    { nome: 'Lanche da tarde', horario: '16:00', substituicoes: 'Iogurte por fruta.', itens: [
      { taco_id: 222, gramas: 130, unidade_nome: 'unidade', gramas_por_unidade: 130 },
      { taco_id: 88, gramas: 80, unidade_nome: 'colher de sopa', gramas_por_unidade: 40 } ] },
    { nome: 'Jantar', horario: '19:30', substituicoes: 'Mandioca por batata-doce.', itens: [
      { taco_id: 129, gramas: 100, unidade_nome: 'pedaço', gramas_por_unidade: 50 },
      { taco_id: 377, gramas: 90, unidade_nome: 'bife', gramas_por_unidade: 90 },
      { taco_id: 100, gramas: 60, unidade_nome: 'xícara', gramas_por_unidade: 60 } ] } ],
  observacoes: 'Beba água ao longo do dia.',
};
// Na rodada de correção, a IA simulada acrescenta uma fonte de gordura (como faria a IA real ao ver o desvio).
const corrigido = structuredClone(mock);
corrigido.refeicoes[3].itens.push({ taco_id: 163, gramas: 80, unidade_nome: 'colher de sopa', gramas_por_unidade: 30 });
corrigido.refeicoes[0].itens.push({ taco_id: 589, gramas: 10, unidade_nome: 'unidade', gramas_por_unidade: 5 });
let chamadas = 0;
globalThis.fetch = async (url) => {
  if (String(url).includes('/auth/v1/user')) return new Response(JSON.stringify({ id: 'u1' }), { status: 200 });
  chamadas++;
  return new Response(JSON.stringify({ content: [{ type: 'tool_use', id: 't' + chamadas, name: 'montar_cardapio', input: chamadas <= 2 ? mock : corrigido }] }), { status: 200 });
};
const { default: handler } = await import('../api/cardapio.js');
const res = { code: 0, body: null, headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(c) { this.code = c; return this; }, json(b) { this.body = b; } };
const metas = { kcal: 1820, ptn: 104, cho: 223, lip: 57 };
await handler({ method: 'POST', headers: { authorization: 'Bearer x' }, body: {
  ficha: { sexo: 'f', idade: 28, objetivo: 'perda de peso', restricoes: ['aplv'], padrao: 'onivoro', preferencias: '', naoGosta: 'jiló', treino: 'musculação 19h' },
  metas, refeicoes: [{ nome: 'Café', horario: '07:00', pct: 25 }, { nome: 'Lanche', horario: '10:00', pct: 10 }, { nome: 'Almoço', horario: '12:30', pct: 30 }, { nome: 'Lanche', horario: '16:00', pct: 10 }, { nome: 'Jantar', horario: '19:30', pct: 25 }] } }, res);
assert.equal(res.code, 200, JSON.stringify(res.body));
const b = res.body;
console.log('chamadas à IA simulada:', chamadas);
console.log('refeições:', b.refeicoes.length, '| totais:', b.totais, '| metas:', metas);
console.log('avisos:', b.avisos);
for (const r of b.refeicoes) console.log(`  ${r.horario} ${r.nome}:`, r.itens.map((i) => `${i.taco_nome} ${i.quantidade}`).join('; '));
assert.equal(b.refeicoes.length, 5);
assert.ok(Math.abs(b.totais.kcal - metas.kcal) / metas.kcal <= 0.05, 'kcal fora de 5%');
for (const k of ['ptn', 'cho', 'lip']) assert.ok(Math.abs(b.totais[k] - metas[k]) / metas[k] <= 0.10, `${k} fora de 10%`);
assert.ok(!b.refeicoes.flatMap((r) => r.itens).some((i) => i.taco_id === 448), 'iogurte continuou no cardápio');
const { criarTaco, listaDeCompras, violacoes } = await import('../lib/nutri.mjs');
const { readFileSync } = await import('node:fs');
const taco = criarTaco(JSON.parse(readFileSync(new URL('../data/taco.json', import.meta.url))));
assert.ok(!b.refeicoes.flatMap((r) => r.itens).some((i) => violacoes(taco.get(i.taco_id), ['aplv']).length), 'restrição violada');
const lista = listaDeCompras(taco, b.refeicoes);
assert.ok(lista.categorias.length >= 3);
console.log('lista de compras:'); for (const c of lista.categorias) console.log(`  ${c.nome}:`, c.itens.map((i) => `${i.item} ${i.quantidade}`).join('; '));
// Erros legíveis
globalThis.fetch = async (url) => String(url).includes('/auth/') ? new Response('{}', { status: 401 }) : null;
const r2 = { ...res, code: 0 }; await handler({ method: 'POST', headers: { authorization: 'Bearer x' }, body: {} }, r2);
console.log('sem sessão ->', r2.code, r2.body.mensagem);
delete process.env.ANTHROPIC_API_KEY;
globalThis.fetch = async () => new Response(JSON.stringify({ id: 'u1' }), { status: 200 });
const r3 = { ...res, code: 0 }; await handler({ method: 'POST', headers: { authorization: 'Bearer x' }, body: { ficha: { sexo: 'f', idade: 28, objetivo: 'x' }, metas, refeicoes: [{ nome: 'a', horario: '07:00', pct: 30 }, { nome: 'b', horario: '12:00', pct: 40 }, { nome: 'c', horario: '19:00', pct: 30 }] } }, r3);
console.log('sem chave ->', r3.code, r3.body.mensagem, '| id', r3.body.requestId);
console.log('OK: todos os critérios passaram');
