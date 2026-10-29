// Cálculos do Prato Planejado. Roda no servidor (api/) e no navegador.
// Regra central: a IA escolhe alimentos e gramas; os valores nutricionais vêm sempre da TACO.

export const TOLERANCIA = { kcal: 0.05, macro: 0.10 };

export const RESTRICOES = [
  { id: 'lactose', nome: 'Lactose' },
  { id: 'aplv', nome: 'APLV (proteína do leite)' },
  { id: 'gluten', nome: 'Glúten / celíaca' },
  { id: 'ovo', nome: 'Ovo' },
  { id: 'amendoim', nome: 'Amendoim' },
  { id: 'castanhas', nome: 'Castanhas e nozes' },
  { id: 'frutos_do_mar', nome: 'Frutos do mar' },
  { id: 'soja', nome: 'Soja' },
];

export const PADROES = [
  { id: 'onivoro', nome: 'Onívoro' },
  { id: 'vegetariano', nome: 'Vegetariano' },
  { id: 'vegano', nome: 'Vegano' },
  { id: 'sem_carne_vermelha', nome: 'Sem carne vermelha' },
];

const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const LEITE = /\b(leite|queijo|iogurte|requeijao|manteiga|creme de leite|nata|coalhada|doce de leite|ricota|chantilly|sorvete|achocolatado|bebida lactea)\b/;
const COM_LEITE = /\b(bolo|pudim|mingau|pao de queijo|creme|mousse|quindim|brigadeiro|panqueca|pizza|lasanha|estrogonofe|strogonoff|chocolate|torta|tapioca, com manteiga|cuscuz, paulista)\b/;
const GLUTEN = /\b(trigo|pao|macarrao|biscoito|bolo|torrada|pizza|lasanha|cevada|centeio|aveia|rosca|semolina|cuscuz marroquino|kibe|bisnaguinha|empada|coxinha|esfiha|pastel|quibe|croissant|bolacha|cerveja|cuscuz, paulista|panqueca|nhoque|torta|wafer|sanduiche|hamburguer|salgadinho|farinha, de trigo|barra de cereais|cereais)\b/;
const OVO = /\b(ovo|ovos|maionese|bolo|pudim|panqueca|quindim|omelete|suspiro|torta|empada|mousse|biscoito|macarrao, trigo, cru, com ovos)\b/;
const CARNE = /\b(carne|frango|peixe|presunto|salsicha|linguica|mortadela|bacon|toucinho|salame|hamburguer|coxinha|charque|figado|atum|sardinha|bacalhau|camarao|peru|chester|pescada|merluza|corvina|tilapia|salmao|lula|polvo|caranguejo|siri|mexilhao|ostra|lagosta|caldo de carne|bife|costela|picanha|file|lombo|pernil)\b/;
const VERMELHA = /\b(bovina|boi|porco|suina|carneiro|cordeiro|vitela|cabrito|linguica|bacon|presunto|salame|mortadela|charque|toucinho|costela|picanha|pernil|lombo)\b/;

const REGRAS = {
  lactose: (n, c) => (c === 'leite e derivados' || LEITE.test(n) || COM_LEITE.test(n)) && !/leite de coco/.test(n),
  aplv: (n, c) => (c === 'leite e derivados' || LEITE.test(n) || COM_LEITE.test(n)) && !/leite de coco/.test(n),
  gluten: (n) => GLUTEN.test(n) && !/pao de queijo/.test(n),
  ovo: (n, c) => c === 'ovos e derivados' || OVO.test(n),
  amendoim: (n) => /amendoim|pacoca|pe de moleque/.test(n),
  castanhas: (n) => /castanha|\bnoz\b|nozes|amendoa|avela|pistache|macadamia|pinhao|baru|pecan/.test(n),
  frutos_do_mar: (n) => /camarao|caranguejo|siri|lula|polvo|marisco|ostra|mexilhao|lagosta|sururu|vieira/.test(n),
  soja: (n) => /soja|tofu|misso|shoyu|proteina texturizada/.test(n),
  vegetariano: (n, c) => c === 'carnes e derivados' || c === 'pescados e frutos do mar' || CARNE.test(n),
  vegano: (n, c) => REGRAS.vegetariano(n, c) || c === 'leite e derivados' || c === 'ovos e derivados' || LEITE.test(n) || COM_LEITE.test(n) || OVO.test(n) || /\bmel\b|gelatina/.test(n),
  sem_carne_vermelha: (n) => VERMELHA.test(n),
};

// Devolve a lista de restrições que o alimento viola (vazia = permitido).
export function violacoes(food, restricoes = [], padrao = 'onivoro', naoGosta = '') {
  const n = norm(food.nome), c = norm(food.cat);
  const out = restricoes.filter((r) => REGRAS[r]?.(n, c));
  if (padrao && padrao !== 'onivoro' && REGRAS[padrao]?.(n, c)) out.push(padrao);
  const odeia = norm(naoGosta).split(/[,;.\n]| e /).map((s) => s.trim()).filter((s) => s.length >= 3);
  if (odeia.some((w) => n.includes(w))) out.push('nao_gosta');
  return out;
}

export function criarTaco(data) {
  const lista = (data.alimentos || data).filter((f) => f.kcal > 0);
  const porId = new Map(lista.map((f) => [f.id, f]));
  return { lista, porId, get: (id) => porId.get(Number(id)) };
}

const r1 = (x) => Math.round(x * 10) / 10;

function plural(nome, q) {
  if (q <= 1) return nome;
  const [p, ...rest] = nome.split(' ');
  const pl = /ao$/.test(p) ? p.replace(/ao$/, 'oes') : /ão$/.test(p) ? p.replace(/ão$/, 'ões') : /[rz]$/.test(p) ? p + 'es' : /l$/.test(p) ? p.slice(0, -1) + 'is' : /s$/.test(p) ? p : p + 's';
  return [pl, ...rest].join(' ');
}

export function medidaTexto(gramas, unidade) {
  const g = Math.round(gramas);
  if (!unidade || !unidade.g || !unidade.nome) return `${g} g`;
  const q = Math.round((gramas / unidade.g) * 2) / 2;
  if (q < 0.5) return `${g} g`;
  const qtxt = q === 0.5 ? '1/2' : Number.isInteger(q) ? String(q) : `${Math.floor(q)} e 1/2`;
  return `${g} g (${qtxt} ${plural(unidade.nome, Math.ceil(q))})`;
}

// Calcula os valores de um item a partir da TACO.
export function calcularItem(taco, it) {
  const f = taco.get(it.taco_id);
  const g = Math.max(0, Number(it.gramas) || 0);
  if (!f) return { ...it, gramas: g, kcal: Number(it.kcal) || 0, ptn: Number(it.ptn) || 0, cho: Number(it.cho) || 0, lip: Number(it.lip) || 0, fib: Number(it.fib) || 0, na: Number(it.na) || 0 };
  const k = g / 100;
  return {
    ...it, taco_id: f.id, alimento: it.alimento || f.nome, taco_nome: f.nome, gramas: g,
    quantidade: medidaTexto(g, it.unidade),
    kcal: Math.round(f.kcal * k), ptn: r1(f.ptn * k), cho: r1(f.cho * k), lip: r1(f.lip * k), fib: r1(f.fib * k), na: Math.round(f.na * k),
  };
}

export function totais(refeicoes) {
  const t = { kcal: 0, ptn: 0, cho: 0, lip: 0, fib: 0, na: 0 };
  for (const r of refeicoes || []) for (const i of r.itens || []) for (const k of Object.keys(t)) t[k] += Number(i[k]) || 0;
  for (const k of Object.keys(t)) t[k] = k === 'kcal' || k === 'na' ? Math.round(t[k]) : r1(t[k]);
  return t;
}

export function desvios(t, metas) {
  const d = {};
  for (const k of ['kcal', 'ptn', 'cho', 'lip']) d[k] = metas[k] ? (t[k] - metas[k]) / metas[k] : 0;
  return d;
}

export function dentroDaMeta(t, metas) {
  const d = desvios(t, metas);
  return Math.abs(d.kcal) <= TOLERANCIA.kcal && ['ptn', 'cho', 'lip'].every((k) => Math.abs(d[k]) <= TOLERANCIA.macro);
}

const perfil = (f) => { const e = f.ptn * 4 + f.cho * 4 + f.lip * 9 || 1; return [f.ptn * 4 / e, f.cho * 4 / e, f.lip * 9 / e]; };
const EVITAR_NA_TROCA = new Set(['Alimentos preparados', 'Outros alimentos industrializados', 'Produtos açucarados', 'Bebidas (alcoólicas e não alcoólicas)', 'Miscelâneas']);
// Limite de gramas por item, para o ajuste não criar porções absurdas.
export function limiteGramas(f) {
  if (!f) return 400;
  if (f.kcal > 600) return 15;
  if (f.cat === 'Frutas e derivados') return 250;
  if (f.cat === 'Ovos e derivados') return 150;
  if (f.cat === 'Nozes e sementes') return 30;
  if (f.cat === 'Carnes e derivados' || f.cat === 'Pescados e frutos do mar') return 200;
  return 300;
}

const dominante = (f) => {
  const e = { ptn: f.ptn * 4, cho: f.cho * 4, lip: f.lip * 9 };
  return Object.entries(e).sort((a, b) => b[1] - a[1])[0][0];
};

function arredondar(g, f) {
  if (f && f.kcal > 600) return Math.max(1, Math.round(g)); // óleos e gorduras: de 1 em 1 g
  return Math.max(5, Math.round(g / 5) * 5);
}

function resolver3(A, b) {
  const det = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const D = det(A);
  if (Math.abs(D) < 1e-9) return null;
  return [0, 1, 2].map((c) => det(A.map((row, i) => row.map((v, j) => (j === c ? b[i] : v)))) / D);
}

// Ajusta as porções por grupo de macronutriente dominante e depois pela energia total.
export function ajustarPorcoes(taco, refeicoes, metas) {
  let refs = refeicoes.map((r) => ({ ...r, itens: r.itens.map((i) => calcularItem(taco, i)) }));
  const fixo = (i) => !taco.get(i.taco_id) || norm(i.taco_nome).includes('cafe, infusao');
  for (let it = 0; it < 6; it++) {
    const grupos = { ptn: [0, 0, 0], cho: [0, 0, 0], lip: [0, 0, 0] };
    const resto = [0, 0, 0];
    for (const r of refs) for (const i of r.itens) {
      const v = [i.ptn, i.cho, i.lip];
      const dst = fixo(i) ? resto : grupos[dominante(taco.get(i.taco_id))];
      v.forEach((x, j) => (dst[j] += x));
    }
    const ordem = ['ptn', 'cho', 'lip'];
    const A = [0, 1, 2].map((j) => ordem.map((g) => grupos[g][j]));
    const b = [metas.ptn - resto[0], metas.cho - resto[1], metas.lip - resto[2]];
    const m = resolver3(A, b);
    const fator = {};
    ordem.forEach((g, k) => (fator[g] = m && grupos[g].some((x) => x > 0) ? Math.min(1.6, Math.max(0.6, m[k])) : 1));
    const escala = (i, x) => { const f = taco.get(i.taco_id); return calcularItem(taco, { ...i, gramas: Math.min(limiteGramas(f), Math.max(5, i.gramas * x)) }); };
    refs = refs.map((r) => ({ ...r, itens: r.itens.map((i) => (fixo(i) ? i : escala(i, fator[dominante(taco.get(i.taco_id))]))) }));
    const t = totais(refs);
    const s = t.kcal ? Math.min(1.4, Math.max(0.7, metas.kcal / t.kcal)) : 1;
    refs = refs.map((r) => ({ ...r, itens: r.itens.map((i) => (fixo(i) ? i : escala(i, s))) }));
    if (dentroDaMeta(totais(refs), metas)) break;
  }
  refs = refs.map((r) => ({ ...r, itens: r.itens.map((i) => calcularItem(taco, { ...i, gramas: fixo(i) ? i.gramas : arredondar(i.gramas, taco.get(i.taco_id)) })) }));
  return refs;
}

// Miúdos, farinhas, pós e frituras não entram como troca automática.
const NAO_TROCAR_POR = /coracao|figado|moela|lingua|bucho|tripa|mocoto|rim\b|farinha|\bpo\b|em po|frit|empanad|a milanesa|amido|fecula|polvilho|quibe|kibe|hamburguer|empada|coxinha|salsicha|linguica|mortadela|presunto|bacon|salame|charque/;

// Trocas preferidas do dia a dia brasileiro.
const USUAIS = /cuscuz|tapioca|pao de queijo|arroz, .*cozido|batata, doce, cozida|mandioca, cozida|inhame|feijao, .*cozido|ovo, de galinha, inteiro, cozido|frango, peito, sem pele, grelhado|extrato soluvel|banana|mamao|maca/;
const TUBERCULO = /batata|mandioca|aipim|macaxeira|inhame|cara\b|baroa|pao de queijo|polenta/;

// Papel do alimento no prato (as categorias da TACO nem sempre servem: pão de queijo está em "Verduras").
export function papel(f) {
  const n = norm(f.nome);
  if (f.cat === 'Leite e derivados') return 'laticinio';
  if (['Carnes e derivados', 'Pescados e frutos do mar', 'Ovos e derivados'].includes(f.cat)) return 'proteina';
  if (f.cat === 'Leguminosas e derivados') return 'leguminosa';
  if (f.cat === 'Frutas e derivados') return 'fruta';
  if (f.cat === 'Gorduras e óleos' || f.cat === 'Nozes e sementes') return 'gordura';
  if (f.cat === 'Cereais e derivados' || (f.cat === 'Verduras, hortaliças e derivados' && TUBERCULO.test(n)) || /cuscuz|tapioca/.test(n)) return 'carboidrato';
  if (f.cat === 'Verduras, hortaliças e derivados') return 'hortalica';
  return 'outro';
}
// Papéis aceitos como troca, em ordem de preferência (o primeiro é o próprio papel).
const TROCAS = {
  laticinio: [['laticinio'], ['leguminosa', /extrato|tofu/], ['proteina', /ovo, de galinha, inteiro, cozido/], ['fruta', /crua?\b/]],
  proteina: [['proteina', /grelhad|cozid|assad|mexid/], ['leguminosa', /cozid/]],
  leguminosa: [['leguminosa', /cozid/], ['proteina', /grelhad|cozid|assad/]],
  carboidrato: [['carboidrato']],
  fruta: [['fruta', /crua?\b|polpa/]],
  hortalica: [['hortalica']],
  gordura: [['gordura']],
  outro: [['outro']],
};
function grupoDeTroca(f, x) {
  const n = norm(x.nome), op = TROCAS[papel(f)] || [['outro']];
  return op.findIndex(([pp, re]) => papel(x) === pp && (!re || re.test(n)));
}

// Troca alimentos que violam restrições por outro do mesmo grupo, com a mesma energia.
export function trocarProibidos(taco, refeicoes, restricoes, padrao, naoGosta) {
  const avisos = [];
  const refs = refeicoes.map((r) => ({
    ...r,
    itens: r.itens.map((i) => {
      const f = taco.get(i.taco_id);
      if (!f) return i;
      const v = violacoes(f, restricoes, padrao, naoGosta);
      if (!v.length) return i;
      const pf = perfil(f);
      const cand = taco.lista
        .filter((x) => x.id !== f.id && (!EVITAR_NA_TROCA.has(x.cat) || /cuscuz|tapioca/.test(norm(x.nome))) && !NAO_TROCAR_POR.test(norm(x.nome)) && !violacoes(x, restricoes, padrao, naoGosta).length)
        .map((x) => {
          const gi = grupoDeTroca(f, x);
          if (gi < 0) return null;
          const px = perfil(x);
          const forma = /\bcrua?\b/.test(norm(x.nome)) === /\bcrua?\b/.test(norm(f.nome)) ? 0 : 0.6;
          const dist = Math.hypot(px[0] - pf[0], px[1] - pf[1], px[2] - pf[2]);
          const dens = Math.abs(Math.log((x.kcal || 1) / (f.kcal || 1)));
          const usual = USUAIS.test(norm(x.nome)) ? -0.8 : 0;
          return { x, s: gi * 1.5 + dist * 2 + dens * 0.8 + (gi === 0 ? forma : 0) + usual };
        })
        .filter(Boolean)
        .sort((a, b) => a.s - b.s);
      const novo = cand[0]?.x;
      if (!novo) { avisos.push(`${f.nome} viola ${v.join(', ')} e não encontrei substituto: remova à mão.`); return i; }
      const kcalItem = (f.kcal * i.gramas) / 100;
      avisos.push(`${f.nome} foi trocado por ${novo.nome} (${v.map((x) => RESTRICOES.find((r) => r.id === x)?.nome || PADROES.find((p) => p.id === x)?.nome || 'não gosta').join(', ')}).`);
      return calcularItem(taco, { taco_id: novo.id, alimento: novo.nome, gramas: Math.min(limiteGramas(novo), (kcalItem / novo.kcal) * 100), unidade: null });
    }),
  }));
  return { refeicoes: refs, avisos };
}

// ---------- lista de compras (sem IA) ----------
const SETOR = {
  'Frutas e derivados': 'Hortifrúti', 'Verduras, hortaliças e derivados': 'Hortifrúti',
  'Carnes e derivados': 'Açougue e peixaria', 'Pescados e frutos do mar': 'Açougue e peixaria',
  'Leite e derivados': 'Laticínios',
};
// Fator cozido → cru aproximado para comprar a quantidade certa.
const CRU = [
  [/arroz.*cozid/, 0.4, 'arroz cru'], [/feijao.*cozid/, 0.45, 'feijão cru'], [/macarrao.*cozid/, 0.45, 'macarrão cru'],
  [/(frango|carne|bovin|suin|peixe|pescada|merluza|tilapia|file|bife).*(cozid|grelhad|assad)/, 1.35, null],
];

function setorDe(f) {
  if (/\bpao\b|torrada|bisnaguinha/.test(norm(f.nome))) return 'Padaria';
  return SETOR[f.cat] || 'Mercearia';
}

function unidadeCompra(f, g, unidades) {
  const n = norm(f.nome);
  if (f.cat === 'Ovos e derivados' || /^ovo/.test(n)) {
    const q = Math.ceil(g / 50);
    return q >= 12 ? `${Math.ceil(q / 12)} dúzia${q > 12 ? 's' : ''} (${q} ovos)` : `${q} ovos`;
  }
  const u = unidades.find((x) => x && /unidade|fruta/.test(norm(x.nome)) && x.g);
  if (u && (f.cat === 'Frutas e derivados' || f.cat === 'Verduras, hortaliças e derivados')) {
    const q = Math.ceil(g / u.g);
    return `${q} unidade${q > 1 ? 's' : ''} (cerca de ${(g / 1000).toFixed(1).replace('.', ',')} kg)`;
  }
  if (f.kcal > 600 && f.cat === 'Gorduras e óleos') return `${Math.round(g)} ml (1 frasco de 500 ml dura mais)`;
  if (g >= 1000) return `${(Math.ceil(g / 100) / 10).toFixed(1).replace('.', ',')} kg`;
  return `${Math.ceil(g / 50) * 50} g`;
}

export function listaDeCompras(taco, refeicoes, dias = 7) {
  const soma = new Map();
  for (const r of refeicoes || []) for (const i of r.itens || []) {
    const f = taco.get(i.taco_id);
    if (!f) continue;
    const s = soma.get(f.id) || { f, g: 0, unidades: [] };
    s.g += (Number(i.gramas) || 0) * dias;
    s.unidades.push(i.unidade);
    soma.set(f.id, s);
  }
  const setores = new Map();
  for (const { f, g, unidades } of soma.values()) {
    if (norm(f.nome).includes('cafe, infusao')) { add('Mercearia', 'Café em pó', `${Math.ceil((g * 0.1) / 50) * 50} g`); continue; }
    const cru = CRU.find(([re]) => re.test(norm(f.nome)));
    const gCompra = cru ? g * cru[1] : g;
    const nome = cru && cru[2] ? cru[2][0].toUpperCase() + cru[2].slice(1) : f.nome.split(',').slice(0, 2).join(',').trim();
    add(setorDe(f), nome + (cru && !cru[2] ? ' (peso cru)' : ''), unidadeCompra(f, gCompra, unidades));
  }
  function add(setor, item, quantidade) {
    if (!setores.has(setor)) setores.set(setor, []);
    setores.get(setor).push({ item, quantidade });
  }
  const ordem = ['Hortifrúti', 'Açougue e peixaria', 'Laticínios', 'Padaria', 'Mercearia'];
  return { categorias: ordem.filter((s) => setores.has(s)).map((s) => ({ nome: s, itens: setores.get(s).sort((a, b) => a.item.localeCompare(b.item, 'pt-BR')) })) };
}

// ---------- substituições equivalentes (calculadas, não chutadas) ----------
// Alimentos do mesmo grupo de troca, com a quantidade que dá a mesma energia do item original.
export function substitutos(taco, item, restricoes = [], padrao = 'onivoro', naoGosta = '', quantos = 4) {
  const f = taco.get(item.taco_id);
  if (!f) return [];
  const kcalItem = (f.kcal * (Number(item.gramas) || 0)) / 100;
  const pf = perfil(f);
  const cozido = /cozid|grelhad|assad|refogad/.test(norm(f.nome));
  return taco.lista
    .filter((x) => x.id !== f.id && (!EVITAR_NA_TROCA.has(x.cat) || /cuscuz|tapioca/.test(norm(x.nome))) && !NAO_TROCAR_POR.test(norm(x.nome)) && !violacoes(x, restricoes, padrao, naoGosta).length)
    .map((x) => {
      const gi = grupoDeTroca(f, x);
      if (gi < 0) return null;
      const px = perfil(x);
      const cru = /\bcrua?\b/.test(norm(x.nome)) && !['Frutas e derivados', 'Verduras, hortaliças e derivados'].includes(x.cat) && !/\bcrua?\b/.test(norm(f.nome));
      const forma = (cozido && /\bcrua?\b/.test(norm(x.nome)) && x.cat !== 'Frutas e derivados') || cru ? 1.2 : 0;
      if (/canjica|mingau|doce|com leite|com acucar|pudim|calda|xarope|cristalizad/.test(norm(x.nome))) return null;
      const s = gi * 1.2 + Math.hypot(px[0] - pf[0], px[1] - pf[1], px[2] - pf[2]) * 2 + Math.abs(Math.log(x.kcal / f.kcal)) * 0.6 + forma + (USUAIS.test(norm(x.nome)) ? -0.6 : 0);
      return { x, s };
    })
    .filter(Boolean)
    .sort((a, b) => a.s - b.s)
    .filter(({ x }, _i, arr) => {
      // Variedade: no máximo 2 opções com o mesmo nome base (ex.: 2 tipos de banana).
      const base = norm(x.nome).split(',')[0];
      const antes = arr.slice(0, arr.findIndex((y) => y.x === x)).filter((y) => norm(y.x.nome).split(',')[0] === base).length;
      return antes < 2 && base !== norm(f.nome).split(',')[0] || (base === norm(f.nome).split(',')[0] && antes < 1);
    })
    .slice(0, quantos)
    .map(({ x }) => {
      const g = Math.min(limiteGramas(x), Math.max(5, Math.round(((kcalItem / x.kcal) * 100) / 5) * 5));
      return calcularItem(taco, { taco_id: x.id, alimento: x.nome, gramas: g, unidade: null });
    });
}

// Lista enxuta enviada à IA: só alimentos prontos para comer e de uso comum (o nutricionista
// ainda pode buscar qualquer item da TACO no editor). Corta o pedido pela metade em tokens.
const CRU_OK = new Set(['Frutas e derivados', 'Verduras, hortaliças e derivados', 'Nozes e sementes', 'Leite e derivados']);
const FORA_DO_CARDAPIO = /condensado|mingau|infantil|pe-de-moleque|pacoca|petit suisse|bebida lactea|iogurte, sabor|\bcrua?s?\b|\bpo\b|mistura para|tablete|instantaneo|recheado|wafer|refrigerante|cerveja|aguardente|isotonica|frit|milanesa|empanad|com gordura|congelado|coracao|figado|moela|lingua|bucho|tripa|mocoto|rim\b|apresuntado|hamburguer|salsicha|linguica|mortadela|presunto|bacon|salame|toucinho|torresmo|chantilly|maionese|glicose|gelatina|shoyu|tempero|fermento|farinha|amido|fecula|polvilho|massa|enlatad|conserva|pastel|coxinha|empada|quibe|kibe|esfiha|pizza|biscoito|bolo|chocolate|achocolatado|doce|cocada|quindim|maria mole|marmelada|geleia|acucar|creme de|caldo de/;
export function paraCardapio(f) {
  const n = norm(f.nome);
  if (/^(aveia|tapioca)/.test(n)) return true;
  if (/\bcrua?s?\b/.test(n) && CRU_OK.has(f.cat)) return !FORA_DO_CARDAPIO.test(n.replace(/\bcrua?s?\b/g, ''));
  if (['Miscelâneas', 'Outros alimentos industrializados'].includes(f.cat)) return false;
  if (f.cat === 'Produtos açucarados') return /^mel\b|rapadura/.test(n);
  return !FORA_DO_CARDAPIO.test(n);
}
